import { useState, type FormEvent } from 'react'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { site } from '@/data/site'
import { academySeo } from '@/lib/academy-seo'
import { requireSession } from '@/lib/guards'
import { getCheckout, startPayment, submitBankTransfer } from '@/server/fns/student'
import { RouteError } from '@/components/academy/RouteError'
import { Alert, Field, Price, useAction } from '@/components/academy/ui'

export const Route = createFileRoute('/academy/checkout/$slug')({
  beforeLoad: requireSession,
  loader: ({ params }) => getCheckout({ data: { slug: params.slug } }),
  head: () => academySeo({ title: 'Enrol', path: '/academy/checkout', noindex: true }),
  errorComponent: RouteError,
  component: Checkout,
})

function Checkout() {
  const d = Route.useLoaderData()
  const router = useRouter()
  const { pending, error, run } = useAction()
  const [bankRef, setBankRef] = useState<string | null>(d.openBankPayment?.status === 'pending' ? d.openBankPayment.reference : null)
  const a = d.availability
  const c = d.course

  async function pay(provider: 'paystack' | 'flutterwave' | 'bank_transfer') {
    const r = await run(() => startPayment({ data: { slug: c.slug, provider } }))
    if (!r) return
    if (r.kind === 'redirect') window.location.href = r.url
    else setBankRef(r.reference)
  }

  async function reportTransfer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const ok = await run(() => submitBankTransfer({ data: { reference: bankRef!, payerName: String(f.get('payerName')), transferDetails: String(f.get('details')) } }))
    if (ok) router.invalidate()
  }

  const noMethods = !d.gateways.paystack && !d.gateways.flutterwave && !d.bank

  return (
    <section className="wrap grid gap-14 py-12 md:grid-cols-12 md:py-16">
      <div className="md:col-span-7">
        <Link to="/academy/courses/$slug" params={{ slug: c.slug }} className="text-sm text-muted hover:text-ink">← Course details</Link>
        <p className="eyebrow mt-8">Enrolment · Level {c.level}</p>
        <h1 className="display mt-4 text-4xl md:text-6xl">{c.title}</h1>

        <div className="mt-10 space-y-6">
          {a.state === 'enrolled' && (
            <Alert tone="success">You are enrolled. <Link to="/academy/learn/$slug" params={{ slug: c.slug }} className="link">Go to your course →</Link></Alert>
          )}
          {a.state === 'payment_pending' && (
            <Alert tone="info">
              Your bank transfer (reference <strong className="font-mono">{a.reference}</strong>) is awaiting verification. Our team checks every transfer against Nexora’s bank statement; your course opens as soon as it is confirmed — usually within one working day.
            </Alert>
          )}
          {a.state === 'needs_guardian_consent' && <Alert tone="info">Your parent or guardian’s consent must be verified before you can enrol. <Link to="/academy/dashboard" className="link">Check your profile</Link>.</Alert>}
          {a.state === 'needs_prerequisite' && <Alert tone="info">You need a verified completion of {a.prerequisiteTitle ?? 'the previous level'} before enrolling in this course.</Alert>}
          {(a.state === 'not_open' || a.state === 'awaiting_price') && <Alert tone="info">Enrolment for this course is not open yet.</Alert>}

          {a.state === 'eligible' && !bankRef && (
            <>
              <p className="text-lg leading-relaxed text-ink-soft">
                {d.gateways.paystack || d.gateways.flutterwave
                  ? 'Choose how you would like to pay. Your course opens automatically once your payment has been verified.'
                  : 'Enrolment is paid by direct bank transfer to Nexora Technologies. Get your payment reference and our account details below, then let us know once you have sent the transfer. Your course opens as soon as our team confirms it — usually within one working day.'}
              </p>
              <div className="grid gap-3">
                {d.gateways.paystack && <button type="button" disabled={pending} onClick={() => pay('paystack')} className="btn btn-primary justify-between">Pay online with Paystack <span className="text-sm opacity-80">Card · Bank · USSD · Transfer</span></button>}
                {d.gateways.flutterwave && <button type="button" disabled={pending} onClick={() => pay('flutterwave')} className="btn btn-primary justify-between">Pay online with Flutterwave <span className="text-sm opacity-80">Card · Bank · USSD</span></button>}
                {d.bank && <button type="button" disabled={pending} onClick={() => pay('bank_transfer')} className={`btn justify-between ${d.gateways.paystack || d.gateways.flutterwave ? 'btn-ghost' : 'btn-primary'}`}>Pay by bank transfer <span className="text-sm opacity-80">Get account details →</span></button>}
              </div>
              {noMethods && (
                <Alert tone="info">
                  Payment options are being set up. Please contact us on{' '}
                  <a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer" className="link">WhatsApp</a> to reserve your place.
                </Alert>
              )}
            </>
          )}

          {a.state === 'eligible' && bankRef && d.bank && (
            <div className="border-t border-ink pt-6">
              <p className="eyebrow">Bank transfer instructions</p>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div><dt className="text-sm text-muted">Bank</dt><dd className="mt-1 text-lg font-medium">{d.bank.bankName}</dd></div>
                <div><dt className="text-sm text-muted">Account name</dt><dd className="mt-1 text-lg font-medium">{d.bank.accountName}</dd></div>
                <div><dt className="text-sm text-muted">Account number</dt><dd className="mt-1 font-mono text-lg font-medium">{d.bank.accountNumber}</dd></div>
                <div><dt className="text-sm text-muted">Amount</dt><dd className="mt-1 text-lg font-medium"><Price kobo={c.priceKobo} /></dd></div>
                <div className="sm:col-span-2"><dt className="text-sm text-muted">Payment reference — include this in the transfer narration</dt><dd className="mt-1 font-mono text-xl font-medium">{bankRef}</dd></div>
              </dl>
              {d.bank.instructions && <p className="mt-5 leading-relaxed text-ink-soft">{d.bank.instructions}</p>}
              <form onSubmit={reportTransfer} className="mt-8 grid gap-6 border-t border-line pt-6">
                <p className="text-sm text-muted">After making the transfer, tell us so we can match it on our bank statement. Screenshots are not accepted as proof — access opens only after we confirm the credit.</p>
                <Field label="Name on the paying account" htmlFor="b-name"><input id="b-name" name="payerName" className="field" required minLength={2} maxLength={120} /></Field>
                <Field label="Transfer details" htmlFor="b-det" hint="Your bank, the date and time of transfer, and the transaction reference shown by your bank."><textarea id="b-det" name="details" rows={3} className="field resize-y" required minLength={4} maxLength={500} /></Field>
                <div><button className="btn btn-primary" disabled={pending}>{pending ? 'Sending…' : 'I have made the transfer'}</button></div>
              </form>
            </div>
          )}
          {error && <Alert>{error}</Alert>}
        </div>
      </div>
      <aside className="md:col-span-4 md:col-start-9">
        <div className="border-t border-ink pt-6">
          <p className="eyebrow">Order summary</p>
          <div className="mt-5 flex items-baseline justify-between gap-4"><span>{c.title}</span><span className="text-xl font-medium"><Price kobo={c.priceKobo} /></span></div>
          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">Payments are made by bank transfer directly to Nexora Technologies’ business account. Always use the account shown on this page and include your payment reference. Receipts appear in your dashboard payment history once the transfer is confirmed.</p>
        </div>
      </aside>
    </section>
  )
}
