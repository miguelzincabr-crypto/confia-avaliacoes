import { BadgeCheck, Camera, CornerDownRight, MessageSquareQuote, UserRound } from 'lucide-react';
import type { Company, Review } from '@/lib/types';
import { initials, formatRelative } from '@/lib/utils';
import { Stars } from './Stars';
import { VerificationBadge } from './VerificationBadge';

type Props = {
  review: Review;
  company?: Company;
  showCompany?: boolean;
};

export function ReviewCard({ review, company, showCompany = false }: Props) {
  return (
    <article className="animate-slide-up rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft sm:p-6">
      <div className="flex items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
          {review.is_anonymous ? <UserRound size={19} /> : initials(review.author_name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold text-brand-900">{review.author_name}</span>
            {!review.is_anonymous && <BadgeCheck size={15} className="text-brand-500" aria-label="Avaliação identificada" />}
            {showCompany && company && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-sm text-slate-500">{company.name}</span>
                {company.verified && <VerificationBadge compact />}
              </>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Stars value={review.rating} size={15} />
            <span className="text-xs text-slate-400">{formatRelative(review.created_at)}</span>
            {review.truth_confirmed && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Experiência confirmada
              </span>
            )}
          </div>
        </div>
        <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-50 text-sm font-bold text-gold-700 sm:flex">
          {review.rating}
        </span>
      </div>

      <h3 className="mt-4 text-base font-bold text-brand-900">{review.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{review.comment}</p>

      {review.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {tag}
            </span>
          ))}
        </div>
      )}

      {review.photos.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {review.photos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={`Foto enviada pelo cliente ${i + 1}`}
              className="h-24 w-32 shrink-0 rounded-xl border border-slate-200 object-cover transition-transform duration-300 hover:scale-105"
            />
          ))}
        </div>
      )}

      {review.response && (
        <div className="mt-4 rounded-xl border-l-4 border-brand-500 bg-brand-50/70 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-700">
            <CornerDownRight size={14} />
            Resposta da empresa
            {review.responded_at && <span className="font-normal normal-case tracking-normal text-brand-500">· {formatRelative(review.responded_at)}</span>}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-brand-900/80">{review.response}</p>
        </div>
      )}

      {!review.response && (
        <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
          <MessageSquareQuote size={13} />
          Aguardando resposta da empresa
        </div>
      )}

      {review.photos.length > 0 && (
        <span className="sr-only"><Camera size={12} /> {review.photos.length} foto(s)</span>
      )}
    </article>
  );
}
