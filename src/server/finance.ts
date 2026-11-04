// CONFIDENTIAL institutional allocations. Server-only.
// Nothing from this module may be returned by any server function that is not gated by FINANCE roles,
// except reconciliation statements that a finance admin has explicitly released to an authorised school representative.
import { and, eq, inArray, isNull, lte, or, gte, sql } from 'drizzle-orm'
import { audit, db, schema, today } from './core'

/** Active agreement for a school on a given date. */
export async function activeAgreement(schoolId: number, on = today()) {
  const [a] = await db()
    .select()
    .from(schema.schoolAgreements)
    .where(
      and(
        eq(schema.schoolAgreements.schoolId, schoolId),
        eq(schema.schoolAgreements.status, 'active'),
        lte(schema.schoolAgreements.startsOn, on),
        or(isNull(schema.schoolAgreements.endsOn), gte(schema.schoolAgreements.endsOn, on)),
      ),
    )
    .orderBy(sql`${schema.schoolAgreements.startsOn} desc`)
    .limit(1)
  return a ?? null
}

/**
 * Creates the allocation for one successful payment if the enrolment is attributed to an approved partner school
 * with an active agreement. Idempotent (unique payment_id).
 */
export async function allocateForPayment(paymentId: number, actorId: number | null) {
  const d = db()
  const [row] = await d
    .select({ payment: schema.payments, enrolment: schema.enrolments, user: schema.users })
    .from(schema.payments)
    .innerJoin(schema.enrolments, eq(schema.enrolments.paymentId, schema.payments.id))
    .innerJoin(schema.users, eq(schema.users.id, schema.payments.userId))
    .where(eq(schema.payments.id, paymentId))
  if (!row || row.payment.status !== 'success') return null
  const schoolId = row.enrolment.schoolId
  if (!schoolId || row.user.schoolId !== schoolId || row.user.schoolLinkStatus !== 'approved') return null
  const paidOn = (row.payment.verifiedAt ?? row.payment.createdAt).slice(0, 10)
  const agreement = await activeAgreement(schoolId, paidOn)
  if (!agreement) return null
  const [created] = await d
    .insert(schema.schoolAllocations)
    .values({
      schoolId,
      agreementId: agreement.id,
      paymentId,
      enrolmentId: row.enrolment.id,
      amountKobo: agreement.allocationPerEnrolmentKobo,
      recordedById: actorId,
    })
    .onConflictDoNothing()
    .returning()
  if (created) await audit(actorId, 'allocation.created', 'school_allocation', created.id, { schoolId, paymentId })
  return created ?? null
}

/** Finance: scans all successful, school-attributed payments and creates any missing allocations. */
export async function recalculateAllocations(actorId: number) {
  const rows = await db()
    .select({ id: schema.payments.id })
    .from(schema.payments)
    .innerJoin(schema.enrolments, eq(schema.enrolments.paymentId, schema.payments.id))
    .leftJoin(schema.schoolAllocations, eq(schema.schoolAllocations.paymentId, schema.payments.id))
    .where(and(eq(schema.payments.status, 'success'), sql`${schema.enrolments.schoolId} is not null`, isNull(schema.schoolAllocations.id)))
  let created = 0
  for (const r of rows) if (await allocateForPayment(r.id, actorId)) created++
  return { scanned: rows.length, created }
}

/** Voids an outstanding allocation when its payment is refunded. Paid allocations are flagged for recovery. */
export async function voidAllocationForPayment(paymentId: number, actorId: number, reason: string) {
  const d = db()
  const [a] = await d.select().from(schema.schoolAllocations).where(eq(schema.schoolAllocations.paymentId, paymentId))
  if (!a) return
  if (a.status === 'outstanding') {
    await d.update(schema.schoolAllocations).set({ status: 'void', note: `Voided: ${reason}` }).where(eq(schema.schoolAllocations.id, a.id))
  } else if (a.status === 'paid') {
    await d
      .update(schema.schoolAllocations)
      .set({ note: `${a.note ? a.note + ' | ' : ''}Payment refunded after payout — recover or offset: ${reason}` })
      .where(eq(schema.schoolAllocations.id, a.id))
  }
  await audit(actorId, 'allocation.refund_adjusted', 'school_allocation', a.id, { paymentId, previous: a.status })
}

/** Voids outstanding allocations for a learner whose school link was rejected. */
export async function voidAllocationsForUserSchool(userId: number, schoolId: number, actorId: number) {
  const d = db()
  const enrols = await d
    .select({ id: schema.enrolments.id })
    .from(schema.enrolments)
    .where(and(eq(schema.enrolments.userId, userId), eq(schema.enrolments.schoolId, schoolId)))
  if (!enrols.length) return
  await d
    .update(schema.schoolAllocations)
    .set({ status: 'void', note: 'Voided: school attribution rejected' })
    .where(and(inArray(schema.schoolAllocations.enrolmentId, enrols.map((e) => e.id)), eq(schema.schoolAllocations.status, 'outstanding')))
  await audit(actorId, 'allocation.voided_attribution', 'user', userId, { schoolId })
}
