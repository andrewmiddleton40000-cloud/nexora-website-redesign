import { useMemo } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { completionRequirements } from '@/data/academy'
import { academySeo } from '@/lib/academy-seo'
import { loadCatalogue } from '@/lib/academy-catalogue'
import { CourseCard, availabilityLabel } from '@/components/academy/CourseCard'
import { PageIntro } from '@/components/academy/ui'

type Search = { q?: string; subject?: string; level?: string; open?: boolean }

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const

export const Route = createFileRoute('/academy/courses/')({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === 'string' && s.q.trim() ? s.q.slice(0, 80) : undefined,
    subject: typeof s.subject === 'string' && s.subject ? s.subject.slice(0, 80) : undefined,
    level: typeof s.level === 'string' && (LEVELS as readonly string[]).includes(s.level) ? s.level : undefined,
    open: s.open === true || s.open === 'true' ? true : undefined,
  }),
  loader: () => loadCatalogue(),
  head: () =>
    academySeo({
      title: 'Courses',
      path: '/academy/courses',
      description: 'Browse Nexora Digital Academy courses by subject and level, from AI & Prompt Engineering to Digital Innovation & Project Development. Start with Level 1, no experience needed.',
    }),
  component: Catalogue,
})

function Catalogue() {
  const { courses } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const set = (patch: Partial<Search>) => navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false })

  const subjects = useMemo<string[]>(() => [...new Set<string>(courses.map((c) => c.category).filter((x): x is string => !!x))], [courses])
  const levels = LEVELS.filter((l) => courses.some((c) => c.levelLabel === l))

  const results = useMemo(() => {
    const q = search.q?.toLowerCase().trim()
    return courses.filter((c) => {
      if (search.subject && c.category !== search.subject) return false
      if (search.level && c.levelLabel !== search.level) return false
      if (search.open) {
        const tone = availabilityLabel(c).tone
        if (tone === 'locked' || tone === 'pending') return false
      }
      if (q) {
        const hay = [c.title, c.summary, c.category ?? '', ...(c.skills ?? []), ...(c.outcomes ?? [])].join(' ').toLowerCase()
        return q.split(/\s+/).every((w) => hay.includes(w))
      }
      return true
    })
  }, [courses, search])

  const filtered = !!(search.q || search.subject || search.level || search.open)

  return (
    <>
      <PageIntro
        eyebrow="Course catalogue"
        title={
          <>
            Find your course, <span className="serif text-forest">build real skills.</span>
          </>
        }
        intro="Search by topic or skill, or browse by subject and level. Each level builds on the one before it, and every course is enrolled and paid for separately."
      />

      <section className="wrap pb-20 md:pb-28">
        <div className="grid gap-10 lg:grid-cols-12">
          <aside className="lg:col-span-3" aria-label="Filter courses">
            <div className="lg:sticky lg:top-28">
              <label htmlFor="course-search" className="eyebrow">
                Search
              </label>
              <input
                id="course-search"
                type="search"
                className="field mt-3"
                placeholder="e.g. prompts, HTML, automation"
                value={search.q ?? ''}
                onChange={(e) => set({ q: e.target.value || undefined })}
              />

              {subjects.length > 0 && (
                <fieldset className="mt-8">
                  <legend className="eyebrow">Subject</legend>
                  <ul className="mt-3 space-y-1 text-[0.95rem]">
                    <FilterOption active={!search.subject} onClick={() => set({ subject: undefined })} label="All subjects" />
                    {subjects.map((s) => (
                      <FilterOption key={s} active={search.subject === s} onClick={() => set({ subject: s })} label={s} count={courses.filter((c) => c.category === s).length} />
                    ))}
                  </ul>
                </fieldset>
              )}

              <fieldset className="mt-8">
                <legend className="eyebrow">Level</legend>
                <ul className="mt-3 space-y-1 text-[0.95rem]">
                  <FilterOption active={!search.level} onClick={() => set({ level: undefined })} label="All levels" />
                  {levels.map((l) => (
                    <FilterOption key={l} active={search.level === l} onClick={() => set({ level: l })} label={l} count={courses.filter((c) => c.levelLabel === l).length} />
                  ))}
                </ul>
              </fieldset>

              <label className="mt-8 flex cursor-pointer items-center gap-3 text-[0.95rem]">
                <input type="checkbox" className="h-4 w-4 accent-[var(--color-forest)]" checked={!!search.open} onChange={(e) => set({ open: e.target.checked || undefined })} />
                Open for enrolment now
              </label>
            </div>
          </aside>

          <div className="lg:col-span-9">
            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-ink pb-4">
              <p className="text-sm text-muted" aria-live="polite">
                {results.length === courses.length ? `${courses.length} courses` : `${results.length} of ${courses.length} courses`}
              </p>
              {filtered && (
                <Link to="/academy/courses" search={{}} replace resetScroll={false} className="link text-sm">
                  Clear filters
                </Link>
              )}
            </div>
            {results.length ? (
              <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((c) => (
                  <CourseCard key={c.slug} c={c} />
                ))}
              </ul>
            ) : (
              <div className="py-16">
                <p className="display text-3xl">No courses match those filters.</p>
                <p className="mt-3 text-muted">Try a different word, or clear the filters to see every course.</p>
              </div>
            )}
          </div>
        </div>
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
              {completionRequirements.map((r) => (
                <li key={r} className="flex gap-5">
                  <span className="tick" aria-hidden="true">✓</span>
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

function FilterOption({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count?: number }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`flex w-full items-center justify-between gap-3 py-1.5 text-left transition-colors ${active ? 'font-medium text-forest' : 'text-ink-soft hover:text-ink'}`}
      >
        <span className="flex items-center gap-2.5">
          <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-forest' : 'bg-transparent'}`} aria-hidden="true" />
          {label}
        </span>
        {count != null && <span className="tabular-nums text-xs text-muted">{count}</span>}
      </button>
    </li>
  )
}
