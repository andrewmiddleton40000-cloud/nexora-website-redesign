// Learner-facing server functions. Every handler resolves the user server-side and checks access itself.
// Nothing here may read school_agreements, school_allocations or reconciliation_statements.
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { and, asc, desc, eq, gte, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { AppError, audit, db, getSetting, requireUser, schema } from '../core'
import { computeProgress, courseAvailability, getCourseBySlug, getEnrolment, hasAccess, requireCourseAccess } from '../learning'
import { confirmGatewayPayment, flutterwaveInitialize, gatewayStatus, newReference, paystackInitialize } from '../payments'

export type BankDetails = { bankName?: string; accountName?: string; accountNumber?: string; instructions?: string }

async function bankDetails() {
  const b = await getSetting<BankDetails>('bank_transfer')
  return b?.accountNumber ? b : null
}

export const getDashboard = createServerFn({ method: 'GET' }).handler(async () => {
  const u = await requireUser()
  const d = db()
  const [school] = u.schoolId ? await d.select({ name: schema.schools.name, code: schema.schools.code }).from(schema.schools).where(eq(schema.schools.id, u.schoolId)) : []
  const [guardian] = await d
    .select({ guardianName: schema.guardianConsents.guardianName, status: schema.guardianConsents.status })
    .from(schema.guardianConsents)
    .where(eq(schema.guardianConsents.userId, u.id))
  const courses = await d.select().from(schema.courses).orderBy(asc(schema.courses.level))
  const enrolments = await d.select().from(schema.enrolments).where(eq(schema.enrolments.userId, u.id))
  const active = enrolments.filter((e) => hasAccess(e))
  const progress = await Promise.all(
    active.map(async (e) => {
      const c = courses.find((x) => x.id === e.courseId)!
      const p = await computeProgress(e)
      const nextLesson = await d
        .select({ id: schema.lessons.id, title: schema.lessons.title })
        .from(schema.lessons)
        .where(and(eq(schema.lessons.courseId, c.id), eq(schema.lessons.published, true)))
        .orderBy(asc(schema.lessons.sortOrder))
      const next = nextLesson.find((l) => !p.completedLessonIds.includes(l.id)) ?? null
      return { enrolmentId: e.id, status: e.status, course: { id: c.id, slug: c.slug, title: c.title, level: c.level }, progress: p, nextLesson: next }
    }),
  )
  const cohortIds = active.map((e) => e.cohortId).filter((x): x is number => !!x)
  const sessions = cohortIds.length
    ? await d
        .select({ id: schema.liveSessions.id, title: schema.liveSessions.title, startsAt: schema.liveSessions.startsAt, durationMinutes: schema.liveSessions.durationMinutes, meetingUrl: schema.liveSessions.meetingUrl, cohortId: schema.liveSessions.cohortId })
        .from(schema.liveSessions)
        .where(and(inArray(schema.liveSessions.cohortId, cohortIds), gte(schema.liveSessions.startsAt, new Date(Date.now() - 2 * 3600_000).toISOString())))
        .orderBy(asc(schema.liveSessions.startsAt))
        .limit(10)
    : []
  const recorded = active.length
    ? await d
        .select({ id: schema.lessons.id, title: schema.lessons.title, courseId: schema.lessons.courseId, videoUrl: schema.lessons.videoUrl })
        .from(schema.lessons)
        .where(and(inArray(schema.lessons.courseId, active.map((e) => e.courseId)), eq(schema.lessons.published, true)))
        .orderBy(asc(schema.lessons.sortOrder))
    : []
  const certificates = await d
    .select({ number: schema.certificates.number, courseTitle: schema.certificates.courseTitle, completedOn: schema.certificates.completedOn, verificationCode: schema.certificates.verificationCode })
    .from(schema.certificates)
    .where(eq(schema.certificates.userId, u.id))
  const payments = await d
    .select({ reference: schema.payments.reference, courseId: schema.payments.courseId, amountKobo: schema.payments.amountKobo, provider: schema.payments.provider, status: schema.payments.status, createdAt: schema.payments.createdAt, verifiedAt: schema.payments.verifiedAt })
    .from(schema.payments)
    .where(eq(schema.payments.userId, u.id))
    .orderBy(desc(schema.payments.createdAt))
  const catalogue = await Promise.all(
    courses
      .filter((c) => c.status !== 'draft' && c.status !== 'archived')
      .map(async (c) => ({ id: c.id, slug: c.slug, title: c.title, level: c.level, levelLabel: c.levelLabel, priceKobo: c.priceKobo, availability: await courseAvailability(u, c) })),
  )
  return {
    profile: {
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      country: u.country,
      ageGroup: u.ageGroup,
      role: u.role,
      school: school ? { name: school.name, code: school.code, linkStatus: u.schoolLinkStatus } : u.schoolNameOther ? { name: u.schoolNameOther, code: null, linkStatus: 'none' } : null,
      guardian: guardian ?? null,
      intendedCourse: u.intendedCourse,
    },
    enrolments: progress,
    sessions,
    recordedLessons: recorded.filter((l) => !!l.videoUrl).map(({ videoUrl: _v, ...l }) => ({ ...l, courseSlug: courses.find((c) => c.id === l.courseId)?.slug ?? '' })),
    certificates,
    payments: payments.map((p) => ({ ...p, courseTitle: courses.find((c) => c.id === p.courseId)?.title ?? '' })),
    catalogue,
    gateways: gatewayStatus(),
    bankTransferAvailable: !!(await bankDetails()),
  }
})

export const updateProfile = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      fullName: z.string().trim().min(2).max(120),
      phone: z.string().trim().regex(/^[0-9+()\-\s]{7,40}$/),
      country: z.string().trim().min(2).max(60),
      ageGroup: z.enum(['under_18', 'adult']),
      schoolCode: z.string().trim().max(20).optional(),
      schoolName: z.string().trim().max(160).optional(),
      guardian: z
        .object({
          name: z.string().trim().min(2).max(120),
          phone: z.string().trim().regex(/^[0-9+()\-\s]{7,40}$/),
          email: z.union([z.email().max(254), z.literal('')]).optional(),
          relationship: z.string().trim().min(2).max(60),
          consent: z.literal(true),
        })
        .optional(),
    }),
  )
  .handler(async ({ data }) => {
    const u = await requireUser()
    const d = db()
    if (data.ageGroup === 'under_18') {
      const [g] = await d.select().from(schema.guardianConsents).where(eq(schema.guardianConsents.userId, u.id))
      if (!g && !data.guardian) throw new AppError('Learners under 18 must add a parent or guardian and confirm their consent.')
      if (data.guardian && (!g || g.status !== 'verified')) {
        const values = { guardianName: data.guardian.name, guardianPhone: data.guardian.phone, guardianEmail: data.guardian.email || null, relationship: data.guardian.relationship, status: 'declared', declaredAt: new Date().toISOString() }
        if (g) await d.update(schema.guardianConsents).set(values).where(eq(schema.guardianConsents.id, g.id))
        else await d.insert(schema.guardianConsents).values({ userId: u.id, ...values })
      }
    }
    const patch: Partial<typeof schema.users.$inferInsert> = { fullName: data.fullName, phone: data.phone, country: data.country, ageGroup: data.ageGroup, updatedAt: new Date().toISOString() }
    const code = data.schoolCode?.toUpperCase()
    if (code) {
      const [s] = await d.select({ id: schema.schools.id }).from(schema.schools).where(eq(schema.schools.code, code))
      if (!s) throw new AppError('That school code was not recognised. Check it with your school, or leave it blank.')
      if (s.id !== u.schoolId) Object.assign(patch, { schoolId: s.id, schoolLinkStatus: 'pending', schoolNameOther: null })
    } else if (data.schoolName && !u.schoolId) patch.schoolNameOther = data.schoolName
    await d.update(schema.users).set(patch).where(eq(schema.users.id, u.id))
    await audit(u.id, 'user.profile_updated', 'user', u.id)
    return { ok: true }
  })

