// Nexora staff administration. Each handler checks roles on the server.
import { createServerFn } from '@tanstack/react-start'
import { and, asc, count, desc, eq, ilike, inArray, or, sql, sum } from 'drizzle-orm'
import { z } from 'zod'
import { AppError, audit, db, randomCode, requireRole, schema } from '../core'
import { computeProgress } from '../learning'
import { allocateForPayment, voidAllocationsForUserSchool } from '../finance'
import { ACADEMIC, FINANCE, ROLES, STAFF, hasRole } from '../../lib/roles'

const id = z.number().int().positive()

export const adminOverview = createServerFn({ method: 'GET' }).handler(async () => {
  const me = await requireRole(STAFF)
  const d = db()
  const [students] = await d.select({ n: count() }).from(schema.users).where(eq(schema.users.role, 'student'))
  const [schools] = await d.select({ n: count() }).from(schema.schools).where(eq(schema.schools.status, 'active'))
  const [enrols] = await d.select({ n: count() }).from(schema.enrolments).where(inArray(schema.enrolments.status, ['active', 'completed']))
  const [completed] = await d.select({ n: count() }).from(schema.courseCompletions)
  const [activeCourses] = await d.select({ n: count() }).from(schema.courses).where(eq(schema.courses.status, 'available'))
  const [awaiting] = await d.select({ n: count() }).from(schema.payments).where(eq(schema.payments.status, 'awaiting_verification'))
  const [ungraded] = await d.select({ n: count() }).from(schema.assignmentSubmissions).where(eq(schema.assignmentSubmissions.status, 'submitted'))
  const [newEnquiries] = await d.select({ n: count() }).from(schema.schoolEnquiries).where(eq(schema.schoolEnquiries.status, 'new'))
  const [pendingConsent] = await d.select({ n: count() }).from(schema.guardianConsents).where(eq(schema.guardianConsents.status, 'declared'))
  let revenue: { collectedKobo: number; refundedKobo: number } | null = null
  if (hasRole(me.role, FINANCE)) {
    const [r] = await d.select({ s: sum(schema.payments.amountKobo) }).from(schema.payments).where(eq(schema.payments.status, 'success'))
    const [f] = await d.select({ s: sum(schema.payments.amountKobo) }).from(schema.payments).where(eq(schema.payments.status, 'refunded'))
    revenue = { collectedKobo: Number(r?.s ?? 0), refundedKobo: Number(f?.s ?? 0) }
  }
  const perCourse = await d
    .select({ id: schema.courses.id, title: schema.courses.title, level: schema.courses.level, enrolments: count(schema.enrolments.id) })
    .from(schema.courses)
    .leftJoin(schema.enrolments, and(eq(schema.enrolments.courseId, schema.courses.id), inArray(schema.enrolments.status, ['active', 'completed'])))
    .groupBy(schema.courses.id)
    .orderBy(asc(schema.courses.level))
  const completionsPerCourse = await d.select({ courseId: schema.courseCompletions.courseId, n: count() }).from(schema.courseCompletions).groupBy(schema.courseCompletions.courseId)
  return {
    role: me.role,
    totals: { students: students.n, schools: schools.n, enrolments: enrols.n, completions: completed.n, activeCourses: activeCourses.n },
    queues: { awaitingPayments: hasRole(me.role, FINANCE) ? awaiting.n : null, ungraded: ungraded.n, newEnquiries: newEnquiries.n, pendingConsent: pendingConsent.n },
    revenue,
    perCourse,
    completionsPerCourse,
  }
})

// ---------- Students ----------

