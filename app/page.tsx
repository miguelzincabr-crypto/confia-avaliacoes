'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  X,
} from 'lucide-react';
import { CompanyCard } from '@/components/CompanyCard';
import { ReviewCard } from '@/components/ReviewCard';
import { Stars } from '@/components/Stars';
import { getRecentReviews, getTopCompanies, listCompanies, listReviews } from '@/lib/data';
import type { Company, CompanyStats, Review } from '@/lib/types';
import { computeStats } from '@/lib/data';
import { isSupabaseConfigured } from '@/lib/data';

type TopItem = { company: Company; stats: CompanyStats };

export default function HomePage() {
  const [top, setTop] = useState<TopItem[]>([]);
  const [recent, setRecent] = useState<Review[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([getTopCompanies(4), getRecentReviews(6), listCompanies(), listReviews()])
      .then(([topRes, recentRes, companiesRes, reviewsRes]) => {
        if (!active) return;
        setTop(topRes);
        setRecent(recentRes);
        setCompanies(companiesRes);
        setAllReviews(reviewsRes);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const term = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (term.length < 2) return null;
    const matchedCompanies = companies.filter((c) =>
      [c.name, c.category ?? '', c.description, c.city ?? ''].some((v) => v.toLowerCase().includes(term))
    );
    const matchedReviews = allReviews.filter((r) =>
      [r.title, r.comment, ...r.tags].some((v) => v.toLowerCase().includes(term))
    );
    return { companies: matchedCompanies, reviews: matchedReviews };
  }, [term, companies, allReviews]);

  const totalReviews = allReviews.length;
  const totalCompanies = companies.length;
  const overallAverage = computeStats(allReviews).average;

  return (
    <>
      {/* HERO + BUSCA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 20%, #fff 0, transparent 38%), radial-gradient(circle at 82% 70%, #f5b301 0, transparent 32%)',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-16 text-center sm:px-6 sm:pb-28 sm:pt-24">
          <span className="inline-flex animate-fade-in items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-brand-50 backdrop-blur">
            <ShieldCheck size={14} className="text-gold-400" />
            Avaliações de experiências reais
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl animate-slide-up text-4xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Escolha bem. <span className="text-gold-400">Confie</span> em quem já passou por isso.
          </h1>
          <p className="mx-auto mt-5 max-w-xl animate-slide-up text-base leading-relaxed text-brand-100 sm:text-lg">
            Encontre empresas, leia avaliações verificadas e compartilhe a sua experiência em poucos cliques.
          </p>

          <div className="relative mx-auto mt-9 max-w-2xl animate-slide-up">
            <Search className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busque por empresa, produto ou palavra-chave..."
              aria-label="Buscar empresas ou avaliações"
              className="w-full rounded-2xl border-0 bg-white py-4 pl-13 pr-12 text-sm text-brand-900 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-gold-400/40 sm:text-base"
              style={{ paddingLeft: '3.25rem' }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Limpar busca"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-800"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-brand-200 sm:text-sm">
            <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-gold-400" /> Avaliações recentes</span>
            <span className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-gold-400" /> Selos de verificação</span>
            <span className="flex items-center gap-1.5"><Star size={14} className="text-gold-400" /> Notas de 1 a 5 estrelas</span>
          </div>
        </div>
      </section>

      {/* INDICADORES */}
      <section className="relative z-10 mx-auto -mt-12 max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
          {[
            { label: 'Avaliações publicadas', value: totalReviews },
            { label: 'Empresas avaliadas', value: totalCompanies },
            { label: 'Nota média geral', value: overallAverage.toFixed(1).replace('.', ',') },
          ].map((item) => (
            <div key={item.label} className="px-2 text-center">
              <p className="text-xl font-extrabold text-brand-900 sm:text-3xl">{loading ? '—' : item.value}</p>
              <p className="mt-0.5 text-[10px] font-medium text-slate-500 sm:text-xs">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RESULTADOS DA BUSCA */}
      {results && (
        <section className="mx-auto max-w-6xl animate-fade-in px-4 pt-12 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Resultados para “{query.trim()}”</h2>
            <span className="text-sm text-slate-500">
              {results.companies.length + results.reviews.length} resultado(s)
            </span>
          </div>
          {results.companies.length === 0 && results.reviews.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Search size={28} className="mx-auto text-slate-300" />
              <p className="mt-3 font-semibold text-brand-900">Nada encontrado</p>
              <p className="mt-1 text-sm text-slate-500">Tente outro termo ou navegue pelas empresas abaixo.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-10">
              {results.companies.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Empresas</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {results.companies.map((company) => (
                      <CompanyCard key={company.id} company={company} stats={computeStats(allReviews.filter((r) => r.company_id === company.id))} />
                    ))}
                  </div>
                </div>
              )}
              {results.reviews.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Avaliações</h3>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {results.reviews.slice(0, 6).map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        company={companies.find((c) => c.id === review.company_id)}
                        showCompany
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* AVALIAÇÕES RECENTES */}
      <section id="avaliacoes" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-16 sm:px-6 sm:pt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-500">O que dizem os clientes</span>
            <h2 className="section-title mt-1">Avaliações recentes</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Atualizado agora
          </span>
        </div>

        {loading ? (
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </div>
        ) : (
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                company={companies.find((c) => c.id === review.company_id)}
                showCompany
              />
            ))}
          </div>
        )}
      </section>

      {/* EMPRESAS MAIS BEM AVALIADAS */}
      <section id="empresas" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-16 sm:px-6 sm:pt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gold-600">
              <TrendingUp size={13} /> Destaques
            </span>
            <h2 className="section-title mt-1">Empresas mais bem avaliadas</h2>
          </div>
          <span className="text-sm text-slate-500">Baseado na média das avaliações</span>
        </div>

        {loading ? (
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </div>
        ) : (
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {top.map(({ company, stats }) => (
              <CompanyCard key={company.id} company={company} stats={stats} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
        <div className="relative overflow-hidden rounded-3xl bg-brand-900 px-6 py-10 text-center sm:px-12 sm:py-14">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold-500/10 blur-2xl" />
          <Star size={30} className="mx-auto fill-gold-500 text-gold-500" />
          <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">Sua opinião faz a diferença</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-brand-100 sm:text-base">
            Avalie uma empresa em menos de 2 minutos. É rápido, anônimo se você quiser e ajuda outras pessoas a decidirem.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {top[0] && (
              <Link href={`/avaliar/${top[0].company.slug}`} className="btn-primary bg-gold-500 text-brand-950 hover:bg-gold-400">
                Avaliar uma empresa <ArrowRight size={16} />
              </Link>
            )}
            <Link href="/dashboard" className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20">
              Sou empresa
            </Link>
          </div>
          {!isSupabaseConfigured && (
            <p className="mt-6 text-xs text-brand-300">
              Modo demonstração ativo — os dados ficam salvos neste navegador.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
