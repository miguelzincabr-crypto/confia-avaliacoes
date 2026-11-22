-- =============================================================
-- confia. — Esquema do banco de dados (PostgreSQL / Supabase)
-- Execute este arquivo em: Supabase Dashboard > SQL Editor > New query
-- =============================================================

create extension if not exists pgcrypto;

-- -------------------------------------------------------------
-- 1. Tabelas
-- -------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'company', 'admin')),
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfis públicos dos usuários (1:1 com auth.users).';

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  slug text not null unique,
  logo_url text,
  description text not null default '',
  category text,
  city text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.companies is 'Empresas que podem receber avaliações.';

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null check (char_length(author_name) between 2 and 80),
  rating smallint not null check (rating between 1 and 5),
  title text not null check (char_length(title) between 5 and 90),
  comment text not null check (char_length(comment) between 20 and 1000),
  tags text[] not null default '{}',
  photos text[] not null default '{}',
  is_anonymous boolean not null default false,
  truth_confirmed boolean not null default false check (truth_confirmed),
  response text,
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.reviews is 'Avaliações de clientes. author_id nulo + is_anonymous = anônima.';

-- -------------------------------------------------------------
-- 2. Índices
-- -------------------------------------------------------------

create index if not exists reviews_company_created_idx on public.reviews (company_id, created_at desc);
create index if not exists reviews_author_idx on public.reviews (author_id);
create index if not exists reviews_rating_idx on public.reviews (rating);
create index if not exists companies_owner_idx on public.companies (owner_id);

-- -------------------------------------------------------------
-- 3. Perfil automático para novos usuários
-- -------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -------------------------------------------------------------
-- 4. View de estatísticas
-- -------------------------------------------------------------

create or replace view public.company_stats as
select
  c.id as company_id,
  count(r.id) as total,
  coalesce(round(avg(r.rating)::numeric, 2), 0) as average,
  count(r.id) filter (where r.rating = 1) as one_star,
  count(r.id) filter (where r.rating = 2) as two_star,
  count(r.id) filter (where r.rating = 3) as three_star,
  count(r.id) filter (where r.rating = 4) as four_star,
  count(r.id) filter (where r.rating = 5) as five_star,
  count(r.id) filter (where r.response is not null) as answered
from public.companies c
left join public.reviews r on r.company_id = c.id
group by c.id;

grant select on public.company_stats to anon, authenticated;

-- -------------------------------------------------------------
-- 5. Row Level Security (RLS)
-- -------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.reviews enable row level security;

-- Profiles: leitura pública; cada usuário edita apenas o próprio perfil.
drop policy if exists "Perfis legíveis por todos" on public.profiles;
create policy "Perfis legíveis por todos" on public.profiles for select using (true);

drop policy if exists "Usuário edita próprio perfil" on public.profiles;
create policy "Usuário edita próprio perfil" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- Companies: leitura pública; apenas o dona edita/exclui.
drop policy if exists "Empresas legíveis por todos" on public.companies;
create policy "Empresas legíveis por todos" on public.companies for select using (true);

drop policy if exists "Usuário autenticado cria empresa" on public.companies;
create policy "Usuário autenticado cria empresa" on public.companies for insert
  to authenticated with check (auth.uid() = owner_id);

drop policy if exists "Dono edita empresa" on public.companies;
create policy "Dono edita empresa" on public.companies for update
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "Dono exclui empresa" on public.companies;
create policy "Dono exclui empresa" on public.companies for delete using (auth.uid() = owner_id);

-- Reviews: leitura pública; qualquer pessoa (inclusive anônima) pode avaliar;
-- apenas o dono da empresa pode responder/editar.
drop policy if exists "Avaliações legíveis por todos" on public.reviews;
create policy "Avaliações legíveis por todos" on public.reviews for select using (true);

drop policy if exists "Qualquer pessoa pode avaliar" on public.reviews;
create policy "Qualquer pessoa pode avaliar" on public.reviews for insert
  to anon, authenticated
  with check (
    truth_confirmed = true
    and (author_id is null or author_id = auth.uid())
  );

drop policy if exists "Dono da empresa responde avaliação" on public.reviews;
create policy "Dono da empresa responde avaliação" on public.reviews for update
  to authenticated
  using (
    exists (
      select 1 from public.companies c
      where c.id = company_id and c.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.companies c
      where c.id = company_id and c.owner_id = auth.uid()
    )
  );

-- -------------------------------------------------------------
-- 6. Storage (fotos das avaliações + logos)
-- -------------------------------------------------------------

insert into storage.buckets (id, name, public)
values
  ('review-photos', 'review-photos', true),
  ('company-logos', 'company-logos', true)
on conflict (id) do nothing;

drop policy if exists "Fotos públicas" on storage.objects;
create policy "Fotos públicas" on storage.objects for select
  using (bucket_id in ('review-photos', 'company-logos'));

drop policy if exists "Enviar fotos de avaliação" on storage.objects;
create policy "Enviar fotos de avaliação" on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'review-photos');

drop policy if exists "Enviar logo da empresa" on storage.objects;
create policy "Enviar logo da empresa" on storage.objects for insert
  to authenticated with check (bucket_id = 'company-logos');

drop policy if exists "Dono remove fotos" on storage.objects;
create policy "Dono remove fotos" on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'review-photos'
    and exists (
      select 1 from public.companies c
      where c.id::text = split_part(name, '/', 1) and c.owner_id = auth.uid()
    )
  );