export const listStudents = createServerFn({ method: 'GET' })
  .validator(z.object({ q: z.string().max(100).optional() }))
  .handler(async ({ data }) => {
    await requireRole(ACADEMIC)
    const q = data.q?.trim()
    return db()
      .select({
        id: schema.users.id,
        fullName: schema.users.fullName,
        email: schema.users.email,
        role: schema.users.role,
        country: schema.users.country,
        ageGroup: schema.users.ageGroup,
        schoolName: schema.schools.name,
        schoolLinkStatus: schema.users.schoolLinkStatus,
        consent: schema.guardianConsents.status,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .leftJoin(schema.schools, eq(schema.schools.id, schema.users.schoolId))
      .leftJoin(schema.guardianConsents, eq(schema.guardianConsents.userId, schema.users.id))
      .where(q ? or(ilike(schema.users.fullName, `%${q}%`), ilike(schema.users.email, `%${q}%`)) : undefined)
      .orderBy(desc(schema.users.createdAt))
      .limit(200)
  })

export const getStudent = createServerFn({ method: 'GET' })
  .validator(z.object({ userId: id }))
  .handler(async ({ data }) => {
    await requireRole(ACADEMIC)
    const d = db()
    const [u] = await d.select().from(schema.users).where(eq(schema.users.id, data.userId))
    if (!u) throw new AppError('User not found.', 'NOT_FOUND')
    const [guardian] = await d.select().from(schema.guardianConsents).where(eq(schema.guardianConsents.userId, u.id))
    const [school] = u.schoolId ? await d.select({ id: schema.schools.id, name: schema.schools.name, code: schema.schools.code }).from(schema.schools).where(eq(schema.schools.id, u.schoolId)) : []
    const enrolments = await d
      .select({ e: schema.enrolments, title: schema.courses.title })
      .from(schema.enrolments)
      .innerJoin(schema.courses, eq(schema.courses.id, schema.enrolments.courseId))
      .where(eq(schema.enrolments.userId, u.id))
    const withProgress = await Promise.all(enrolments.map(async ({ e, title }) => ({ id: e.id, courseTitle: title, status: e.status, cohortId: e.cohortId, progress: await computeProgress(e) })))
    const { identityId: _i, ...profile } = u
    return { profile, guardian: guardian ?? null, school: school ?? null, enrolments: withProgress }
  })

export const setGuardianConsent = createServerFn({ method: 'POST' })
  .validator(z.object({ userId: id, status: z.enum(['verified', 'rejected']), notes: z.string().max(500).optional() }))
  .handler(async ({ data }) => {
    const me = await requireRole(ACADEMIC)
    const [g] = await db()
      .update(schema.guardianConsents)
      .set({ status: data.status, verifiedById: me.id, verifiedAt: new Date().toISOString(), notes: data.notes || null })
      .where(eq(schema.guardianConsents.userId, data.userId))
      .returning()
    if (!g) throw new AppError('No guardian record for this learner.', 'NOT_FOUND')
    await audit(me.id, `guardian.${data.status}`, 'user', data.userId)
    return { ok: true }
  })

export const setUserRole = createServerFn({ method: 'POST' })
  .validator(z.object({ userId: id, role: z.enum(ROLES), status: z.enum(['active', 'suspended']).optional() }))
  .handler(async ({ data }) => {
    const me = await requireRole(['super_admin'])
    if (data.userId === me.id && data.role !== 'super_admin') throw new AppError('You cannot remove your own super administrator role.')
    await db().update(schema.users).set({ role: data.role, ...(data.status ? { status: data.status } : {}), updatedAt: new Date().toISOString() }).where(eq(schema.users.id, data.userId))
    await audit(me.id, 'user.role_changed', 'user', data.userId, { role: data.role, status: data.status })
    return { ok: true }
  })

/** Nexora-side approval of a learner's school attribution (schools can also approve their own learners). */
export const setSchoolLink = createServerFn({ method: 'POST' })
  .validator(z.object({ userId: id, status: z.enum(['approved', 'rejected']) }))
  .handler(async ({ data }) => {
    const me = await requireRole(ACADEMIC)
    return applySchoolLink(data.userId, data.status, me.id, null)
  })

export async function applySchoolLink(userId: number, status: 'approved' | 'rejected', actorId: number, mustBeSchoolId: number | null) {
  const d = db()
  const [u] = await d.select().from(schema.users).where(eq(schema.users.id, userId))
  if (!u?.schoolId) throw new AppError('This learner is not linked to a school.', 'NOT_FOUND')
  if (mustBeSchoolId !== null && u.schoolId !== mustBeSchoolId) throw new AppError('This learner does not belong to your school.', 'FORBIDDEN')
  await d.update(schema.users).set({ schoolLinkStatus: status }).where(eq(schema.users.id, userId))
  if (status === 'approved') {
    await d.update(schema.enrolments).set({ schoolId: u.schoolId }).where(and(eq(schema.enrolments.userId, userId), sql`${schema.enrolments.schoolId} is null`))
    const paid = await d.select({ paymentId: schema.enrolments.paymentId }).from(schema.enrolments).where(and(eq(schema.enrolments.userId, userId), eq(schema.enrolments.schoolId, u.schoolId)))
    for (const p of paid) if (p.paymentId) await allocateForPayment(p.paymentId, actorId)
  } else {
    await voidAllocationsForUserSchool(userId, u.schoolId, actorId)
    await d.update(schema.enrolments).set({ schoolId: null }).where(and(eq(schema.enrolments.userId, userId), eq(schema.enrolments.schoolId, u.schoolId)))
  }
  await audit(actorId, `school_link.${status}`, 'user', userId, { schoolId: u.schoolId })
  return { ok: true }
}

// ---------- Schools ----------

export const listSchools = createServerFn({ method: 'GET' }).handler(async () => {
  await requireRole(ACADEMIC)
  const d = db()
  const schools = await d.select().from(schema.schools).orderBy(asc(schema.schools.name))
  const students = await d.select({ schoolId: schema.users.schoolId, status: schema.users.schoolLinkStatus, n: count() }).from(schema.users).groupBy(schema.users.schoolId, schema.users.schoolLinkStatus)
  const enrols = await d.select({ schoolId: schema.enrolments.schoolId, n: count() }).from(schema.enrolments).where(inArray(schema.enrolments.status, ['active', 'completed'])).groupBy(schema.enrolments.schoolId)
  const members = await d
    .select({ id: schema.schoolMembers.id, schoolId: schema.schoolMembers.schoolId, userId: schema.users.id, name: schema.users.fullName, email: schema.users.email, position: schema.schoolMembers.position, canViewReconciliation: schema.schoolMembers.canViewReconciliation })
    .from(schema.schoolMembers)
    .innerJoin(schema.users, eq(schema.users.id, schema.schoolMembers.userId))
  return schools.map((s) => ({
    ...s,
    approvedStudents: students.filter((x) => x.schoolId === s.id && x.status === 'approved').reduce((a, b) => a + b.n, 0),
    pendingStudents: students.filter((x) => x.schoolId === s.id && x.status === 'pending').reduce((a, b) => a + b.n, 0),
    enrolments: enrols.find((x) => x.schoolId === s.id)?.n ?? 0,
    members: members.filter((m) => m.schoolId === s.id),
  }))
})

const schoolInput = z.object({
  name: z.string().trim().min(2).max(160),
  location: z.string().trim().max(160),
  country: z.string().trim().max(60),
  schoolType: z.string().trim().max(80),
  contactName: z.string().trim().max(120).optional(),
  contactPosition: z.string().trim().max(120).optional(),
  contactEmail: z.union([z.email(), z.literal('')]).optional(),
  contactPhone: z.string().trim().max(40).optional(),
  status: z.enum(['prospect', 'active', 'paused', 'ended']),
  notes: z.string().max(2000).optional(),
})

export const saveSchool = createServerFn({ method: 'POST' })
  .validator(schoolInput.extend({ id: id.optional() }))
  .handler(async ({ data }) => {
    const me = await requireRole(ACADEMIC)
    const { id: schoolId, ...v } = data
    const values = { ...v, contactEmail: v.contactEmail || null }
    if (schoolId) {
      await db().update(schema.schools).set(values).where(eq(schema.schools.id, schoolId))
      await audit(me.id, 'school.updated', 'school', schoolId)
      return { id: schoolId }
    }
    const [s] = await db().insert(schema.schools).values({ ...values, code: `NXS-${randomCode(6)}` }).returning()
    await audit(me.id, 'school.created', 'school', s.id)
    return { id: s.id }
  })

export const addSchoolMember = createServerFn({ method: 'POST' })
  .validator(z.object({ schoolId: id, email: z.email(), position: z.string().trim().max(120).optional(), canViewReconciliation: z.boolean() }))
  .handler(async ({ data }) => {
    const me = await requireRole(ACADEMIC)
    if (data.canViewReconciliation && !hasRole(me.role, ['super_admin'])) throw new AppError('Only a super administrator can authorise reconciliation access.', 'FORBIDDEN')
    const d = db()
    const [u] = await d.select().from(schema.users).where(eq(schema.users.email, data.email.toLowerCase()))
    if (!u) throw new AppError('No Academy account uses that email. Ask the representative to register first.', 'NOT_FOUND')
    if (hasRole(u.role, STAFF)) throw new AppError('Staff accounts cannot be school representatives.')
    const existing = await d.select().from(schema.schoolMembers).where(eq(schema.schoolMembers.userId, u.id))
    if (existing.some((m) => m.schoolId !== data.schoolId)) throw new AppError('This account already represents another school.', 'CONFLICT')
    await d
      .insert(schema.schoolMembers)
      .values({ schoolId: data.schoolId, userId: u.id, position: data.position || null, canViewReconciliation: data.canViewReconciliation })
      .onConflictDoUpdate({ target: [schema.schoolMembers.schoolId, schema.schoolMembers.userId], set: { position: data.position || null, canViewReconciliation: data.canViewReconciliation } })
    await d.update(schema.users).set({ role: 'school_partner' }).where(eq(schema.users.id, u.id))
    await audit(me.id, 'school.member_added', 'school', data.schoolId, { userId: u.id, canViewReconciliation: data.canViewReconciliation })
    return { ok: true }
  })

export const removeSchoolMember = createServerFn({ method: 'POST' })
  .validator(z.object({ memberId: id }))
  .handler(async ({ data }) => {
    const me = await requireRole(ACADEMIC)
    const [m] = await db().delete(schema.schoolMembers).where(eq(schema.schoolMembers.id, data.memberId)).returning()
    if (m) {
      await db().update(schema.users).set({ role: 'student' }).where(and(eq(schema.users.id, m.userId), eq(schema.users.role, 'school_partner')))
      await audit(me.id, 'school.member_removed', 'school', m.schoolId, { userId: m.userId })
    }
    return { ok: true }
  })

// ---------- Courses ----------

export const adminCourses = createServerFn({ method: 'GET' }).handler(async () => {
  await requireRole(ACADEMIC)
  const d = db()
  const courses = await d.select().from(schema.courses).orderBy(asc(schema.courses.level))
  const lessons = await d.select({ id: schema.lessons.id, courseId: schema.lessons.courseId, moduleId: schema.lessons.moduleId, sortOrder: schema.lessons.sortOrder, title: schema.lessons.title, kind: schema.lessons.kind, published: schema.lessons.published, isRequired: schema.lessons.isRequired, isLiveSession: schema.lessons.isLiveSession, isPreview: schema.lessons.isPreview, hasVideo: sql<boolean>`${schema.lessons.videoUrl} is not null` }).from(schema.lessons).orderBy(asc(schema.lessons.sortOrder))
  const modules = await d.select().from(schema.courseModules).orderBy(asc(schema.courseModules.week))
  const assessments = await d.select({ id: schema.assessments.id, courseId: schema.assessments.courseId, title: schema.assessments.title, kind: schema.assessments.kind, weight: schema.assessments.weight, published: schema.assessments.published, questionCount: sql<number>`jsonb_array_length(${schema.assessments.questions})` }).from(schema.assessments).orderBy(asc(schema.assessments.sortOrder))
  const assignments = await d.select().from(schema.assignments).orderBy(asc(schema.assignments.sortOrder))
  return courses.map((c) => ({
    ...c,
    modules: modules.filter((m) => m.courseId === c.id),
    lessons: lessons.filter((l) => l.courseId === c.id),
    assessments: assessments.filter((a) => a.courseId === c.id),
    assignments: assignments.filter((a) => a.courseId === c.id),
  }))
})

export const saveCourse = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      id: id.optional(),
      slug: z.string().trim().regex(/^[a-z0-9-]{3,80}$/),
      level: z.number().int().min(1).max(50),
      title: z.string().trim().min(3).max(160),
      levelLabel: z.enum(['Beginner', 'Intermediate', 'Advanced']),
      category: z.string().trim().max(80).nullable(),
      skills: z.array(z.string().trim().min(1).max(60)).max(20),
      instructorName: z.string().trim().max(120).nullable(),
      instructorBio: z.string().trim().max(1500).nullable(),
      faqs: z.array(z.object({ q: z.string().trim().min(3).max(300), a: z.string().trim().min(1).max(2000) })).max(30),
      summary: z.string().trim().min(10).max(400),
      description: z.string().trim().min(10).max(4000),
      outcomes: z.array(z.string().trim().min(2).max(300)).max(20),
      durationLabel: z.string().trim().max(60).nullable(),
      delivery: z.string().trim().max(200).nullable(),
      audience: z.string().trim().max(200).nullable(),
      prerequisitesText: z.string().trim().max(400).nullable(),
      prerequisiteCourseId: id.nullable(),
      priceKobo: z.number().int().min(0).max(1_000_000_000).nullable(),
      status: z.enum(['available', 'locked', 'draft', 'archived']),
      passMarkPercent: z.number().int().min(1).max(100),
      attendanceRequirementPercent: z.number().int().min(0).max(100),
    }),
  )
  .handler(async ({ data }) => {
    const me = await requireRole(ACADEMIC)
    const { id: courseId, ...v } = data
    if (v.status === 'available' && (v.priceKobo == null || v.priceKobo <= 0)) throw new AppError('Set a price before making a course available for enrolment.')
    if (courseId && v.prerequisiteCourseId === courseId) throw new AppError('A course cannot be its own prerequisite.')
    const values = { ...v, updatedAt: new Date().toISOString() }
    try {
      if (courseId) {
        const [before] = await db().select({ priceKobo: schema.courses.priceKobo, status: schema.courses.status }).from(schema.courses).where(eq(schema.courses.id, courseId))
        await db().update(schema.courses).set(values).where(eq(schema.courses.id, courseId))
        await audit(me.id, 'course.updated', 'course', courseId, { before, after: { priceKobo: v.priceKobo, status: v.status } })
        return { id: courseId }
      }
      const [c] = await db().insert(schema.courses).values(values).returning()
      await audit(me.id, 'course.created', 'course', c.id)
      return { id: c.id }
    } catch (e) {
      if (String(e).includes('unique')) throw new AppError('Another course already uses that slug.', 'CONFLICT')
      throw e
    }
  })

