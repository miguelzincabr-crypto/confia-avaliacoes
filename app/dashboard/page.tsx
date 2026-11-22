'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Filter,
  Inbox,
  Loader2,
  LogOut,
  Mail,
  MessageSquareReply,
  QrCode,
  Send,
  Star,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { RatingDistribution } from '@/components/RatingDistribution';
import { Stars } from '@/components/Stars';
import { computeStats, getSession, listCompanies, listReviews, respondToReview, signInDemo, signOut } from '@/lib/data';
import type { Company, CompanyStats, Review, SessionUser } from '@/lib/types';
import { cn, formatDate, initials, pluralize } from '@/lib/utils';

type AnswerFilter = 'all' | 'answered' | 'unanswered';
type DaysFilter = 'all' | '7' | '30' | '90';

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [companyId, setCompanyId] = useState('');
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);

  const [ratingFilter, setRatingFilter] = useState('all');
  const [daysFilter, setDaysFilter] = useState<DaysFilter>('all');
  const [answerFilter, setAnswerFilter] = useState<AnswerFilter>('all');

  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    getSession()
      .then(async (s) => {
        if (!active) return;
        setSession(s);
        if (s) {
          const [companiesRes, reviewsRes] = await Promise.all([listCompanies(), listReviews()]);
          if (!active) return;
          const owned = companiesRes.filter((c) => !s.companyId || !c.owner_id || c.owner_id === s.id || c.id === s.companyId);
          setCompanies(owned.length ? owned : companiesRes);
          setReviews(reviewsRes);
          setCompanyId(s.companyId ?? owned[0]?.id ?? companiesRes[0]?.id ?? '');
        }
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
        setAuthChecking(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const company = companies.find((c) => c.id === companyId) ?? null;
  const companyReviews = useMemo(() => reviews.filter((r) => r.company_id === companyId), [reviews, companyId]);
  const stats: CompanyStats = useMemo(() => computeStats(companyReviews), [companyReviews]);

  const filtered = useMemo(() => {
    const now = Date.now();
    return companyReviews.filter((r) => {
      if (ratingFilter !== 'all' && r.rating !== Number(ratingFilter)) return false;
      if (daysFilter !== 'all') {
        const limit = Number(daysFilter) * 86400000;
        if (now - new Date(r.created_at).getTime() > limit) return false;
      }
      if (answerFilter === 'answered' && !r.response) return false;
      if (answerFilter === 'unanswered' && r.response) return false;
      return true;
    });
  }, [companyReviews, ratingFilter, daysFilter, answerFilter]);

  const answered = companyReviews.filter((r) => r.response).length;
  const unanswered = companyReviews.length - answered;

  const inviteUrl = company ? `${typeof window !== 'undefined' ? window.location.origin : ''}/avaliar/${company.slug}` : '';
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Olá! Que tal avaliar sua experiência com ${company?.name ?? 'nós'}? ${inviteUrl}`)}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(`Avalie sua experiência com ${company?.name ?? 'nós'}`)}&body=${encodeURIComponent(`Olá!\n\nGostaríamos muito de conhecer sua opinião. Avalie sua experiência aqui: ${inviteUrl}\n\nObrigado!`)}`;

  async function handleDemo() {
    setAuthChecking(true);
    const user = await signInDemo();
    const [companiesRes, reviewsRes] = await Promise.all([listCompanies(), listReviews()]);
    const owned = companiesRes.filter((c) => !c.owner_id || c.owner_id === user.id || c.id === user.companyId);
    setCompanies(owned.length ? owned : companiesRes);
    setReviews(reviewsRes);
    setCompanyId(user.companyId ?? owned[0]?.id ?? companiesRes[0]?.id ?? '');
    setSession(user);
    setAuthChecking(false);
    router.refresh();
  }

  async function saveResponse(review: Review) {
    const text = (drafts[review.id] ?? review.response ?? '').trim();
    if (!text) return;
    setSavingId(review.id);
    try {
      await respondToReview(review.id, text);
      setReviews((prev) => prev.map((r) => r.id === review.id ? { ...r, response: text, responded_at: new Date().toISOString() } : r));
      setEditing(null);
      setToast('Resposta publicada com sucesso!');
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Erro ao salvar resposta.');
    } finally {
      setSavingId(null);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setToast('Não foi possível copiar. Selecione o texto manualmente.');
    }
  }

  if (authChecking || loading) {
    return <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6"><div className="h-96 animate-pulse rounded-3xl border border-slate-200 bg-white" /></div>;
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><Building2 size={28} /></div>
        <h1 className="mt-6 text-2xl font-extrabold text-brand-900">Acesse o painel da empresa</h1>
        <p className="mt-2 text-sm text-slate-500">Entre com sua conta para acompanhar e responder avaliações.</p>
        <div className="mt-7 flex flex-col gap-3">
          <Link href="/login" className="btn-primary">Ir para o login</Link>
          <button onClick={handleDemo} className="btn-secondary">Usar conta de demonstração</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex animate-slide-up items-center gap-2 rounded-xl bg-brand-900 px-5 py-3 text-sm font-semibold text-white shadow-soft">
          <CheckCircle2 size={17} className="text-emerald-400" /> {toast}
        </div>
      )}

      {/* CABEÇALHO */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-500">Painel administrativo</span>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-brand-900 sm:text-3xl">Olá, {session.name.split(' ')[0]} 👋</h1>
          <p className="mt-1 text-sm text-slate-500">Acompanhe a reputação da sua empresa em tempo real.</p>
        </div>
        <div className="flex items-center gap-2">
          {companies.length > 1 && (
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="input-field w-auto max-w-56 py-2.5 text-sm font-semibold"
              aria-label="Selecionar empresa"
            >
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          <button
            onClick={async () => { await signOut(); setSession(null); router.refresh(); }}
            className="btn-secondary px-3 py-2.5"
            aria-label="Sair"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {company && (
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <Building2 size={15} />
          <span>Gerenciando</span>
          <strong className="text-brand-800">{company.name}</strong>
          <Link href={`/empresa/${company.slug}`} target="_blank" className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline">
            Ver perfil público <ExternalLink size={12} />
          </Link>
        </div>
      )}

      {/* MÉTRICAS */}
      <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Nota média geral', value: stats.average.toFixed(1).replace('.', ','), icon: Star, tone: 'text-gold-500', sub: 'de 5 estrelas' },
          { label: 'Total de avaliações', value: String(stats.total), icon: Inbox, tone: 'text-brand-600', sub: 'recebidas' },
          { label: 'Aguardando resposta', value: String(unanswered), icon: MessageSquareReply, tone: 'text-amber-600', sub: `${answered} respondidas` },
          { label: 'Taxa de resposta', value: `${stats.total ? Math.round((answered / stats.total) * 100) : 0}%`, icon: TrendingUp, tone: 'text-emerald-600', sub: 'das avaliações' },
        ].map(({ label, value, icon: Icon, tone, sub }) => (
          <div key={label} className="animate-slide-up rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <Icon size={18} className={tone} />
            </div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-brand-900">{value}</p>
            <p className="mt-0.5 text-xs text-slate-400">{sub}</p>
          </div>
        ))}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-5">
          <RatingDistribution stats={stats} />

          {/* CONVITE / QR CODE */}
          <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
            <div className="flex items-center gap-2">
              <QrCode size={18} className="text-brand-600" />
              <h2 className="font-bold text-brand-900">Convide seus clientes</h2>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Compartilhe o link ou o QR Code para receber avaliações via WhatsApp ou e-mail.
            </p>

            <div className="mt-4 flex justify-center rounded-xl border border-dashed border-slate-200 bg-white p-3">
              {inviteUrl && <QRCodeSVG value={inviteUrl} size={140} level="M" fgColor="#0f2a4a" bgColor="#ffffff" />}
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 p-2">
              <input readOnly value={inviteUrl} className="min-w-0 flex-1 bg-transparent px-1 text-[11px] text-slate-600 outline-none" aria-label="Link de convite" />
              <button onClick={copyLink} className="shrink-0 rounded-lg bg-brand-900 p-2 text-white transition-colors hover:bg-brand-800" aria-label="Copiar link" title="Copiar link">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary justify-center px-2 py-2 text-xs bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100">
                WhatsApp
              </a>
              <a href={mailtoUrl} className="btn-secondary justify-center px-2 py-2 text-xs">
                <Mail size={13} /> E-mail
              </a>
            </div>
          </div>
        </aside>

        {/* LISTA DE AVALIAÇÕES COM FILTROS */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
            <div>
              <h2 className="font-bold text-brand-900">Avaliações recebidas</h2>
              <p className="mt-0.5 text-xs text-slate-500">{filtered.length} de {companyReviews.length} avaliação(ões)</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"><Filter size={14} /> Filtros</div>
          </div>

          <div className="grid gap-2 border-b border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-3">
            <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="input-field py-2 text-xs" aria-label="Filtrar por nota">
              <option value="all">Todas as notas</option>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} estrelas</option>)}
            </select>
            <select value={daysFilter} onChange={(e) => setDaysFilter(e.target.value as DaysFilter)} className="input-field py-2 text-xs" aria-label="Filtrar por data">
              <option value="all">Qualquer data</option>
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
            <select value={answerFilter} onChange={(e) => setAnswerFilter(e.target.value as AnswerFilter)} className="input-field py-2 text-xs" aria-label="Filtrar por resposta">
              <option value="all">Todas</option>
              <option value="answered">Respondidas</option>
              <option value="unanswered">Não respondidas</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarDays size={28} className="mx-auto text-slate-300" />
              <p className="mt-3 font-semibold text-brand-900">Nenhuma avaliação com esses filtros</p>
              <button onClick={() => { setRatingFilter('all'); setDaysFilter('all'); setAnswerFilter('all'); }} className="mt-3 text-sm font-semibold text-brand-600 hover:underline">
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((review) => (
                <article key={review.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">
                      {review.is_anonymous ? <Users size={16} /> : initials(review.author_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-brand-900">{review.author_name}</span>
                        <Stars value={review.rating} size={13} />
                        <span className="text-xs text-slate-400">{formatDate(review.created_at)}</span>
                        {review.response ? (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Respondida</span>
                        ) : (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">Aguardando</span>
                        )}
                      </div>
                      <h3 className="mt-2 text-sm font-bold text-brand-900">{review.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{review.comment}</p>

                      {review.tags.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {review.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{tag}</span>)}
                        </div>
                      )}

                      {review.photos.length > 0 && (
                        <div className="mt-2.5 flex gap-2">
                          {review.photos.map((src, i) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={i} src={src} alt={`Foto ${i + 1}`} className="h-16 w-20 rounded-lg border border-slate-200 object-cover" />
                          ))}
                        </div>
                      )}

                      {review.response && editing !== review.id && (
                        <div className="mt-3 rounded-xl border-l-4 border-brand-500 bg-brand-50 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-brand-600">Sua resposta pública</p>
                          <p className="mt-1 text-sm text-brand-900/80">{review.response}</p>
                        </div>
                      )}

                      {editing === review.id ? (
                        <div className="mt-3 animate-fade-in">
                          <textarea
                            value={drafts[review.id] ?? review.response ?? ''}
                            onChange={(e) => setDrafts((prev) => ({ ...prev, [review.id]: e.target.value }))}
                            rows={3}
                            placeholder="Escreva uma resposta pública e profissional..."
                            className="input-field resize-y"
                          />
                          <div className="mt-2 flex gap-2">
                            <button onClick={() => saveResponse(review)} disabled={savingId === review.id} className="btn-primary px-3 py-2 text-xs">
                              {savingId === review.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                              Publicar resposta
                            </button>
                            <button onClick={() => setEditing(null)} className="btn-secondary px-3 py-2 text-xs"><X size={14} /> Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditing(review.id);
                            setDrafts((prev) => ({ ...prev, [review.id]: review.response ?? '' }));
                          }}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 transition-colors hover:text-brand-800"
                        >
                          <MessageSquareReply size={14} /> {review.response ? 'Editar resposta' : 'Responder publicamente'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
