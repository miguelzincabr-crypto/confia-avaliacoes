import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function VerificationBadge({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span
      title="Empresa verificada pela plataforma"
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-brand-50 font-semibold text-brand-700 ring-1 ring-inset ring-brand-200',
        compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
        className
      )}
    >
      <BadgeCheck size={compact ? 12 : 14} className="text-brand-600" />
      {!compact && 'Verificada'}
    </span>
  );
}
