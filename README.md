# confia. — Plataforma de Avaliações de Empresas

Aplicação completa (mobile-first) para clientes avaliarem empresas e para empresas gerenciarem sua reputação. Funciona **imediatamente em modo demonstração** (sem backend) ou com **Supabase** para autenticação, banco e storage.

---

## ✨ Funcionalidades

### Página inicial (pública)
- Busca destaque por empresa, produto, categoria, cidade ou palavra-chave em avaliações.
- Seções **Avaliações recentes** e **Empresas mais bem avaliadas**.
- Indicadores: nota de 1 a 5 estrelas (com preenchimento parcial), selo de verificação, contadores.
- Cards clicáveis levando ao perfil público da empresa.

### Formulário de avaliação (`/avaliar/:slug`)
- Seletor de **1 a 5 estrelas** com feedback visual dinâmico no hover, teclado e animação.
- Título e comentário detalhado com contador de caracteres e validação.
- Upload de até 3 fotos (opcional) com preview e remoção.
- Tags rápidas (Bom atendimento, Entrega rápida, Preço justo etc.).
- Checkbox obrigatório de veracidade.
- Publicação **anônima** ou **identificada** (com nome da sessão, quando logado).
- Tela de sucesso animada com link para a avaliação publicada.

### Painel da empresa (`/dashboard`)
- Métricas: **nota média**, **total de avaliações**, aguardando resposta e taxa de resposta.
- **Gráfico de barras** com distribuição percentual por estrela.
- Lista de avaliações com filtros por **nota**, **data** (7/30/90 dias) e **respondidas/não respondidas**.
- Campo para **responder publicamente** cada avaliação.
- **Link direto e QR Code** de convite, com botões de compartilhar no WhatsApp e por e-mail.

### Perfil público da empresa (`/empresa/:slug`)
- Logo, descrição, categoria, cidade, selo de verificação.
- Nota média em destaque e distribuição por estrelas.
- Lista **paginada** de avaliações com as respostas da empresa.
- Botão de compartilhar e CTA para avaliar.

### Design
- Paleta: branco, cinza claro, **azul escuro/confiança** e **amarelo/dourado** para estrelas.
- Mobile-first, totalmente responsivo.
- Micro-interações: hover nas estrelas, elevação de cards, animações de entrada, spinner e check animado no envio.

---

## 📁 Estrutura de pastas

```
.
├── app/
│   ├── layout.tsx                  # Layout raiz (header, footer, metadata, fonte)
│   ├── globals.css                 # Tailwind + componentes utilitários (.btn-primary, .input-field)
│   ├── page.tsx                    # Página inicial pública (busca, recentes, destaques)
│   ├── avaliar/
│   │   └── [slug]/page.tsx         # Formulário de avaliação + tela de sucesso
│   ├── empresa/
│   │   └── [slug]/page.tsx         # Perfil público com paginação
│   ├── dashboard/
│   │   └── page.tsx                # Painel administrativo (métricas, filtros, respostas, QR)
│   └── login/
│       └── page.tsx                # Login / cadastro / acesso demo
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Stars.tsx                   # Stars (exibição parcial) + StarRating (interativo)
│   ├── RatingDistribution.tsx      # Gráfico de barras
│   ├── ReviewCard.tsx
│   ├── CompanyCard.tsx
│   └── VerificationBadge.tsx
├── lib/
│   ├── types.ts                    # Tipagens e constantes (tags, rótulos das notas)
│   ├── supabase.ts                 # Cliente Supabase (ou null se não configurado)
│   ├── data.ts                     # Camada de dados: Supabase OU localStorage (demo)
│   ├── mock-data.ts                # Empresas e avaliações de exemplo
│   └── utils.ts                    # cn, datas, slugify, iniciais
├── supabase/
│   ├── schema.sql                  # Tabelas, RLS, storage, trigger e view de estatísticas
│   └── seed.sql                    # Dados de exemplo (opcional)
├── vite-shims/                     # Compatibilidade next/* → react-router (build Vite)
│   ├── link.tsx
│   └── navigation.tsx
├── deploy/vite/                    # Configs de publicação da build Vite
│   ├── netlify.toml
│   ├── vercel.json
│   ├── _redirects
│   └── package.lovable.json
├── main.vite.tsx                   # Entry SPA (BrowserRouter + rotas)
├── index.html                      # Entry HTML da build Vite
├── vite.config.ts                  # Aliases e variáveis VITE_SUPABASE_*
├── .env.local.example              # Next.js
├── .env.vite.example               # Vite
├── tailwind.config.ts
├── next.config.mjs
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

---

## 🚀 Como executar

### 1. Instalar dependências

```bash
npm install
```

### 2. Rodar em modo demo (sem backend)

```bash
npm run dev
```

Abra http://localhost:3000. Todo o conteúdo de exemplo já aparece, e novas avaliações/respostas são gravadas no `localStorage` do navegador. Acesse `/login` → **"Acessar com conta de demonstração"** para testar o painel.

### 3. Conectar ao Supabase

1. Crie um projeto em https://supabase.com.
2. Copie `.env.local.example` para `.env.local` e preencha:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
   ```