/** Module-by-module outline with completion ticks, used by the learning sidebar. */
async function courseOutline(courseId: number, enrolmentId: number | null) {
  const d = db()
  const modules = await d.select({ id: schema.courseModules.id, week: schema.courseModules.week, title: schema.courseModules.title }).from(schema.courseModules).where(eq(schema.courseModules.courseId, courseId)).orderBy(asc(schema.courseModules.week))
  const lessons = await d
    .select({ id: schema.lessons.id, moduleId: schema.lessons.moduleId, title: schema.lessons.title, kind: schema.lessons.kind, durationMinutes: schema.lessons.durationMinutes, isRequired: schema.lessons.isRequired })
    .from(schema.lessons)
    .where(and(eq(schema.lessons.courseId, courseId), eq(schema.lessons.published, true)))
    .orderBy(asc(schema.lessons.sortOrder))
  const done = enrolmentId ? await d.select({ lessonId: schema.lessonProgress.lessonId }).from(schema.lessonProgress).where(eq(schema.lessonProgress.enrolmentId, enrolmentId)) : []
  const doneIds = new Set(done.map((x) => x.lessonId))
  const withDone = lessons.map((l) => ({ ...l, done: doneIds.has(l.id) }))
  const groups = modules.map((m) => ({ ...m, lessons: withDone.filter((l) => l.moduleId === m.id) }))
  const loose = withDone.filter((l) => !l.moduleId || !modules.some((m) => m.id === l.moduleId))
  if (loose.length) groups.push({ id: 0, week: 0, title: 'More lessons', lessons: loose })
  // "Resume": the first unfinished lesson in course order, preferring required ones.
  const ordered = groups.flatMap((g) => g.lessons)
  const resume = ordered.find((l) => !l.done && l.isRequired) ?? ordered.find((l) => !l.done) ?? null
  return { modules: groups, resumeLessonId: resume?.id ?? null, completedCount: ordered.filter((l) => l.done).length, totalCount: ordered.length }
}

