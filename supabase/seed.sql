-- =============================================================
-- Dados de exemplo para o Supabase (opcional)
-- Execute DEPOIS do schema.sql. Pode ser executado várias vezes.
-- =============================================================

insert into public.companies (id, name, slug, description, category, city, verified)
values
  ('00000000-0000-4000-8000-000000000001', 'Aurora Café', 'aurora-cafe',
   'Café de especialidade, bolos artesanais e um ambiente acolhedor no coração da cidade.',
   'Cafeteria', 'São Paulo, SP', true),
  ('00000000-0000-4000-8000-000000000002', 'TechServe Solutions', 'techserve-solutions',
   'Consultoria em tecnologia, desenvolvimento de sistemas e suporte ágil para empresas.',
   'Tecnologia', 'Curitiba, PR', true),
  ('00000000-0000-4000-8000-000000000003', 'Livraria Horizonte', 'livraria-horizonte',
   'Livros novos e raros, clube de leitura e cafés literários.',
   'Livraria', 'Porto Alegre, RS', true),
  ('00000000-0000-4000-8000-000000000004', 'Oficina Rápida Centro', 'oficina-rapida-centro',
   'Manutenção preventiva e corretiva de veículos com orçamento transparente.',
   'Automotivo', 'Belo Horizonte, MG', false),
  ('00000000-0000-4000-8000-000000000005', 'Studio Bella', 'studio-bella',
   'Salão de beleza com profissionais especializados em cortes, coloração e tratamentos.',
   'Beleza', 'Recife, PE', true),
  ('00000000-0000-4000-8000-000000000006', 'Mercado Natural', 'mercado-natural',
   'Hortifruti e produtos orgânicos selecionados, com entrega rápida na região.',
   'Supermercado', 'Florianópolis, SC', false)
on conflict (id) do nothing;

with dados (company_id, author_name, rating, title, comment, tags, is_anonymous, response, days_ago) as (
  values
    ('00000000-0000-4000-8000-000000000001'::uuid, 'Marina Costa', 5, 'O melhor café da cidade!',
     'Atendimento impecável e o café coado na hora é sensacional. O bolo de cenoura da casa é imperdível. Volto sempre!',
     array['Bom atendimento','Produto de qualidade','Recomendo'], false,
     'Muito obrigada, Marina! Esperamos você em breve!', 5),
    ('00000000-0000-4000-8000-000000000001'::uuid, 'Cliente anônimo', 4, 'Ótimo ambiente, mas lotado',
     'Produto excelente e equipe atenciosa. Só acho que falta mais espaço nos horários de pico.',
     array['Bom atendimento','Ambiente limpo'], true, null, 2),
    ('00000000-0000-4000-8000-000000000002'::uuid, 'Juliana Prado', 5, 'Equipe extremamente competente',
     'Contratamos para desenvolver nosso sistema interno. Entregaram antes do prazo, com documentação completa e suporte excelente.',
     array['Entrega rápida','Produto de qualidade','Preço justo'], false,
     'Obrigado, Juliana! Foi um prazer trabalhar com a equipe de vocês.', 6),
    ('00000000-0000-4000-8000-000000000002'::uuid, 'Carlos Menezes', 4, 'Bom custo-benefício',
     'Profissionais sérios. O suporte poderia ter um tempo de resposta um pouco menor à noite.',
     array['Preço justo'], false, 'Obrigado pelo retorno! Já estamos ajustando a escala noturna.', 14),
    ('00000000-0000-4000-8000-000000000003'::uuid, 'Beatriz Souza', 5, 'Paraíso dos leitores',
     'Curadoria incrível e o clube de leitura é maravilhoso. Encontrei edições que procurava há anos.',
     array['Bom atendimento','Superou expectativas','Recomendo'], false,
     'Ficamos felizes, Beatriz! Nosso próximo encontro já está agendado.', 10),
    ('00000000-0000-4000-8000-000000000004'::uuid, 'Anderson Rocha', 2, 'Demorou mais do que o prometido',
     'Orçamento correto, mas o prazo inicial não foi cumprido e não recebi atualizações.',
     array[]::text[], false, 'Sentimos muito, Anderson. Estamos revisando nosso processo de comunicação.', 8),
    ('00000000-0000-4000-8000-000000000005'::uuid, 'Camila Ferreira', 5, 'Profissionalismo e talento',
     'Meu corte ficou exatamente como eu queria. Atendimento gentil e ambiente impecável.',
     array['Bom atendimento','Ambiente limpo'], false, 'Obrigada, Camila! Você é sempre bem-vinda por aqui.', 4),
    ('00000000-0000-4000-8000-000000000006'::uuid, 'Fernanda Dias', 5, 'Entrega rápida e produtos frescos',
     'Fiz pedido pelo app e chegou em 25 minutos, tudo muito bem acondicionado.',
     array['Entrega rápida','Produto de qualidade'], false, 'Obrigado, Fernanda! Sua satisfação é nossa prioridade.', 7),
    ('00000000-0000-4000-8000-000000000006'::uuid, 'Cliente anônimo', 3, 'Poderia melhorar',
     'Produtos bons, mas faltaram itens no pedido e a substituição não foi avisada.',
     array[]::text[], true, 'Pedimos desculpas. Já reforçamos a conferência dos pedidos.', 13)
)
insert into public.reviews (company_id, author_name, rating, title, comment, tags, is_anonymous, truth_confirmed, response, responded_at, created_at)
select
  d.company_id, d.author_name, d.rating, d.title, d.comment, d.tags, d.is_anonymous, true,
  d.response,
  case when d.response is not null then now() - (d.days_ago - 1) * interval '1 day' end,
  now() - d.days_ago * interval '1 day'
from dados d
where not exists (
  select 1 from public.reviews r
  where r.company_id = d.company_id and r.title = d.title
);
