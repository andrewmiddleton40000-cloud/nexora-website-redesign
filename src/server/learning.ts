// Course progression, eligibility and access rules — the single backend source of truth.
import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import { AppError, db, schema, type DbUser } from './core'
import { ACADEMIC_OR_INSTRUCTOR, hasRole } from '../lib/roles'

type Course = typeof schema.courses.$inferSelect
type Enrolment = typeof schema.enrolments.$inferSelect

export const ACCESS_STATUSES = ['active', 'completed'] as const

export async function getCourseBySlug(slug: string) {
  const [c] = await db().select().from(schema.courses).where(eq(schema.courses.slug, slug))
  return c ?? null
}

export async function getEnrolment(userId: number, courseId: number) {
  const [e] = await db()
    .select()
    .from(schema.enrolments)
    .where(and(eq(schema.enrolments.userId, userId), eq(schema.enrolments.courseId, courseId)))
  return e ?? null
}

export function hasAccess(e: Enrolment | null) {
  return !!e && (ACCESS_STATUSES as readonly string[]).includes(e.status)
}

export async function hasVerifiedCompletion(userId: number, courseId: number) {
  const [c] = await db()
    .select({ id: schema.courseCompletions.id })
    .from(schema.courseCompletions)
    .where(and(eq(schema.courseCompletions.userId, userId), eq(schema.courseCompletions.courseId, courseId)))
  return !!c
}

export type Availability =
  | { state: 'enrolled'; enrolmentId: number; completed: boolean }
  | { state: 'eligible'; priceKobo: number }
  | { state: 'awaiting_price' }
  | { state: 'needs_prerequisite'; prerequisiteTitle: string | null }
  | { state: 'not_open' }
  | { state: 'needs_guardian_consent' }
  | { state: 'payment_pending'; reference: string }

/** Decides what a learner may do with a course. Used by pages AND enforced again at payment time. */
export async function courseAvailability(user: DbUser | null, course: Course): Promise<Availability> {
  if (user) {
    const e = await getEnrolment(user.id, course.id)
    if (hasAccess(e)) return { state: 'enrolled', enrolmentId: e!.id, completed: e!.status === 'completed' }
  }
  if (course.status !== 'available') return { state: 'not_open' }
  if (course.prerequisiteCourseId) {
    const ok = user ? await hasVerifiedCompletion(user.id, course.prerequisiteCourseId) : false
    if (!ok) {
      const [p] = await db().select({ title: schema.courses.title }).from(schema.courses).where(eq(schema.courses.id, course.prerequisiteCourseId))
      return { state: 'needs_prerequisite', prerequisiteTitle: p?.title ?? null }
    }
  }
  if (course.priceKobo == null || course.priceKobo <= 0) return { state: 'awaiting_price' }
  if (user) {
    if (user.ageGroup === 'under_18') {
      const [g] = await db().select().from(schema.guardianConsents).where(eq(schema.guardianConsents.userId, user.id))
      if (!g || g.status !== 'verified') return { state: 'needs_guardian_consent' }
    }
    const [pending] = await db()
      .select({ reference: schema.payments.reference })
      .from(schema.payments)
      .where(and(eq(schema.payments.userId, user.id), eq(schema.payments.courseId, course.id), eq(schema.payments.status, 'awaiting_verification')))
    if (pending) return { state: 'payment_pending', reference: pending.reference }
  }
  return { state: 'eligible', priceKobo: course.priceKobo }
}

/**
 * Throws unless the user may open lessons of this course: staff preview, or a paid, verified enrolment.
 * Every lesson, assignment and assessment handler calls this — direct URLs cannot bypass it.
 */
export async function requireCourseAccess(user: DbUser, courseId: number): Promise<{ enrolment: Enrolment | null; staff: boolean }> {
  if (hasRole(user.role, ACADEMIC_OR_INSTRUCTOR)) {
    return { enrolment: await getEnrolment(user.id, courseId), staff: true }
  }
  const e = await getEnrolment(user.id, courseId)
  if (!hasAccess(e)) throw new AppError('You need an active, paid enrolment to open this course.', 'FORBIDDEN')
  return { enrolment: e, staff: false }
}

export type Progress = Awaited<ReturnType<typeof computeProgress>>