export const getCourseWorkspace = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: z.string().min(1).max(80) }))
  .handler(async ({ data }) => {
    const u = await requireUser()
    const c = await getCourseBySlug(data.slug)
    if (!c) throw new AppError('Course not found.', 'NOT_FOUND')
    const { enrolment, staff } = await requireCourseAccess(u, c.id)
    const d = db()
    const modules = await d.select().from(schema.courseModules).where(eq(schema.courseModules.courseId, c.id)).orderBy(asc(schema.courseModules.week))
    const lessons = await d
      .select({ id: schema.lessons.id, moduleId: schema.lessons.moduleId, title: schema.lessons.title, kind: schema.lessons.kind, durationMinutes: schema.lessons.durationMinutes, hasVideo: schema.lessons.videoUrl, isLiveSession: schema.lessons.isLiveSession })
      .from(schema.lessons)
      .where(and(eq(schema.lessons.courseId, c.id), eq(schema.lessons.published, true)))
      .orderBy(asc(schema.lessons.sortOrder))
    const assignments = await d.select().from(schema.assignments).where(eq(schema.assignments.courseId, c.id)).orderBy(asc(schema.assignments.sortOrder))
    const assessments = await d
      .select({ id: schema.assessments.id, title: schema.assessments.title, description: schema.assessments.description, kind: schema.assessments.kind, maxAttempts: schema.assessments.maxAttempts, weight: schema.assessments.weight })
      .from(schema.assessments)
      .where(and(eq(schema.assessments.courseId, c.id), eq(schema.assessments.published, true)))
      .orderBy(asc(schema.assessments.sortOrder))
    const progress = enrolment ? await computeProgress(enrolment) : null
    const subs = enrolment ? await d.select().from(schema.assignmentSubmissions).where(eq(schema.assignmentSubmissions.enrolmentId, enrolment.id)) : []
    const [cert] = enrolment ? await d.select({ number: schema.certificates.number }).from(schema.certificates).where(and(eq(schema.certificates.userId, u.id), eq(schema.certificates.courseId, c.id))) : []
    const [cohort] = enrolment?.cohortId
      ? await d.select({ name: schema.cohorts.name, startsOn: schema.cohorts.startsOn, endsOn: schema.cohorts.endsOn }).from(schema.cohorts).where(eq(schema.cohorts.id, enrolment.cohortId))
      : []
    const outline = await courseOutline(c.id, enrolment?.id ?? null)
    return {
      staffPreview: staff && !enrolment,
      cohort: cohort ?? null,
      resumeLessonId: outline.resumeLessonId,
      course: { id: c.id, slug: c.slug, title: c.title, level: c.level, passMarkPercent: c.passMarkPercent, attendanceRequirementPercent: c.attendanceRequirementPercent },
      modules: modules.map((m) => ({ ...m, lessons: lessons.filter((l) => l.moduleId === m.id).map((l) => ({ ...l, hasVideo: !!l.hasVideo, durationMinutes: l.durationMinutes ?? null })) })),
      assignments: assignments.map((a) => {
        const s = subs.find((x) => x.assignmentId === a.id)
        return { ...a, submission: s ? { content: s.content, linkUrl: s.linkUrl, status: s.status, score: s.score, feedback: s.feedback, submittedAt: s.submittedAt } : null }
      }),
      assessments,
      progress,
      certificateNumber: cert?.number ?? null,
    }
  })

