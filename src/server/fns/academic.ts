// Cohorts, attendance, grading, completion verification and certificates.
// Instructors are scoped to their own cohorts; academic and super administrators see everything.
import { createServerFn } from '@tanstack/react-start'
import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { AppError, audit, db, randomCode, requireRole, schema, type DbUser } from '../core'
import { computeProgress } from '../learning'
import { ACADEMIC, ACADEMIC_OR_INSTRUCTOR, hasRole } from '../../lib/roles'

const id = z.number().int().positive()

async function scopedCohortIds(me: DbUser): Promise<number[] | null> {
  if (hasRole(me.role, ACADEMIC)) return null // all
  const rows = await db().select({ id: schema.cohorts.id }).from(schema.cohorts).where(eq(schema.cohorts.instructorId, me.id))
  return rows.map((r) => r.id)
}

async function assertEnrolmentInScope(me: DbUser, enrolmentId: number) {
  const [e] = await db().select().from(schema.enrolments).where(eq(schema.enrolments.id, enrolmentId))
  if (!e) throw new AppError('Enrolment not found.', 'NOT_FOUND')
  const scope = await scopedCohortIds(me)
  if (scope && (!e.cohortId || !scope.includes(e.cohortId))) throw new AppError('This learner is not in one of your cohorts.', 'FORBIDDEN')
  return e
}

export const academicData = createServerFn({ method: 'GET' }).handler(async () => {
  const me = await requireRole(ACADEMIC_OR_INSTRUCTOR)
  const d = db()
  const scope = await scopedCohortIds(me)
  const cohorts = await d
    .select({ c: schema.cohorts, courseTitle: schema.courses.title, schoolName: schema.schools.name, instructorName: schema.users.fullName })
    .from(schema.cohorts)
    .innerJoin(schema.courses, eq(schema.courses.id, schema.cohorts.courseId))
    .leftJoin(schema.schools, eq(schema.schools.id, schema.cohorts.schoolId))
    .leftJoin(schema.users, eq(schema.users.id, schema.cohorts.instructorId))
    .where(scope ? inArray(schema.cohorts.id, scope.length ? scope : [-1]) : undefined)
    .orderBy(desc(schema.cohorts.createdAt))
  const cohortIds = cohorts.map((c) => c.c.id)
  const sessions = cohortIds.length ? await d.select().from(schema.liveSessions).where(inArray(schema.liveSessions.cohortId, cohortIds)).orderBy(asc(schema.liveSessions.startsAt)) : []
  const enrolments = await d
    .select({ e: schema.enrolments, name: schema.users.fullName, courseTitle: schema.courses.title })
    .from(schema.enrolments)
    .innerJoin(schema.users, eq(schema.users.id, schema.enrolments.userId))
    .innerJoin(schema.courses, eq(schema.courses.id, schema.enrolments.courseId))
    .where(scope ? inArray(schema.enrolments.cohortId, scope.length ? scope : [-1]) : inArray(schema.enrolments.status, ['active', 'completed']))
    .orderBy(asc(schema.users.fullName))
  const enrolIds = enrolments.map((e) => e.e.id)
  const attendance = enrolIds.length ? await d.select().from(schema.attendance).where(inArray(schema.attendance.enrolmentId, enrolIds)) : []
  const submissions = enrolIds.length
    ? await d
        .select({ s: schema.assignmentSubmissions, title: schema.assignments.title, kind: schema.assignments.kind, name: schema.users.fullName })
        .from(schema.assignmentSubmissions)
        .innerJoin(schema.assignments, eq(schema.assignments.id, schema.assignmentSubmissions.assignmentId))
        .innerJoin(schema.users, eq(schema.users.id, schema.assignmentSubmissions.userId))
        .where(inArray(schema.assignmentSubmissions.enrolmentId, enrolIds))
        .orderBy(desc(schema.assignmentSubmissions.submittedAt))
    : []
  const progress = await Promise.all(enrolments.map(async ({ e }) => ({ enrolmentId: e.id, p: await computeProgress(e) })))
  const instructorAssessments = await d.select({ id: schema.assessments.id, courseId: schema.assessments.courseId, title: schema.assessments.title }).from(schema.assessments).where(eq(schema.assessments.kind, 'instructor'))
  const certificates = enrolIds.length
    ? await d.select({ completionId: schema.certificates.completionId, number: schema.certificates.number, enrolmentId: schema.courseCompletions.enrolmentId, revokedAt: schema.certificates.revokedAt }).from(schema.certificates).innerJoin(schema.courseCompletions, eq(schema.courseCompletions.id, schema.certificates.completionId)).where(inArray(schema.courseCompletions.enrolmentId, enrolIds))
    : []
  return {
    canManage: hasRole(me.role, ACADEMIC),
    cohorts: cohorts.map((c) => ({ ...c.c, courseTitle: c.courseTitle, schoolName: c.schoolName, instructorName: c.instructorName })),
    sessions,
    learners: enrolments.map(({ e, name, courseTitle }) => ({
      enrolmentId: e.id,
      userId: e.userId,
      name,
      courseId: e.courseId,
      courseTitle,
      cohortId: e.cohortId,
      status: e.status,
      progress: progress.find((p) => p.enrolmentId === e.id)!.p,
      certificate: certificates.find((c) => c.enrolmentId === e.id) ?? null,
    })),
    attendance,
    submissions: submissions.map(({ s, title, kind, name }) => ({ ...s, title, kind, name })),
    instructorAssessments,
  }
})

