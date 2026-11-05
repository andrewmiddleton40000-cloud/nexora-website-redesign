import { Link } from '@tanstack/react-router'
import { site } from '@/data/site'
import { formatPostDate } from '@/lib/blog'
import { imageSrc } from '@/lib/markdown'
import { SocialIcon } from '@/components/SocialIcons'

export type BlogCard = {
  slug: string
  title: string
  summary: string
  topic: string
  coverImage: string | null
  coverAlt: string | null
  authorName: string | null
  publishedAt: string | null
  readingMinutes: number
}

export const substack = site.socials.find((s) => s.label === 'Substack') ?? null

export function PostMeta({ p, className = '' }: { p: Pick<BlogCard, 'publishedAt' | 'readingMinutes' | 'authorName'>; className?: string }) {
  return (
    <p className={`text-sm text-muted ${className}`}>
      {p.publishedAt && <time dateTime={p.publishedAt}>{formatPostDate(p.publishedAt)}</time>} · {p.readingMinutes} min read
      {p.authorName ? ` · ${p.authorName}` : ''}
    </p>
  )
}

/** Grid card used on the blog index, the homepage strip and related posts. */
export function PostCard({ p, headingLevel = 'h2', feature = false }: { p: BlogCard; headingLevel?: 'h2' | 'h3'; feature?: boolean }) {
  const H = headingLevel
  const cover = p.coverImage ? imageSrc(p.coverImage, feature ? 1400 : 800) : null
  return (
    <article className={`card group relative flex h-full flex-col overflow-hidden ${feature ? 'md:grid md:grid-cols-2' : ''}`}>
      {cover && (
        <div className={`overflow-hidden bg-paper-deep ${feature ? 'aspect-[16/10] md:aspect-auto' : 'aspect-[16/9]'}`}>
          <img src={cover} alt={p.coverAlt ?? ''} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        </div>
      )}
      <div className={`flex flex-1 flex-col ${feature ? 'p-8 md:p-12' : 'p-7'}`}>
        {p.topic && <span className="chip self-start !py-1 !text-xs">{p.topic}</span>}
        <H className={`display mt-4 transition-colors group-hover:text-forest ${feature ? 'text-[2rem] md:text-5xl' : 'text-[1.6rem] md:text-[1.85rem]'}`}>
          <Link to="/blog/$slug" params={{ slug: p.slug }} className="after:absolute after:inset-0">
            {p.title}
          </Link>
        </H>
        <p className={`mt-4 leading-relaxed text-ink-soft ${feature ? 'text-lg' : ''}`}>{p.summary}</p>
        <PostMeta p={p} className="mt-auto pt-6" />
      </div>
    </article>
  )
}

/** Substack is Nexora's newsletter; the blog on this site is the home for posts. */
export function NewsletterCTA({ compact = false }: { compact?: boolean }) {
  if (!substack) return null
  if (compact) {
    return (
      <div className="card-forest flex flex-col gap-5 p-7 md:flex-row md:items-center md:justify-between md:p-9">
        <div>
          <p className="text-xl font-medium">Get new posts in your inbox</p>
          <p className="mt-2 text-paper/75">Subscribe to the Nexora newsletter on Substack. It’s free, and you can unsubscribe at any time.</p>
        </div>
        <a href={substack.href} target="_blank" rel="noopener noreferrer" className="btn btn-signal shrink-0">
          <SocialIcon label="Substack" className="h-4 w-4" /> Subscribe on Substack
        </a>
      </div>
    )
  }
  return (
    <section className="bg-ink text-paper py-20 md:py-28" aria-labelledby="newsletter-title">
      <div className="wrap grid gap-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <p className="eyebrow eyebrow-mark !text-paper/60">Newsletter</p>
          <h2 id="newsletter-title" className="display mt-6 text-[2.4rem] md:text-6xl">
            New posts, <span className="serif text-gradient-signal pr-1">straight to your inbox.</span>
          </h2>
        </div>
        <div className="md:col-span-5">
          <p className="text-lg leading-relaxed text-paper/75">
            Subscribe to the Nexora newsletter on Substack for practical notes on websites, AI and business technology.
            It’s free, and you can unsubscribe at any time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={substack.href} target="_blank" rel="noopener noreferrer" className="btn btn-signal">
              Subscribe on Substack <span className="arrow" aria-hidden="true">→</span>
            </a>
            <a href="/blog/rss.xml" className="btn btn-ghost hover:!bg-paper hover:!text-ink hover:!border-paper">
              RSS feed
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
