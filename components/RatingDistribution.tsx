import type { CompanyStats } from '@/lib/types';
import { Stars } from './Stars';

export function RatingDistribution({ stats, showAverage = true }: { stats: CompanyStats; showAverage?: boolean }) {
  const max = Math.max(1, ...Object.values(stats.distribution));

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card sm:p-6">
      {showAverage && (
        <div className="mb-5 flex items-end gap-4 border-b border-slate-100 pb-5">
          <span className="text-5xl font-extrabold leading-none tracking-tight text-brand-900">
            {stats.average.toFixed(1).replace('.', ',')}
          </span>
          <div className="pb-1">
            <Stars value={stats.average} size={18} />
            <p className="mt-1 text-xs text-slate-500">
              {stats.total} {stats.total === 1 ? 'avaliação' : 'avaliações'}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = stats.distribution[star];
          const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
          return (
            <div key={star} className="flex items-center gap-3">
              <span className="flex w-12 shrink-0 items-center gap-1 text-xs font-semibold text-slate-600">
                {star} <span className="text-gold-500">★</span>
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-500 transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%`, opacity: count / max ? 0.45 + 0.55 * (count / max) : 0.45 }}
                />
              </div>
              <span className="w-9 shrink-0 text-right text-xs tabular-nums text-slate-500">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
