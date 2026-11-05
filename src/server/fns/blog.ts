// Blog server functions. Public readers only ever see live posts; writing requires BLOG roles.
import { createServerFn } from '@tanstack/react-start'
import { and, asc, count, desc, eq, gt, ilike, lt, ne, notInArray, or, sql } from 'drizzle-orm'
import { z } from 'zod'
import { AppError, audit, db, requireRole, schema } from '../core'
import { cardColumns, ensureBlogSeeded, isLive, iso, publicPost, toCard } from '../blog'
import { BLOG } from '../../lib/roles'
import { POSTS_PER_PAGE, slugify } from '../../lib/blog'
import { categories } from '../../data/pricing'

const P = schema.blogPosts

// ---------- Public ----------

export const listBlogPosts = createServerFn({ method: 'GET' })
  .validator(z.object({ q: z.string().max(80).optional(), topic: z.string().max(80).optional(), page: z.number().int().min(1).max(1000).optional() }))
  .handler(async ({ data }) => {
    await ensureBlogSeeded()
    const d = db()
    const words = (data.q ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 6)
    const where = and(
      isLive(),
      data.topic ? eq(P.topic, data.topic) : undefined,
      ...words.map((w) => {
        const like = `%${w.replace(/[%_\\]/g, (c) => `\\${c}`)}%`
        return or(ilike(P.title, like), ilike(P.summary, like), ilike(P.body, like), ilike(P.topic, like))
      }),
    )
    const page = data.page ?? 1
    const [rows, [total], topics] = await Promise.all([
      d.select(cardColumns).from(P).where(where).orderBy(desc(P.publishedAt), desc(P.id)).limit(POSTS_PER_PAGE).offset((page - 1) * POSTS_PER_PAGE),
      d.select({ n: count() }).from(P).where(where),
      d.select({ topic: P.topic, n: count() }).from(P).where(and(isLive(), ne(P.topic, ''))).groupBy(P.topic).orderBy(desc(count()), asc(P.topic)),
    ])
    return { posts: rows.map(toCard), total: total.n, pages: Math.max(1, Math.ceil(total.n / POSTS_PER_PAGE)), page, topics: topics.map((t) => t.topic) }
  })

export const latestBlogPosts = createServerFn({ method: 'GET' })
  .validator(z.object({ limit: z.number().int().min(1).max(6) }))
  .handler(async ({ data }) => {
    await ensureBlogSeeded()
    const rows = await db().select(cardColumns).from(P).where(isLive()).orderBy(desc(P.publishedAt), desc(P.id)).limit(data.limit)
    return rows.map(toCard)
  })

export const getBlogPost = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: z.string().min(1).max(120) }))
  .handler(async ({ data }) => {
    await ensureBlogSeeded()
    const d = db()
    const [p] = await d.select().from(P).where(and(eq(P.slug, data.slug), isLive()))
    if (!p) return null
    const [sameTopic, newer, older, course] = await Promise.all([
      p.topic
        ? d.select(cardColumns).from(P).where(and(isLive(), eq(P.topic, p.topic), ne(P.id, p.id))).orderBy(desc(P.publishedAt)).limit(3)
        : Promise.resolve([]),
      d.select({ slug: P.slug, title: P.title }).from(P).where(and(isLive(), gt(P.publishedAt, p.publishedAt!))).orderBy(asc(P.publishedAt)).limit(1),
      d.select({ slug: P.slug, title: P.title }).from(P).where(and(isLive(), lt(P.publishedAt, p.publishedAt!))).orderBy(desc(P.publishedAt)).limit(1),
      p.relatedCourseSlug
        ? d
            .select({ slug: schema.courses.slug, title: schema.courses.title, summary: schema.courses.summary })
            .from(schema.courses)
            .where(and(eq(schema.courses.slug, p.relatedCourseSlug), notInArray(schema.courses.status, ['draft', 'archived'])))
        : Promise.resolve([]),
    ])
    const fill =
      sameTopic.length < 3
        ? await d
            .select(cardColumns)
            .from(P)
            .where(and(isLive(), ne(P.id, p.id), p.topic ? ne(P.topic, p.topic) : undefined))
            .orderBy(desc(P.publishedAt))
            .limit(3 - sameTopic.length)
        : []
    const related = [...sameTopic, ...fill]
    return {
      post: publicPost(p),
      related: related.map(toCard),
      newer: newer[0] ?? null,
      older: older[0] ?? null,
      course: course[0] ?? null,
    }
  })

// ---------- Staff (super_admin, editor) ----------

