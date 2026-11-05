import { createServerFn } from '@tanstack/react-start'
import { and, asc, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { courseAvailability, type Availability } from '../learning'
import { currentUser, db, ensureSeeded, schema } from '../core'

/** Public course fields only — never add anything financial beyond the student-facing price. */
function publicCourse(c: typeof schema.courses.$inferSelect) {
  return {
    id: c.id,
    slug: c.slug,
    level: c.level,
    title: c.title,
    levelLabel: c.levelLabel,
    category: c.category,
    skills: c.skills,
    summary: c.summary,
    description: c.description,
    outcomes: c.outcomes,
    durationLabel: c.durationLabel,
    delivery: c.delivery,
    audience: c.audience,
    prerequisitesText: c.prerequisitesText,
    priceKobo: c.priceKobo,
    status: c.status,
    image: c.image,
    passMarkPercent: c.passMarkPercent,
    instructorName: c.instructorName,
    instructorBio: c.instructorBio,
    faqs: c.faqs,
  }
}
export type PublicCourse = ReturnType<typeof publicCourse> & { availability: Availability | null }

export const listCourses = createServerFn({ method: 'GET' }).handler(async () => {
  await ensureSeeded()
  const user = await currentUser()
  const rows = await db().select().from(schema.courses).orderBy(asc(schema.courses.level))
  const visible = rows.filter((c) => c.status !== 'draft' && c.status !== 'archived')
  return Promise.all(visible.map(async (c): Promise<PublicCourse> => ({ ...publicCourse(c), availability: user ? await courseAvailability(user, c) : null })))
})

export const getCoursePage = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: z.string().min(1).max(80) }))
  .handler(async ({ data }) => {
    await ensureSeeded()
    const [c] = await db().select().from(schema.courses).where(eq(schema.courses.slug, data.slug))
    if (!c || c.status === 'draft' || c.status === 'archived') return null
    const user = await currentUser()
    const modules = await db().select().from(schema.courseModules).where(eq(schema.courseModules.courseId, c.id)).orderBy(asc(schema.courseModules.week))
    // Syllabus only: titles and summaries. Lesson bodies and recordings are served by the access-checked getLesson.
    const lessons = await db()
      .select({ id: schema.lessons.id, moduleId: schema.lessons.moduleId, title: schema.lessons.title, kind: schema.lessons.kind, summary: schema.lessons.summary, durationMinutes: schema.lessons.durationMinutes, isPreview: schema.lessons.isPreview })
      .from(schema.lessons)
      .where(and(eq(schema.lessons.courseId, c.id), eq(schema.lessons.published, true)))
      .orderBy(asc(schema.lessons.sortOrder))
    const assessments = await db()
      .select({ title: schema.assessments.title, kind: schema.assessments.kind })
      .from(schema.assessments)
      .where(and(eq(schema.assessments.courseId, c.id), eq(schema.assessments.published, true)))
      .orderBy(asc(schema.assessments.sortOrder))
    const assignments = await db()
      .select({ title: schema.assignments.title, kind: schema.assignments.kind })
      .from(schema.assignments)
      .where(eq(schema.assignments.courseId, c.id))
      .orderBy(asc(schema.assignments.sortOrder))
    const [prereq] = c.prerequisiteCourseId
      ? await db().select({ slug: schema.courses.slug, title: schema.courses.title }).from(schema.courses).where(eq(schema.courses.id, c.prerequisiteCourseId))
      : []
    return {
      course: publicCourse(c),
      attendanceRequirementPercent: c.attendanceRequirementPercent,
      prerequisite: prereq ?? null,
      modules: modules.map((m) => ({ ...m, lessons: lessons.filter((l) => l.moduleId === m.id) })),
      looseLessons: lessons.filter((l) => !l.moduleId),
      assessments,
      assignments,
      availability: user ? await courseAvailability(user, c) : null,
      signedIn: !!user,
    }
  })

/** Free preview lessons: readable without an account, but only lessons staff have explicitly marked as previews. */
export const getPreviewLesson = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: z.string().min(1).max(80), lessonId: z.number().int().positive() }))
  .handler(async ({ data }) => {
    await ensureSeeded()
    const d = db()
    const [c] = await d.select().from(schema.courses).where(eq(schema.courses.slug, data.slug))
    if (!c || c.status === 'draft' || c.status === 'archived') return null
    const [l] = await d
      .select()
      .from(schema.lessons)
      .where(and(eq(schema.lessons.id, data.lessonId), eq(schema.lessons.courseId, c.id), eq(schema.lessons.published, true), eq(schema.lessons.isPreview, true)))
    if (!l) return null
    const [mod] = l.moduleId ? await d.select({ week: schema.courseModules.week, title: schema.courseModules.title }).from(schema.courseModules).where(eq(schema.courseModules.id, l.moduleId)) : []
    const others = await d
      .select({ id: schema.lessons.id, title: schema.lessons.title })
      .from(schema.lessons)
      .where(and(eq(schema.lessons.courseId, c.id), eq(schema.lessons.published, true), eq(schema.lessons.isPreview, true)))
      .orderBy(asc(schema.lessons.sortOrder))
    const user = await currentUser()
    return {
      course: publicCourse(c),
      availability: user ? await courseAvailability(user, c) : null,
      lesson: { id: l.id, title: l.title, kind: l.kind, summary: l.summary, content: l.content, secondaryNote: l.secondaryNote, videoUrl: l.videoUrl, durationMinutes: l.durationMinutes },
      module: mod ?? null,
      otherPreviews: others.filter((o) => o.id !== l.id),
    }
  })

export const publishedTestimonials = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    return await db()
      .select({ id: schema.testimonials.id, name: schema.testimonials.name, context: schema.testimonials.context, quote: schema.testimonials.quote })
      .from(schema.testimonials)
      .where(and(eq(schema.testimonials.published, true), eq(schema.testimonials.consentConfirmed, true)))
      .orderBy(desc(schema.testimonials.createdAt))
      .limit(6)
  } catch {
    return []
  }
})

export const recordSchoolEnquiry = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      schoolName: z.string().trim().min(2).max(160),
      location: z.string().trim().min(2).max(160),
      schoolType: z.string().trim().min(2).max(80),
      contactName: z.string().trim().min(2).max(120),
      position: z.string().trim().min(2).max(120),
      email: z.email().max(254),
      phone: z.string().trim().regex(/^[0-9+()\-\s]{7,40}$/),
      studentPopulation: z.string().trim().min(1).max(40),
      yearGroup: z.string().trim().min(1).max(80),
      message: z.string().trim().max(3000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await db().insert(schema.schoolEnquiries).values({ ...data, message: data.message || null })
    return { ok: true }
  })

export const verifyCertificate = createServerFn({ method: 'GET' })
  .validator(z.object({ code: z.string().trim().min(4).max(40) }))
  .handler(async ({ data }) => {
    const code = data.code.toUpperCase()
    const [c] = await db().select().from(schema.certificates).where(eq(schema.certificates.verificationCode, code))
    const [byNumber] = c ? [c] : await db().select().from(schema.certificates).where(eq(schema.certificates.number, code))
    const cert = c ?? byNumber
    if (!cert) return null
    return {
      number: cert.number,
      verificationCode: cert.verificationCode,
      studentName: cert.studentName,
      courseTitle: cert.courseTitle,
      completedOn: cert.completedOn,
      revoked: !!cert.revokedAt,
    }
  })

/** Minimal session info for headers and route guards. */
export const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const u = await currentUser().catch(() => null)
  if (!u) return null
  return { id: u.id, fullName: u.fullName, email: u.email, role: u.role }
})
