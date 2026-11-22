'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ImagePlus,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Tag,
  UserRound,
  X,
} from 'lucide-react';
import { StarRating, Stars } from '@/components/Stars';
import { VerificationBadge } from '@/components/VerificationBadge';
import { createReview, getCompanyBySlug, getSession, uploadReviewPhotos } from '@/lib/data';
import { QUICK_TAGS, RATING_LABELS, type Company, type Review, type SessionUser } from '@/lib/types';
import { cn } from '@/lib/utils';

const MAX_PHOTOS = 3;
const MAX_FILE_SIZE = 2 * 1024 * 1024;

export default function AvaliarPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? '';

  const [company, setCompany] = useState<Company | null>(null);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [anonymous, setAnonymous] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [truth, setTruth] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<Review | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getCompanyBySlug(slug), getSession()])
      .then(([companyRes, sessionRes]) => {
        if (!active) return;
        setCompany(companyRes);
        setSession(sessionRes);
        if (sessionRes) setAuthorName(sessionRes.name);
      })
      .finally(() => active && setLoadingCompany(false));
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  function handleFiles(list: FileList | null) {
    if (!list) return;
    const picked = Array.from(list).filter((f) => f.type.startsWith('image/'));
    const invalid = picked.find((f) => f.size > MAX_FILE_SIZE);
    if (invalid) {
      setError('Cada foto deve ter no máximo 2 MB.');
      return;
    }
    setError('');
    setFiles((prev) => [...prev, ...picked].slice(0, MAX_PHOTOS));
  }

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!rating) return setError('Selecione uma nota de 1 a 5 estrelas.');
    if (title.trim().length < 5) return setError('O título deve ter pelo menos 5 caracteres.');
    if (comment.trim().length < 20) return setError('O comentário deve ter pelo menos 20 caracteres.');
    if (!anonymous && authorName.trim().length < 2) return setError('Informe seu nome ou escolha avaliar de forma anônima.');
    if (!truth) return setError('Confirme que a avaliação corresponde à sua experiência real.');
    if (!company) return setError('Empresa não encontrada.');

    setSubmitting(true);
    try {
      const photos = await uploadReviewPhotos(files, company.id);
      const review = await createReview({
        company_id: company.id,
        author_id: session?.id ?? null,
        author_name: authorName.trim() || 'Cliente anônimo',
        rating,
        title: title.trim(),
        comment: comment.trim(),
        tags,
        photos,
        is_anonymous: anonymous,
        truth_confirmed: truth,
      });
      setDone(review);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a avaliação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingCompany) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="h-96 animate-pulse rounded-3xl border border-slate-200 bg-white" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-brand-900">Empresa não encontrada</h1>
        <p className="mt-2 text-sm text-slate-500">O link pode estar desatualizado.</p>
        <Link href="/" className="btn-primary mt-6">Voltar ao início</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="animate-pop rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <svg viewBox="0 0 52 52" className="h-12 w-12">
              <circle cx="26" cy="26" r="23" fill="none" stroke="#10b981" strokeWidth="3" opacity="0.25" />
              <path
                d="M15 27 l7 7 l15 -16"
                fill="none"
                stroke="#059669"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="48"
                className="animate-check-draw"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl font-extrabold text-brand-900 sm:text-3xl">Avaliação enviada!</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Obrigado por compartilhar sua experiência com <strong className="text-brand-900">{company.name}</strong>.
            Sua avaliação já está visível para outros clientes.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-slate-50 px-5 py-3">
            <Stars value={done.rating} size={20} />
            <span className="font-bold text-brand-900">{done.rating},0</span>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={`/empresa/${company.slug}`} className="btn-primary">
              Ver avaliação publicada <ArrowRight size={16} />
            </Link>
            <Link href="/" className="btn-secondary">Voltar ao início</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href={`/empresa/${company.slug}`} className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-brand-700">
        <ArrowLeft size={15} /> Voltar para a empresa
      </Link>

      {/* Cabeçalho da empresa */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-50 ring-1 ring-slate-200">
          {company.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logo_url} alt={`Logo ${company.name}`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-bold text-brand-700">{company.name[0]}</div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-bold text-brand-900 sm:text-xl">Avaliar {company.name}</h1>
            {company.verified && <VerificationBadge compact />}
          </div>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            {company.category ?? 'Empresa'} {company.city ? `· ${company.city}` : ''}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/* NOTA POR ESTRELAS */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-900 text-xs font-bold text-white">1</span>
            <h2 className="font-bold text-brand-900">Como você avalia sua experiência?</h2>
          </div>
          <div className="mt-5 flex flex-col items-center gap-3 rounded-xl bg-slate-50 py-6">
            <StarRating value={rating} onChange={(v) => { setRating(v); setError(''); }} size={44} />
            <div className={cn(
              'min-h-[24px] text-center text-sm font-semibold transition-all duration-300',
              rating ? 'animate-pop text-brand-800' : 'text-slate-400'
            )}>
              {rating ? `${rating},0 — ${RATING_LABELS[rating]}` : 'Passe o mouse e clique nas estrelas'}
            </div>
          </div>
        </section>

        {/* TÍTULO E COMENTÁRIO */}
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-900 text-xs font-bold text-white">2</span>
            <h2 className="font-bold text-brand-900">Conte o que aconteceu</h2>
          </div>
          <div>
            <label htmlFor="titulo" className="label-field">Título da avaliação</label>
            <input
              id="titulo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={90}
              placeholder="Ex.: Atendimento excelente e entrega no prazo"
              className="input-field"
            />
            <p className="mt-1 text-right text-[11px] text-slate-400">{title.length}/90</p>
          </div>
          <div>
            <label htmlFor="comentario" className="label-field">Comentário detalhado</label>
            <textarea
              id="comentario"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              maxLength={1000}
              placeholder="Descreva sua experiência: o que gostou, o que poderia melhorar, prazos, atendimento..."
              className="input-field resize-y"
            />
            <p className="mt-1 text-right text-[11px] text-slate-400">{comment.length}/1000 · mínimo 20</p>
          </div>
        </section>

        {/* FOTOS E TAGS */}
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-900 text-xs font-bold text-white">3</span>
            <h2 className="font-bold text-brand-900">Adicione detalhes (opcional)</h2>
          </div>

          <div>
            <p className="label-field">Fotos</p>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="flex flex-wrap gap-3">
              {previews.map((src, i) => (
                <div key={src} className="group relative h-24 w-28 overflow-hidden rounded-xl border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Prévia ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    aria-label="Remover foto"
                    onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-slate-600 shadow transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              {files.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="flex h-24 w-28 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition-all hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600"
                >
                  {files.length ? <ImagePlus size={20} /> : <Camera size={20} />}
                  <span className="text-[11px] font-semibold">Adicionar</span>
                </button>
              )}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">Até {MAX_PHOTOS} fotos · JPG ou PNG · máx. 2 MB cada</p>
          </div>

          <div>
            <p className="label-field flex items-center gap-1.5"><Tag size={14} /> Tags rápidas</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map((tag) => {
                const selected = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95',
                      selected
                        ? 'border-brand-600 bg-brand-900 text-white shadow-soft'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'
                    )}
                  >
                    {selected && <Check size={11} className="mr-1 inline" />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* IDENTIDADE E VERACIDADE */}
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-900 text-xs font-bold text-white">4</span>
            <h2 className="font-bold text-brand-900">Como publicar</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setAnonymous(false)}
              className={cn(
                'flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all',
                !anonymous ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full', !anonymous ? 'bg-brand-900 text-white' : 'bg-slate-100 text-slate-500')}>
                {session ? <LockKeyhole size={15} /> : <UserRound size={15} />}
              </span>
              <span>
                <span className="block text-sm font-bold text-brand-900">Com meu nome</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {session ? `Publicar como ${session.name} (logado)` : 'Seu nome aparece na avaliação'}
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setAnonymous(true)}
              className={cn(
                'flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all',
                anonymous ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full', anonymous ? 'bg-brand-900 text-white' : 'bg-slate-100 text-slate-500')}>
                <UserRound size={15} />
              </span>
              <span>
                <span className="block text-sm font-bold text-brand-900">Anônimo</span>
                <span className="mt-0.5 block text-xs text-slate-500">Sua identidade não será exibida</span>
              </span>
            </button>
          </div>

          {!anonymous && (
            <div className="animate-fade-in">
              <label htmlFor="nome" className="label-field">Seu nome</label>
              <input
                id="nome"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                readOnly={Boolean(session)}
                placeholder="Como deseja ser identificado?"
                className={cn('input-field', session && 'cursor-not-allowed bg-slate-50 text-slate-600')}
              />
              {session && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-emerald-700">
                  <ShieldCheck size={13} /> Sessão verificada — nome vinculado à sua conta.
                </p>
              )}
            </div>
          )}

          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-4">
            <input
              type="checkbox"
              checked={truth}
              onChange={(e) => setTruth(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-brand-700 accent-brand-800 focus:ring-brand-500"
            />
            <span className="text-sm leading-relaxed text-slate-700">
              Confirmo que esta avaliação reflete a minha experiência real e que as informações são verdadeiras.
            </span>
          </label>
        </section>

        {error && (
          <div role="alert" className="animate-fade-in rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <CheckCircle2 size={14} /> Seus dados são usados apenas para publicar esta avaliação.
          </p>
          <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
            {submitting ? (
              <><Loader2 size={17} className="animate-spin" /> Enviando avaliação...</>
            ) : (
              <>Publicar avaliação <ArrowRight size={16} /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
