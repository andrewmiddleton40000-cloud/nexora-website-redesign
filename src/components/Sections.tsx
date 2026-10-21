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
  index,
  label,
  title,
  intro,
  tone = 'light',
}: {
  index: string
  label: string
  title: React.ReactNode
  intro?: React.ReactNode
  tone?: 'light' | 'dark'
}) {
  return (
    <div className="grid gap-8 md:grid-cols-12 md:gap-10">
      <p className={`eyebrow md:col-span-3 md:pt-3 ${tone === 'dark' ? '!text-paper/55' : ''}`}>
        ({index}) {label}
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
    <ol className="border-t border-ink">
      {categories.map((c) => {
        const from = c.services.reduce((a, b) => (b.price < a.price ? b : a))
        return (
          <li key={c.id} className="group border-b border-line">
            <Link to="/services" hash={c.id} className="grid gap-4 py-8 md:grid-cols-12 md:gap-10 md:py-10">
              <span className="text-sm text-muted tabular-nums md:col-span-1 md:pt-2">{c.number}</span>
              <h3 className="display text-[1.9rem] md:col-span-5 md:text-4xl transition-colors group-hover:text-forest">
                {c.title}
              </h3>
              <div className="md:col-span-4 md:pt-1.5">
                <p className="text-lg leading-relaxed text-ink-soft">{c.intro}</p>
                <p className="mt-3 text-sm text-muted">{c.services.map((s) => s.name).slice(0, 4).join(' · ')}…</p>
              </div>
              <p className="md:col-span-2 md:pt-2 md:text-right">
                <span className="block text-xs uppercase tracking-[0.14em] text-muted">From</span>
                <span className="mt-1 block text-xl font-medium tabular-nums">{formatPrice(from)}</span>
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
            <p className="eyebrow md:col-span-3 md:pt-3">({c.number}) Category</p>
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
    <ol className="grid border-l border-t border-line sm:grid-cols-2 xl:grid-cols-4">
      {packages.map((p, i) => {
        const entry = i === 0
        return (
          <li key={p.serviceId} className="flex flex-col border-b border-r border-line bg-white p-6 md:p-8">
            <p className="flex items-center justify-between text-sm text-muted tabular-nums">
              0{i + 1}
              {entry && <span className="bg-forest-tint px-2.5 py-1 text-xs text-forest">Entry-level offer</span>}
            </p>
            <h3 className="display mt-5 text-[2rem]">{p.title}</h3>
            <p className="mt-3 min-h-[4.5rem] leading-relaxed text-muted">{p.audience}</p>
            <p className="mt-6 text-xs uppercase tracking-[0.14em] text-muted">Package price</p>
            <p className="mt-1 text-3xl font-medium tabular-nums tracking-[-0.02em]">{formatPrice(p.service)}</p>
            <p className="mt-6 text-sm font-medium">Included</p>
            <ul className="mt-3 flex-1 space-y-2 text-[0.95rem] text-ink-soft">
              {p.includes.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-[0.7rem] inline-block h-px w-3 shrink-0 bg-forest" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <QuoteButtons service={p.service} />
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
              <span className="text-forest transition-transform duration-200 group-open:rotate-45" aria-hidden="true">
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
  const line = dark ? 'border-line-dark' : 'border-line'
  return (
    <ul className={`grid border-t md:grid-cols-2 ${dark ? 'border-line-dark' : 'border-ink'}`}>
      {benefits.map((b, i) => (
        <li key={b.title} className={`border-b ${line} py-8 md:odd:pr-10 md:even:border-l md:even:pl-10`}>
          <p className={`text-sm tabular-nums ${dark ? 'text-signal' : 'text-forest'}`}>0{i + 1}</p>
          <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em]">{b.title}</h3>
          <p className={`mt-3 max-w-md leading-relaxed ${dark ? 'text-paper/65' : 'text-muted'}`}>{b.body}</p>
        </li>
      ))}
    </ul>
  )
}

export function Principles({ tone = 'dark' }: { tone?: 'light' | 'dark' }) {
  const line = tone === 'dark' ? 'border-line-dark' : 'border-line'
  return (
    <ul className={`grid border-t ${line} md:grid-cols-2 lg:grid-cols-3`}>
      {principles.map((p, i) => (
        <li key={p.title} className={`border-b ${line} py-8 md:pr-10`}>
          <p className={`text-sm tabular-nums ${tone === 'dark' ? 'text-signal' : 'text-forest'}`}>0{i + 1}</p>
          <h3 className="mt-4 text-2xl font-medium tracking-[-0.02em]">{p.title}</h3>
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
      <span className="absolute left-[0.4rem] top-2 bottom-2 w-px bg-line md:left-0 md:right-0 md:top-[0.4rem] md:bottom-auto md:h-px md:w-auto" aria-hidden="true" />
      {processSteps.map((step) => (
        <li key={step.number} className="relative pl-10 pb-10 md:pl-0 md:pr-8 md:pb-0">
          <span className="absolute left-0 top-0 h-[0.85rem] w-[0.85rem] rounded-full border-2 border-forest bg-paper md:static md:block" aria-hidden="true" />
          <p className="text-sm text-muted tabular-nums md:mt-8">{step.number}</p>
          <h3 className="display mt-2 text-3xl md:text-[2.1rem]">{step.title}</h3>
          <p className="mt-3 leading-relaxed text-muted">{step.body}</p>
        </li>
      ))}
    </ol>
  )
}

export function AudienceList() {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-2 text-xl md:text-2xl tracking-[-0.02em]">
      {audiences.map((a, i) => (
        <li key={a} className="flex items-center gap-3">
          {a}
          {i < audiences.length - 1 && <span className="text-forest" aria-hidden="true">/</span>}
        </li>
      ))}
    </ul>
  )
}

function ProjectCard({ p, large }: { p: Project; large: boolean }) {
  return (
    <li className={`group ${large ? 'md:col-span-7' : 'md:col-span-5 md:mt-24'}`}>
      <div className={`overflow-hidden bg-paper-deep ${large ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
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
      <p className="mt-3 text-sm text-muted">{p.services.join(' · ')}</p>
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
              className={`border px-4 py-2 text-sm transition-colors ${
                active === c.id ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'
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
        <div className="aspect-[16/10] overflow-hidden bg-paper-deep">
          <img
            src={img('hospitality.jpg', 1200)}
            srcSet={imgSet('hospitality.jpg', [600, 900, 1200, 1600])}
            sizes="(min-width: 768px) 58vw, 100vw"
            alt="A guest receiving a room key at a boutique hotel reception, with a booking calendar on a tablet"
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
      <div className="wrap grid gap-12 py-24 md:grid-cols-12 md:py-36">
        <div className="md:col-span-8">
          <p className="eyebrow !text-paper/60">Next step</p>
          <h2 id="cta-title" className="display mt-6 text-[2.9rem] md:text-7xl lg:text-[5.5rem]">
            Let’s make your next digital move <span className="serif text-signal">count.</span>
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
