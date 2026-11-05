// Server-only helpers. Only import this from inside server function handlers or server routes.
import { getUser as getIdentityUser } from '@netlify/identity'
import { and, eq, sql } from 'drizzle-orm'
import { getDb, schema } from '../../db/index'
import { hasRole, type Role } from '../lib/roles'
import { seedCourses } from '../data/academy'

export const db = () => getDb()
export { schema }

export class AppError extends Error {
  /** Marks the message as safe to show to the user. Anything else is replaced by a generic message. */
  readonly expose = true
  constructor(message: string, public code: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INVALID' | 'CONFLICT' | 'UNAVAILABLE' = 'INVALID') {
    super(message)
  }
}

export type DbUser = typeof schema.users.$inferSelect

function superAdminEmails() {
  return (process.env.ACADEMY_SUPER_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

const clean = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/**
 * Resolves the signed-in Netlify Identity user (token verified against the Identity API)
 * to an Academy user record, creating it on first sign-in from the registration metadata.
 */
export async function currentUser(): Promise<DbUser | null> {
  const identity = await getIdentityUser()
  if (!identity?.id || !identity.email) return null
  await ensureSeeded()
  const d = db()
  const email = identity.email.toLowerCase()
  const [existing] = await d.select().from(schema.users).where(eq(schema.users.identityId, identity.id))
  if (existing) {
    if (existing.status !== 'active') return null
    if (existing.role !== 'super_admin' && superAdminEmails().includes(email)) {
      const [u] = await d.update(schema.users).set({ role: 'super_admin' }).where(eq(schema.users.id, existing.id)).returning()
      await audit(u.id, 'role.bootstrap_super_admin', 'user', u.id)
      return u
    }
    return existing
  }

  // First sign-in: build the profile from what the learner entered at registration.
  const m = (identity.userMetadata ?? {}) as Record<string, unknown>
  const role: Role = superAdminEmails().includes(email) ? 'super_admin' : 'student'
  let schoolId: number | null = null
  const schoolCode = clean(m.school_code, 20).toUpperCase()
  if (schoolCode) {
    const [s] = await d.select({ id: schema.schools.id }).from(schema.schools).where(eq(schema.schools.code, schoolCode))
    schoolId = s?.id ?? null
  }
  const ageGroup = m.age_group === 'under_18' ? 'under_18' : m.age_group === 'adult' ? 'adult' : null
  const [created] = await d
    .insert(schema.users)
    .values({
      identityId: identity.id,
      email,
      fullName: clean(m.full_name, 120) || identity.name || email.split('@')[0],
      phone: clean(m.phone, 40) || null,
      country: clean(m.country, 60) || null,
      ageGroup,
      role,
      schoolId,
      schoolNameOther: schoolId ? null : clean(m.school_name, 160) || null,
      schoolLinkStatus: schoolId ? 'pending' : 'none',
      intendedCourse: clean(m.course, 80) || null,
    })
    .onConflictDoNothing()
    .returning()
  const user = created ?? (await d.select().from(schema.users).where(eq(schema.users.email, email)))[0]
  if (!user) return null
  if (created && ageGroup === 'under_18' && clean(m.guardian_name) && clean(m.guardian_phone) && m.guardian_consent === true) {
    await d
      .insert(schema.guardianConsents)
      .values({
        userId: user.id,
        guardianName: clean(m.guardian_name, 120),
        guardianPhone: clean(m.guardian_phone, 40),
        guardianEmail: clean(m.guardian_email, 254) || null,
        relationship: clean(m.guardian_relationship, 60) || 'Parent/Guardian',
      })
      .onConflictDoNothing()
  }
  if (created) await audit(user.id, 'user.registered', 'user', user.id, { role })
  return user
}

export async function requireUser(): Promise<DbUser> {
  const u = await currentUser()
  if (!u) throw new AppError('Please sign in to continue.', 'UNAUTHENTICATED')
  return u
}

export async function requireRole(roles: readonly Role[]): Promise<DbUser> {
  const u = await requireUser()
  if (!hasRole(u.role, roles)) throw new AppError('You do not have permission to do that.', 'FORBIDDEN')
  return u
}

export async function audit(actorUserId: number | null, action: string, entityType: string, entityId?: number | string | null, details?: Record<string, unknown>) {
  try {
    await db().insert(schema.auditLogs).values({ actorUserId, action, entityType, entityId: entityId == null ? null : String(entityId), details })
  } catch (e) {
    console.error('audit log failed', action, e)
  }
}

export function today() {
  return new Date().toISOString().slice(0, 10)
}

export function randomCode(len: number, alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789') {
  const bytes = crypto.getRandomValues(new Uint8Array(len))
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

// ---------- Seeding ----------

const SEED_KEY = 'seed:courses:v1'
let seeding: Promise<void> | null = null

/** Inserts the five-level catalogue and Level 1 curriculum once. Idempotent and race-safe via unique keys. */
export function ensureSeeded() {
  seeding ??= runSeed().catch((e) => {
    seeding = null
    throw e
  })
  return seeding
}

async function runSeed() {
  const d = db()
  const [done] = await d.select().from(schema.settings).where(eq(schema.settings.key, SEED_KEY))
  if (done) return
  const ids: Record<number, number> = {}
  for (const c of seedCourses) {
    await d
      .insert(schema.courses)
      .values({
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
      })
      .onConflictDoNothing()
    const [row] = await d.select({ id: schema.courses.id }).from(schema.courses).where(eq(schema.courses.slug, c.slug))
    ids[c.level] = row.id
  }
  for (const c of seedCourses) {
    if (c.level > 1 && ids[c.level - 1]) {
      await d
        .update(schema.courses)
        .set({ prerequisiteCourseId: ids[c.level - 1] })
        .where(and(eq(schema.courses.id, ids[c.level]), sql`${schema.courses.prerequisiteCourseId} is null`))
    }
    const courseId = ids[c.level]
    let order = 0
    for (const m of c.modules ?? []) {
      await d.insert(schema.courseModules).values({ courseId, week: m.week, title: m.title, summary: m.summary }).onConflictDoNothing()
      const [mod] = await d
        .select({ id: schema.courseModules.id })
        .from(schema.courseModules)
        .where(and(eq(schema.courseModules.courseId, courseId), eq(schema.courseModules.week, m.week)))
      for (const l of m.lessons) {
        order += 1
        await d
          .insert(schema.lessons)
          .values({
            courseId,
            moduleId: mod.id,
            sortOrder: order,
            title: l.title,
            kind: l.kind,
            summary: l.summary,
            content: l.content,
            secondaryNote: l.secondaryNote ?? null,
            durationMinutes: l.durationMinutes ?? null,
            isLiveSession: !!l.isLiveSession,
            isPreview: !!l.isPreview,
          })
          .onConflictDoNothing()
      }
    }
    let aOrder = 0
    for (const q of c.quizzes ?? []) {
      aOrder += 1
      await d
        .insert(schema.assessments)
        .values({ courseId, title: q.title, description: q.description, kind: 'quiz', weight: q.weight, questions: q.questions, sortOrder: aOrder })
        .onConflictDoNothing()
    }
    for (const q of c.instructorAssessments ?? []) {
      aOrder += 1
      await d
        .insert(schema.assessments)
        .values({ courseId, title: q.title, description: q.description, kind: 'instructor', weight: q.weight, questions: [], sortOrder: aOrder })
        .onConflictDoNothing()
    }
    let sOrder = 0
    for (const a of c.assignments ?? []) {
      sOrder += 1
      await d
        .insert(schema.assignments)
        .values({ courseId, title: a.title, instructions: a.instructions, kind: a.kind, sortOrder: sOrder })
        .onConflictDoNothing()
    }
  }
  await d.insert(schema.settings).values({ key: SEED_KEY, value: { at: new Date().toISOString() } }).onConflictDoNothing()
}

export async function getSetting<T extends Record<string, unknown>>(key: string): Promise<T | null> {
  const [row] = await db().select().from(schema.settings).where(eq(schema.settings.key, key))
  return (row?.value as T) ?? null
}
