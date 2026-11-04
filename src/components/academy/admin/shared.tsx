import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { errMsg } from '../ui'

/** Loads data from a server function on the client, with reload. */
export function useServerData<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setData(await load())
      setError(null)
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  useEffect(() => {
    reload()
  }, [reload])
  return { data, error, loading, reload }
}

export function Panel({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-t border-ink pt-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  )
}

export function Loading({ error, loading }: { error: string | null; loading: boolean }) {
  if (error) return <p role="alert" className="text-sm text-[#8a3520]">{error}</p>
  if (loading) return <p className="text-sm text-muted">Loading…</p>
  return null
}

export const input = 'w-full border border-line bg-white px-3 py-2 text-sm focus:border-forest focus:outline-none'
export const smallBtn = 'btn btn-ghost !min-h-[2.1rem] !px-3 text-xs'
export const smallPrimary = 'btn btn-primary !min-h-[2.1rem] !px-3 text-xs'

export function L({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block text-xs text-muted ${className}`}>
      <span className="mb-1 block uppercase tracking-[0.1em]">{label}</span>
      {children}
    </label>
  )
}

export function Table({ head, children, min = '40rem' }: { head: string[]; children: ReactNode; min?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-y border-line text-left text-sm" style={{ minWidth: min }}>
        <thead className="bg-paper-deep/50 text-xs uppercase tracking-[0.08em] text-muted">
          <tr>{head.map((h) => <th key={h} className="px-2 py-2 font-normal">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  )
}

export const td = 'px-2 py-2 align-top'

export function koboFromNaira(v: string) {
  const n = Number(String(v).replace(/[,\s₦]/g, ''))
  return Number.isFinite(n) ? Math.round(n * 100) : NaN
}
