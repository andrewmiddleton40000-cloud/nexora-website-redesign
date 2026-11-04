// RESTRICTED: payments administration and confidential institutional allocations.
// Every handler requires super_admin or finance_admin.
import { createServerFn } from '@tanstack/react-start'
import { and, asc, desc, eq, gte, lte } from 'drizzle-orm'
import { z } from 'zod'
import { AppError, audit, db, requireRole, schema } from '../core'
import { confirmGatewayPayment, gatewayStatus, markPaymentSuccess } from '../payments'
import { recalculateAllocations, voidAllocationForPayment } from '../finance'
import { FINANCE } from '../../lib/roles'

const id = z.number().int().positive()

export const listPayments = createServerFn({ method: 'GET' })
  .validator(z.object({ status: z.string().max(30).optional() }))
  .handler(async ({ data }) => {
    await requireRole(FINANCE)
    const rows = await db()
      .select({ p: schema.payments, name: schema.users.fullName, email: schema.users.email, courseTitle: schema.courses.title })
      .from(schema.payments)
      .innerJoin(schema.users, eq(schema.users.id, schema.payments.userId))
      .innerJoin(schema.courses, eq(schema.courses.id, schema.payments.courseId))
      .where(data.status ? eq(schema.payments.status, data.status) : undefined)
      .orderBy(desc(schema.payments.createdAt))
      .limit(300)
    return { payments: rows.map((r) => ({ ...r.p, name: r.name, email: r.email, courseTitle: r.courseTitle })), gateways: gatewayStatus() }
  })

/** Manual bank transfer verification: staff confirm the credit on Nexora's bank statement — never from a screenshot. */
export const verifyBankTransfer = createServerFn({ method: 'POST' })
  .validator(z.object({ paymentId: id, bankTransactionRef: z.string().trim().min(4).max(120), amountConfirmedKobo: z.number().int().positive(), statementChecked: z.literal(true) }))
  .handler(async ({ data }) => {
    const me = await requireRole(FINANCE)
    const [p] = await db().select().from(schema.payments).where(eq(schema.payments.id, data.paymentId))
    if (!p || p.provider !== 'bank_transfer') throw new AppError('Bank transfer payment not found.', 'NOT_FOUND')
    if (data.amountConfirmedKobo !== p.amountKobo) throw new AppError('The amount received does not match the course price. Do not verify partial or mismatched payments.')
    await markPaymentSuccess(p.id, `bank:${data.bankTransactionRef.toUpperCase()}`, me.id)
    return { ok: true }
  })

export const rejectPayment = createServerFn({ method: 'POST' })
  .validator(z.object({ paymentId: id, reason: z.string().trim().min(3).max(500) }))
  .handler(async ({ data }) => {
    const me = await requireRole(FINANCE)
    const [p] = await db()
      .update(schema.payments)
      .set({ status: 'failed', failureReason: data.reason, updatedAt: new Date().toISOString() })
      .where(and(eq(schema.payments.id, data.paymentId), eq(schema.payments.status, 'awaiting_verification')))
      .returning()
    if (!p) throw new AppError('Only payments awaiting verification can be rejected.', 'CONFLICT')
    await audit(me.id, 'payment.rejected', 'payment', p.id, { reason: data.reason })
    return { ok: true }
  })

export const reverifyPayment = createServerFn({ method: 'POST' })
  .validator(z.object({ paymentId: id }))
  .handler(async ({ data }) => {
    const me = await requireRole(FINANCE)
    const [p] = await db().select().from(schema.payments).where(eq(schema.payments.id, data.paymentId))
    if (!p) throw new AppError('Payment not found.', 'NOT_FOUND')
    const r = await confirmGatewayPayment(p.reference, me.id)
    return { status: r.status, reason: 'reason' in r ? (r.reason ?? null) : null }
  })