export const adminListPosts = createServerFn({ method: 'GET' }).handler(async () => {
  await requireRole(BLOG)
  await ensureBlogSeeded()
  const d = db()
  const [posts, courses, topics] = await Promise.all([
    d
      .select({ id: P.id, slug: P.slug, title: P.title, topic: P.topic, status: P.status, publishedAt: P.publishedAt, updatedAt: P.updatedAt, authorName: P.authorName, editor: schema.users.fullName })
      .from(P)
      .leftJoin(schema.users, eq(schema.users.id, P.updatedById))
      .orderBy(sql`${P.publishedAt} desc nulls first`, desc(P.updatedAt)),
    d.select({ slug: schema.courses.slug, title: schema.courses.title }).from(schema.courses).where(notInArray(schema.courses.status, ['draft', 'archived'])).orderBy(asc(schema.courses.level)),
    d.selectDistinct({ topic: P.topic }).from(P).where(ne(P.topic, '')),
  ])
  return { posts: posts.map((p) => ({ ...p, publishedAt: iso(p.publishedAt), updatedAt: iso(p.updatedAt) })), courses, topics: topics.map((t) => t.topic) }
})

export const adminGetPost = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ data }) => {
    await requireRole(BLOG)
    const [p] = await db().select().from(P).where(eq(P.id, data.id))
    if (!p) throw new AppError('That post no longer exists.', 'NOT_FOUND')
    return { ...p, publishedAt: iso(p.publishedAt), updatedAt: iso(p.updatedAt) }
  })

const opt = (max: number) => z.string().trim().max(max).optional().transform((v) => v || null)

export const savePost = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      id: z.number().int().positive().optional(),
      title: z.string().trim().min(3, 'Add a title').max(160),
      slug: z.string().trim().max(100).optional(),
      summary: z.string().trim().max(400),
      topic: z.string().trim().max(60),
      body: z.string().max(100_000),
      coverImage: opt(200),
      coverAlt: opt(200),
      authorName: opt(80),
      relatedService: opt(40),
      relatedCourseSlug: opt(80),
      /** 'draft' keeps it private; 'published' with a future date schedules it. */
      status: z.enum(['draft', 'published']),
      publishedAt: z.iso.datetime({ offset: true }).optional().nullable(),
      /** updatedAt the editor loaded, so two people can't silently overwrite each other. */
      expectedUpdatedAt: z.string().max(40).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const me = await requireRole(BLOG)
    const d = db()
    const slug = slugify(data.slug || data.title)
    if (!slug) throw new AppError('The web address needs at least one letter or number.')
    if (data.relatedService && !categories.some((c) => c.id === data.relatedService)) throw new AppError('Choose a service area from the list.')
    if (data.status === 'published') {
      if (data.summary.length < 20) throw new AppError('Add a short summary (at least 20 characters) before publishing. It is shown in listings, search results and social shares.')
      if (data.body.trim().length < 200) throw new AppError('The post body looks too short to publish.')
      if (data.coverImage && !data.coverAlt) throw new AppError('Describe the cover image (alt text) before publishing.')
    }
    const [clash] = await d.select({ id: P.id }).from(P).where(and(eq(P.slug, slug), data.id ? ne(P.id, data.id) : undefined))
    if (clash) throw new AppError('Another post already uses this web address. Change the title or the address.', 'CONFLICT')

    const existing = data.id ? (await d.select().from(P).where(eq(P.id, data.id)))[0] : undefined
    if (data.id && !existing) throw new AppError('That post no longer exists.', 'NOT_FOUND')
    if (existing && data.expectedUpdatedAt && iso(existing.updatedAt) !== iso(data.expectedUpdatedAt))
      throw new AppError('Someone else saved this post after you opened it. Copy your changes, reopen the post, and apply them again.', 'CONFLICT')
    // Keep the original publish date when re-saving a live post unless a new one was chosen.
    const publishedAt = data.publishedAt ? new Date(data.publishedAt).toISOString() : data.status === 'published' ? (existing?.publishedAt ?? new Date().toISOString()) : null

    const values = {
      slug,
      title: data.title,
      summary: data.summary,
      topic: data.topic,
      body: data.body,
      coverImage: data.coverImage,
      coverAlt: data.coverAlt,
      authorName: data.authorName,
      relatedService: data.relatedService,
      relatedCourseSlug: data.relatedCourseSlug,
      status: data.status,
      publishedAt,
      updatedById: me.id,
      updatedAt: new Date().toISOString(),
    }
    const [row] = existing
      ? await d.update(P).set(values).where(eq(P.id, existing.id)).returning()
      : await d.insert(P).values({ ...values, createdById: me.id }).returning()
    await audit(me.id, existing ? 'blog.post_updated' : 'blog.post_created', 'blog_post', row.id, { status: row.status, publishedAt: row.publishedAt, slug: row.slug })
    return { ...row, publishedAt: iso(row.publishedAt), updatedAt: iso(row.updatedAt) }
  })

export const deletePost = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const me = await requireRole(BLOG)
    const [row] = await db().delete(P).where(eq(P.id, data.id)).returning({ id: P.id, slug: P.slug })
    if (row) await audit(me.id, 'blog.post_deleted', 'blog_post', row.id, { slug: row.slug })
    return { ok: true }
  })
