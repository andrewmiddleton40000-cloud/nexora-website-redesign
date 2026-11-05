import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { audiences, benefits, img, imgSet, principles, processSteps, site } from '@/data/site'
import {
  categories,
  faqs,
  formatPrice,
  packages,
  priceLabel,
  pricingNote,
  separateCosts,
  whatsappLink,
  type PricedService,
} from '@/data/pricing'
import { projects, type Project } from '@/data/projects'
import { WhatsAppIcon } from './WhatsApp'

export function SectionHead({
  label,
  title,
  intro,
  tone = 'light',
}: {
  index?: string
  label: string
  title: React.ReactNode
  intro?: React.ReactNode
  tone?: 'light' | 'dark'
}) {
  return (
    <div className="grid gap-8 md:grid-cols-12 md:gap-10">
      <p className={`eyebrow eyebrow-mark md:col-span-3 md:pt-3 ${tone === 'dark' ? 'eyebrow-dark !text-paper/60' : ''}`}>
        {label}
      </p>
      <div className="md:col-span-9">
        <h2 className="display text-[2.6rem] md:text-6xl lg:text-7xl max-w-4xl">{title}</h2>
        {intro && (
          <p className={`mt-6 max-w-2xl text-lg leading-relaxed ${tone === 'dark' ? 'text-paper/70' : 'text-muted'}`}>
            {intro}
          </p>
        )}
      </div>
    </div>
  )
}

