import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { listBlogPosts } from '@/server/fns/blog'
import { seo } from '@/lib/seo'
import { site } from '@/data/site'
import { ClosingCTA } from '@/components/Sections'
import { NewsletterCTA, PostCard } from '@/components/Blog'

type Search = { q?: string; topic?: string; page?: number }

export const Route = createFileRoute('/blog/')({
  validateSearch: (s: Record<string, unknown>): Search => {
    const page = Number(s.page)
    return {
      q: typeof s.q === 'string' && s.q.trim() ? s.q.trim().slice(0, 80) : undefined,
      topic: typeof s.topic === 'string' && s.topic ? s.topic.slice(0, 80) : undefined,
      page: Number.isInteger(page) && page > 1 && page <= 1000 ? page : undefined,
    }
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    try {
      return { ...(await listBlogPosts({ data: deps })), live: true }
    } catch (e) {
      console.error('blog unavailable', e)
      return { posts: [], total: 0, pages: 1, page: 1, topics: [] as string[], live: false }
    }
  },
  head: ({ match }) => {
    const filtered = !!(match.search.q || match.search.topic || match.search.page)
    const base = seo({
      title: match.search.topic ? `${match.search.topic} — Blog` : 'Blog',
      path: '/blog',
      description: 'Practical articles on website development, AI automation, business technology and digital growth from Nexora Technologies.',
    })
    return {
      ...base,
      meta: filtered ? [...base.meta, { name: 'robots', content: 'noindex, follow' }] : base.meta,
      links: [...base.links, { rel: 'alternate', type: 'application/rss+xml', title: `${site.name} Blog`, href: '/blog/rss.xml' }],
    }
  },
  component: BlogIndex,
})

function BlogIndex() {
  const { posts, total, pages, page, topics, live } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const [q, setQ] = useState(search.q ?? '')
  useEffect(() => setQ(search.q ?? ''), [search.q])
  const filtered = !!(search.q || search.topic)
  const [feature, ...rest] = !filtered && page === 1 ? posts : [undefined, ...posts]

  return (
    <>
      <section className="wrap pt-16 pb-14 md:pt-24 md:pb-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="eyebrow eyebrow-mark rise">Blog</p>
            <h1 className="display rise rise-2 mt-6 text-[3rem] md:text-7xl lg:text-[5.75rem]">
              Practical notes on <span className="serif text-gradient pr-1">technology that works.</span>
            </h1>
          </div>
          <p className="rise rise-3 text-lg leading-relaxed text-muted md:col-span-4 md:self-end">
            Guidance for business owners and learners on websites, AI automation, business technology and digital
            growth, written to help you make better decisions, whoever you work with.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="Filter posts by topic" className="flex flex-wrap gap-2">
            {[undefined, ...topics].map((t) => {
              const active = search.topic === t
              return (
                <Link
                  key={t ?? 'all'}
                  to="/blog"
                  search={(prev) => ({ ...prev, topic: t, page: undefined })}
                  resetScroll={false}
                  aria-current={active ? 'true' : undefined}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    active ? 'border-forest bg-forest text-paper shadow-[0_8px_20px_-10px_rgb(31_75_58/0.8)]' : 'border-line bg-white hover:border-forest'
                  }`}
                >
                  {t ?? 'All topics'}
                </Link>
              )
            })}
          </div>
          <form
            role="search"
            className="flex w-full gap-2 lg:w-auto"
            onSubmit={(e) => {
              e.preventDefault()
              navigate({ search: (prev) => ({ ...prev, q: q.trim() || undefined, page: undefined }), resetScroll: false })
            }}
          >
            <label htmlFor="blog-q" className="sr-only">Search the blog</label>
            <input id="blog-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts" className="field !mt-0 w-full lg:w-72" />
            <button className="btn btn-primary shrink-0">Search</button>
          </form>
        </div>
      </section>

      <section className="border-t border-line bg-white py-16 md:py-24" aria-label="Posts">
        <div className="wrap">
          {filtered && (
            <p className="mb-8 text-muted" role="status">
              {total} {total === 1 ? 'post' : 'posts'}
              {search.topic ? ` in ${search.topic}` : ''}
              {search.q ? ` matching “${search.q}”` : ''} ·{' '}
              <Link to="/blog" className="link">Clear filters</Link>
            </p>
          )}
          {!live ? (
            <p className="text-lg text-muted">The blog is temporarily unavailable. Please try again in a few minutes.</p>
          ) : posts.length === 0 ? (
            <p className="text-lg text-muted">{filtered ? 'No posts match that search yet. Try another word or topic.' : 'No posts yet. Check back soon.'}</p>
          ) : (
            <>
              {feature && <div className="mb-6"><PostCard p={feature} feature /></div>}
              <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rest.filter((p) => !!p).map((p) => (
                  <li key={p.slug}><PostCard p={p} /></li>
                ))}
              </ul>
            </>
          )}

          {pages > 1 && (
            <nav aria-label="Blog pages" className="mt-14 flex items-center justify-between border-t border-line pt-8">
              {page > 1 ? (
                <Link to="/blog" search={(prev) => ({ ...prev, page: page - 1 > 1 ? page - 1 : undefined })} className="btn btn-ghost">← Newer posts</Link>
              ) : <span />}
              <span className="text-sm text-muted">Page {page} of {pages}</span>
              {page < pages ? (
                <Link to="/blog" search={(prev) => ({ ...prev, page: page + 1 })} className="btn btn-ghost">Older posts →</Link>
              ) : <span />}
            </nav>
          )}
        </div>
      </section>

      <NewsletterCTA />
      <ClosingCTA />
    </>
  )
}
