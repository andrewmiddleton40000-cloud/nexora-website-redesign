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
            <p className="eyebrow eyebrow-mark rise">Portfolio</p>
            <h1 className="display rise rise-2 mt-6 text-[3rem] md:text-7xl lg:text-[5.75rem]">
              Selected work, <span className="serif text-gradient pr-1">shown honestly.</span>
            </h1>
          </div>
          <div className="rise rise-3 md:col-span-4 md:self-end">
            <p className="text-lg leading-relaxed text-muted">
              Every project here is real. Each one explains the business, the problem it faced, what we delivered and —
              where it can be verified — the outcome. Internal and demonstration projects are labelled as such.
            </p>
            {industries.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {industries.map((i) => (
                  <li key={i} className="chip !py-1.5 !text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-forest" aria-hidden="true" />
                    {i}
                  </li>
                ))}
              </ul>
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