export const getLesson = createServerFn({ method: 'GET' })
  .validator(z.object({ lessonId: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const u = await requireUser()
    const d = db()
    const [l] = await d.select().from(schema.lessons).where(eq(schema.lessons.id, data.lessonId))
    if (!l || !l.published) throw new AppError('Lesson not found.', 'NOT_FOUND')
    const { enrolment } = await requireCourseAccess(u, l.courseId)
    const [c] = await d.select({ slug: schema.courses.slug, title: schema.courses.title }).from(schema.courses).where(eq(schema.courses.id, l.courseId))
    const siblings = await d
      .select({ id: schema.lessons.id, title: schema.lessons.title })
      .from(schema.lessons)
      .where(and(eq(schema.lessons.courseId, l.courseId), eq(schema.lessons.published, true)))
      .orderBy(asc(schema.lessons.sortOrder))
    const i = siblings.findIndex((s) => s.id === l.id)
    const [mod] = l.moduleId ? await d.select({ week: schema.courseModules.week, title: schema.courseModules.title }).from(schema.courseModules).where(eq(schema.courseModules.id, l.moduleId)) : []
    const [done] = enrolment
      ? await d.select().from(schema.lessonProgress).where(and(eq(schema.lessonProgress.enrolmentId, enrolment.id), eq(schema.lessonProgress.lessonId, l.id)))
      : []
    const outline = await courseOutline(l.courseId, enrolment?.id ?? null)
    return {
      outline,
      lesson: { id: l.id, title: l.title, kind: l.kind, summary: l.summary, content: l.content, secondaryNote: l.secondaryNote, videoUrl: l.videoUrl, durationMinutes: l.durationMinutes, isLiveSession: l.isLiveSession },
      module: mod ?? null,
      course: c,
      prev: siblings[i - 1] ?? null,
      next: siblings[i + 1] ?? null,
      completed: !!done,
      canTrack: !!enrolment && enrolment.status === 'active',
    }
  })

export const completeLesson = createServerFn({ method: 'POST' })
  .validator(z.object({ lessonId: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const u = await requireUser()
    const [l] = await db().select().from(schema.lessons).where(eq(schema.lessons.id, data.lessonId))
    if (!l) throw new AppError('Lesson not found.', 'NOT_FOUND')
    const e = await getEnrolment(u.id, l.courseId)
    if (!e || e.status !== 'active') throw new AppError('You need an active enrolment to track progress.', 'FORBIDDEN')
    await db().insert(schema.lessonProgress).values({ enrolmentId: e.id, lessonId: l.id }).onConflictDoNothing()
    return { ok: true }
  })

const safeLink = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === '' || /^https:\/\/[^\s]+$/i.test(v), 'Links must start with https://')

export const submitAssignment = createServerFn({ method: 'POST' })
  .validator(z.object({ assignmentId: z.number().int().positive(), content: z.string().trim().min(20).max(10000), linkUrl: safeLink.optional() }))
  .handler(async ({ data }) => {
    const u = await requireUser()
    const d = db()
    const [a] = await d.select().from(schema.assignments).where(eq(schema.assignments.id, data.assignmentId))
    if (!a) throw new AppError('Assignment not found.', 'NOT_FOUND')
    const e = await getEnrolment(u.id, a.courseId)
    if (!e || e.status !== 'active') throw new AppError('You need an active enrolment to submit work.', 'FORBIDDEN')
    const [existing] = await d.select().from(schema.assignmentSubmissions).where(and(eq(schema.assignmentSubmissions.assignmentId, a.id), eq(schema.assignmentSubmissions.enrolmentId, e.id)))
    if (existing?.status === 'approved') throw new AppError('This work has already been approved and cannot be changed.', 'CONFLICT')
    const values = { content: data.content, linkUrl: data.linkUrl || null, status: 'submitted', submittedAt: new Date().toISOString(), score: null, feedback: existing?.feedback ?? null }
    if (existing) await d.update(schema.assignmentSubmissions).set(values).where(eq(schema.assignmentSubmissions.id, existing.id))
    else await d.insert(schema.assignmentSubmissions).values({ ...values, assignmentId: a.id, enrolmentId: e.id, userId: u.id })
    await audit(u.id, 'assignment.submitted', 'assignment', a.id)
    return { ok: true }
  })

export const getQuiz = createServerFn({ method: 'GET' })
  .validator(z.object({ assessmentId: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const u = await requireUser()
    const d = db()
    const [a] = await d.select().from(schema.assessments).where(eq(schema.assessments.id, data.assessmentId))
    if (!a || !a.published || a.kind !== 'quiz') throw new AppError('Assessment not found.', 'NOT_FOUND')
    const { enrolment } = await requireCourseAccess(u, a.courseId)
    const results = enrolment
      ? await d.select({ scorePercent: schema.assessmentResults.scorePercent, attempt: schema.assessmentResults.attempt, createdAt: schema.assessmentResults.createdAt }).from(schema.assessmentResults).where(and(eq(schema.assessmentResults.assessmentId, a.id), eq(schema.assessmentResults.enrolmentId, enrolment.id)))
      : []
    const [c] = await d.select({ slug: schema.courses.slug, title: schema.courses.title, passMarkPercent: schema.courses.passMarkPercent }).from(schema.courses).where(eq(schema.courses.id, a.courseId))
    return {
      assessment: { id: a.id, title: a.title, description: a.description, maxAttempts: a.maxAttempts },
      // Answer keys are stripped — grading happens only on the server.
      questions: a.questions.map((q) => ({ q: q.q, options: q.options })),
      results,
      course: c,
      canAttempt: !!enrolment && enrolment.status === 'active' && results.length < a.maxAttempts,
    }
  })

export const submitQuiz = createServerFn({ method: 'POST' })
  .validator(z.object({ assessmentId: z.number().int().positive(), answers: z.array(z.number().int().min(-1).max(10)).max(100) }))
  .handler(async ({ data }) => {
    const u = await requireUser()
    const d = db()
    const [a] = await d.select().from(schema.assessments).where(eq(schema.assessments.id, data.assessmentId))
    if (!a || a.kind !== 'quiz') throw new AppError('Assessment not found.', 'NOT_FOUND')
    const e = await getEnrolment(u.id, a.courseId)
    if (!e || e.status !== 'active') throw new AppError('You need an active enrolment to take assessments.', 'FORBIDDEN')
    if (data.answers.length !== a.questions.length) throw new AppError('Please answer every question.')
    const prior = await d.select({ id: schema.assessmentResults.id }).from(schema.assessmentResults).where(and(eq(schema.assessmentResults.assessmentId, a.id), eq(schema.assessmentResults.enrolmentId, e.id)))
    if (prior.length >= a.maxAttempts) throw new AppError('You have used all attempts for this assessment.', 'CONFLICT')
    const correct = a.questions.filter((q, i) => q.answer === data.answers[i]).length
    const scorePercent = a.questions.length ? Math.round((correct / a.questions.length) * 100) : 0
    await d.insert(schema.assessmentResults).values({ assessmentId: a.id, enrolmentId: e.id, userId: u.id, scorePercent, attempt: prior.length + 1, answers: data.answers })
    return { scorePercent, correct, total: a.questions.length, attempt: prior.length + 1, attemptsLeft: a.maxAttempts - prior.length - 1 }
  })

// ---------- Payments (learner side) ----------

function origin() {
  try {
    return new URL(getRequest().url).origin
  } catch {
    return process.env.URL ?? ''
  }
}

export const getCheckout = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: z.string().min(1).max(80) }))
  .handler(async ({ data }) => {
    const u = await requireUser()
    const c = await getCourseBySlug(data.slug)
    if (!c) throw new AppError('Course not found.', 'NOT_FOUND')
    const availability = await courseAvailability(u, c)
    const bank = await bankDetails()
    const [open] = await db()
      .select({ reference: schema.payments.reference, provider: schema.payments.provider, status: schema.payments.status, amountKobo: schema.payments.amountKobo, transferNote: schema.payments.transferNote, payerName: schema.payments.payerName })
      .from(schema.payments)
      .where(and(eq(schema.payments.userId, u.id), eq(schema.payments.courseId, c.id), inArray(schema.payments.status, ['pending', 'awaiting_verification']), eq(schema.payments.provider, 'bank_transfer')))
      .orderBy(desc(schema.payments.createdAt))
      .limit(1)
    return {
      course: { slug: c.slug, title: c.title, level: c.level, priceKobo: c.priceKobo },
      availability,
      gateways: gatewayStatus(),
      bank,
      openBankPayment: open ?? null,
      email: u.email,
    }
  })

