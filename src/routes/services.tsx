import { Link, createFileRoute } from '@tanstack/react-router'
import { site } from '@/data/site'
import { categories, faqs } from '@/data/pricing'
import { seo } from '@/lib/seo'
import {
  ClosingCTA,
  FAQList,
  PackageGrid,
  PriceList,
  PricingNote,
  ProcessTimeline,
  SectionHead,
} from '@/components/Sections'
import { WhatsAppIcon } from '@/components/WhatsApp'

export const Route = createFileRoute('/services')({
  head: () => ({
    ...seo({
      title: 'Services and Pricing',
      path: '/services',
      description:
        'Website, e-commerce, web application, AI and automation services with transparent starting prices in naira — from a ₦350,000 landing page to enterprise systems.',
    }),
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }),
      },
    ],
  }),
  component: ServicesPage,
})

function ServicesPage() {
  return (
    <>
      <section className="wrap pt-16 pb-16 md:pt-24 md:pb-24">
        <p className="eyebrow rise">Services and pricing</p>
        <h1 className="display rise rise-2 mt-6 max-w-5xl text-[3rem] md:text-7xl lg:text-[5.75rem]">
          Clear services. <span className="serif text-forest">Transparent prices</span> in naira.
        </h1>
        <div className="rise rise-3 mt-8 grid gap-8 md:grid-cols-12">
          <p className="max-w-2xl text-lg leading-relaxed text-muted md:col-span-7 md:text-xl">
            Every service below shows its starting price, so you know where a project begins before we talk. Your final
            proposal is tailored to your goals and the functionality you need.
          </p>
          <nav aria-label="Service categories" className="md:col-span-4 md:col-start-9">
            <ul className="border-t border-line text-sm">
              {[{ id: 'packages', title: 'Website packages' }, ...categories, { id: 'faq', title: 'Pricing questions' }].map((c) => (
                <li key={c.id} className="border-b border-line">
                  <a href={`#${c.id}`} className="flex justify-between py-2.5 hover:text-forest">
                    {c.title} <span aria-hidden="true">↓</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <section id="packages" className="border-t border-line bg-paper-deep/50 py-24 md:py-32" aria-labelledby="packages-title">
        <div className="wrap">
          <div className="grid gap-8 md:grid-cols-12 md:gap-10">
            <p className="eyebrow md:col-span-3 md:pt-3">(01) Website packages</p>
            <div className="md:col-span-9">
              <h2 id="packages-title" className="display text-[2.6rem] md:text-6xl max-w-4xl">
                Four packages. <span className="serif">Exactly what’s included.</span>
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
                Our most requested website projects, with their inclusions set out in full. Anything beyond the list —
                extra pages, integrations or custom features — is scoped and priced separately.
              </p>
            </div>
          </div>
          <div className="mt-16">
            <PackageGrid />
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t border-line py-24 md:py-32" aria-labelledby="pricing-title">
        <div className="wrap">
          <div className="grid gap-8 md:grid-cols-12 md:gap-10">
            <p className="eyebrow md:col-span-3 md:pt-3">(02) Full price list</p>
            <div className="md:col-span-9">
              <h2 id="pricing-title" className="display text-[2.6rem] md:text-6xl max-w-4xl">
                Every service, <span className="serif">with its starting price.</span>
              </h2>
            </div>
          </div>
          <div className="mt-20">
            <PriceList />
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-white py-20 md:py-28" aria-label="Pricing note">
        <div className="wrap">
          <PricingNote />
        </div>
      </section>

      <section className="py-24 md:py-32" aria-label="How we deliver">
        <div className="wrap">
          <SectionHead index="03" label="How we deliver" title={<>Five stages, <span className="serif">agreed up front.</span></>} />
          <div className="mt-16">
            <ProcessTimeline />
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-line bg-white py-24 md:py-32" aria-labelledby="faq-title">
        <div className="wrap grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4">
            <p className="eyebrow">(04) Questions</p>
            <h2 id="faq-title" className="display mt-6 text-[2.6rem] md:text-5xl">
              Pricing and project <span className="serif">questions.</span>
            </h2>
            <p className="mt-6 leading-relaxed text-muted">Something not covered here? Ask us directly.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/enquiry" className="btn btn-primary">
                Request a Quote <span className="arrow" aria-hidden="true">→</span>
              </Link>
              <a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                <WhatsAppIcon /> WhatsApp
              </a>
            </div>
          </div>
          <div className="md:col-span-8">
            <FAQList />
          </div>
        </div>
      </section>

      <ClosingCTA />
    </>
  )
}
