import { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { academySeo } from '@/lib/academy-seo'
import { confirmMyPayment } from '@/server/fns/student'
import { Alert, Price, errMsg } from '@/components/academy/ui'

export const Route = createFileRoute('/academy/payment/callback')({
  validateSearch: (s: Record<string, unknown>): { ref?: string } => ({
    ref: typeof s.ref === 'string' ? s.ref : typeof s.reference === 'string' ? s.reference : typeof s.tx_ref === 'string' ? s.tx_ref : undefined,
  }),
  head: () => academySeo({ title: 'Payment status', path: '/academy/payment/callback', noindex: true }),
  component: Callback,
})

type Result = Awaited<ReturnType<typeof confirmMyPayment>>

function Callback() {
  const { ref } = Route.useSearch()
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tries, setTries] = useState(0)

  useEffect(() => {
    if (!ref) return
    let cancelled = false
    // Verification always happens server-to-server with the gateway; the redirect itself proves nothing.
    confirmMyPayment({ data: { reference: ref } })
      .then((r) => {
        if (cancelled) return
        setResult(r)
        if (r.status === 'pending' && tries < 4) setTimeout(() => setTries((t) => t + 1), 4000)
      })
      .catch((e) => !cancelled && setError(errMsg(e)))
    return () => {
      cancelled = true
    }
  }, [ref, tries])

  return (
    <section className="wrap max-w-3xl py-20 md:py-28">
      <p className="eyebrow">Payment status</p>
      {!ref && <h1 className="display mt-6 text-5xl">No payment reference found.</h1>}
      {ref && !result && !error && <h1 className="display mt-6 text-5xl">Confirming your payment…</h1>}
      {error && <div className="mt-6"><Alert>{error}</Alert></div>}
      {result && (
        <>
          <h1 className="display mt-6 text-5xl md:text-6xl">
            {result.status === 'success' ? <>Payment confirmed. <span className="serif text-gradient pr-1">Welcome aboard.</span></> : result.status === 'failed' ? 'Payment was not successful.' : 'We are still confirming your payment.'}
          </h1>
          <dl className="mt-10 grid gap-6 border-t border-ink pt-6 sm:grid-cols-3">
            <div><dt className="text-sm text-muted">Course</dt><dd className="mt-1 font-medium">{result.course?.title}</dd></div>
            <div><dt className="text-sm text-muted">Amount</dt><dd className="mt-1 font-medium"><Price kobo={result.amountKobo} /></dd></div>
            <div><dt className="text-sm text-muted">Reference</dt><dd className="mt-1 font-mono text-sm">{result.reference}</dd></div>
          </dl>
          {result.status !== 'success' && result.reason && <p className="mt-6 text-muted">{result.reason}</p>}
          <div className="mt-10 flex flex-wrap gap-3">
            {result.status === 'success' && result.course && <Link to="/academy/learn/$slug" params={{ slug: result.course.slug }} className="btn btn-primary">Start learning →</Link>}
            {result.status === 'failed' && result.course && <Link to="/academy/checkout/$slug" params={{ slug: result.course.slug }} className="btn btn-primary">Try again</Link>}
            <Link to="/academy/dashboard" className="btn btn-ghost">My dashboard</Link>
          </div>
          {result.status === 'pending' && <p className="mt-6 text-sm text-muted">If you completed the payment, it will be confirmed automatically as soon as the provider notifies us. You can safely leave this page.</p>}
        </>
      )}
    </section>
  )
}
