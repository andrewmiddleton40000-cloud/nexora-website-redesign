import { Link } from '@tanstack/react-router'
import type { Availability } from '@/server/learning'
import { img, imgSet } from '@/data/site'
import { Badge, Price } from './ui'

export type CourseSummary = {
  slug: string
  level: number
  title: string
  levelLabel: string
  category?: string | null
  skills?: string[]
  summary: string
  description?: string
  outcomes?: string[]
  durationLabel: string | null
  delivery?: string | null
  prerequisitesText: string | null
  priceKobo: number | null
  status: string
  image: string | null
  availability: Availability | null
}

export function availabilityLabel(c: Pick<CourseSummary, 'status' | 'availability'>) {
  const a = c.availability
  if (!a) return c.status === 'available' ? { tone: 'available', text: 'Open for enrolment' } : { tone: 'locked', text: 'Locked' }
  switch (a.state) {
    case 'enrolled':
      return a.completed ? { tone: 'completed', text: 'Completed' } : { tone: 'enrolled', text: 'Enrolled' }
    case 'eligible':
      return { tone: 'eligible', text: 'Eligible to enrol' }
    case 'payment_pending':
      return { tone: 'pending', text: 'Payment being verified' }
    case 'needs_guardian_consent':
      return { tone: 'pending', text: 'Guardian consent pending' }
    case 'awaiting_price':
      return { tone: 'locked', text: 'Enrolment opening soon' }
    case 'needs_prerequisite':
      return { tone: 'locked', text: 'Locked' }
    default:
      return { tone: 'locked', text: c.status === 'available' ? 'Open' : 'Locked' }
  }
}

/** The single primary action for a course, based on the server-computed availability. */
export function CourseAction({ c, tone = 'light' }: { c: CourseSummary; tone?: 'light' | 'dark' }) {
  const a = c.availability
  const ghost = tone === 'dark' ? 'btn btn-ghost hover:!bg-paper hover:!text-ink hover:!border-paper' : 'btn btn-ghost'
  const primary = tone === 'dark' ? 'btn btn-signal' : 'btn btn-primary'
  if (!a) {
    if (c.status === 'available' && c.priceKobo)
      return (
        <Link to="/academy/register" search={{ course: c.slug }} className={primary}>
          Enrol now <span className="arrow" aria-hidden="true">→</span>
        </Link>
      )
    return (
      <Link to="/academy/courses/$slug" params={{ slug: c.slug }} className={ghost}>
        View course details
      </Link>
    )
  }
  switch (a.state) {
    case 'enrolled':
      return (
        <Link to="/academy/learn/$slug" params={{ slug: c.slug }} className={primary}>
          {a.completed ? 'Review course' : 'Continue learning'} <span className="arrow" aria-hidden="true">→</span>
        </Link>
      )
    case 'eligible':
      return (
        <Link to="/academy/checkout/$slug" params={{ slug: c.slug }} className={primary}>
          Enrol — <Price kobo={a.priceKobo} /> <span className="arrow" aria-hidden="true">→</span>
        </Link>
      )
    case 'payment_pending':
      return (
        <Link to="/academy/checkout/$slug" params={{ slug: c.slug }} className={ghost}>
          View payment status
        </Link>
      )
    case 'needs_guardian_consent':
      return (
        <Link to="/academy/dashboard" className={ghost}>
          Check consent status
        </Link>
      )
    case 'needs_prerequisite':
      return <span className="text-sm text-muted">Complete {a.prerequisiteTitle ?? 'the previous level'} first</span>
    default:
      return (
        <Link to="/academy/courses/$slug" params={{ slug: c.slug }} className={ghost}>
          View course details
        </Link>
      )
  }
}

