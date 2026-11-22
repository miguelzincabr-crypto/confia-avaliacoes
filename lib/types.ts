export type Company = {
  id: string;
  owner_id: string | null;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string;
  category: string | null;
  city: string | null;
  verified: boolean;
  created_at: string;
};

export type Review = {
  id: string;
  company_id: string;
  author_id: string | null;
  author_name: string;
  rating: number;
  title: string;
  comment: string;
  tags: string[];
  photos: string[];
  is_anonymous: boolean;
  truth_confirmed: boolean;
  response: string | null;
  responded_at: string | null;
  created_at: string;
};

export type ReviewInput = {
  company_id: string;
  author_id?: string | null;
  author_name: string;
  rating: number;
  title: string;
  comment: string;
  tags: string[];
  photos: string[];
  is_anonymous: boolean;
  truth_confirmed: boolean;
};

export type RatingDistribution = Record<1 | 2 | 3 | 4 | 5, number>;

export type CompanyStats = {
  average: number;
  total: number;
  distribution: RatingDistribution;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  companyId?: string;
};

export const QUICK_TAGS = [
  'Bom atendimento',
  'Entrega rápida',
  'Preço justo',
  'Produto de qualidade',
  'Ambiente limpo',
  'Pontualidade',
  'Superou expectativas',
  'Recomendo',
] as const;

export const RATING_LABELS: Record<number, string> = {
  1: 'Muito insatisfatório',
  2: 'Insatisfatório',
  3: 'Regular',
  4: 'Bom',
  5: 'Excelente',
};