/** Full completion breakdown for one enrolment. */
export async function computeProgress(enrolment: Enrolment) {
  const d = db()
  const [course] = await d.select().from(schema.courses).where(eq(schema.courses.id, enrolment.courseId))
  const lessons = await d
    .select({ id: schema.lessons.id, isRequired: schema.lessons.isRequired, isLiveSession: schema.lessons.isLiveSession })
    .from(schema.lessons)
    .where(and(eq(schema.lessons.courseId, enrolment.courseId), eq(schema.lessons.published, true)))
  const done = new Set(
    (await d.select({ lessonId: schema.lessonProgress.lessonId }).from(schema.lessonProgress).where(eq(schema.lessonProgress.enrolmentId, enrolment.id))).map(
      (r) => r.lessonId,
    ),
  )
  const required = lessons.filter((l) => l.isRequired)
  const requiredDone = required.filter((l) => done.has(l.id)).length

  // Attendance: each live-session lesson is credited by live attendance OR by completing its recorded lesson.
  const live = lessons.filter((l) => l.isLiveSession)
  const presentRows = await d
    .select({ lessonId: schema.liveSessions.lessonId })
    .from(schema.attendance)
    .innerJoin(schema.liveSessions, eq(schema.attendance.liveSessionId, schema.liveSessions.id))
    .where(and(eq(schema.attendance.enrolmentId, enrolment.id), eq(schema.attendance.status, 'present')))
  const present = new Set(presentRows.map((r) => r.lessonId))
  const attendedLive = live.filter((l) => present.has(l.id)).length
  const credited = live.filter((l) => present.has(l.id) || done.has(l.id)).length
  const attendancePercent = live.length ? Math.round((credited / live.length) * 100) : 100

  const assessments = await d
    .select()
    .from(schema.assessments)
    .where(and(eq(schema.assessments.courseId, enrolment.courseId), eq(schema.assessments.published, true)))
    .orderBy(asc(schema.assessments.sortOrder))
  const results = await d
    .select()
    .from(schema.assessmentResults)
    .where(eq(schema.assessmentResults.enrolmentId, enrolment.id))
    .orderBy(desc(schema.assessmentResults.createdAt))
  const assessmentRows = assessments.map((a) => {
    const mine = results.filter((r) => r.assessmentId === a.id)
    const score = mine.length ? (a.kind === 'quiz' ? Math.max(...mine.map((r) => r.scorePercent)) : mine[0].scorePercent) : null
    return { id: a.id, title: a.title, kind: a.kind, weight: a.weight, score, attempts: mine.length, maxAttempts: a.maxAttempts }
  })
  const totalWeight = assessmentRows.reduce((s, a) => s + a.weight, 0)
  const overallScore = totalWeight ? Math.round(assessmentRows.reduce((s, a) => s + a.weight * (a.score ?? 0), 0) / totalWeight) : 0

  const assignments = await d.select().from(schema.assignments).where(eq(schema.assignments.courseId, enrolment.courseId)).orderBy(asc(schema.assignments.sortOrder))
  const subs = assignments.length
    ? await d
        .select()
        .from(schema.assignmentSubmissions)
        .where(and(eq(schema.assignmentSubmissions.enrolmentId, enrolment.id), inArray(schema.assignmentSubmissions.assignmentId, assignments.map((a) => a.id))))
    : []
  const assignmentRows = assignments.map((a) => {
    const s = subs.find((x) => x.assignmentId === a.id)
    return { id: a.id, title: a.title, kind: a.kind, isRequired: a.isRequired, status: s?.status ?? 'not_submitted', score: s?.score ?? null, feedback: s?.feedback ?? null }
  })
  const finalProject = assignmentRows.find((a) => a.kind === 'final_project') ?? null
  const finalProjectSubmitted = !finalProject || finalProject.status === 'submitted' || finalProject.status === 'approved'

  const [completion] = await d.select().from(schema.courseCompletions).where(eq(schema.courseCompletions.enrolmentId, enrolment.id))

  const checks = {
    lessons: required.length === 0 || requiredDone === required.length,
    attendance: attendancePercent >= course.attendanceRequirementPercent,
    score: overallScore >= course.passMarkPercent,
    finalProject: finalProjectSubmitted,
    verified: !!completion,
  }
  const items = required.length + assignmentRows.filter((a) => a.isRequired).length + assessmentRows.length
  const itemsDone =
    requiredDone +
    assignmentRows.filter((a) => a.isRequired && (a.status === 'submitted' || a.status === 'approved')).length +
    assessmentRows.filter((a) => a.score != null).length
  return {
    courseId: course.id,
    lessonsTotal: required.length,
    lessonsDone: requiredDone,
    completedLessonIds: [...done],
    liveTotal: live.length,
    attendedLive,
    attendancePercent,
    attendanceRequired: course.attendanceRequirementPercent,
    overallScore,
    passMark: course.passMarkPercent,
    assessments: assessmentRows,
    assignments: assignmentRows,
    finalProjectStatus: finalProject?.status ?? null,
    checks,
    readyForVerification: checks.lessons && checks.attendance && checks.score && checks.finalProject,
    percent: items ? Math.round((itemsDone / items) * 100) : 0,
    completedAt: completion?.verifiedAt ?? null,
  }
}
