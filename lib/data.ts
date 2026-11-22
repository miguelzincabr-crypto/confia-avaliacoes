import { supabase, isSupabaseConfigured, PHOTOS_BUCKET } from './supabase';
import { DEMO_COMPANIES, DEMO_REVIEWS } from './mock-data';
import type {
  Company,
  CompanyStats,
  RatingDistribution,
  Review,
  ReviewInput,
  SessionUser,
} from './types';
import { slugify } from './utils';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const K_COMPANIES = 'confia:companies';
const K_REVIEWS = 'confia:reviews';
const K_SESSION = 'confia:session';

function readLocal<T>(key: string, seed: T): T {
  if (typeof window === 'undefined') return seed;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      window.localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as T;
  } catch {
    return seed;
  }
}

function writeLocal<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function computeStats(reviews: Review[]): CompanyStats {
  const distribution: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const review of reviews) {
    const rating = Math.min(5, Math.max(1, Math.round(review.rating)));
    distribution[rating as 1 | 2 | 3 | 4 | 5] += 1;
    sum += rating;
  }
  return {
    total: reviews.length,
    average: reviews.length ? sum / reviews.length : 0,
    distribution,
  };
}

const byDateDesc = (a: Review, b: Review) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

/* ------------------------------------------------------------------ */
/* Empresas                                                            */
/* ------------------------------------------------------------------ */

export async function listCompanies(): Promise<Company[]> {
  if (supabase) {
    const { data, error } = await supabase.from('companies').select('*').order('created_at');
    if (error) throw error;
    return (data ?? []) as Company[];
  }
  return readLocal<Company[]>(K_COMPANIES, DEMO_COMPANIES);
}

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  const companies = await listCompanies();
  return companies.find((c) => c.slug === slug) ?? null;
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const companies = await listCompanies();
  return companies.find((c) => c.id === id) ?? null;
}

export async function getTopCompanies(limit = 4): Promise<Array<{ company: Company; stats: CompanyStats }>> {
  const companies = await listCompanies();
  const reviews = await listReviews();
  return companies
    .map((company) => ({
      company,
      stats: computeStats(reviews.filter((r) => r.company_id === company.id)),
    }))
    .filter((item) => item.stats.total > 0)
    .sort((a, b) => b.stats.average - a.stats.average || b.stats.total - a.stats.total)
    .slice(0, limit);
}

export async function createCompany(input: {
  name: string;
  description: string;
  category?: string;
  city?: string;
  ownerId?: string;
}): Promise<Company> {
  const slugBase = slugify(input.name) || 'empresa';
  if (supabase) {
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('companies')
      .insert({
        name: input.name,
        slug: `${slugBase}-${Math.random().toString(36).slice(2, 6)}`,
        description: input.description,
        category: input.category ?? null,
        city: input.city ?? null,
        owner_id: input.ownerId ?? userData.user?.id ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return data as Company;
  }

  const companies = readLocal<Company[]>(K_COMPANIES, DEMO_COMPANIES);
  const company: Company = {
    id: `cmp-${crypto.randomUUID()}`,
    owner_id: input.ownerId ?? 'demo-owner',
    name: input.name,
    slug: `${slugBase}-${Math.random().toString(36).slice(2, 6)}`,
    logo_url: null,
    description: input.description,
    category: input.category ?? null,
    city: input.city ?? null,
    verified: false,
    created_at: new Date().toISOString(),
  };
  writeLocal(K_COMPANIES, [company, ...companies]);
  return company;
}

/* ------------------------------------------------------------------ */
/* Avaliações                                                          */
/* ------------------------------------------------------------------ */

export async function listReviews(companyId?: string): Promise<Review[]> {
  let rows: Review[];
  if (supabase) {
    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (companyId) query = query.eq('company_id', companyId);
    const { data, error } = await query;
    if (error) throw error;
    rows = (data ?? []) as Review[];
  } else {
    rows = readLocal<Review[]>(K_REVIEWS, DEMO_REVIEWS);
    if (companyId) rows = rows.filter((r) => r.company_id === companyId);
  }
  return rows.sort(byDateDesc);
}

export async function getRecentReviews(limit = 6): Promise<Review[]> {
  return (await listReviews()).slice(0, limit);
}

export async function getCompanyStats(companyId: string): Promise<CompanyStats> {
  return computeStats(await listReviews(companyId));
}

export async function createReview(input: ReviewInput): Promise<Review> {
  if (supabase) {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        company_id: input.company_id,
        author_id: input.author_id ?? null,
        author_name: input.is_anonymous ? 'Cliente anônimo' : input.author_name,
        rating: input.rating,
        title: input.title,
        comment: input.comment,
        tags: input.tags,
        photos: input.photos,
        is_anonymous: input.is_anonymous,
        truth_confirmed: input.truth_confirmed,
      })
      .select()
      .single();
    if (error) throw error;
    return data as Review;
  }

  const reviews = readLocal<Review[]>(K_REVIEWS, DEMO_REVIEWS);
  const review: Review = {
    id: `rev-${crypto.randomUUID()}`,
    company_id: input.company_id,
    author_id: input.author_id ?? null,
    author_name: input.is_anonymous ? 'Cliente anônimo' : input.author_name,
    rating: input.rating,
    title: input.title,
    comment: input.comment,
    tags: input.tags,
    photos: input.photos,
    is_anonymous: input.is_anonymous,
    truth_confirmed: input.truth_confirmed,
    response: null,
    responded_at: null,
    created_at: new Date().toISOString(),
  };
  writeLocal(K_REVIEWS, [review, ...reviews]);
  return review;
}

