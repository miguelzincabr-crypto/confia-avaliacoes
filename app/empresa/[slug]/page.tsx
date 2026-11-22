'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  PenLine,
  Share2,
  Star,
  Store,
} from 'lucide-react';
import { RatingDistribution } from '@/components/RatingDistribution';
import { ReviewCard } from '@/components/ReviewCard';
import { VerificationBadge } from '@/components/VerificationBadge';
import { getCompanyBySlug, getCompanyStats, listReviews } from '@/lib/data';
import type { Company, CompanyStats, Review } from '@/lib/types';

const PER_PAGE = 5;

export default function EmpresaPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? '';

  const [company, setCompany] = useState<Company | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<CompanyStats>({ average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getCompanyBySlug(slug), listReviews()])
      .then(async ([companyRes, reviewsRes]) => {
        if (!active) return;
        setCompany(companyRes);
        const scoped = reviewsRes.filter((r) => r.company_id === companyRes?.id);
        setReviews(scoped);
        if (companyRes) setStats(await getCompanyStats(companyRes.id));
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  const pages = Math.max(1, Math.ceil(reviews.length / PER_PAGE));
  const visible = useMemo(() => reviews.slice((page - 1) * PER_PAGE, page * PER_PAGE), [reviews, page]);

  useEffect(() => setPage(1), [slug]);

  async function share() {
    if (!company) return;
    const url = `${window.location.origin}/empresa/${company.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: company.name, text: `Veja as avaliações de ${company.name}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* compartilhamento cancelado */
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6"><div className="h-80 animate-pulse rounded-3xl border border-slate-200 bg-white" /></div>;
  }

  if (!company) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-brand-900">Empresa não encontrada</h1>
        <p className="mt-2 text-sm text-slate-500">Verifique o link ou explore outras empresas avaliadas.</p>
        <Link href="/" className="btn-primary mt-6">Voltar ao início</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-brand-700">
        <ArrowLeft size={15} /> Todas as empresas
      </Link>

      {/* CABEÇALHO */}
      <header className="animate-slide-up overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
        <div className="h-24 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700 sm:h-32" />
        <div className="px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="-mt-10 flex flex-wrap items-end justify-between gap-4 sm:-mt-12">
            <div className="h-20 w-20 overflow-hidden rounded-2xl bg-white p-1 shadow-soft ring-1 ring-slate-200 sm:h-24 sm:w-24">
              {company.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logo_url} alt={`Logo ${company.name}`} className="h-full w-full rounded-xl object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-brand-50 text-2xl font-bold text-brand-700">
                  {company.name[0]}
                </div>
              )}
            </div>
            <div className="flex gap-2 pb-1">
              <button onClick={share} className="btn-secondary">
                <Share2 size={15} /> {copied ? 'Link copiado!' : 'Compartilhar'}
              </button>
              <Link href={`/avaliar/${company.slug}`} className="btn-primary">
                <PenLine size={15} /> Avaliar empresa
              </Link>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-brand-900 sm:text-3xl">{company.name}</h1>
            {company.verified && <VerificationBadge />}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            {company.category && <span className="inline-flex items-center gap-1.5"><Store size={14} /> {company.category}</span>}
            {company.city && <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {company.city}</span>}
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600">{company.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-extrabold leading-none text-brand-900">{stats.average.toFixed(1).replace('.', ',')}</span>
              <div>
                <div className="flex items-center gap-1 text-gold-500">
                  {Array.from({ length: 5 }, (_, i) => <Star key={i} size={16} className={i < Math.round(stats.average) ? 'fill-current' : 'fill-slate-200 text-slate-200'} />)}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{stats.total} {stats.total === 1 ? 'avaliação' : 'avaliações'}</p>
              </div>
            </div>
            <div className="hidden h-10 w-px bg-slate-200 sm:block" />
            <p className="text-sm text-slate-500">
              <strong className="text-brand-900">{stats.distribution[5]}</strong> pessoas avaliaram com 5 estrelas
            </p>
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <RatingDistribution stats={stats} />
          <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 p-5">
            <h3 className="font-bold text-brand-900">Já foi cliente?</h3>
            <p className="mt-1 text-sm leading-relaxed text-brand-800/80">
              Ajude outras pessoas a decidir. Leva menos de 2 minutos.
            </p>
            <Link href={`/avaliar/${company.slug}`} className="btn-primary mt-4 w-full">
              Escrever avaliação
            </Link>
          </div>
        </aside>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-brand-900">Avaliações dos clientes</h2>
            <span className="text-sm text-slate-500">{reviews.length} no total</span>
          </div>

          {visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Star size={28} className="mx-auto text-slate-300" />
              <p className="mt-3 font-semibold text-brand-900">Seja o primeiro a avaliar</p>
              <p className="mt-1 text-sm text-slate-500">Sua opinião ajuda toda a comunidade.</p>
              <Link href={`/avaliar/${company.slug}`} className="btn-primary mt-5">Avaliar agora</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {visible.map((review) => <ReviewCard key={review.id} review={review} />)}
            </div>
          )}

          {pages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Paginação de avaliações">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary px-3 py-2 disabled:opacity-40"
                aria-label="Página anterior"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  aria-current={page === n ? 'page' : undefined}
                  className={`h-10 w-10 rounded-xl text-sm font-semibold transition-all ${
                    page === n ? 'bg-brand-900 text-white shadow-soft' : 'bg-white text-slate-600 hover:bg-brand-50'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="btn-secondary px-3 py-2 disabled:opacity-40"
                aria-label="Próxima página"
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
