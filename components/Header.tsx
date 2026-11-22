'use client';

import Link from 'next/link';
import { Menu, Star, X, LayoutDashboard, Search } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Header() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/#avaliacoes', label: 'Avaliações recentes', icon: Star },
    { href: '/#empresas', label: 'Melhores empresas', icon: Search },
    { href: '/dashboard', label: 'Área da empresa', icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-900 shadow-soft">
            <Star size={19} className="fill-gold-500 text-gold-500" />
          </span>
          <span className="text-lg font-bold tracking-tight text-brand-900">
            confia<span className="text-gold-500">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-800"
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-sm font-semibold text-brand-800 transition-colors hover:text-brand-600"
          >
            Entrar
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-brand-800 active:translate-y-0"
          >
            Sou empresa
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-brand-900 transition-colors hover:bg-brand-50 md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        className={cn(
          'overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 md:hidden',
          open ? 'max-h-80' : 'max-h-0 border-transparent'
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-50"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="mt-1 rounded-xl border border-brand-200 px-3 py-2.5 text-center text-sm font-semibold text-brand-800"
          >
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  );
}
