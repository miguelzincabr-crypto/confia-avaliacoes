import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import type { Company, CompanyStats } from '@/lib/types';
import { Stars } from './Stars';
import { VerificationBadge } from './VerificationBadge';

export function CompanyCard({ company, stats }: { company: Company; stats: CompanyStats }) {
  return (
    <Link
      href={`/empresa/${company.slug}`}
      className="group flex animate-slide-up flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-soft"
    >
      <div className="flex items-start gap-3.5">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-brand-50 ring-1 ring-slate-200">
          {company.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logo_url} alt={`Logo ${company.name}`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-bold text-brand-700">
              {company.name[0]}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-bold text-brand-900 group-hover:text-brand-700">{company.name}</h3>
            <ArrowUpRight size={16} className="shrink-0 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-500" />
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            {company.verified && <VerificationBadge compact />}
            {company.category && <span className="text-xs text-slate-500">{company.category}</span>}
          </div>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{company.description}</p>

      {company.city && (
        <p className="mt-3 flex items-center gap-1 text-xs text-slate-400">
          <MapPin size={12} /> {company.city}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
        <Stars value={stats.average} size={15} showNumber />
        <span className="text-xs text-slate-400">
          {stats.total} {stats.total === 1 ? 'avaliação' : 'avaliações'}
        </span>
      </div>
    </Link>
  );
}