export function CourseRow({ c, expanded = false }: { c: CourseSummary; expanded?: boolean }) {
  const label = availabilityLabel(c)
  const locked = label.tone === 'locked'
  return (
    <li className="border-b border-line">
      <article className="grid gap-6 py-10 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-3">
          <p className="inline-flex rounded-full bg-forest px-3 py-1 text-xs font-medium tabular-nums text-signal">Level {c.level}</p>
          {c.image && (
            <div className={`mt-4 aspect-[4/3] overflow-hidden rounded-2xl bg-paper-deep shadow-[0_20px_40px_-26px_rgb(22_21_19/0.6)] ${locked ? 'grayscale-[0.6]' : ''}`}>
              <img
                src={img(c.image, 600)}
                srcSet={imgSet(c.image, [360, 600, 900])}
                sizes="(min-width: 768px) 22vw, 100vw"
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
        <div className="md:col-span-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={label.tone}>{label.text}</Badge>
            <span className="text-xs uppercase tracking-[0.14em] text-muted">{c.levelLabel}</span>
          </div>
          <h3 className="display mt-4 text-3xl md:text-[2.6rem]">
            <Link to="/academy/courses/$slug" params={{ slug: c.slug }} className="hover:text-forest">
              {c.title}
            </Link>
          </h3>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">{expanded ? c.description : c.summary}</p>
          {expanded && c.outcomes && c.outcomes.length > 0 && (
            <>
              <p className="eyebrow mt-8">Learning outcomes</p>
              <ul className="mt-3 space-y-2">
                {c.outcomes.map((o) => (
                  <li key={o} className="flex gap-3 leading-relaxed text-ink-soft">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forest" aria-hidden="true" />
                    {o}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <dl className="grid content-start gap-5 text-sm md:col-span-3">
          <div>
            <dt className="eyebrow">Price</dt>
            <dd className="mt-1 text-xl font-medium">
              <Price kobo={c.priceKobo} />
            </dd>
          </div>
          <div>
            <dt className="eyebrow">Duration</dt>
            <dd className="mt-1">{c.durationLabel ?? 'To be announced'}</dd>
          </div>
          {expanded && c.delivery && (
            <div>
              <dt className="eyebrow">Delivery</dt>
              <dd className="mt-1 leading-relaxed">{c.delivery}</dd>
            </div>
          )}
          <div>
            <dt className="eyebrow">Prerequisites</dt>
            <dd className="mt-1 leading-relaxed">{c.prerequisitesText ?? 'None'}</dd>
          </div>
          <div className="pt-1">
            <CourseAction c={c} />
          </div>
        </dl>
      </article>
    </li>
  )
}

/** Catalogue card: image, subject, title, skills and the facts a learner filters on. */
export function CourseCard({ c }: { c: CourseSummary }) {
  const label = availabilityLabel(c)
  const locked = label.tone === 'locked'
  const skills = c.skills ?? []
  return (
    <li className="card group relative flex flex-col p-3 pb-6">
      <div className={`relative aspect-[16/10] overflow-hidden rounded-[0.9rem] bg-paper-deep ${locked ? 'grayscale-[0.6]' : ''}`}>
        <span className="absolute left-3 top-3 z-10 rounded-full bg-ink/85 px-3 py-1 text-xs font-medium text-signal backdrop-blur-sm">
          Level {c.level}
        </span>
        {c.image && (
          <img
            src={img(c.image, 640)}
            srcSet={imgSet(c.image, [360, 640, 960])}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none"
          />
        )}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2 px-3">
        <Badge tone={label.tone}>{label.text}</Badge>
        {c.category && <span className="text-xs uppercase tracking-[0.14em] text-muted">{c.category}</span>}
      </div>
      <h3 className="display mt-3 px-3 text-2xl md:text-[1.9rem]">
        <Link to="/academy/courses/$slug" params={{ slug: c.slug }} className="after:absolute after:inset-0 group-hover:text-forest">
          {c.title}
        </Link>
      </h3>
      <p className="mt-3 px-3 leading-relaxed text-ink-soft">{c.summary}</p>
      {skills.length > 0 && (
        <p className="mt-4 px-3 text-sm leading-relaxed text-muted">
          <span className="font-medium text-ink">Skills you'll gain:</span> {skills.join(', ')}
        </p>
      )}
      <p className="mx-3 mt-auto flex items-baseline justify-between gap-4 border-t border-line pt-5 text-sm text-muted">
        <span>
          Level {c.level} · {c.levelLabel} · {c.durationLabel ?? 'Duration to be announced'}
        </span>
        <span className="shrink-0 text-base font-medium text-forest">
          <Price kobo={c.priceKobo} fallback="Price TBA" />
        </span>
      </p>
    </li>
  )
}
