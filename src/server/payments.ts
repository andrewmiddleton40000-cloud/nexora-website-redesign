// Payment processing. Server-only. Gateway secrets are read from environment variables and never leave the server.
import { createHmac, timingSafeEqual } from 'node:crypto'
import { and, eq, inArray } from 'drizzle-orm'
import { AppError, audit, db, randomCode, schema } from './core'
import { allocateForPayment } from './finance'

type Payment = typeof schema.payments.$inferSelect

export function gatewayStatus() {
  return {
    paystack: !!process.env.PAYSTACK_SECRET_KEY,
    flutterwave: !!process.env.FLUTTERWAVE_SECRET_KEY,
  }
}

export function newReference() {
  return `NDA-${Date.now().toString(36).toUpperCase()}-${randomCode(6)}`
}

/** Paystack: initialise a hosted checkout. */
export async function paystackInitialize(p: Payment, email: string, callbackUrl: string) {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) throw new AppError('Online card payments are not available yet. Please use bank transfer.', 'UNAVAILABLE')
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, amount: p.amountKobo, currency: p.currency, reference: p.reference, callback_url: callbackUrl, metadata: { payment_id: p.id } }),
    signal: AbortSignal.timeout(15000),
  })
  const body = (await res.json().catch(() => null)) as { status?: boolean; data?: { authorization_url?: string }; message?: string } | null
  if (!res.ok || !body?.status || !body.data?.authorization_url) throw new AppError('The payment provider could not start the payment. Please try again.', 'UNAVAILABLE')
  return body.data.authorization_url
}

/** Flutterwave: create a hosted payment link. */
export async function flutterwaveInitialize(p: Payment, email: string, name: string, redirectUrl: string) {
  const key = process.env.FLUTTERWAVE_SECRET_KEY
  if (!key) throw new AppError('Flutterwave payments are not available yet. Please use another method.', 'UNAVAILABLE')
  const res = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tx_ref: p.reference,
      amount: p.amountKobo / 100,
      currency: p.currency,
      redirect_url: redirectUrl,
      customer: { email, name },
      customizations: { title: 'Nexora Digital Academy' },
      meta: { payment_id: p.id },
    }),
    signal: AbortSignal.timeout(15000),
  })
  const body = (await res.json().catch(() => null)) as { status?: string; data?: { link?: string } } | null
  if (!res.ok || body?.status !== 'success' || !body.data?.link) throw new AppError('The payment provider could not start the payment. Please try again.', 'UNAVAILABLE')
  return body.data.link
}

type Verified = { ok: true; transactionId: string } | { ok: false; reason: string; final: boolean }

/** Server-to-server verification. The amount, currency and reference must match our own record exactly. */
export async function verifyWithGateway(p: Payment): Promise<Verified> {
  if (p.provider === 'paystack') {
    const key = process.env.PAYSTACK_SECRET_KEY
    if (!key) return { ok: false, reason: 'Paystack is not configured', final: false }
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(p.reference)}`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(15000),
    })
    const body = (await res.json().catch(() => null)) as { data?: { status?: string; amount?: number; currency?: string; reference?: string; id?: number; gateway_response?: string } } | null
    const t = body?.data
    if (!res.ok || !t) return { ok: false, reason: 'Could not reach Paystack', final: false }
    if (t.status !== 'success') return { ok: false, reason: t.gateway_response || `Transaction ${t.status}`, final: t.status === 'failed' || t.status === 'abandoned' || t.status === 'reversed' }
    if (t.reference !== p.reference || t.amount !== p.amountKobo || t.currency !== p.currency) return { ok: false, reason: 'Amount or reference mismatch', final: true }
    return { ok: true, transactionId: `paystack:${t.id}` }
  }
  if (p.provider === 'flutterwave') {
    const key = process.env.FLUTTERWAVE_SECRET_KEY
    if (!key) return { ok: false, reason: 'Flutterwave is not configured', final: false }
    const res = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(p.reference)}`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(15000),
    })
    const body = (await res.json().catch(() => null)) as { data?: { status?: string; amount?: number; currency?: string; tx_ref?: string; id?: number } } | null
    const t = body?.data
    if (!res.ok || !t) return { ok: false, reason: 'Could not reach Flutterwave', final: false }
    if (t.status !== 'successful') return { ok: false, reason: `Transaction ${t.status}`, final: t.status === 'failed' }
    if (t.tx_ref !== p.reference || Math.round((t.amount ?? 0) * 100) !== p.amountKobo || t.currency !== p.currency) return { ok: false, reason: 'Amount or reference mismatch', final: true }
    return { ok: true, transactionId: `flutterwave:${t.id}` }
  }
  return { ok: false, reason: 'Bank transfers are verified by Nexora staff', final: false }
}

