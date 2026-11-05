// Server-only blog rules. Import from server functions and server routes only.
import { and, eq, lte, sql } from 'drizzle-orm'
import { db, schema } from './core'
import { seedPosts } from '../data/blog-seed'
import { readingMinutes } from '../lib/markdown'

const SEED_KEY = 'seed:blog:v1'
let seeding: Promise<void> | null = null

/** Copies the original three articles into the database once. Deleted posts are not re-created. */
export function ensureBlogSeeded() {
  seeding ??= (async () => {
    const d = db()
    const [done] = await d.select().from(schema.settings).where(eq(schema.settings.key, SEED_KEY))
    if (done) return
    for (const p of seedPosts) {
      await d
        .insert(schema.blogPosts)
        .values({ ...p, status: 'published' })
        .onConflictDoNothing()
    }
    await d.insert(schema.settings).values({ key: SEED_KEY, value: { at: new Date().toISOString() } }).onConflictDoNothing()
  })().catch((e) => {
    seeding = null
    throw e
  })
  return seeding
}

/** Published and not scheduled for the future. */
export const isLive = () => and(eq(schema.blogPosts.status, 'published'), lte(schema.blogPosts.publishedAt, sql`now()`))

type Post = typeof schema.blogPosts.$inferSelect

/** Postgres returns '2026-10-21 08:00:00+00'; send standard ISO strings that every browser parses. */
export function iso(v: string): string
export function iso(v: string | null): string | null
export function iso(v: string | null) {
  if (!v) return null
  const d = new Date(v.includes('T') ? v : v.replace(' ', 'T').replace(/([+-]\d\d)$/, '$1:00'))
  return Number.isNaN(d.getTime()) ? v : d.toISOString()
}

/** Fields safe for the public listing (no body, no staff ids). */
export function postCard(p: Post) {
  return {
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    topic: p.topic,
    coverImage: p.coverImage,
    coverAlt: p.coverAlt,
    authorName: p.authorName,
    publishedAt: iso(p.publishedAt),
    readingMinutes: readingMinutes(p.body),
  }
}
export type PostCard = ReturnType<typeof postCard>

export function publicPost(p: Post) {
  return {
    ...postCard(p),
    body: p.body,
    relatedService: p.relatedService,
    relatedCourseSlug: p.relatedCourseSlug,
    updatedAt: iso(p.updatedAt),
  }
}

// Cards are built from a column subset so listings never load full bodies twice.
export const cardColumns = {
  slug: schema.blogPosts.slug,
  title: schema.blogPosts.title,
  summary: schema.blogPosts.summary,
  topic: schema.blogPosts.topic,
  coverImage: schema.blogPosts.coverImage,
  coverAlt: schema.blogPosts.coverAlt,
  authorName: schema.blogPosts.authorName,
  publishedAt: schema.blogPosts.publishedAt,
  body: schema.blogPosts.body,
}
export function toCard(r: { [K in keyof typeof cardColumns]: Post[K] }): PostCard {
  const { body, ...rest } = r
  return { ...rest, publishedAt: iso(rest.publishedAt), readingMinutes: readingMinutes(body) }
}

export const MEDIA_STORE = 'blog-media'
export const MEDIA_KEY = /^[a-z0-9-]{8,80}\.(webp|jpg|png|gif)$/
export const MEDIA_TYPES: Record<string, string> = { webp: 'image/webp', jpg: 'image/jpeg', png: 'image/png', gif: 'image/gif' }
