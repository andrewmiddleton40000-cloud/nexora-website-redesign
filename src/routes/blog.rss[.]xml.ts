import { createFileRoute } from '@tanstack/react-router'
import { desc } from 'drizzle-orm'
import { db, schema } from '@/server/core'
import { ensureBlogSeeded, isLive } from '@/server/blog'
import { site } from '@/data/site'

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!)

/** RSS feed of the latest 30 live posts, for feed readers and Substack/automation tools. */
export const Route = createFileRoute('/blog/rss.xml')({
  server: {
    handlers: {
      GET: async () => {
        await ensureBlogSeeded()
        const P = schema.blogPosts
        const rows = await db()
          .select({ slug: P.slug, title: P.title, summary: P.summary, topic: P.topic, publishedAt: P.publishedAt })
          .from(P)
          .where(isLive())
          .orderBy(desc(P.publishedAt))
          .limit(30)
        const items = rows
          .map((r) => {
            const url = `${site.url}/blog/${r.slug}`
            return `<item><title>${esc(r.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${new Date(r.publishedAt!).toUTCString()}</pubDate>${r.topic ? `<category>${esc(r.topic)}</category>` : ''}<description>${esc(r.summary)}</description></item>`
          })
          .join('')
        const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${esc(site.name)} Blog</title><link>${site.url}/blog</link><atom:link href="${site.url}/blog/rss.xml" rel="self" type="application/rss+xml"/><description>Practical articles on websites, AI automation, business technology and digital growth.</description><language>en</language>${items}</channel></rss>`
        return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' } })
      },
    },
  },
})