3. No **SQL Editor** do Supabase, execute `supabase/schema.sql` e, se quiser, `supabase/seed.sql`.
4. Em **Authentication → Providers → Email**, habilite o provedor de e-mail (e desative a confirmação para testes, se desejar).
5. Reinicie `npm run dev`.

> A aplicação detecta automaticamente as variáveis de ambiente. Se estiverem vazias, usa o modo demo.

---

## 🌐 Publicar (duas opções)

O repositório tem **duas builds** que compartilham o mesmo código (`app/`, `components/`, `lib/`):

| Build | Comando | Saída | Ideal para |
|---|---|---|---|
| **Next.js** | `npm run build` | `.next/` | Vercel, Railway, Render, Netlify (com plugin Next) |
| **Vite (SPA)** | `npm run build:vite` | `dist/` | Lovable, Netlify, Cloudflare Pages, Vercel static, GitHub Pages |

### Opção A — Next.js na Vercel (recomendado, sem alterações)

1. `git add . && git commit -m "Plataforma de avaliações confia."`
2. Envie para GitHub/GitLab/Bitbucket e importe em [vercel.com/new](https://vercel.com/new).
3. A Vercel detecta Next.js automaticamente. Configure as variáveis:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
4. No Supabase: *Authentication → URL Configuration* → Site URL = `https://seu-app.vercel.app` e Redirect URLs = `https://seu-app.vercel.app/**`.
5. Deploy.

> Não rode `npm run build` com `npm run dev` aberto — ambos usam `.next/` e podem corromper o cache. Pare o dev antes do build (ou use a build Vite, que sai em `dist/`).

### Opção B — Vite (Lovable / hosts estáticos)

A build Vite usa React Router nos bastidores. Os shims em `vite-shims/` traduzem `next/link` e `next/navigation`, então **você não edita as páginas**.

```bash
cp .env.vite.example .env.local   # preencha VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
npm run dev:vite                   # http://localhost:5173
npm run build:vite                 # gera dist/
npm run preview:vite               # http://localhost:4173
```

Variáveis de ambiente da build Vite: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Vazias = modo demo.

**SPA fallback obrigatório** (rotas como `/empresa/aurora-cafe` precisam servir `index.html`):
- **Netlify:** copie `deploy/vite/netlify.toml` para a raiz (já traz build, publish e redirect).
- **Vercel (estático):** copie `deploy/vite/vercel.json` para a raiz.
- **Outros hosts:** copie `deploy/vite/_redirects` para `dist/` (ou configure rewrite `/* → /index.html`).

**Lovable especificamente:** o ambiente deles já roda Vite. Importe o código e garanta que o comando de dev/build seja Vite. Se o Lovable exigir um `package.json` só dele, use o modelo `deploy/vite/package.lovable.json` (troque o nome para `package.json`) — ele contém apenas as dependências da versão SPA. Depois, defina as variáveis `VITE_SUPABASE_*` no painel do Lovable e execute `supabase/schema.sql` no seu projeto Supabase.

> No modo demo, os dados ficam no `localStorage` de cada origem. Portas diferentes (3000, 4173, 5173) têm dados separados — normal.

---

## 🗄️ Modelo de dados

| Tabela | Campos principais | Observações |
|---|---|---|
| `profiles` | `id` (FK → auth.users), `full_name`, `avatar_url`, `role` | Criada automaticamente via trigger |
| `companies` | `id`, `owner_id`, `name`, `slug` (unique), `logo_url`, `description`, `category`, `city`, `verified` | `owner_id` edita a empresa e responde avaliações |
| `reviews` | `id`, `company_id`, `author_id`, `author_name`, `rating` (1–5), `title`, `comment`, `tags[]`, `photos[]`, `is_anonymous`, `truth_confirmed`, `response`, `responded_at`, `created_at` | `author_id` nulo = anônimo; `truth_confirmed` obrigatório |

**View `company_stats`**: média, total, contagem por estrela e quantidade respondida por empresa.

**RLS**: leitura pública de empresas/avaliações; qualquer visitante pode inserir avaliações confirmadas; somente o dono da empresa pode atualizar (responder) e excluir seus dados. Fotos e logos ficam em buckets públicos no Storage.

---

## 🧪 Validação

```bash
npm run typecheck
npm run build         # Next.js → .next/
npm run build:vite    # Vite/SPA → dist/
```

---

## 📌 Observações

- O QR Code é gerado no cliente com `qrcode.react`; ele aponta para `/avaliar/{slug}`.
- No modo demo, fotos são convertidas em data URL e gravadas no navegador (limite de 2 MB por arquivo).
- Em produção com Supabase, as fotos são enviadas para o bucket `review-photos` e os logos para `company-logos`.
- Para criar uma empresa logada no Supabase, use `createCompany()` em `lib/data.ts` ou insira via SQL com `owner_id = auth.uid()`.
