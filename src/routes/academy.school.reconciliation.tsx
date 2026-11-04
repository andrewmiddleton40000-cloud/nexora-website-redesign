import { Link, createFileRoute } from '@tanstack/react-router'
import { academySeo } from '@/lib/academy-seo'
import { requireSession } from '@/lib/guards'
import { schoolReconciliation } from '@/server/fns/school'
import { RouteError } from '@/components/academy/RouteError'
import { EmptyState, Price, formatDate } from '@/components/academy/ui'

export const Route = createFileRoute('/academy/school/reconciliation')({
  beforeLoad: requireSession,
  loader: () => schoolReconciliation(),
  head: () => academySeo({ title: 'Reconciliation statements', path: '/academy/school/reconciliation', noindex: true }),
  errorComponent: RouteError,
  component: Reconciliation,
})

function Reconciliation() {
  const d = Route.useLoaderData()
  return (
    <section className="wrap py-12 md:py-16">
      <Link to="/academy/school" className="text-sm text-muted hover:text-ink">← School dashboard</Link>
      <p className="eyebrow mt-8">Private · authorised representatives only</p>
      <h1 className="display mt-4 text-4xl md:text-6xl">Institutional reconciliation</h1>
      <p className="mt-4 max-w-2xl text-muted">{d.school.name} ({d.school.code}). Statements released by Nexora Finance under your partnership agreement. Please keep these confidential.</p>
      <div className="mt-12 space-y-12">
        {d.statements.length === 0 && <EmptyState title="No statements released yet">Statements appear here when Nexora Finance releases them to your school.</EmptyState>}
        {d.statements.map((s) => (
          <article key={s.id} className="border-t border-ink pt-6">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="text-2xl font-medium">{formatDate(s.periodStart)} – {formatDate(s.periodEnd)}</h2>
              <button type="button" className="link text-sm print:hidden" onClick={() => window.print()}>Print</button>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
              <div><dt className="text-sm text-muted">Enrolments</dt><dd className="mt-1 text-xl font-medium">{s.enrolmentCount}</dd></div>
              <div><dt className="text-sm text-muted">Total</dt><dd className="mt-1 text-xl font-medium"><Price kobo={s.totalKobo} /></dd></div>
              <div><dt className="text-sm text-muted">Paid</dt><dd className="mt-1 text-xl font-medium"><Price kobo={s.paidKobo} /></dd></div>
              <div><dt className="text-sm text-muted">Outstanding</dt><dd className="mt-1 text-xl font-medium"><Price kobo={s.outstandingKobo} /></dd></div>
            </dl>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[30rem] border-y border-line text-left text-sm">
                <thead className="text-muted"><tr><th className="py-2 font-normal">Date</th><th className="font-normal">Course</th><th className="font-normal">Amount</th><th className="font-normal">Status</th></tr></thead>
                <tbody className="divide-y divide-line">{s.lines.map((l, i) => <tr key={i}><td className="py-2">{formatDate(l.date)}</td><td>{l.course}</td><td><Price kobo={l.amountKobo} /></td><td className="capitalize">{l.status}</td></tr>)}</tbody>
              </table>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
