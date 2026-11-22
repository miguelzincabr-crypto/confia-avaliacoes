'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Building2, Loader2, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured, signIn, signInDemo, signUp } from '@/lib/data';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres.');
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password, name);
        setError('Conta criada! Verifique seu e-mail para confirmar o cadastro e então faça login.');
        setMode('login');
      } else {
        await signIn(email, password);
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo() {
    setLoading(true);
    await signInDemo();
    router.push('/dashboard');
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-10 sm:px-6 sm:py-16">
      <Link href="/" className="mb-8 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-slate-500 hover:text-brand-700">
        <ArrowLeft size={15} /> Início
      </Link>

      <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft md:grid-cols-2">
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-brand-950 to-brand-800 p-10 text-white md:flex">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <ShieldCheck size={22} className="text-gold-400" />
            </div>
            <h2 className="mt-8 text-3xl font-bold leading-tight">Seu painel, sua reputação.</h2>
            <p className="mt-4 text-sm leading-relaxed text-brand-100">
              Acompanhe avaliações em tempo real, responda publicamente e compartilhe seu link de convite.
            </p>
          </div>
          <div className="space-y-4 text-sm text-brand-100">
            {['Métricas e distribuição por estrelas', 'Respostas públicas em um clique', 'Link e QR Code para convidar clientes'].map((item) => (
              <p key={item} className="flex items-center gap-2"><span className="text-gold-400">✓</span> {item}</p>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Building2 size={21} />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-brand-900">
            {mode === 'login' ? 'Área da empresa' : 'Criar conta'}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {mode === 'login' ? 'Entre para gerenciar suas avaliações.' : 'Cadastre sua empresa e comece a receber avaliações.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="nome" className="label-field">Nome do responsável</label>
                <input id="nome" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Seu nome" required />
              </div>
            )}
            <div>
              <label htmlFor="email" className="label-field">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="voce@empresa.com" required />
              </div>
            </div>
            <div>
              <label htmlFor="senha" className="label-field">Senha</label>
              <div className="relative">
                <LockKeyhole size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10" placeholder="Mínimo 6 caracteres" required />
              </div>
            </div>

            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 size={17} className="animate-spin" /> : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} className="mt-4 w-full text-center text-sm font-semibold text-brand-700 hover:underline">
            {mode === 'login' ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
          </button>

          {!isSupabaseConfigured && (
            <>
              <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
                <span className="h-px flex-1 bg-slate-200" /> ou <span className="h-px flex-1 bg-slate-200" />
              </div>
              <button onClick={handleDemo} disabled={loading} className="btn-secondary w-full border-brand-200 bg-brand-50 text-brand-800 hover:bg-brand-100">
                Acessar com conta de demonstração
              </button>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400">
                Modo demo: nenhum dado sai do seu navegador.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
