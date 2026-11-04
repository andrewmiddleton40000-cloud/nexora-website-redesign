import { useState, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { formatNaira } from '@/data/academy'

/** Extracts a readable message from a server-function error. */
export function errMsg(e: unknown) {
  const m = (e as { message?: string })?.message ?? ''
  if (!m) return 'Something went wrong. Please try again.'
  if (m.startsWith('[') || m.startsWith('{')) {
    try {
      const issues = JSON.parse(m) as Array<{ message?: string; path?: string[] }>
      if (Array.isArray(issues) && issues[0]) return `Please check ${issues[0].path?.join('.') || 'the form'}: ${issues[0].message}`
    } catch {
      /* fall through */
    }
  }
  return m
}

/** Runs an async action with pending/error state. */
export function useAction() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function run<T>(fn: () => Promise<T>): Promise<T | undefined> {
    setPending(true)
    setError(null)
    try {
      return await fn()
    } catch (e) {
      setError(errMsg(e))
      return undefined
    } finally {
      setPending(false)
    }
  }
  return { pending, error, setError, run }
}

export function Alert({ tone = 'error', children }: { tone?: 'error' | 'info' | 'success'; children: ReactNode }) {
  const cls =
    tone === 'error'
      ? 'border-[#b4472c] text-[#8a3520] bg-[#b4472c]/5'
      : tone === 'success'
        ? 'border-forest text-forest bg-forest-tint/60'
        : 'border-line text-ink-soft bg-white'
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`border-l-2 px-4 py-3 text-sm leading-relaxed ${cls}`}>
      {children}
    </div>
  )
}

export const labelCls = 'block text-xs uppercase tracking-[0.14em] text-muted'

export function Field({ label, htmlFor, hint, children, className = '' }: { label: string; htmlFor: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={labelCls}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-2 text-sm text-muted">{hint}</p>}
    </div>
  )
}

export function Price({ kobo, fallback = 'Price to be announced' }: { kobo: number | null | undefined; fallback?: string }) {
  const v = formatNaira(kobo)
  return <span>{v ?? fallback}</span>
}

const badgeTones: Record<string, string> = {
  available: 'bg-signal text-ink',
  enrolled: 'bg-forest text-white',
  completed: 'bg-forest text-white',
  eligible: 'bg-signal text-ink',
  locked: 'bg-paper-deep text-ink-soft',
  pending: 'bg-paper-deep text-ink',
  success: 'bg-forest-tint text-forest',
  failed: 'bg-[#b4472c]/10 text-[#8a3520]',
  refunded: 'bg-paper-deep text-ink-soft',
}

export function Badge({ tone = 'locked', children }: { tone?: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.7rem] font-medium uppercase tracking-[0.1em] ${badgeTones[tone] ?? badgeTones.locked}`}>
      {children}
    </span>
  )
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div>
      <div className="h-1.5 w-full bg-line" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? 'Progress'}>
        <div className="h-full bg-forest transition-[width] duration-500" style={{ width: `${v}%` }} />
      </div>
    </div>
  )
}

export function formatDate(iso: string | null | undefined, withTime = false) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('en-GB', withTime ? { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' } : { day: 'numeric', month: 'short', year: 'numeric' })
}

export function PageIntro({ eyebrow, title, intro, children }: { eyebrow: string; title: ReactNode; intro?: ReactNode; children?: ReactNode }) {
  return (
    <section className="wrap pt-14 pb-14 md:pt-20 md:pb-20">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="eyebrow rise">{eyebrow}</p>
          <h1 className="display rise rise-2 mt-6 text-[2.75rem] md:text-7xl">{title}</h1>
        </div>
        {intro && <div className="rise rise-3 text-lg leading-relaxed text-ink-soft md:col-span-4 md:self-end">{intro}</div>}
      </div>
      {children}
    </section>
  )
}

/** Renders lesson text: blank-line paragraphs, "- " bullet lists and "1. " numbered lists. */
export function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/)
  return (
    <div className="prose-article">
      {blocks.map((b, i) => {
        const lines = b.split('\n').filter((l) => l.trim())
        if (lines.length && lines.every((l) => /^\s*-\s+/.test(l))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{l.replace(/^\s*-\s+/, '')}</li>
              ))}
            </ul>
          )
        }
        if (lines.length && lines.every((l) => /^\s*\d+\.\s+/.test(l))) {
          return (
            <ol key={i} className="mt-5 list-decimal pl-5 text-[1.125rem] leading-[1.75] text-ink-soft [&>li+li]:mt-2">
              {lines.map((l, j) => (
                <li key={j}>{l.replace(/^\s*\d+\.\s+/, '')}</li>
              ))}
            </ol>
          )
        }
        const head = lines[0] ?? ''
        const rest = lines.slice(1)
        if (rest.length && rest.every((l) => /^\s*-\s+/.test(l))) {
          return (
            <div key={i}>
              <p>{head}</p>
              <ul>
                {rest.map((l, j) => (
                  <li key={j}>{l.replace(/^\s*-\s+/, '')}</li>
                ))}
              </ul>
            </div>
          )
        }
        return <p key={i}>{lines.join(' ')}</p>
      })}
    </div>
  )
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="border border-dashed border-line p-8">
      <p className="font-medium">{title}</p>
      {children && <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>}
    </div>
  )
}

export function BackLink({ to, children, params }: { to: string; children: ReactNode; params?: Record<string, string> }) {
  return (
    <Link to={to as never} params={params as never} className="text-sm text-muted hover:text-ink">
      ← {children}
    </Link>
  )
}

export function Stat({ label, value, note }: { label: string; value: ReactNode; note?: ReactNode }) {
  return (
    <div className="border-t border-ink pt-4">
      <p className="eyebrow">{label}</p>
      <p className="mt-3 text-3xl font-medium tabular-nums tracking-[-0.03em]">{value}</p>
      {note && <p className="mt-1 text-sm text-muted">{note}</p>}
    </div>
  )
}