/** Homepage overview: the four service categories with their lowest starting price. */
export function CategoryIndex() {
  return (
    <ol className="grid gap-5 md:grid-cols-2">
      {categories.map((c, i) => {
        const from = c.services.reduce((a, b) => (b.price < a.price ? b : a))
        const feature = i === 0
        return (
          <li key={c.id} className={`group card ${feature ? 'card-forest' : ''}`}>
            <Link to="/services" hash={c.id} className="flex h-full flex-col p-7 md:p-10">
              <span className="flex items-start justify-between gap-4">
                <span className={`orb ${feature ? '' : 'orb-forest'}`} aria-hidden="true" />
                <span
                  className={`grid h-11 w-11 place-items-center rounded-full border text-lg transition-transform duration-300 group-hover:-rotate-45 ${
                    feature ? 'border-paper/30' : 'border-line'
                  }`}
                  aria-hidden="true"
                >
                  →
                </span>
              </span>
              <h3 className={`display mt-8 text-[2rem] md:text-[2.6rem] ${feature ? '' : 'transition-colors group-hover:text-forest'}`}>
                {c.title}
              </h3>
              <p className={`mt-4 text-lg leading-relaxed ${feature ? 'text-paper/80' : 'text-ink-soft'}`}>{c.intro}</p>
              <p className={`mt-3 mb-8 text-sm ${feature ? 'text-paper/60' : 'text-muted'}`}>
                {c.services.map((s) => s.name).slice(0, 4).join(' · ')}…
              </p>
              <p className={`mt-auto flex items-baseline justify-between gap-4 border-t pt-5 ${feature ? 'border-paper/20' : 'border-line'}`}>
                <span className={`text-xs uppercase tracking-[0.14em] ${feature ? 'text-paper/60' : 'text-muted'}`}>Starting from</span>
                <span className={`text-2xl font-medium tabular-nums ${feature ? 'text-signal' : 'text-forest'}`}>{formatPrice(from)}</span>
              </p>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

export function QuoteButtons({ service, tone = 'light' }: { service: PricedService; tone?: 'light' | 'dark' }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        to="/enquiry"
        search={{ service: service.id }}
        className={`btn !min-h-[2.6rem] !px-4 text-sm ${tone === 'dark' ? 'btn-signal' : 'btn-primary'}`}
      >
        Request a Quote <span className="arrow" aria-hidden="true">→</span>
      </Link>
      <a
        href={whatsappLink(service)}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn btn-ghost !min-h-[2.6rem] !px-4 text-sm ${tone === 'dark' ? 'hover:!bg-paper hover:!text-ink hover:!border-paper' : ''}`}
        aria-label={`Discuss ${service.name} on WhatsApp`}
      >
        <WhatsAppIcon /> WhatsApp
      </a>
    </div>
  )
}

function ServiceRow({ s }: { s: PricedService }) {
  return (
    <li id={s.id} className="border-b border-line">
      <div className="grid gap-5 py-8 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <h4 className="text-2xl font-medium tracking-[-0.02em]">{s.name}</h4>
          <p className="mt-3 leading-relaxed text-ink-soft">{s.description}</p>
        </div>
        <ul className="space-y-1.5 text-sm text-muted md:col-span-3 md:pt-1.5">
          {s.deliverables.map((d) => (
            <li key={d} className="flex gap-3">
              <span className="mt-[0.6rem] inline-block h-px w-3 shrink-0 bg-forest" aria-hidden="true" />
              {d}
            </li>
          ))}
        </ul>
        <div className="md:col-span-4 md:pl-4 md:border-l md:border-line">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">{priceLabel(s)}</p>
          <p className="mt-1 text-[1.65rem] font-medium tabular-nums tracking-[-0.02em]">{formatPrice(s)}</p>
          {s.custom && (
            <p className="mt-1 text-sm text-muted">Final quotation depends on your requirements.</p>
          )}
          <div className="mt-4">
            <QuoteButtons service={s} />
          </div>
        </div>
      </div>
    </li>
  )
}

/** Full priced service list, grouped by category. */
export function PriceList() {
  return (
    <div className="space-y-24 md:space-y-32">
      {categories.map((c) => (
        <section key={c.id} id={c.id} aria-labelledby={`${c.id}-title`}>
          <div className="grid gap-6 md:grid-cols-12 md:gap-10">
            <p className="eyebrow eyebrow-mark md:col-span-3 md:pt-3">Category</p>
            <div className="md:col-span-9">
              <h3 id={`${c.id}-title`} className="display text-[2.3rem] md:text-5xl">
                {c.title}
              </h3>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{c.intro}</p>
            </div>
          </div>
          <ul className="mt-12 border-t border-ink">
            {c.services.map((s) => (
              <ServiceRow key={s.id} s={s} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

/** The four main website packages, with the landing page as the entry point. */
export function PackageGrid() {
  return (
    <ol className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {packages.map((p, i) => {
        const entry = i === 0
        return (
          <li key={p.serviceId} className={`card flex flex-col p-6 md:p-8 ${entry ? 'card-forest' : ''}`}>
            <p className="flex min-h-[1.6rem] items-center justify-between">
              <span className={`orb !h-8 !w-8 ${entry ? '' : 'orb-forest'}`} aria-hidden="true" />
              {entry && <span className="rounded-full bg-signal px-3 py-1 text-xs font-medium text-ink">Entry-level offer</span>}
            </p>
            <h3 className="display mt-6 text-[2rem]">{p.title}</h3>
            <p className={`mt-3 min-h-[4.5rem] leading-relaxed ${entry ? 'text-paper/75' : 'text-muted'}`}>{p.audience}</p>
            <p className={`mt-6 text-xs uppercase tracking-[0.14em] ${entry ? 'text-paper/60' : 'text-muted'}`}>Package price</p>
            <p className={`mt-1 text-[2.1rem] font-medium tabular-nums tracking-[-0.02em] ${entry ? 'text-signal' : 'text-forest'}`}>
              {formatPrice(p.service)}
            </p>
            <p className="mt-6 text-sm font-medium">Included</p>
            <ul className={`mt-3 flex-1 space-y-2 text-[0.95rem] ${entry ? 'text-paper/85' : 'text-ink-soft'}`}>
              {p.includes.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className={`tick !h-5 !w-5 !text-[0.65rem] ${entry ? '!bg-signal !text-ink' : ''}`} aria-hidden="true">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <QuoteButtons service={p.service} tone={entry ? 'dark' : 'light'} />
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function PricingNote() {
  return (
    <div className="grid gap-10 border-t border-ink pt-10 md:grid-cols-12 md:gap-10">
      <p className="eyebrow md:col-span-3 md:pt-2">Pricing note</p>
      <div className="md:col-span-5">
        <p className="text-2xl leading-snug tracking-[-0.02em]">{pricingNote}</p>
        <p className="mt-5 leading-relaxed text-muted">
          Additional functionality is scoped and priced separately. For projects with substantial custom
          functionality, the listed amount is a starting price and the final quotation depends on your requirements.
        </p>
      </div>
      <div className="md:col-span-4">
        <p className="text-sm font-medium">Separate unless expressly included</p>
        <ul className="mt-4 border-t border-line text-sm text-ink-soft">
          {separateCosts.map((c) => (
            <li key={c} className="border-b border-line py-2.5">
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function FAQList() {
  return (
    <ul className="border-t border-ink">
      {faqs.map((f) => (
        <li key={f.q} className="border-b border-line">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 py-6 text-xl font-medium tracking-[-0.015em] md:text-2xl [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest-tint text-forest transition-[transform,background-color,color] duration-200 group-open:rotate-45 group-open:bg-forest group-open:text-signal" aria-hidden="true">
                +
              </span>
            </summary>
            <p className="max-w-3xl pb-7 leading-relaxed text-ink-soft">{f.a}</p>
          </details>
        </li>
      ))}
    </ul>
  )
}

export function Benefits({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark'
  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {benefits.map((b) => (
        <li key={b.title} className={`card ${dark ? 'card-dark' : ''} p-7 md:p-9`}>
          <span className={`orb ${dark ? '' : 'orb-forest'}`} aria-hidden="true" />
          <h3 className="mt-6 text-2xl font-medium tracking-[-0.02em]">{b.title}</h3>
          <p className={`mt-3 max-w-md leading-relaxed ${dark ? 'text-paper/65' : 'text-muted'}`}>{b.body}</p>
        </li>
      ))}
    </ul>
  )
}

export function Principles({ tone = 'dark' }: { tone?: 'light' | 'dark' }) {
  return (
    <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {principles.map((p) => (
        <li key={p.title} className={`card ${tone === 'dark' ? 'card-dark' : ''} p-7 md:p-8`}>
          <span className={`orb !h-9 !w-9 ${tone === 'dark' ? '' : 'orb-forest'}`} aria-hidden="true" />
          <h3 className="mt-6 text-2xl font-medium tracking-[-0.02em]">{p.title}</h3>
          <p className={`mt-3 leading-relaxed ${tone === 'dark' ? 'text-paper/65' : 'text-muted'}`}>{p.body}</p>
        </li>
      ))}
    </ul>
  )
}

/** Horizontal timeline on desktop, vertical on mobile. */
export function ProcessTimeline() {
  return (
    <ol className="relative grid gap-0 md:grid-cols-5">
      <span className="absolute left-[0.6rem] top-2 bottom-2 w-[3px] rounded-full bg-linear-to-b from-forest via-[#4f9a68] to-signal md:left-0 md:right-0 md:top-[0.55rem] md:bottom-auto md:h-[3px] md:w-auto md:bg-linear-to-r" aria-hidden="true" />
      {processSteps.map((step) => (
        <li key={step.number} className="relative pl-10 pb-10 md:pl-0 md:pr-8 md:pb-0">
          <span className="absolute left-0 top-0 block h-[1.35rem] w-[1.35rem] rounded-full border-[3px] border-paper bg-forest shadow-[0_0_0_3px_var(--color-forest-tint),0_8px_18px_-6px_rgb(31_75_58/0.7)] md:static" aria-hidden="true" />
          <h3 className="display mt-0 md:mt-8 text-3xl md:text-[2.1rem]">{step.title}</h3>
          <p className="mt-3 leading-relaxed text-muted">{step.body}</p>
        </li>
      ))}
    </ol>
  )
}

export function AudienceList() {
  return (
    <ul className="flex flex-wrap gap-2.5">
      {audiences.map((a) => (
        <li key={a} className="chip">
          <span className="h-1.5 w-1.5 rounded-full bg-forest" aria-hidden="true" />
          {a}
        </li>
      ))}
    </ul>
  )
}

function ProjectCard({ p, large }: { p: Project; large: boolean }) {
  return (
    <li className={`group ${large ? 'md:col-span-7' : 'md:col-span-5 md:mt-24'}`}>
      <div
        className={`overflow-hidden rounded-2xl bg-paper-deep shadow-[0_24px_50px_-30px_rgb(22_21_19/0.55)] ring-1 ring-line transition-shadow duration-500 group-hover:shadow-[0_0_0_2px_var(--color-forest),0_30px_60px_-28px_rgb(31_75_58/0.6)] ${large ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}
      >
        <img
          src={img(p.image, 1200)}
          srcSet={imgSet(p.image, [600, 900, 1200, 1600])}
          sizes={large ? '(min-width: 768px) 60vw, 100vw' : '(min-width: 768px) 40vw, 100vw'}
          alt={p.imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
      </div>
      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="text-2xl font-medium tracking-[-0.02em]">{p.name}</h3>
        <p className="text-sm text-muted">
          {p.industry}
          {p.kind === 'internal' && ' · Internal / demonstration project'}
          {p.year && ` · ${p.year}`}
        </p>
      </div>
      <p className="mt-3 max-w-xl leading-relaxed text-ink-soft">{p.problem}</p>
      {p.approach && <p className="mt-3 max-w-xl leading-relaxed text-muted">{p.approach}</p>}
      {p.outcome && (
        <p className="mt-4 flex max-w-xl gap-3 text-sm">
          <span className="mt-[0.55rem] inline-block h-px w-6 shrink-0 bg-forest" aria-hidden="true" />
          <span>
            <span className="font-medium">Outcome: </span>
            <span className="text-ink-soft">{p.outcome}</span>
          </span>
        </p>
      )}
      <ul className="mt-4 flex flex-wrap gap-2">
        {p.services.map((sv) => (
          <li key={sv} className="rounded-full bg-forest-tint px-3 py-1 text-xs text-forest">
            {sv}
          </li>
        ))}
      </ul>
      {p.url && (
        <a href={p.url} target="_blank" rel="noopener noreferrer" className="link mt-4 inline-block text-sm">
          Visit live site ↗
        </a>
      )}
    </li>
  )
}

/**
 * Renders projects from src/data/projects.ts in a staggered editorial grid, optionally
 * filterable by service category. Until genuine work is added, shows an honest empty state.
 */
export function WorkShowcase({ limit, filterable = false }: { limit?: number; filterable?: boolean }) {
  const [active, setActive] = useState<string>('all')
  const present = categories.filter((c) => projects.some((p) => p.category === c.id))
  const filtered = active === 'all' ? projects : projects.filter((p) => p.category === active)
  const list = limit ? filtered.slice(0, limit) : filtered
  if (projects.length === 0) return <WorkEmptyState />
  return (
    <>
      {filterable && present.length > 1 && (
        <div role="group" aria-label="Filter projects by category" className="mb-14 flex flex-wrap gap-2">
          {[{ id: 'all', title: 'All work' }, ...present].map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={active === c.id}
              onClick={() => setActive(c.id)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                active === c.id ? 'border-forest bg-forest text-paper shadow-[0_8px_20px_-10px_rgb(31_75_58/0.8)]' : 'border-line bg-white hover:border-forest'
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      )}
      <ul className="grid gap-16 md:grid-cols-12 md:gap-x-10 md:gap-y-24">
        {list.map((p, i) => (
          <ProjectCard key={p.slug} p={p} large={i % 4 === 0 || i % 4 === 3} />
        ))}
      </ul>
    </>
  )
}

function WorkEmptyState() {
  const fields = [
    ['The business', 'Who the client is and the industry they operate in.'],
    ['The problem', 'What was slowing them down or holding growth back.'],
    ['What we delivered', 'The services, systems and design work involved.'],
    ['The outcome', 'Results we can verify — never estimates presented as fact.'],
    ['The finished work', 'Real screenshots and a live link wherever the client allows.'],
  ]
  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-10">
      <figure className="md:col-span-7">
        <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-paper-deep">
          <img
            src={img('hospitality.jpg', 1200)}
            srcSet={imgSet('hospitality.jpg', [600, 900, 1200, 1600])}
            sizes="(min-width: 768px) 58vw, 100vw"
            alt="A shop assistant helping a customer pay at a tablet checkout counter"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        <figcaption className="mt-3 text-sm text-muted">Illustrative photography — not a client project.</figcaption>
      </figure>
      <div className="md:col-span-5 md:pt-2">
        <p className="eyebrow">Case studies in preparation</p>
        <p className="mt-5 text-2xl leading-snug tracking-[-0.02em]">
          We only publish work we’re permitted to share. Detailed case studies are being prepared with our clients and
          will appear here as they’re approved.
        </p>
        <dl className="mt-8 border-t border-line">
          {fields.map(([t, d]) => (
            <div key={t} className="grid grid-cols-[8.5rem_1fr] gap-4 border-b border-line py-4 text-sm">
              <dt className="font-medium">{t}</dt>
              <dd className="text-muted">{d}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-muted">
          Want to see relevant examples before you commit?{' '}
          <Link to="/enquiry" className="link text-ink">
            Ask us in your project enquiry
          </Link>{' '}
          or{' '}
          <a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer" className="link text-ink">
            on WhatsApp
          </a>
          .
        </p>
      </div>
    </div>
  )
}

export function ClosingCTA() {
  return (
    <section className="bg-forest text-paper" aria-labelledby="cta-title">
      <span className="rings -right-40 -top-40" aria-hidden="true" />
      <div className="wrap grid gap-12 py-24 md:grid-cols-12 md:py-36">
        <div className="md:col-span-8">
          <p className="eyebrow eyebrow-mark !text-paper/60">Next step</p>
          <h2 id="cta-title" className="display mt-6 text-[2.9rem] md:text-7xl lg:text-[5.5rem]">
            Let’s make your next digital move <span className="serif text-gradient-signal pr-2">count.</span>
          </h2>
        </div>
        <div className="md:col-span-4 md:self-end">
          <p className="text-lg leading-relaxed text-paper/75">
            Tell us what your business needs. We’ll review your requirements and send a written proposal with a clear
            price.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/enquiry" className="btn btn-signal">
              Request a Proposal <span className="arrow" aria-hidden="true">→</span>
            </Link>
            <a
              href={site.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost hover:!bg-paper hover:!text-ink hover:!border-paper"
            >
              <WhatsAppIcon /> WhatsApp us
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
