import { Link, createFileRoute } from '@tanstack/react-router'
import { img, imgSet, site } from '@/data/site'
import { categories } from '@/data/pricing'
import { seo } from '@/lib/seo'
import { AudienceList, ClosingCTA, Principles, SectionHead } from '@/components/Sections'

export const Route = createFileRoute('/about')({
  head: () =>
    seo({
      title: 'About',
      path: '/about',
      description:
        'Nexora Technologies is a digital solutions partner helping Nigerian and international businesses use websites, e-commerce, AI and automation effectively.',
    }),
  component: AboutPage,
})

function AboutPage() {
  return (
    <>
      <section className="wrap pt-16 pb-20 md:pt-24 md:pb-28">
        <p className="eyebrow rise">About Nexora</p>
        <h1 className="display rise rise-2 mt-6 max-w-5xl text-[2.9rem] md:text-7xl lg:text-[5.5rem]">
          Your business has goals. <span className="serif text-forest">Our job is to help technology support them.</span>
        </h1>
      </section>

      <section className="border-y border-line bg-white">
        <div className="wrap grid gap-12 py-20 md:grid-cols-12 md:py-28">
          <p className="eyebrow md:col-span-3 md:pt-2">(01) Our mission</p>
          <div className="md:col-span-8 space-y-6 text-xl leading-relaxed text-ink-soft">
            <p className="text-2xl md:text-3xl leading-snug tracking-[-0.02em] text-ink">“{site.positioning}”</p>
            <p>
              Our mission is to help businesses use technology effectively — to present themselves credibly, sell and serve
              customers online, and remove the manual work that slows teams down. We work with business owners,
              established companies and entrepreneurs in Nigeria and internationally, as a digital solutions partner
              rather than a single-service vendor.
            </p>
            <p>
              That might mean a new website that finally reflects the quality of your business, a CRM that keeps every
              lead from slipping through, or a small custom tool that removes hours of manual work each week.
            </p>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2">
        <div className="aspect-[4/3] overflow-hidden bg-paper-deep md:aspect-auto">
          <img
            src={img('hospitality.jpg', 1200)}
            srcSet={imgSet('hospitality.jpg', [640, 960, 1280, 1408])}
            sizes="(min-width: 768px) 50vw, 100vw"
            alt="A guest receiving a room key at a boutique hotel reception, with a booking calendar on a tablet"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="px-5 py-20 md:px-14 md:py-28">
          <p className="eyebrow">Who we work with</p>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft max-w-md">
            Established and growing businesses, particularly in Nigeria and other emerging markets, that are ready to
            operate more efficiently and present themselves better online.
          </p>
          <div className="mt-8">
            <AudienceList />
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32" aria-labelledby="capabilities-title">
        <div className="wrap grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4">
            <p className="eyebrow">(02) Capabilities</p>
            <h2 id="capabilities-title" className="display mt-6 text-[2.6rem] md:text-5xl">
              What we <span className="serif">design and build.</span>
            </h2>
          </div>
          <ol className="border-t border-ink md:col-span-8">
            {categories.map((c) => (
              <li key={c.id} className="grid gap-3 border-b border-line py-7 sm:grid-cols-[3rem_1fr]">
                <span className="text-sm text-forest tabular-nums pt-1">{c.number}</span>
                <div>
                  <Link to="/services" hash={c.id} className="text-2xl font-medium tracking-[-0.02em] hover:text-forest">
                    {c.title}
                  </Link>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{c.services.map((s) => s.name).join(' · ')}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-ink text-paper py-24 md:py-32">
        <div className="wrap">
          <SectionHead
            tone="dark"
            index="03"
            label="Our approach"
            title={<>How we <span className="serif text-signal">work with you.</span></>}
          />
          <div className="mt-16">
            <Principles />
          </div>
          <Link to="/services" className="link mt-12 inline-block text-paper/85">
            See our services →
          </Link>
        </div>
      </section>

      <section className="border-b border-line bg-white" aria-labelledby="commitment-title">
        <div className="wrap grid gap-10 py-20 md:grid-cols-12 md:py-28">
          <p className="eyebrow md:col-span-3 md:pt-3">(04) Our commitment</p>
          <div className="md:col-span-9">
            <h2 id="commitment-title" className="display text-[2.4rem] md:text-5xl max-w-3xl">
              Honest advice, clear pricing, <span className="serif text-forest">and work you can rely on.</span>
            </h2>
            <ul className="mt-10 grid gap-x-10 border-t border-line md:grid-cols-3">
              {[
                ['Transparent pricing', 'Published naira starting prices and written proposals that list what is — and isn’t — included.'],
                ['Plain communication', 'No jargon. You always know what is being built, why, and what happens next.'],
                ['Work you own', 'Clean handover, documentation where it matters, and support options if you want them.'],
              ].map(([t, d]) => (
                <li key={t} className="border-b border-line py-6">
                  <p className="font-medium">{t}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ClosingCTA />
    </>
  )
}