export const saveModule = createServerFn({ method: 'POST' })
  .validator(z.object({ id: id.optional(), courseId: id, week: z.number().int().min(1).max(52), title: z.string().trim().min(2).max(160), summary: z.string().trim().max(1000) }))
  .handler(async ({ data }) => {
    const me = await requireRole(ACADEMIC)
    const { id: moduleId, ...v } = data
    if (moduleId) await db().update(schema.courseModules).set(v).where(eq(schema.courseModules.id, moduleId))
    else await db().insert(schema.courseModules).values(v).onConflictDoNothing()
    await audit(me.id, moduleId ? 'module.updated' : 'module.created', 'course', data.courseId)
    return { ok: true }
  })

export const getLessonForEdit = createServerFn({ method: 'GET' })
  .validator(z.object({ lessonId: id }))
  .handler(async ({ data }) => {
    await requireRole(ACADEMIC)
    const [l] = await db().select().from(schema.lessons).where(eq(schema.lessons.id, data.lessonId))
    if (!l) throw new AppError('Lesson not found.', 'NOT_FOUND')
    return l
  })

export const saveLesson = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      id: id.optional(),
      courseId: id,
      moduleId: id.nullable(),
      sortOrder: z.number().int().min(0).max(10000),
      title: z.string().trim().min(2).max(200),
      kind: z.enum(['live', 'recorded', 'reading']),
      summary: z.string().trim().max(1000),
      content: z.string().max(50000),
      secondaryNote: z.string().max(2000).nullable(),
      videoUrl: z.string().trim().max(500).refine((v) => v === '' || /^https:\/\//.test(v), 'Recording links must use https://').nullable(),
      durationMinutes: z.number().int().min(0).max(600).nullable(),
      isRequired: z.boolean(),
      isLiveSession: z.boolean(),
      published: z.boolean(),
      isPreview: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    const me = await requireRole(ACADEMIC)
    const { id: lessonId, ...v } = data
    const values = { ...v, videoUrl: v.videoUrl || null, secondaryNote: v.secondaryNote || null }
    try {
      if (lessonId) await db().update(schema.lessons).set(values).where(eq(schema.lessons.id, lessonId))
      else await db().insert(schema.lessons).values(values)
    } catch (e) {
      if (String(e).includes('unique')) throw new AppError('Another lesson in this course already uses that order number.', 'CONFLICT')
      throw e
    }
    await audit(me.id, lessonId ? 'lesson.updated' : 'lesson.created', 'course', data.courseId, { lessonId })
    return { ok: true }
  })

