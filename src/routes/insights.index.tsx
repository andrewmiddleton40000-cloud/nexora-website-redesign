import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { articles, formatDate, topics } from '@/data/insights'
import { seo } from '@/lib/seo'
import { ClosingCTA } from '@/components/Sections'

export const Route = createFileRoute('/insights/')({
  head: () =>
    seo({
      title: 'Insights',
      path: '/insights',
      description:
        'Practical articles on website development, AI automation, business technology and digital growth from Nexora Technologies.',
    }),
  component: InsightsPage,
})

function InsightsPage() {
  const [topic, setTopic] = useState<string>('all')
  const list = topic === 'all' ? articles : articles.filter((a) => a.topic === topic)
  return (
    <>
      <section className="wrap pt-16 pb-16 md:pt-24 md:pb-20">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="eyebrow rise">Insights</p>
            <h1 className="display rise rise-2 mt-6 text-[3rem] md:text-7xl lg:text-[5.75rem]">
              Practical notes on <span className="serif text-forest">technology that works.</span>
            </h1>
          </div>
          <p className="rise rise-3 text-lg leading-relaxed text-muted md:col-span-4 md:self-end">
            Guidance for business owners on websites, AI automation, business technology and digital growth — written
            to help you make better decisions, whoever you work with.
          </p>
        </div>
        <div role="group" aria-label="Filter articles by topic" className="mt-12 flex flex-wrap gap-2">
          {['all', ...topics].map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={topic === t}
              onClick={() => setTopic(t)}
              className={`border px-4 py-2 text-sm transition-colors ${
                topic === t ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'
              }`}
            >
              {t === 'all' ? 'All topics' : t}
            </button>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-white py-16 md:py-24" aria-label="Articles">
        <div className="wrap">
          {list.length === 0 ? (
            <p className="text-lg text-muted">No articles in this topic yet — check back soon.</p>
          ) : (
            <ol className="border-t border-ink">
              {list.map((a) => (
                <li key={a.slug} className="group border-b border-line">
                  <Link
                    to="/insights/$slug"
                    params={{ slug: a.slug }}
                    className="grid gap-4 py-10 md:grid-cols-12 md:gap-10"
                  >
                    <p className="text-sm text-muted md:col-span-3 md:pt-2">
                      <span className="text-forest">{a.topic}</span>
                      <br />
                      {formatDate(a.published)} · {a.readingMinutes} min read
                    </p>
                    <div className="md:col-span-8">
                      <h2 className="display text-[1.9rem] md:text-4xl transition-colors group-hover:text-forest">
                        {a.title}
                      </h2>
                      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">{a.summary}</p>
                    </div>
                    <span className="hidden text-2xl text-forest md:col-span-1 md:block md:pt-2 md:text-right" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <ClosingCTA />
    </>
  )
}
