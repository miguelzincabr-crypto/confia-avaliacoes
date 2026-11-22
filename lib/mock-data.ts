import type { Company, Review } from './types';

const daysAgo = (days: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

/** SVG inline para o modo demo funcionar sem depender de imagens externas. */
const photo = (a: string, b: string, label: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
      </linearGradient></defs>
      <rect width="400" height="300" fill="url(#g)"/>
      <circle cx="310" cy="70" r="34" fill="rgba(255,255,255,.35)"/>
      <path d="M0 230 L110 150 L190 215 L275 130 L400 235 L400 300 L0 300 Z" fill="rgba(255,255,255,.28)"/>
      <text x="20" y="282" font-family="sans-serif" font-size="18" fill="rgba(255,255,255,.85)">${label}</text>
    </svg>`
  )}`;

const logo = (bg: string, text: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <rect width="160" height="160" rx="36" fill="${bg}"/>
      <text x="80" y="98" text-anchor="middle" font-family="sans-serif" font-size="56" font-weight="700" fill="#fff">${text}</text>
    </svg>`
  )}`;

export const DEMO_COMPANIES: Company[] = [
  {
    id: 'cmp-aurora',
    owner_id: 'demo-owner',
    name: 'Aurora Café',
    slug: 'aurora-cafe',
    logo_url: logo('#0f2a4a', 'A'),
    description:
      'Café de especialidade, bolos artesanais e um ambiente acolhedor no coração da cidade. Torra própria e atendimento feito com carinho.',
    category: 'Cafeteria',
    city: 'São Paulo, SP',
    verified: true,
    created_at: daysAgo(420),
  },
  {
    id: 'cmp-techserve',
    owner_id: 'demo-owner',
    name: 'TechServe Solutions',
    slug: 'techserve-solutions',
    logo_url: logo('#1f54cf', 'T'),
    description:
      'Consultoria em tecnologia, desenvolvimento de sistemas e suporte ágil para empresas de todos os portes.',
    category: 'Tecnologia',
    city: 'Curitiba, PR',
    verified: true,
    created_at: daysAgo(360),
  },
  {
    id: 'cmp-livraria',
    owner_id: 'demo-owner',
    name: 'Livraria Horizonte',
    slug: 'livraria-horizonte',
    logo_url: logo('#b45309', 'L'),
    description:
      'Livros novos e raros, clube de leitura e cafés literários. Um refúgio para quem ama histórias.',
    category: 'Livraria',
    city: 'Porto Alegre, RS',
    verified: true,
    created_at: daysAgo(300),
  },
  {
    id: 'cmp-oficina',
    owner_id: 'demo-owner',
    name: 'Oficina Rápida Centro',
    slug: 'oficina-rapida-centro',
    logo_url: logo('#374151', 'O'),
    description:
      'Manutenção preventiva e corretiva de veículos com orçamento transparente e prazo cumprido.',
    category: 'Automotivo',
    city: 'Belo Horizonte, MG',
    verified: false,
    created_at: daysAgo(250),
  },
  {
    id: 'cmp-studio',
    owner_id: 'demo-owner',
    name: 'Studio Bella',
    slug: 'studio-bella',
    logo_url: logo('#9d174d', 'B'),
    description:
      'Salão de beleza com profissionais especializados em cortes, coloração e tratamentos capilares.',
    category: 'Beleza',
    city: 'Recife, PE',
    verified: true,
    created_at: daysAgo(210),
  },
  {
    id: 'cmp-mercado',
    owner_id: 'demo-owner',
    name: 'Mercado Natural',
    slug: 'mercado-natural',
    logo_url: logo('#15803d', 'M'),
    description:
      'Hortifruti e produtos orgânicos selecionados, com entrega rápida na região metropolitana.',
    category: 'Supermercado',
    city: 'Florianópolis, SC',
    verified: false,
    created_at: daysAgo(180),
  },
];

export const DEMO_REVIEWS: Review[] = [
  {
    id: 'rev-1', company_id: 'cmp-aurora', author_id: null, author_name: 'Marina Costa',
    rating: 5, title: 'O melhor café da cidade!',
    comment: 'Atendimento impecável e o café coado na hora é sensacional. O bolo de cenoura da casa é imperdível. Volto sempre!',
    tags: ['Bom atendimento', 'Produto de qualidade', 'Recomendo'],
    photos: [photo('#f5b301', '#d99a00', 'Café da casa')],
    is_anonymous: false, truth_confirmed: true,
    response: 'Muito obrigada, Marina! Ficamos felizes em saber que você aprecia nosso café. Esperamos você em breve! ☕',
    responded_at: daysAgo(4), created_at: daysAgo(5),
  },
  {
    id: 'rev-2', company_id: 'cmp-aurora', author_id: null, author_name: 'Cliente anônimo',
    rating: 4, title: 'Ótimo ambiente, mas lotado',
    comment: 'Produto excelente e equipe atenciosa. Só acho que falta mais espaço nos horários de pico.',
    tags: ['Bom atendimento', 'Ambiente limpo'], photos: [],
    is_anonymous: true, truth_confirmed: true,
    response: null, responded_at: null, created_at: daysAgo(2),
  },
  {
    id: 'rev-3', company_id: 'cmp-aurora', author_id: null, author_name: 'Rafael Lima',
    rating: 5, title: 'Experiência perfeita',
    comment: 'Barista explicou a origem dos grãos com muita paciência. Nota 10!',
    tags: ['Bom atendimento', 'Superou expectativas'], photos: [],
    is_anonymous: false, truth_confirmed: true,
    response: 'Que legal, Rafael! Adoramos compartilhar a história por trás de cada grão. Obrigado!',
    responded_at: daysAgo(8), created_at: daysAgo(9),
  },
  {
    id: 'rev-4', company_id: 'cmp-techserve', author_id: null, author_name: 'Juliana Prado',
    rating: 5, title: 'Equipe extremamente competente',
    comment: 'Contratamos para desenvolver nosso sistema interno. Entregaram antes do prazo, com documentação completa e suporte excelente.',
    tags: ['Entrega rápida', 'Produto de qualidade', 'Preço justo'],
    photos: [photo('#1f54cf', '#0f2a4a', 'Projeto entregue')],
    is_anonymous: false, truth_confirmed: true,
    response: 'Obrigado, Juliana! Foi um prazer trabalhar com a equipe de vocês. Estamos à disposição para a próxima fase.',
    responded_at: daysAgo(3), created_at: daysAgo(6),
  },
  {
    id: 'rev-5', company_id: 'cmp-techserve', author_id: null, author_name: 'Carlos Menezes',
    rating: 4, title: 'Bom custo-benefício',
    comment: 'Profissionais sérios. O suporte poderia ter um tempo de resposta um pouco menor à noite.',
    tags: ['Preço justo'], photos: [],
    is_anonymous: false, truth_confirmed: true,
    response: 'Obrigado pelo retorno, Carlos! Já estamos ajustando a escala do suporte noturno.',
    responded_at: daysAgo(12), created_at: daysAgo(14),
  },
  {
    id: 'rev-6', company_id: 'cmp-techserve', author_id: null, author_name: 'Cliente anônimo',
    rating: 3, title: 'Regular',
    comment: 'O projeto foi entregue, mas houve bastante retrabalho na primeira versão.',
    tags: [], photos: [],
    is_anonymous: true, truth_confirmed: true,
    response: null, responded_at: null, created_at: daysAgo(1),
  },
  {
    id: 'rev-7', company_id: 'cmp-livraria', author_id: null, author_name: 'Beatriz Souza',
    rating: 5, title: 'Paraíso dos leitores',
    comment: 'Curadoria incrível e o clube de leitura é maravilhoso. Encontrei edições que procurava há anos.',
    tags: ['Bom atendimento', 'Superou expectativas', 'Recomendo'], photos: [],
    is_anonymous: false, truth_confirmed: true,
    response: 'Ficamos tão felizes, Beatriz! Our next encontro já está agendado. 📚',
    responded_at: daysAgo(7), created_at: daysAgo(10),
  },
  {
    id: 'rev-8', company_id: 'cmp-livraria', author_id: null, author_name: 'Pedro Alves',
    rating: 5, title: 'Recomendo demais',
    comment: 'Ambiente aconchegante, preços justos e atendimento que realmente conhece literatura.',
    tags: ['Preço justo', 'Ambiente limpo'], photos: [],
    is_anonymous: false, truth_confirmed: true,
    response: null, responded_at: null, created_at: daysAgo(3),
  },
  {
    id: 'rev-9', company_id: 'cmp-oficina', author_id: null, author_name: 'Anderson Rocha',
    rating: 2, title: 'Demorou mais do que o prometido',
    comment: 'Orçamento correto, mas o prazo inicial não foi cumprido e não recebi atualizações.',
    tags: [], photos: [],
    is_anonymous: false, truth_confirmed: true,
    response: 'Sentimos muito, Anderson. Estamos revisando nosso processo de comunicação para evitar que isso se repita.',
    responded_at: daysAgo(5), created_at: daysAgo(8),
  },
  {
    id: 'rev-10', company_id: 'cmp-oficina', author_id: null, author_name: 'Cliente anônimo',
    rating: 4, title: 'Serviço bom',
    comment: 'Preço honesto e o carro ficou pronto no dia combinado.',
    tags: ['Preço justo', 'Pontualidade'], photos: [],
    is_anonymous: true, truth_confirmed: true,
    response: null, responded_at: null, created_at: daysAgo(15),
  },
  {
    id: 'rev-11', company_id: 'cmp-studio', author_id: null, author_name: 'Camila Ferreira',
    rating: 5, title: 'Profissionalismo e talento',
    comment: 'Meu corte ficou exatamente como eu queria. Atendimento gentil e ambiente impecável.',
    tags: ['Bom atendimento', 'Ambiente limpo'],
    photos: [photo('#9d174d', '#be185d', 'Corte realizado')],
    is_anonymous: false, truth_confirmed: true,
    response: 'Obrigada, Camila! Você é sempre muito bem-vinda por aqui. ✨',
    responded_at: daysAgo(2), created_at: daysAgo(4),
  },
  {
    id: 'rev-12', company_id: 'cmp-studio', author_id: null, author_name: 'Larissa Gomes',
    rating: 4, title: 'Gostei bastante',
    comment: 'Ótimos profissionais, apenas senti falta de mais opções de horário aos sábados.',
    tags: ['Bom atendimento'], photos: [],
    is_anonymous: false, truth_confirmed: true,
    response: null, responded_at: null, created_at: daysAgo(11),
  },
  {
    id: 'rev-13', company_id: 'cmp-mercado', author_id: null, author_name: 'Fernanda Dias',
    rating: 5, title: 'Entrega rápida e produtos frescos',
    comment: 'Fiz pedido pelo app e chegou em 25 minutos, tudo muito bem acondicionado.',
    tags: ['Entrega rápida', 'Produto de qualidade'], photos: [],
    is_anonymous: false, truth_confirmed: true,
    response: 'Obrigado, Fernanda! Sua satisfação é nossa prioridade. 🥬',
    responded_at: daysAgo(6), created_at: daysAgo(7),
  },
  {
    id: 'rev-14', company_id: 'cmp-mercado', author_id: null, author_name: 'Cliente anônimo',
    rating: 3, title: 'Poderia melhorar',
    comment: 'Produtos bons, mas faltaram itens no pedido e a substituição não foi avisada.',
    tags: [], photos: [],
    is_anonymous: true, truth_confirmed: true,
    response: 'Pedimos desculpas. Já reforçamos a conferência dos pedidos e a comunicação sobre substituições.',
    responded_at: daysAgo(9), created_at: daysAgo(13),
  },
  {
    id: 'rev-15', company_id: 'cmp-mercado', author_id: null, author_name: 'Bruno Martins',
    rating: 5, title: 'Excelente',
    comment: 'Melhor hortifruti da região, com preços muito competitivos.',
    tags: ['Preço justo', 'Recomendo'], photos: [],
    is_anonymous: false, truth_confirmed: true,
    response: null, responded_at: null, created_at: daysAgo(20),
  },
];