const questionInput = z.object({ q: z.string().trim().min(3).max(500), options: z.array(z.string().trim().min(1).max(300)).min(2).max(6), answer: z.number().int().min(0).max(5) })

export const getAssessmentForEdit = createServerFn({ method: 'GET' })
  .validator(z.object({ assessmentId: id }))
  .handler(async ({ data }) => {
    await requireRole(ACADEMIC)
    const [a] = await db().select().from(schema.assessments).where(eq(schema.assessments.id, data.assessmentId))
    if (!a) throw new AppError('Assessment not found.', 'NOT_FOUND')
    return a
  })

export const saveAssessment = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      id: id.optional(),
      courseId: id,
      title: z.string().trim().min(2).max(200),
      description: z.string().trim().max(1000),
      kind: z.enum(['quiz', 'instructor']),
      weight: z.number().int().min(0).max(100),
      maxAttempts: z.number().int().min(1).max(10),
      sortOrder: z.number().int().min(0).max(1000),
      published: z.boolean(),
      questions: z.array(questionInput).max(100),
    }),
  )
  .handler(async ({ data }) => {
    const me = await requireRole(ACADEMIC)
    const { id: assessmentId, ...v } = data
    if (v.kind === 'quiz' && v.published && v.questions.length === 0) throw new AppError('A published quiz needs at least one question.')
    if (v.questions.some((q) => q.answer >= q.options.length)) throw new AppError('Each question’s correct answer must be one of its options.')
    try {
      if (assessmentId) await db().update(schema.assessments).set(v).where(eq(schema.assessments.id, assessmentId))
      else await db().insert(schema.assessments).values(v)
    } catch (e) {
      if (String(e).includes('unique')) throw new AppError('Another assessment in this course already uses that order number.', 'CONFLICT')
      throw e
    }
    await audit(me.id, assessmentId ? 'assessment.updated' : 'assessment.created', 'course', data.courseId)
    return { ok: true }
  })

