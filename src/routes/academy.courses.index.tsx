import { Link, createFileRoute } from '@tanstack/react-router'
import { completionRequirements } from '@/data/academy'
import { academySeo } from '@/lib/academy-seo'
import { loadCatalogue } from '@/lib/academy-catalogue'
import { CourseRow } from '@/components/academy/CourseCard'
import { PageIntro } from '@/components/academy/ui'

export const Route = createFileRoute('/academy/courses/')({
  loader: () => loadCatalogue(),
  head: () =>
    academySeo({
      title: 'Courses',
      path: '/academy/courses',
      description: 'Five progressive levels from AI & Prompt Engineering to Digital Innovation & Project Development. Start with Level 1 — no experience needed.',
    }),
  component: Catalogue,
})

function Catalogue() {
  const { courses } = Route.useLoaderData()
  return (
    <>
      <PageIntro
        eyebrow="Course catalogue"
        title={
          <>
            Five levels, <span className="serif text-forest">built in order.</span>
          </>
        }
        intro="Each level builds on the one before it. Complete a level, have it verified, then enrol in the next. Every course is enrolled and paid for separately."
      />
      <section className="wrap pb-20">
        <ol className="border-t border-ink">
          {courses.map((c) => (
            <CourseRow key={c.slug} c={c} expanded />
          ))}
        </ol>
      </section>
      <section className="border-t border-line bg-white">
        <div className="wrap grid gap-10 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-4">
            <p className="eyebrow">How progression works</p>
            <h2 className="display mt-5 text-4xl md:text-5xl">
              Earn each level. <span className="serif">Then unlock the next.</span>
            </h2>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <p className="text-lg leading-relaxed text-ink-soft">To complete a course and become eligible for the next level you must:</p>
            <ol className="mt-6 space-y-4 border-t border-ink pt-6">
              {completionRequirements.map((r, i) => (
                <li key={r} className="flex gap-5">
                  <span className="text-sm tabular-nums text-muted">0{i + 1}</span>
                  <span className="leading-relaxed">{r}</span>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-sm leading-relaxed text-muted">
              Eligibility does not include free access: each new level is a separate enrolment with its own fee, which is shown here once it has been set.
              Prices for later levels will be published before enrolment opens.
            </p>
            <Link to="/academy/register" className="btn btn-primary mt-8">
              Create your account <span className="arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