export const startPayment = createServerFn({ method: 'POST' })
  .validator(z.object({ slug: z.string().min(1).max(80), provider: z.enum(['paystack', 'flutterwave', 'bank_transfer']) }))
  .handler(async ({ data }) => {
    const u = await requireUser()
    const c = await getCourseBySlug(data.slug)
    if (!c) throw new AppError('Course not found.', 'NOT_FOUND')
    // Re-check eligibility on the server — the button state in the browser is never trusted.
    const a = await courseAvailability(u, c)
    if (a.state === 'payment_pending') throw new AppError('A bank transfer for this course is already awaiting verification.', 'CONFLICT')
    if (a.state !== 'eligible') throw new AppError('You are not currently eligible to enrol in this course.', 'FORBIDDEN')
    if (data.provider !== 'bank_transfer' && !gatewayStatus()[data.provider]) {
      throw new AppError('Online payments are not available. Please pay by bank transfer.', 'UNAVAILABLE')
    }
    const d = db()
    if (data.provider === 'bank_transfer') {
      if (!(await bankDetails())) throw new AppError('Bank transfer details have not been published yet.', 'UNAVAILABLE')
      const [open] = await d
        .select()
        .from(schema.payments)
        .where(and(eq(schema.payments.userId, u.id), eq(schema.payments.courseId, c.id), eq(schema.payments.provider, 'bank_transfer'), eq(schema.payments.status, 'pending')))
      if (open) return { kind: 'bank' as const, reference: open.reference }
    }
    const [p] = await d
      .insert(schema.payments)
      .values({ reference: newReference(), userId: u.id, courseId: c.id, amountKobo: a.priceKobo, currency: c.currency, provider: data.provider })
      .returning()
    await audit(u.id, 'payment.started', 'payment', p.id, { provider: p.provider, reference: p.reference })
    const callback = `${origin()}/academy/payment/callback?ref=${encodeURIComponent(p.reference)}`
    if (data.provider === 'paystack') return { kind: 'redirect' as const, url: await paystackInitialize(p, u.email, callback), reference: p.reference }
    if (data.provider === 'flutterwave') return { kind: 'redirect' as const, url: await flutterwaveInitialize(p, u.email, u.fullName, callback), reference: p.reference }
    return { kind: 'bank' as const, reference: p.reference }
  })

