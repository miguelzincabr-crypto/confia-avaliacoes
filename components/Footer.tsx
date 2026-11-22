import Link from 'next/link';
import { Star } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-900">
              <Star size={16} className="fill-gold-500 text-gold-500" />
            </span>
            <span className="text-base font-bold text-brand-900">confia<span className="text-gold-500">.</span></span>
          </div>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Avaliações reais que ajudam clientes a escolher bem e empresas a evoluir.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-brand-700">Início</Link>
          <Link href="/#empresas" className="hover:text-brand-700">Empresas</Link>
          <Link href="/dashboard" className="hover:text-brand-700">Área da empresa</Link>
          <Link href="/login" className="hover:text-brand-700">Entrar</Link>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} confia. Feito com confiança.
      </div>
    </footer>
  );
}