/** Records a refund made through the gateway dashboard or by bank, revokes access and adjusts the allocation. */
export const recordRefund = createServerFn({ method: 'POST' })
  .validator(z.object({ paymentId: id, refundReference: z.string().trim().min(3).max(120), reason: z.string().trim().min(3).max(500) }))
  .handler(async ({ data }) => {
    const me = await requireRole(FINANCE)
    const d = db()
    const now = new Date().toISOString()
    const [p] = await d
      .update(schema.payments)
      .set({ status: 'refunded', refundedAt: now, refundReference: data.refundReference, refundReason: data.reason, refundedById: me.id, updatedAt: now })
      .where(and(eq(schema.payments.id, data.paymentId), eq(schema.payments.status, 'success')))
      .returning()
    if (!p) throw new AppError('Only successful payments can be refunded.', 'CONFLICT')
    await d.update(schema.enrolments).set({ status: 'revoked' }).where(and(eq(schema.enrolments.paymentId, p.id), eq(schema.enrolments.status, 'active')))
    await voidAllocationForPayment(p.id, me.id, data.reason)
    await audit(me.id, 'payment.refunded', 'payment', p.id, { refundReference: data.refundReference })
    return { ok: true }
  })

export const getBankSettings = createServerFn({ method: 'GET' }).handler(async () => {
  await requireRole(FINANCE)
  const [row] = await db().select().from(schema.settings).where(eq(schema.settings.key, 'bank_transfer'))
  return (row?.value ?? {}) as { bankName?: string; accountName?: string; accountNumber?: string; instructions?: string }
})

export const saveBankSettings = createServerFn({ method: 'POST' })
  .validator(z.object({ bankName: z.string().trim().max(120), accountName: z.string().trim().max(160), accountNumber: z.string().trim().regex(/^[0-9]{0,20}$/), instructions: z.string().trim().max(1000) }))
  .handler(async ({ data }) => {
    const me = await requireRole(FINANCE)
    await db()
      .insert(schema.settings)
      .values({ key: 'bank_transfer', value: data })
      .onConflictDoUpdate({ target: schema.settings.key, set: { value: data, updatedAt: new Date().toISOString() } })
    await audit(me.id, 'settings.bank_transfer', 'settings', 'bank_transfer')
    return { ok: true }
  })

// ---------- Confidential allocations ----------

export const financeOverview = createServerFn({ method: 'GET' }).handler(async () => {
  await requireRole(FINANCE)
  const d = db()
  const schools = await d.select({ id: schema.schools.id, name: schema.schools.name, code: schema.schools.code, status: schema.schools.status }).from(schema.schools).orderBy(asc(schema.schools.name))
  const agreements = await d.select().from(schema.schoolAgreements).orderBy(desc(schema.schoolAgreements.startsOn))
  const allocations = await d
    .select({ a: schema.schoolAllocations, reference: schema.payments.reference, amountPaidKobo: schema.payments.amountKobo, courseTitle: schema.courses.title, schoolName: schema.schools.name })
    .from(schema.schoolAllocations)
    .innerJoin(schema.payments, eq(schema.payments.id, schema.schoolAllocations.paymentId))
    .innerJoin(schema.courses, eq(schema.courses.id, schema.payments.courseId))
    .innerJoin(schema.schools, eq(schema.schools.id, schema.schoolAllocations.schoolId))
    .orderBy(desc(schema.schoolAllocations.createdAt))
    .limit(500)
  const statements = await d.select().from(schema.reconciliationStatements).orderBy(desc(schema.reconciliationStatements.createdAt))
  const bySchool = schools.map((s) => {
    const mine = allocations.filter((a) => a.a.schoolId === s.id)
    const sumBy = (st: string) => mine.filter((a) => a.a.status === st).reduce((t, a) => t + a.a.amountKobo, 0)
    const gross = mine.filter((a) => a.a.status !== 'void').reduce((t, a) => t + a.amountPaidKobo, 0)
    return { ...s, enrolments: mine.filter((a) => a.a.status !== 'void').length, outstandingKobo: sumBy('outstanding'), paidKobo: sumBy('paid'), grossKobo: gross }
  })
  return {
    schools: bySchool,
    agreements,
    allocations: allocations.map((r) => ({ ...r.a, reference: r.reference, amountPaidKobo: r.amountPaidKobo, courseTitle: r.courseTitle, schoolName: r.schoolName })),
    statements,
  }
})