export const saveAssignment = createServerFn({ method: 'POST' })
  .validator(z.object({ id: id.optional(), courseId: id, title: z.string().trim().min(2).max(200), instructions: z.string().trim().min(10).max(5000), kind: z.enum(['assignment', 'final_project']), isRequired: z.boolean(), sortOrder: z.number().int().min(0).max(1000) }))
  .handler(async ({ data }) => {
    const me = await requireRole(ACADEMIC)
    const { id: assignmentId, ...v } = data
    try {
      if (assignmentId) await db().update(schema.assignments).set(v).where(eq(schema.assignments.id, assignmentId))
      else await db().insert(schema.assignments).values(v)
    } catch (e) {
      if (String(e).includes('unique')) throw new AppError('Another assignment in this course already uses that order number.', 'CONFLICT')
      throw e
    }
    await audit(me.id, assignmentId ? 'assignment.updated' : 'assignment.created', 'course', data.courseId)
    return { ok: true }
  })

// ---------- Enquiries, testimonials, settings ----------

export const listEnquiries = createServerFn({ method: 'GET' }).handler(async () => {
  await requireRole(ACADEMIC)
  return db().select().from(schema.schoolEnquiries).orderBy(desc(schema.schoolEnquiries.createdAt)).limit(200)
})

export const setEnquiryStatus = createServerFn({ method: 'POST' })
  .validator(z.object({ id, status: z.enum(['new', 'contacted', 'converted', 'closed']) }))
  .handler(async ({ data }) => {
    const me = await requireRole(ACADEMIC)
    await db().update(schema.schoolEnquiries).set({ status: data.status }).where(eq(schema.schoolEnquiries.id, data.id))
    await audit(me.id, 'enquiry.status', 'school_enquiry', data.id, { status: data.status })
    return { ok: true }
  })

