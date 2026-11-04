import { Link, createFileRoute } from '@tanstack/react-router'
import { academySeo } from '@/lib/academy-seo'
import { verifyCertificate } from '@/server/fns/public'
import { Badge, formatDate } from '@/components/academy/ui'
import { RouteError } from '@/components/academy/RouteError'

export const Route = createFileRoute('/academy/verify/$code')({
  loader: ({ params }) => verifyCertificate({ data: { code: params.code } }),
  head: ({ params }) => academySeo({ title: 'Certificate verification', path: `/academy/verify/${params.code}`, noindex: true }),
  errorComponent: RouteError,
  component: VerifyResult,
})

function VerifyResult() {
  const c = Route.useLoaderData()
  return (
    <section className="wrap py-20 md:py-28">
      <p className="eyebrow">Certificate verification</p>
      {c ? (
        <div className="mt-8 max-w-3xl border-t border-ink pt-8">
          <Badge tone={c.revoked ? 'failed' : 'success'}>{c.revoked ? 'Revoked' : 'Valid certificate'}</Badge>
          <h1 className="display mt-6 text-5xl md:text-6xl">{c.studentName}</h1>
          <p className="mt-4 text-xl text-ink-soft">
            completed <strong className="font-medium text-ink">{c.courseTitle}</strong> at Nexora Digital Academy on {formatDate(c.completedOn)}.
          </p>
          <dl className="mt-10 grid gap-6 sm:grid-cols-2">
            <div><dt className="eyebrow">Certificate number</dt><dd className="mt-2 tabular-nums">{c.number}</dd></div>
            <div><dt className="eyebrow">Verification code</dt><dd className="mt-2 tabular-nums">{c.verificationCode}</dd></div>
          </dl>
          <p className="mt-10 text-sm leading-relaxed text-muted">Issued by Nexora Technologies. This is an academy certificate of completion and not a government or university qualification.</p>
        </div>
      ) : (
        <div className="mt-8 max-w-2xl border-t border-ink pt-8">
          <h1 className="display text-5xl">No certificate found.</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">Check the code and try again. Codes are not case-sensitive.</p>
          <Link to="/academy/verify" className="btn btn-ghost mt-8">Try another code</Link>
        </div>
      )}
    </section>
  )
}