export const submitBankTransfer = createServerFn({ method: 'POST' })
  .validator(z.object({ reference: z.string().min(5).max(60), payerName: z.string().trim().min(2).max(120), transferDetails: z.string().trim().min(4).max(500) }))
  .handler(async ({ data }) => {
    const u = await requireUser()
    const d = db()
    const [p] = await d.select().from(schema.payments).where(and(eq(schema.payments.reference, data.reference), eq(schema.payments.userId, u.id)))
    if (!p || p.provider !== 'bank_transfer') throw new AppError('Payment not found.', 'NOT_FOUND')
    if (p.status !== 'pending' && p.status !== 'awaiting_verification') throw new AppError('This payment can no longer be updated.', 'CONFLICT')
    await d
      .update(schema.payments)
      .set({ status: 'awaiting_verification', payerName: data.payerName, transferNote: data.transferDetails, updatedAt: new Date().toISOString() })
      .where(eq(schema.payments.id, p.id))
    await audit(u.id, 'payment.transfer_reported', 'payment', p.id)
    return { ok: true }
  })

export const confirmMyPayment = createServerFn({ method: 'POST' })
  .validator(z.object({ reference: z.string().min(5).max(60) }))
  .handler(async ({ data }) => {
    const u = await requireUser()
    const [p] = await db().select().from(schema.payments).where(and(eq(schema.payments.reference, data.reference), eq(schema.payments.userId, u.id)))
    if (!p) throw new AppError('Payment not found.', 'NOT_FOUND')
    const r = await confirmGatewayPayment(p.reference, null)
    const [c] = await db().select({ slug: schema.courses.slug, title: schema.courses.title }).from(schema.courses).where(eq(schema.courses.id, p.courseId))
    return { status: r.status, reason: 'reason' in r ? (r.reason ?? null) : null, course: c, amountKobo: p.amountKobo, reference: p.reference, provider: p.provider }
  })
