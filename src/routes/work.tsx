import { createFileRoute } from '@tanstack/react-router'
import { seo } from '@/lib/seo'
import { projects } from '@/data/projects'
import { ClosingCTA, WorkShowcase } from '@/components/Sections'

export const Route = createFileRoute('/work')({
  head: () =>
    seo({
      title: 'Portfolio',
      path: '/work',
      description:
        'Websites, e-commerce platforms, web applications and automation projects by Nexora Technologies, with screenshots, live links and documented outcomes.',
    }),
  component: WorkPage,
})

function WorkPage() {
  const industries = [...new Set(projects.map((p) => p.industry))]
  return (
    <>
      <section className="wrap pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="eyebrow rise">Portfolio</p>
            <h1 className="display rise rise-2 mt-6 text-[3rem] md:text-7xl lg:text-[5.75rem]">
              Selected work, <span className="serif text-forest">shown honestly.</span>
            </h1>
          </div>
          <div className="rise rise-3 md:col-span-4 md:self-end">
            <p className="text-lg leading-relaxed text-muted">
              Every project here is real. Each one explains the business, the problem it faced, what we delivered and —
              where it can be verified — the outcome. Internal and demonstration projects are labelled as such.
            </p>
            {industries.length > 0 && (
              <p className="mt-6 text-sm text-ink-soft">{industries.join(' / ')}</p>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-white py-20 md:py-28" aria-label="Projects">
        <div className="wrap">
          <WorkShowcase filterable />
        </div>
      </section>

      <ClosingCTA />
    </>
  )
}
