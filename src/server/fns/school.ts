// School partner dashboard. A representative only ever sees their own school.
// The ordinary dashboard contains academic data only; reconciliation is a separate, separately-authorised handler.
import { createServerFn } from '@tanstack/react-start'
import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { AppError, db, requireRole, schema, type DbUser } from '../core'
import { computeProgress } from '../learning'
import { applySchoolLink } from './admin'

async function membership(me: DbUser) {
  const [m] = await db().select().from(schema.schoolMembers).where(eq(schema.schoolMembers.userId, me.id))
  if (!m) throw new AppError('Your account is not linked to a partner school yet.', 'FORBIDDEN')
  return m
}

export const schoolDashboard = createServerFn({ method: 'GET' }).handler(async () => {
  const me = await requireRole(['school_partner'])
  const m = await membership(me)
  const d = db()
  const [school] = await d.select().from(schema.schools).where(eq(schema.schools.id, m.schoolId))
  const learners = await d
    .select({ id: schema.users.id, fullName: schema.users.fullName, status: schema.users.schoolLinkStatus, createdAt: schema.users.createdAt })
    .from(schema.users)
    .where(and(eq(schema.users.schoolId, m.schoolId), inArray(schema.users.schoolLinkStatus, ['pending', 'approved'])))
    .orderBy(asc(schema.users.fullName))
  const enrolments = await d
    .select({ e: schema.enrolments, courseTitle: schema.courses.title, name: schema.users.fullName })
    .from(schema.enrolments)
    .innerJoin(schema.courses, eq(schema.courses.id, schema.enrolments.courseId))
    .innerJoin(schema.users, eq(schema.users.id, schema.enrolments.userId))
    .where(and(eq(schema.enrolments.schoolId, m.schoolId), inArray(schema.enrolments.status, ['active', 'completed'])))
  const progress = await Promise.all(
    enrolments.map(async ({ e, courseTitle, name }) => {
      const p = await computeProgress(e)
      return { enrolmentId: e.id, name, courseTitle, status: e.status, percent: p.percent, overallScore: p.overallScore, attendancePercent: p.attendancePercent, finalProject: p.finalProjectStatus }
    }),
  )
  const cohorts = await d
    .select({ id: schema.cohorts.id, name: schema.cohorts.name, status: schema.cohorts.status, startsOn: schema.cohorts.startsOn, endsOn: schema.cohorts.endsOn, courseTitle: schema.courses.title })
    .from(schema.cohorts)
    .innerJoin(schema.courses, eq(schema.courses.id, schema.cohorts.courseId))
    .where(eq(schema.cohorts.schoolId, m.schoolId))
  const reports = await d
    .select({ id: schema.schoolReports.id, title: schema.schoolReports.title, summary: schema.schoolReports.summary, stats: schema.schoolReports.stats, approvedAt: schema.schoolReports.approvedAt })
    .from(schema.schoolReports)
    .where(eq(schema.schoolReports.schoolId, m.schoolId))
    .orderBy(desc(schema.schoolReports.createdAt))
  return {
    school: { name: school.name, code: school.code, location: school.location, schoolType: school.schoolType, status: school.status },
    position: m.position,
    canViewReconciliation: m.canViewReconciliation,
    counts: {
      registered: learners.filter((l) => l.status === 'approved').length,
      pending: learners.filter((l) => l.status === 'pending').length,
      enrolments: enrolments.length,
      completed: enrolments.filter((e) => e.e.status === 'completed').length,
      activeCohorts: cohorts.filter((c) => c.status !== 'finished').length,
    },
    learners,
    progress,
    cohorts,
    reports: reports.filter((r) => r.approvedAt),
  }
})

export const schoolApproveLearner = createServerFn({ method: 'POST' })
  .validator(z.object({ userId: z.number().int().positive(), status: z.enum(['approved', 'rejected']) }))
  .handler(async ({ data }) => {
    const me = await requireRole(['school_partner'])
    const m = await membership(me)
    return applySchoolLink(data.userId, data.status, me.id, m.schoolId)
  })

/** Separate restricted channel: only representatives explicitly authorised for reconciliation, and only released statements. */
export const schoolReconciliation = createServerFn({ method: 'GET' }).handler(async () => {
  const me = await requireRole(['school_partner'])
  const m = await membership(me)
  if (!m.canViewReconciliation) throw new AppError('You are not authorised to view institutional reconciliation statements.', 'FORBIDDEN')
  const [school] = await db().select({ name: schema.schools.name, code: schema.schools.code }).from(schema.schools).where(eq(schema.schools.id, m.schoolId))
  const statements = await db()
    .select()
    .from(schema.reconciliationStatements)
    .where(and(eq(schema.reconciliationStatements.schoolId, m.schoolId), eq(schema.reconciliationStatements.releasedToSchool, true)))
    .orderBy(desc(schema.reconciliationStatements.periodEnd))
  return { school, statements: statements.map(({ generatedById: _g, ...s }) => s) }
})
