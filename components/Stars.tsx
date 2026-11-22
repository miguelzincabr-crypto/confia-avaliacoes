'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { RATING_LABELS } from '@/lib/types';

type StarsProps = {
  value: number;
  size?: number;
  className?: string;
  showNumber?: boolean;
  label?: string;
};

/** Exibição de nota com preenchimento parcial (ex.: 4,3). */
export function Stars({ value, size = 16, className, showNumber = false, label }: StarsProps) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)} aria-label={`${value.toFixed(1)} de 5 estrelas`}>
      <span className="relative inline-flex" style={{ height: size }}>
        <span className="inline-flex gap-0.5 text-slate-300">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={size} strokeWidth={1.5} className="fill-current" />
          ))}
        </span>
        <span
          className="absolute inset-y-0 left-0 inline-flex gap-0.5 overflow-hidden text-gold-500"
          style={{ width: `${pct}%` }}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={size} strokeWidth={1.5} className="fill-current shrink-0" style={{ minWidth: size }} />
          ))}
        </span>
      </span>
      {showNumber && <span className="text-sm font-semibold text-brand-900">{value.toFixed(1)}</span>}
      {label && <span className="text-xs text-slate-500">{label}</span>}
    </span>
  );
}

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  size?: number;
  disabled?: boolean;
  id?: string;
};

/** Seletor interativo de 1 a 5 estrelas com hover e navegação por teclado. */
export function StarRating({ value, onChange, size = 40, disabled = false, id }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div
      id={id}
      role="radiogroup"
      aria-label="Selecione a nota de 1 a 5 estrelas"
      className="inline-flex items-center gap-1"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} ${star === 1 ? 'estrela' : 'estrelas'} — ${RATING_LABELS[star]}`}
          disabled={disabled}
          onMouseEnter={() => setHover(star)}
          onFocus={() => setHover(star)}
          onBlur={() => setHover(0)}
          onClick={() => onChange(star)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
              e.preventDefault();
              const next = Math.min(5, star + 1);
              onChange(next);
              setHover(next);
            }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
              e.preventDefault();
              const prev = Math.max(1, star - 1);
              onChange(prev);
              setHover(prev);
            }
          }}
          className={cn(
            'rounded-lg p-1 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
            disabled ? 'cursor-default opacity-70' : 'cursor-pointer hover:scale-110 active:scale-95'
          )}
        >
          <Star
            size={size}
            strokeWidth={1.6}
            className={cn(
              'transition-all duration-200',
              star <= active
                ? 'fill-gold-500 text-gold-500 drop-shadow-[0_2px_4px_rgba(245,179,1,0.35)]'
                : 'fill-transparent text-slate-300'
            )}
          />
        </button>
      ))}
    </div>
  );
}