export const listTestimonials = createServerFn({ method: 'GET' }).handler(async () => {
  await requireRole(ACADEMIC)
  return db().select().from(schema.testimonials).orderBy(desc(schema.testimonials.createdAt))
})

export const saveTestimonial = createServerFn({ method: 'POST' })
  .validator(z.object({ id: id.optional(), name: z.string().trim().min(2).max(120), context: z.string().trim().max(160), quote: z.string().trim().min(10).max(1000), consentConfirmed: z.boolean(), published: z.boolean() }))
  .handler(async ({ data }) => {
    const me = await requireRole(ACADEMIC)
    if (data.published && !data.consentConfirmed) throw new AppError('Confirm written consent (and guardian consent for minors) before publishing a testimonial.')
    const { id: tid, ...v } = data
    if (tid) await db().update(schema.testimonials).set(v).where(eq(schema.testimonials.id, tid))
    else await db().insert(schema.testimonials).values(v)
    await audit(me.id, 'testimonial.saved', 'testimonial', tid ?? null, { published: v.published })
    return { ok: true }
  })

export const listAudit = createServerFn({ method: 'GET' }).handler(async () => {
  await requireRole(['super_admin'])
  return db()
    .select({ id: schema.auditLogs.id, action: schema.auditLogs.action, entityType: schema.auditLogs.entityType, entityId: schema.auditLogs.entityId, createdAt: schema.auditLogs.createdAt, actor: schema.users.email })
    .from(schema.auditLogs)
    .leftJoin(schema.users, eq(schema.users.id, schema.auditLogs.actorUserId))
    .orderBy(desc(schema.auditLogs.createdAt))
    .limit(150)
})

export const listStaff = createServerFn({ method: 'GET' }).handler(async () => {
  await requireRole(STAFF)
  return db().select({ id: schema.users.id, fullName: schema.users.fullName, email: schema.users.email, role: schema.users.role }).from(schema.users).where(inArray(schema.users.role, ['super_admin', 'academic_admin', 'instructor']))
})
