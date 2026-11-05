import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { getBlogPost } from '@/server/fns/blog'
import { site } from '@/data/site'
import { categories } from '@/data/pricing'
import { seo } from '@/lib/seo'
import { formatPostDate } from '@/lib/blog'
import { Markdown, imageSrc, outline } from '@/lib/markdown'
import { ClosingCTA } from '@/components/Sections'
import { NewsletterCTA, PostCard, PostMeta } from '@/components/Blog'
import { SocialIcon } from '@/components/SocialIcons'

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    const r = await getBlogPost({ data: { slug: params.slug } })
    if (!r) throw notFound()
    return r
  },
  head: ({ loaderData }) => {
    if (!loaderData) return seo({ title: 'Blog', path: '/blog' })
    const a = loaderData.post
    const cover = a.coverImage ? imageSrc(a.coverImage, 1200) : null
    const image = cover ? (cover.startsWith('/') ? `${site.url}${cover}` : cover) : null
    const url = `${site.url}/blog/${a.slug}`
    const base = seo({ title: a.title, description: a.summary, path: `/blog/${a.slug}`, image, imageAlt: a.coverAlt })
    return {
      ...base,
      meta: [
        ...base.meta,
        { property: 'og:type', content: 'article' },
        { property: 'article:published_time', content: a.publishedAt ?? '' },
        { property: 'article:modified_time', content: a.updatedAt },
        ...(a.topic ? [{ property: 'article:section', content: a.topic }] : []),
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      links: [...base.links, { rel: 'alternate', type: 'application/rss+xml', title: `${site.name} Blog`, href: '/blog/rss.xml' }],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: a.title,
            description: a.summary,
            datePublished: a.publishedAt,
            dateModified: a.updatedAt,
            ...(image ? { image } : {}),
            author: a.authorName ? { '@type': 'Person', name: a.authorName } : { '@type': 'Organization', name: site.name },
            publisher: { '@type': 'Organization', name: site.name },
            mainEntityOfPage: url,
          }),
        },
      ],
    }
  },
  component: PostPage,
})

function PostPage() {
  const { post: a, related, newer, older, course } = Route.useLoaderData()
  const toc = outline(a.body)
  const cover = a.coverImage ? imageSrc(a.coverImage, 1600) : null
  const service = a.relatedService ? categories.find((c) => c.id === a.relatedService) : null
  const url = `${site.url}/blog/${a.slug}`
  const share = [
    { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${a.title} ${url}`)}` },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { label: 'X', href: `https://x.com/intent/post?text=${encodeURIComponent(a.title)}&url=${encodeURIComponent(url)}` },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  ]
  const ask = `${site.whatsapp.url}?text=${encodeURIComponent(`Hello Nexora, I just read “${a.title}” and I’d like to ask about it.`)}`

  return (
    <>
      <article className="pt-16 md:pt-24">
        <header className="wrap">
          <Link to="/blog" className="link text-sm">← All posts</Link>
          <div className="mt-8 max-w-4xl">
            {a.topic && (
              <Link to="/blog" search={{ topic: a.topic }} className="eyebrow eyebrow-mark rise">{a.topic}</Link>
            )}
            <h1 className="display rise rise-2 mt-6 text-[2.6rem] md:text-6xl lg:text-7xl">{a.title}</h1>
            <p className="rise rise-3 mt-8 max-w-3xl text-xl leading-relaxed text-ink-soft">{a.summary}</p>
            <PostMeta p={a} className="mt-6" />
          </div>
          {cover && (
            <div className="photo-frame mt-12 overflow-hidden">
              <img src={cover} alt={a.coverAlt ?? ''} className="aspect-[16/8] w-full object-cover" fetchPriority="high" />
            </div>
          )}
        </header>

        <div className="wrap grid gap-12 pt-12 pb-20 md:pb-28 lg:grid-cols-12">
          <aside className="lg:col-span-3 lg:order-last">
            <div className="space-y-8 lg:sticky lg:top-28">
              {toc.length >= 3 && (
                <nav aria-label="In this post" className="hidden lg:block">
                  <p className="eyebrow">In this post</p>
                  <ul className="mt-4 space-y-2 border-l border-line text-sm">
                    {toc.map((h) => (
                      <li key={h.id}>
                        <a href={`#${h.id}`} className="-ml-px block border-l-2 border-transparent pl-4 text-muted hover:border-forest hover:text-ink">
                          {h.text.replace(/[*_`]/g, '')}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
              <div>
                <p className="eyebrow">Share</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {share.map((s) => (
                    <li key={s.label}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className="chip !py-2 !text-sm" aria-label={`Share on ${s.label}`}>
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8 lg:col-start-1">
            <div className="prose-article max-w-[42rem]">
              <Markdown source={a.body} />
            </div>

            {a.updatedAt && a.publishedAt && new Date(a.updatedAt).getTime() - new Date(a.publishedAt).getTime() > 86_400_000 && (
              <p className="mt-10 max-w-[42rem] text-sm text-muted">Last updated {formatPostDate(a.updatedAt)}</p>
            )}

            <div className="mt-14 max-w-[42rem] space-y-6">
              {(service || course) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {service && (
                    <Link to="/services" hash={service.id} className="card group block p-6">
                      <p className="eyebrow">Related service</p>
                      <p className="mt-3 text-lg font-medium group-hover:text-forest">{service.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-muted">See what’s included and the published prices →</p>
                    </Link>
                  )}
                  {course && (
                    <Link to="/academy/courses/$slug" params={{ slug: course.slug }} className="card group block p-6">
                      <p className="eyebrow">Learn it yourself</p>
                      <p className="mt-3 text-lg font-medium group-hover:text-forest">{course.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-muted">A Nexora Digital Academy course. View the course →</p>
                    </Link>
                  )}
                </div>
              )}

              <div className="border-t border-ink pt-8">
                <p className="text-lg">Have a question about this, or a project in mind?</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to="/enquiry" className="btn btn-primary">
                    Discuss Your Project <span className="arrow" aria-hidden="true">→</span>
                  </Link>
                  <a href={ask} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                    <SocialIcon label="WhatsApp" className="h-4 w-4" /> Ask on WhatsApp
                  </a>
                </div>
              </div>

              <NewsletterCTA compact />

              {(newer || older) && (
                <nav aria-label="More posts" className="grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
                  {older ? (
                    <Link to="/blog/$slug" params={{ slug: older.slug }} className="group block">
                      <span className="text-sm text-muted">← Previous post</span>
                      <span className="mt-1 block font-medium group-hover:text-forest">{older.title}</span>
                    </Link>
                  ) : <span />}
                  {newer && (
                    <Link to="/blog/$slug" params={{ slug: newer.slug }} className="group block sm:text-right">
                      <span className="text-sm text-muted">Next post →</span>
                      <span className="mt-1 block font-medium group-hover:text-forest">{newer.title}</span>
                    </Link>
                  )}
                </nav>
              )}
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-line bg-white py-20 md:py-24" aria-labelledby="related-title">
          <div className="wrap">
            <p id="related-title" className="eyebrow eyebrow-mark">Keep reading</p>
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((m) => (
                <li key={m.slug}><PostCard p={m} headingLevel="h3" /></li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ClosingCTA />
    </>
  )
}