export const saveAgreement = createServerFn({ method: 'POST' })
  .validator(z.object({ id: id.optional(), schoolId: id, allocationPerEnrolmentKobo: z.number().int().min(0).max(100_000_000), startsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), endsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(), status: z.enum(['active', 'ended']), documentRef: z.string().trim().max(200).optional(), notes: z.string().trim().max(2000).optional() }))
  .handler(async ({ data }) => {
    const me = await requireRole(FINANCE)
    const { id: aid, ...v } = data
    const values = { ...v, documentRef: v.documentRef || null, notes: v.notes || null }
    if (aid) await db().update(schema.schoolAgreements).set(values).where(eq(schema.schoolAgreements.id, aid))
    else await db().insert(schema.schoolAgreements).values({ ...values, createdById: me.id })
    await audit(me.id, aid ? 'agreement.updated' : 'agreement.created', 'school', data.schoolId)
    return { ok: true }
  })

export const runAllocationCalculation = createServerFn({ method: 'POST' }).handler(async () => {
  const me = await requireRole(FINANCE)
  const r = await recalculateAllocations(me.id)
  await audit(me.id, 'allocation.recalculated', 'school_allocation', null, r)
  return r
})

export const markAllocationsPaid = createServerFn({ method: 'POST' })
  .validator(z.object({ allocationIds: z.array(id).min(1).max(500), payoutReference: z.string().trim().min(3).max(120), paidOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
  .handler(async ({ data }) => {
    const me = await requireRole(FINANCE)
    let updated = 0
    for (const aid of data.allocationIds) {
      const r = await db()
        .update(schema.schoolAllocations)
        .set({ status: 'paid', payoutReference: data.payoutReference, paidAt: new Date(data.paidOn).toISOString() })
        .where(and(eq(schema.schoolAllocations.id, aid), eq(schema.schoolAllocations.status, 'outstanding')))
        .returning({ id: schema.schoolAllocations.id })
      updated += r.length
    }
    await audit(me.id, 'allocation.paid', 'school_allocation', null, { ids: data.allocationIds, payoutReference: data.payoutReference })
    return { updated }
  })

export const generateStatement = createServerFn({ method: 'POST' })
  .validator(z.object({ schoolId: id, periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
  .handler(async ({ data }) => {
    const me = await requireRole(FINANCE)
    if (data.periodEnd < data.periodStart) throw new AppError('The period end must be after the start.')
    const rows = await db()
      .select({ a: schema.schoolAllocations, courseTitle: schema.courses.title })
      .from(schema.schoolAllocations)
      .innerJoin(schema.payments, eq(schema.payments.id, schema.schoolAllocations.paymentId))
      .innerJoin(schema.courses, eq(schema.courses.id, schema.payments.courseId))
      .where(
        and(
          eq(schema.schoolAllocations.schoolId, data.schoolId),
          gte(schema.schoolAllocations.createdAt, `${data.periodStart}T00:00:00Z`),
          lte(schema.schoolAllocations.createdAt, `${data.periodEnd}T23:59:59Z`),
        ),
      )
      .orderBy(asc(schema.schoolAllocations.createdAt))
    const live = rows.filter((r) => r.a.status !== 'void')
    // Lines contain no learner names — only dates, courses and amounts.
    const lines = live.map((r) => ({ date: r.a.createdAt.slice(0, 10), course: r.courseTitle, amountKobo: r.a.amountKobo, status: r.a.status }))
    const total = lines.reduce((s, l) => s + l.amountKobo, 0)
    const paid = lines.filter((l) => l.status === 'paid').reduce((s, l) => s + l.amountKobo, 0)
    const [st] = await db()
      .insert(schema.reconciliationStatements)
      .values({ schoolId: data.schoolId, periodStart: data.periodStart, periodEnd: data.periodEnd, enrolmentCount: lines.length, totalKobo: total, paidKobo: paid, outstandingKobo: total - paid, lines, generatedById: me.id })
      .returning()
    await audit(me.id, 'statement.generated', 'reconciliation_statement', st.id, { schoolId: data.schoolId })
    return { id: st.id }
  })

export const releaseStatement = createServerFn({ method: 'POST' })
  .validator(z.object({ statementId: id, released: z.boolean() }))
  .handler(async ({ data }) => {
    const me = await requireRole(FINANCE)
    await db()
      .update(schema.reconciliationStatements)
      .set({ releasedToSchool: data.released, releasedAt: data.released ? new Date().toISOString() : null })
      .where(eq(schema.reconciliationStatements.id, data.statementId))
    await audit(me.id, data.released ? 'statement.released' : 'statement.withdrawn', 'reconciliation_statement', data.statementId)
    return { ok: true }
  })
