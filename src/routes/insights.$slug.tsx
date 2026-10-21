import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { articles, formatDate, getArticle } from '@/data/insights'
import { site } from '@/data/site'
import { seo } from '@/lib/seo'
import { ClosingCTA } from '@/components/Sections'

export const Route = createFileRoute('/insights/$slug')({
  loader: ({ params }) => {
    const article = getArticle(params.slug)
    if (!article) throw notFound()
    return article
  },
  head: ({ loaderData: a }) => {
    if (!a) return seo({ title: 'Insights', path: '/insights' })
    const base = seo({ title: a.title, description: a.summary, path: `/insights/${a.slug}` })
    return {
      ...base,
      meta: [...base.meta, { property: 'og:type', content: 'article' }, { property: 'article:published_time', content: a.published }],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: a.title,
            description: a.summary,
            datePublished: a.published,
            author: { '@type': 'Organization', name: site.name },
            publisher: { '@type': 'Organization', name: site.name },
            mainEntityOfPage: `${site.url}/insights/${a.slug}`,
          }),
        },
      ],
    }
  },
  component: ArticlePage,
})

function ArticlePage() {
  const a = Route.useLoaderData()
  const more = articles.filter((x) => x.slug !== a.slug).slice(0, 2)
  return (
    <>
      <article className="wrap pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-3">
            <Link to="/insights" className="link text-sm">
              ← All insights
            </Link>
          </div>
          <div className="md:col-span-8">
            <p className="eyebrow rise">
              {a.topic} · {formatDate(a.published)} · {a.readingMinutes} min read
            </p>
            <h1 className="display rise rise-2 mt-6 text-[2.6rem] md:text-6xl">{a.title}</h1>
            <p className="rise rise-3 mt-8 text-xl leading-relaxed text-ink-soft">{a.summary}</p>
            <div className="prose-article mt-12 max-w-[42rem] border-t border-line pt-4">
              {a.body.map((b, i) =>
                b.type === 'ul' ? (
                  <ul key={i}>
                    {b.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : b.type === 'h2' ? (
                  <h2 key={i}>{b.text}</h2>
                ) : (
                  <p key={i}>{b.text}</p>
                ),
              )}
            </div>
            <div className="mt-14 max-w-[42rem] border-t border-ink pt-8">
              <p className="text-lg">Thinking about a project like this?</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/enquiry" className="btn btn-primary">
                  Discuss Your Project <span className="arrow" aria-hidden="true">→</span>
                </Link>
                <Link to="/services" className="btn btn-ghost">
                  View services and pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section className="border-t border-line bg-white py-20 md:py-24" aria-label="More insights">
          <div className="wrap">
            <p className="eyebrow">More insights</p>
            <ul className="mt-8 grid border-t border-ink md:grid-cols-2">
              {more.map((m) => (
                <li key={m.slug} className="group border-b border-line py-8 md:odd:pr-10 md:even:border-l md:even:pl-10">
                  <Link to="/insights/$slug" params={{ slug: m.slug }} className="block">
                    <p className="text-sm text-forest">{m.topic}</p>
                    <h2 className="mt-3 text-2xl font-medium tracking-[-0.02em] group-hover:text-forest">{m.title}</h2>
                    <p className="mt-3 leading-relaxed text-muted">{m.summary}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ClosingCTA />
    </>
  )
}