/**
 * Marks a payment successful exactly once and grants course access.
 * The conditional UPDATE is the duplicate-processing guard: only one caller can move a payment to `success`;
 * the unique provider_transaction_id prevents a single bank/gateway transaction being used twice.
 */
export async function markPaymentSuccess(paymentId: number, transactionId: string, actorId: number | null, extra: Partial<Payment> = {}) {
  const d = db()
  const dup = await d.select({ id: schema.payments.id }).from(schema.payments).where(eq(schema.payments.providerTransactionId, transactionId))
  if (dup.some((r) => r.id !== paymentId)) throw new AppError('That transaction reference has already been used for another payment.', 'CONFLICT')
  const now = new Date().toISOString()
  const [won] = await d
    .update(schema.payments)
    .set({ ...extra, status: 'success', providerTransactionId: transactionId, verifiedAt: now, verifiedById: actorId, updatedAt: now, failureReason: null })
    .where(and(eq(schema.payments.id, paymentId), inArray(schema.payments.status, ['pending', 'awaiting_verification', 'failed', 'abandoned'])))
    .returning()
  const [p] = won ? [won] : await d.select().from(schema.payments).where(eq(schema.payments.id, paymentId))
  if (!p || p.status !== 'success') throw new AppError('This payment cannot be marked as successful.', 'CONFLICT')
  if (won) await audit(actorId, 'payment.success', 'payment', p.id, { reference: p.reference, provider: p.provider })
  await grantAccess(p, actorId)
  return p
}

/** Idempotent: creates (or reactivates) the enrolment for a successful payment, then the school allocation. */
export async function grantAccess(p: Payment, actorId: number | null) {
  const d = db()
  const [user] = await d.select().from(schema.users).where(eq(schema.users.id, p.userId))
  const schoolId = user?.schoolId && user.schoolLinkStatus !== 'rejected' ? user.schoolId : null
  const [cohort] = await d
    .select({ id: schema.cohorts.id })
    .from(schema.cohorts)
    .where(and(eq(schema.cohorts.courseId, p.courseId), inArray(schema.cohorts.status, ['planned', 'running']), schoolId ? eq(schema.cohorts.schoolId, schoolId) : undefined))
    .limit(1)
  const [existing] = await d.select().from(schema.enrolments).where(and(eq(schema.enrolments.userId, p.userId), eq(schema.enrolments.courseId, p.courseId)))
  if (!existing) {
    await d
      .insert(schema.enrolments)
      .values({ userId: p.userId, courseId: p.courseId, paymentId: p.id, schoolId, cohortId: cohort?.id ?? null })
      .onConflictDoNothing()
    await audit(actorId, 'enrolment.created', 'payment', p.id)
  } else if (existing.status === 'revoked') {
    await d.update(schema.enrolments).set({ status: 'active', paymentId: p.id, schoolId }).where(eq(schema.enrolments.id, existing.id))
    await audit(actorId, 'enrolment.reactivated', 'enrolment', existing.id)
  }
  await allocateForPayment(p.id, actorId)
}

/** Paystack webhook signature: HMAC-SHA512 of the raw body with the secret key. */
export function verifyPaystackSignature(raw: string, signature: string | null) {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key || !signature) return false
  const expected = createHmac('sha512', key).update(raw).digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(signature)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** Flutterwave webhook: the `verif-hash` header must equal the secret hash configured in the dashboard. */
export function verifyFlutterwaveHash(header: string | null) {
  const hash = process.env.FLUTTERWAVE_WEBHOOK_HASH
  if (!hash || !header) return false
  const a = Buffer.from(hash)
  const b = Buffer.from(header)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** Re-verifies a gateway payment by reference and grants access if confirmed. Never trusts client input. */
export async function confirmGatewayPayment(reference: string, actorId: number | null) {
  const d = db()
  const [p] = await d.select().from(schema.payments).where(eq(schema.payments.reference, reference))
  if (!p) return { status: 'not_found' as const }
  if (p.status === 'success') return { status: 'success' as const, payment: p }
  if (p.provider === 'bank_transfer') return { status: p.status, payment: p }
  const v = await verifyWithGateway(p)
  if (v.ok) return { status: 'success' as const, payment: await markPaymentSuccess(p.id, v.transactionId, actorId) }
  if (v.final) {
    await d.update(schema.payments).set({ status: 'failed', failureReason: v.reason, updatedAt: new Date().toISOString() }).where(and(eq(schema.payments.id, p.id), eq(schema.payments.status, 'pending')))
    return { status: 'failed' as const, payment: p, reason: v.reason }
  }
  return { status: 'pending' as const, payment: p, reason: v.reason }
}