export async function respondToReview(reviewId: string, response: string): Promise<void> {
  const clean = response.trim();
  if (!clean) return;
  if (supabase) {
    const { error } = await supabase
      .from('reviews')
      .update({ response: clean, responded_at: new Date().toISOString() })
      .eq('id', reviewId);
    if (error) throw error;
    return;
  }
  const reviews = readLocal<Review[]>(K_REVIEWS, DEMO_REVIEWS);
  writeLocal(
    K_REVIEWS,
    reviews.map((r) =>
      r.id === reviewId ? { ...r, response: clean, responded_at: new Date().toISOString() } : r
    )
  );
}

export async function uploadReviewPhotos(files: File[], companyId: string): Promise<string[]> {
  if (!files.length) return [];

  if (supabase) {
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${companyId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  }

  return Promise.all(
    files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
          reader.readAsDataURL(file);
        })
    )
  );
}

/* ------------------------------------------------------------------ */
/* Autenticação / sessão                                               */
/* ------------------------------------------------------------------ */

export async function getSession(): Promise<SessionUser | null> {
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    const [{ data: profile }, { data: company }] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', data.user.id).maybeSingle(),
      supabase.from('companies').select('id').eq('owner_id', data.user.id).maybeSingle(),
    ]);
    return {
      id: data.user.id,
      email: data.user.email ?? '',
      name: profile?.full_name ?? data.user.email?.split('@')[0] ?? 'Usuário',
      companyId: company?.id,
    };
  }
  return readLocal<SessionUser | null>(K_SESSION, null);
}

export async function signIn(email: string, password: string): Promise<SessionUser> {
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const user = await getSession();
    if (!user) throw new Error('Não foi possível carregar a sessão.');
    return user;
  }
  const user: SessionUser = {
    id: 'demo-owner',
    email: email || 'empresa@demo.com',
    name: email ? email.split('@')[0] : 'Empresa Demo',
    companyId: 'cmp-aurora',
  };
  writeLocal(K_SESSION, user);
  return user;
}

export async function signUp(email: string, password: string, fullName: string): Promise<void> {
  if (!supabase) {
    throw new Error('No modo demo não é necessário criar conta — use o acesso de demonstração.');
  }
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
}

export async function signInDemo(): Promise<SessionUser> {
  const user: SessionUser = {
    id: 'demo-owner',
    email: 'empresa@demo.com',
    name: 'Empresa Demo',
    companyId: 'cmp-aurora',
  };
  writeLocal(K_SESSION, user);
  return user;
}

export async function signOut(): Promise<void> {
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
  if (typeof window !== 'undefined') window.localStorage.removeItem(K_SESSION);
}

export { isSupabaseConfigured };
