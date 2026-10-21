import { Link, createFileRoute } from '@tanstack/react-router'
import { img, imgSet } from '@/data/site'
import { seo } from '@/lib/seo'
import {
  AudienceList,
  Benefits,
  CategoryIndex,
  ClosingCTA,
  PackageGrid,
  ProcessTimeline,
  SectionHead,
  WorkShowcase,
} from '@/components/Sections'

export const Route = createFileRoute('/')({
  head: () => seo({ path: '/' }),
  component: Home,
})

function Home() {
  return (
    <>
      {/* Hero — left-aligned headline with offset photograph */}
      <section className="relative overflow-hidden" aria-labelledby="hero-title">
        <div className="wrap grid gap-10 pt-10 pb-16 md:pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-24">
          <div className="lg:col-span-7 lg:pt-10">
            <p className="eyebrow rise">Websites · E-commerce · AI and automation</p>
            <h1 id="hero-title" className="display rise rise-2 mt-6 text-[3.1rem] sm:text-7xl xl:text-[6.4rem]">
              Better digital systems.{' '}
              <span className="serif text-forest">Built around</span> your business.
            </h1>
            <div className="rise rise-3 mt-8 grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end lg:max-w-[38rem] lg:grid-cols-1">
              <p className="text-lg leading-relaxed text-ink-soft md:text-xl">
                Nexora Technologies designs and builds professional websites, online stores, web applications and AI-powered
                automation for businesses in Nigeria and beyond — with published starting prices and written proposals.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/enquiry" className="btn btn-primary">
                  Request a Proposal <span className="arrow" aria-hidden="true">→</span>
                </Link>
                <Link to="/services" className="btn btn-ghost">
                  Services and Pricing
                </Link>
              </div>
            </div>
          </div>

          <figure className="relative lg:col-span-5 lg:-mr-[max(2.5rem,calc((100vw_-_84rem)/2_+_2.5rem))]">
            <div className="aspect-[4/5] overflow-hidden bg-paper-deep sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[38rem]">
              <img
                src={img('hero.jpg', 1200)}
                srcSet={imgSet('hero.jpg', [640, 960, 1280, 1376])}
                sizes="(min-width: 1024px) 45vw, 100vw"
                alt="A business owner reviewing orders on a laptop at the wooden counter of her fabric shop"
                fetchPriority="high"
                className="h-full w-full object-cover object-[72%_50%]"
              />
            </div>
            <figcaption className="absolute bottom-0 left-0 max-w-[16rem] bg-paper px-5 py-4 text-sm leading-snug">
              <span className="block eyebrow !text-[0.65rem] mb-1">Where we start</span>
              The daily work of running a business — orders, customers, follow-ups.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Positioning */}
      <section className="border-y border-line bg-white" aria-labelledby="approach-title">
        <div className="wrap grid gap-10 py-20 md:grid-cols-12 md:py-28">
          <p className="eyebrow md:col-span-3 md:pt-3">(01) Our approach</p>
          <div className="md:col-span-9">
            <h2 id="approach-title" className="display text-[2.6rem] md:text-6xl">
              Technology should make business <span className="serif">easier.</span>
            </h2>
            <div className="mt-10 grid gap-10 md:grid-cols-2">
              <p className="text-xl leading-relaxed text-ink-soft">
                We focus on practical solutions that solve operational problems, improve customer experiences, and
                support measurable business goals.
              </p>
              <div>
                <p className="eyebrow">Who we work with</p>
                <div className="mt-4">
                  <AudienceList />
                </div>
                <p className="mt-5 text-sm text-muted">Serving businesses in Nigeria and other emerging markets.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 md:py-32" aria-label="Services">
        <div className="wrap">
          <SectionHead
            index="02"
            label="Services"
            title={<>Four areas of work, <span className="serif">one accountable partner.</span></>}
            intro="Each engagement is shaped around a business outcome — not a list of features. Every service has a published starting price."
          />
          <div className="mt-16">
            <CategoryIndex />
          </div>
          <Link to="/services" hash="pricing" className="link mt-10 inline-block">
            See all services and prices →
          </Link>
        </div>
      </section>

      {/* Packages */}
      <section className="border-t border-line bg-paper-deep/50 py-24 md:py-32" aria-label="Website packages">
        <div className="wrap">
          <SectionHead
            index="03"
            label="Website packages"
            title={<>Start with a landing page. <span className="serif">Grow from there.</span></>}
            intro="Four clearly defined website packages. Additional functionality is scoped and priced separately."
          />
          <div className="mt-16">
            <PackageGrid />
          </div>
        </div>
      </section>

      {/* Selected work */}
      <section className="border-t border-line bg-white py-24 md:py-32" aria-label="Selected work">
        <div className="wrap">
          <SectionHead
            index="04"
            label="Featured work"
            title={<>Work that solves <span className="serif">real problems.</span></>}
          />
          <div className="mt-16">
            <WorkShowcase limit={4} />
          </div>
          <Link to="/work" className="link mt-12 inline-block">
            View the portfolio →
          </Link>
        </div>
      </section>

      {/* Business benefits — dark */}
      <section className="bg-ink text-paper py-24 md:py-32" aria-label="Why Nexora">
        <div className="wrap">
          <SectionHead
            tone="dark"
            index="05"
            label="Why Nexora"
            title={<>What good technology should <span className="serif text-signal">do for your business.</span></>}
            intro="Before we recommend a platform, a plugin or an AI tool, we want to know how your business actually runs."
          />
          <div className="mt-16">
            <Benefits tone="dark" />
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 md:py-32" aria-label="Our process">
        <div className="wrap">
          <SectionHead
            index="06"
            label="Process"
            title={<>A clear path from <span className="serif">first conversation</span> to finished work.</>}
          />
          <div className="mt-16 md:mt-20">
            <ProcessTimeline />
          </div>
        </div>
      </section>

      {/* About — image-led */}
      <section className="border-t border-line bg-white" aria-labelledby="about-title">
        <div className="grid lg:grid-cols-2">
          <div className="aspect-[4/3] overflow-hidden bg-paper-deep lg:aspect-auto">
            <img
              src={img('workspace.jpg', 1200)}
              srcSet={imgSet('workspace.jpg', [640, 960, 1280, 1408])}
              sizes="(min-width: 1024px) 50vw, 100vw"
              alt="Two people pointing at website wireframe sketches and sticky notes on a planning table"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="px-5 py-20 md:px-16 md:py-28 lg:px-20">
            <p className="eyebrow">(07) About Nexora</p>
            <h2 id="about-title" className="display mt-6 text-[2.4rem] md:text-5xl">
              Your business has goals. <span className="serif text-forest">Our job is to help technology support them.</span>
            </h2>
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-ink-soft">
              Nexora Technologies is a digital solutions partner for small and medium-sized businesses. We bring together
              website development, automation and practical business technology so owners can spend less time on
              repetitive work and more time on customers and growth.
            </p>
            <Link to="/about" className="link mt-8 inline-block">
              More about how we work →
            </Link>
          </div>
        </div>
      </section>

      <ClosingCTA />
    </>
  )
}