export const saveCohort = createServerFn({ method: 'POST' })
  .validator(z.object({ id: id.optional(), courseId: id, name: z.string().trim().min(2).max(120), schoolId: id.nullable(), instructorId: id.nullable(), startsOn: z.string().max(10).nullable(), endsOn: z.string().max(10).nullable(), status: z.enum(['planned', 'running', 'finished']) }))
  .handler(async ({ data }) => {
    const me = await requireRole(ACADEMIC)
    if (data.instructorId) {
      const [ins] = await db().select({ role: schema.users.role }).from(schema.users).where(eq(schema.users.id, data.instructorId))
      if (!ins || !hasRole(ins.role, ACADEMIC_OR_INSTRUCTOR)) throw new AppError('The assigned instructor must have an instructor or academic role.')
    }
    const { id: cohortId, ...v } = data
    if (cohortId) await db().update(schema.cohorts).set(v).where(eq(schema.cohorts.id, cohortId))
    else await db().insert(schema.cohorts).values(v)
    await audit(me.id, cohortId ? 'cohort.updated' : 'cohort.created', 'cohort', cohortId ?? null)
    return { ok: true }
  })

export const saveLiveSession = createServerFn({ method: 'POST' })
  .validator(z.object({ id: id.optional(), cohortId: id, lessonId: id.nullable(), title: z.string().trim().min(2).max(200), startsAt: z.string().min(10).max(40), durationMinutes: z.number().int().min(10).max(600), meetingUrl: z.string().trim().max(500).refine((v) => v === '' || /^https:\/\//.test(v), 'Meeting links must use https://') }))
  .handler(async ({ data }) => {
    const me = await requireRole(ACADEMIC_OR_INSTRUCTOR)
    const scope = await scopedCohortIds(me)
    if (scope && !scope.includes(data.cohortId)) throw new AppError('Not your cohort.', 'FORBIDDEN')
    const startsAt = new Date(data.startsAt)
    if (Number.isNaN(startsAt.getTime())) throw new AppError('Enter a valid date and time.')
    const { id: sid, ...v } = data
    const values = { ...v, startsAt: startsAt.toISOString(), meetingUrl: v.meetingUrl || null }
    if (sid) await db().update(schema.liveSessions).set(values).where(eq(schema.liveSessions.id, sid))
    else await db().insert(schema.liveSessions).values(values)
    await audit(me.id, 'live_session.saved', 'cohort', data.cohortId)
    return { ok: true }
  })

export const assignCohort = createServerFn({ method: 'POST' })
  .validator(z.object({ enrolmentId: id, cohortId: id.nullable() }))
  .handler(async ({ data }) => {
    const me = await requireRole(ACADEMIC)
    const [e] = await db().select().from(schema.enrolments).where(eq(schema.enrolments.id, data.enrolmentId))
    if (!e) throw new AppError('Enrolment not found.', 'NOT_FOUND')
    if (data.cohortId) {
      const [c] = await db().select().from(schema.cohorts).where(eq(schema.cohorts.id, data.cohortId))
      if (!c || c.courseId !== e.courseId) throw new AppError('That cohort is for a different course.')
    }
    await db().update(schema.enrolments).set({ cohortId: data.cohortId }).where(eq(schema.enrolments.id, e.id))
    await audit(me.id, 'enrolment.cohort_assigned', 'enrolment', e.id, { cohortId: data.cohortId })
    return { ok: true }
  })

export const markAttendance = createServerFn({ method: 'POST' })
  .validator(z.object({ liveSessionId: id, enrolmentId: id, status: z.enum(['present', 'absent', 'excused']) }))
  .handler(async ({ data }) => {
    const me = await requireRole(ACADEMIC_OR_INSTRUCTOR)
    const e = await assertEnrolmentInScope(me, data.enrolmentId)
    const [s] = await db().select().from(schema.liveSessions).where(eq(schema.liveSessions.id, data.liveSessionId))
    if (!s || s.cohortId !== e.cohortId) throw new AppError('This learner is not in that session’s cohort.')
    await db()
      .insert(schema.attendance)
      .values({ liveSessionId: s.id, enrolmentId: e.id, status: data.status, markedById: me.id })
      .onConflictDoUpdate({ target: [schema.attendance.liveSessionId, schema.attendance.enrolmentId], set: { status: data.status, markedById: me.id } })
    return { ok: true }
  })

export const reviewSubmission = createServerFn({ method: 'POST' })
  .validator(z.object({ submissionId: id, status: z.enum(['approved', 'returned']), score: z.number().int().min(0).max(100).nullable(), feedback: z.string().trim().max(3000) }))
  .handler(async ({ data }) => {
    const me = await requireRole(ACADEMIC_OR_INSTRUCTOR)
    const [s] = await db().select().from(schema.assignmentSubmissions).where(eq(schema.assignmentSubmissions.id, data.submissionId))
    if (!s) throw new AppError('Submission not found.', 'NOT_FOUND')
    await assertEnrolmentInScope(me, s.enrolmentId)
    await db()
      .update(schema.assignmentSubmissions)
      .set({ status: data.status, score: data.score, feedback: data.feedback || null, reviewedById: me.id, reviewedAt: new Date().toISOString() })
      .where(eq(schema.assignmentSubmissions.id, s.id))
    await audit(me.id, `submission.${data.status}`, 'submission', s.id)
    return { ok: true }
  })

export const recordAssessment = createServerFn({ method: 'POST' })
  .validator(z.object({ assessmentId: id, enrolmentId: id, scorePercent: z.number().int().min(0).max(100), note: z.string().trim().max(1000) }))
  .handler(async ({ data }) => {
    const me = await requireRole(ACADEMIC_OR_INSTRUCTOR)
    const e = await assertEnrolmentInScope(me, data.enrolmentId)
    const [a] = await db().select().from(schema.assessments).where(eq(schema.assessments.id, data.assessmentId))
    if (!a || a.courseId !== e.courseId || a.kind !== 'instructor') throw new AppError('That assessment cannot be recorded for this learner.')
    await db().insert(schema.assessmentResults).values({ assessmentId: a.id, enrolmentId: e.id, userId: e.userId, scorePercent: data.scorePercent, recordedById: me.id, note: data.note || null })
    await audit(me.id, 'assessment.recorded', 'enrolment', e.id, { assessmentId: a.id, score: data.scorePercent })
    return { ok: true }
  })

/** Completion verification: only academic/super admins, and only once every requirement is met. Issues the certificate. */
export const approveCompletion = createServerFn({ method: 'POST' })
  .validator(z.object({ enrolmentId: id, notes: z.string().trim().max(1000).optional() }))
  .handler(async ({ data }) => {
    const me = await requireRole(ACADEMIC)
    const d = db()
    const [e] = await d.select().from(schema.enrolments).where(eq(schema.enrolments.id, data.enrolmentId))
    if (!e || e.status === 'revoked') throw new AppError('Enrolment not found or not active.', 'NOT_FOUND')
    const p = await computeProgress(e)
    if (!p.readyForVerification && !p.checks.verified) {
      const missing = Object.entries(p.checks).filter(([k, v]) => k !== 'verified' && !v).map(([k]) => k)
      throw new AppError(`Requirements not yet met: ${missing.join(', ')}.`)
    }
    const [user] = await d.select().from(schema.users).where(eq(schema.users.id, e.userId))
    const [course] = await d.select().from(schema.courses).where(eq(schema.courses.id, e.courseId))
    const [completion] = await d
      .insert(schema.courseCompletions)
      .values({ enrolmentId: e.id, userId: e.userId, courseId: e.courseId, overallScore: p.overallScore, verifiedById: me.id, notes: data.notes || null })
      .onConflictDoNothing()
      .returning()
    const [comp] = completion ? [completion] : await d.select().from(schema.courseCompletions).where(eq(schema.courseCompletions.enrolmentId, e.id))
    await d.update(schema.enrolments).set({ status: 'completed' }).where(eq(schema.enrolments.id, e.id))
    const year = new Date().getFullYear()
    await d
      .insert(schema.certificates)
      .values({
        number: `NDA-${year}-L${course.level}-${randomCode(6)}`,
        verificationCode: randomCode(10),
        userId: e.userId,
        courseId: e.courseId,
        completionId: comp.id,
        studentName: user.fullName,
        courseTitle: course.title,
        completedOn: comp.verifiedAt.slice(0, 10),
        issuedById: me.id,
      })
      .onConflictDoNothing()
    await audit(me.id, 'completion.verified', 'enrolment', e.id, { overallScore: p.overallScore })
    return { ok: true }
  })

export const revokeCertificate = createServerFn({ method: 'POST' })
  .validator(z.object({ number: z.string().min(5).max(40) }))
  .handler(async ({ data }) => {
    const me = await requireRole(ACADEMIC)
    await db().update(schema.certificates).set({ revokedAt: new Date().toISOString() }).where(eq(schema.certificates.number, data.number))
    await audit(me.id, 'certificate.revoked', 'certificate', data.number)
    return { ok: true }
  })

export const saveSchoolReport = createServerFn({ method: 'POST' })
  .validator(z.object({ schoolId: id, cohortId: id.nullable(), title: z.string().trim().min(3).max(200), summary: z.string().trim().min(10).max(5000) }))
  .handler(async ({ data }) => {
    const me = await requireRole(ACADEMIC)
    const d = db()
    // Academic statistics only — never financial figures.
    const enrols = await d.select().from(schema.enrolments).where(and(eq(schema.enrolments.schoolId, data.schoolId), data.cohortId ? eq(schema.enrolments.cohortId, data.cohortId) : undefined))
    const progress = await Promise.all(enrols.map((e) => computeProgress(e)))
    const stats = {
      learners: enrols.length,
      completed: enrols.filter((e) => e.status === 'completed').length,
      averageProgress: progress.length ? Math.round(progress.reduce((s, p) => s + p.percent, 0) / progress.length) : 0,
      averageScore: progress.length ? Math.round(progress.reduce((s, p) => s + p.overallScore, 0) / progress.length) : 0,
    }
    await d.insert(schema.schoolReports).values({ ...data, stats, approvedById: me.id, approvedAt: new Date().toISOString() })
    await audit(me.id, 'school_report.approved', 'school', data.schoolId)
    return { ok: true }
  })
