import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { completionRequirements, seedCourses } from '@/data/academy'
import { img, imgSet } from '@/data/site'
import { academySeo } from '@/lib/academy-seo'
import { getCoursePage } from '@/server/fns/public'
import { CourseAction, availabilityLabel, type CourseSummary } from '@/components/academy/CourseCard'
import { Badge, Price } from '@/components/academy/ui'

type PageData = Omit<NonNullable<Awaited<ReturnType<typeof getCoursePage>>>, 'prerequisite'> & { prerequisite: { slug: string; title: string } | null }

function fallback(slug: string): PageData | null {
  const c = seedCourses.find((x) => x.slug === slug)
  if (!c) return null
  let n = 0
  return {
    course: { id: 0, slug: c.slug, level: c.level, title: c.title, levelLabel: c.levelLabel, summary: c.summary, description: c.description, outcomes: c.outcomes, durationLabel: c.durationLabel, delivery: c.delivery, audience: c.audience, prerequisitesText: c.prerequisitesText, priceKobo: c.priceKobo, status: c.status, image: c.image, passMarkPercent: 60 },
    attendanceRequirementPercent: 75,
    prerequisite: null,
    modules: (c.modules ?? []).map((m) => ({ id: m.week, courseId: 0, week: m.week, title: m.title, summary: m.summary, lessons: m.lessons.map((l) => ({ id: ++n, moduleId: m.week, title: l.title, kind: l.kind, summary: l.summary, durationMinutes: l.durationMinutes ?? null })) })),
    looseLessons: [],
    assessments: [...(c.quizzes ?? []).map((q) => ({ title: q.title, kind: 'quiz' })), ...(c.instructorAssessments ?? []).map((q) => ({ title: q.title, kind: 'instructor' }))],
    assignments: (c.assignments ?? []).map((a) => ({ title: a.title, kind: a.kind })),
    availability: null,
    signedIn: false,
  }
}

export const Route = createFileRoute('/academy/courses/$slug')({
  loader: async ({ params }) => {
    let data: PageData | null
    try {
      data = await getCoursePage({ data: { slug: params.slug } })
    } catch (e) {
      console.error('course page unavailable', e)
      data = fallback(params.slug)
    }
    if (!data) throw notFound()
    return data
  },
  head: ({ loaderData, params }) =>
    academySeo({
      title: loaderData?.course.title ?? 'Course',
      description: loaderData?.course.summary,
      path: `/academy/courses/${params.slug}`,
    }),
  component: CoursePage,
})

const kindLabel: Record<string, string> = { live: 'Live session', recorded: 'Recorded lesson', reading: 'Reading & practice' }

function CoursePage() {
  const d = Route.useLoaderData()
  const c = d.course
  const summary: CourseSummary = { ...c, availability: d.availability }
  const label = availabilityLabel(summary)
  const liveCount = d.modules.reduce((n, m) => n + m.lessons.filter((l) => l.kind === 'live').length, 0)
  const hasCurriculum = d.modules.length > 0
  return (
    <>
      <section className="bg-ink text-paper">
        <div className="wrap grid gap-12 pt-12 pb-16 md:grid-cols-12 md:pt-16 md:pb-24">
          <div className="md:col-span-7">
            <Link to="/academy/courses" className="text-sm text-paper/60 hover:text-signal">
              ← All courses
            </Link>
            <div className="rise mt-8 flex flex-wrap items-center gap-3">
              <Badge tone={label.tone}>{label.text}</Badge>
              <span className="text-xs uppercase tracking-[0.14em] text-paper/60">
                Level {c.level} · {c.levelLabel}
              </span>
            </div>
            <h1 className="display rise rise-2 mt-6 text-[2.9rem] md:text-7xl">{c.title}</h1>
            <p className="rise rise-3 mt-6 max-w-xl text-lg leading-relaxed text-paper/75">{c.summary}</p>
            <div className="rise rise-3 mt-10 flex flex-wrap items-center gap-5">
              <CourseAction c={summary} tone="dark" />
              {c.priceKobo ? (
                <p className="text-2xl font-medium">
                  <Price kobo={c.priceKobo} />
                </p>
              ) : null}
            </div>
          </div>
          {c.image && (
            <div className="rise rise-2 md:col-span-5">
              <div className="aspect-[4/3] overflow-hidden bg-ink-soft">
                <img src={img(c.image, 900)} srcSet={imgSet(c.image, [480, 800, 1200])} sizes="(min-width: 768px) 40vw, 100vw" alt="" className="h-full w-full object-cover" />
              </div>
            </div>
          )}
        </div>
        <dl className="border-t border-line-dark">
          <div className="wrap grid grid-cols-2 gap-6 py-8 text-sm md:grid-cols-5">
            {[
              ['Audience', c.audience ?? '—'],
              ['Duration', c.durationLabel ?? 'To be announced'],
              ['Delivery', c.delivery ?? '—'],
              ['Structure', liveCount ? `${liveCount === 8 ? 'Eight' : liveCount} live sessions` : 'To be announced'],
              ['Price', c.priceKobo ? <Price key="p" kobo={c.priceKobo} /> : 'To be announced'],
            ].map(([k, v]) => (
              <div key={k as string}>
                <dt className="eyebrow !text-paper/50">{k}</dt>
                <dd className="mt-2 leading-snug text-paper">{v}</dd>
              </div>
            ))}
          </div>
        </dl>
      </section>

      <section className="wrap grid gap-12 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-4">
          <p className="eyebrow eyebrow-mark">Overview</p>
        </div>
        <div className="md:col-span-8">
          <p className="text-2xl leading-snug tracking-[-0.01em] md:text-3xl">{c.description}</p>
          <p className="eyebrow mt-14">What you will be able to do</p>
          <ul className="mt-5 grid gap-x-10 gap-y-4 border-t border-ink pt-6 sm:grid-cols-2">
            {c.outcomes.map((o) => (
              <li key={o} className="flex gap-3 leading-relaxed">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forest" aria-hidden="true" />
                {o}
              </li>
            ))}
          </ul>
          <div className="mt-14 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="eyebrow">Prerequisites</p>
              <p className="mt-3 leading-relaxed">{c.prerequisitesText ?? 'None'}</p>
            </div>
            <div>
              <p className="eyebrow">Availability</p>
              <p className="mt-3 leading-relaxed">
                {c.status === 'available' ? 'Open for enrolment.' : 'Locked. Enrolment opens to learners who have completed the previous level, once the course is scheduled.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {hasCurriculum && (
        <section className="border-t border-line bg-white">
          <div className="wrap py-20 md:py-28">
            <div className="grid gap-8 md:grid-cols-12">
              <p className="eyebrow eyebrow-mark md:col-span-4">Curriculum</p>
              <h2 className="display text-4xl md:col-span-8 md:text-6xl">
                Week by week, <span className="serif text-forest">session by session.</span>
              </h2>
            </div>
            <ol className="mt-14 border-t border-ink">
              {d.modules.map((m) => (
                <li key={m.id} className="grid gap-6 border-b border-line py-10 md:grid-cols-12 md:gap-10">
                  <div className="md:col-span-4">
                    <p className="text-sm tabular-nums text-muted">Week {m.week}</p>
                    <h3 className="display mt-2 text-3xl">{m.title}</h3>
                    <p className="mt-3 leading-relaxed text-muted">{m.summary}</p>
                  </div>
                  <ul className="divide-y divide-line md:col-span-8">
                    {m.lessons.map((l) => (
                      <li key={l.id} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                        <div>
                          <p className="font-medium">{l.title}</p>
                          <p className="mt-1 text-sm leading-relaxed text-muted">{l.summary}</p>
                        </div>
                        <p className="shrink-0 text-xs uppercase tracking-[0.12em] text-muted">
                          {kindLabel[l.kind] ?? l.kind}
                          {l.durationMinutes ? ` · ${l.durationMinutes} min` : ''}
                        </p>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
            <div className="mt-14 grid gap-10 md:grid-cols-3">
              <div>
                <p className="eyebrow">Assessments</p>
                <ul className="mt-4 space-y-2">
                  {d.assessments.map((a) => (
                    <li key={a.title} className="leading-relaxed">
                      {a.title} <span className="text-sm text-muted">· {a.kind === 'quiz' ? 'online quiz' : 'instructor assessed'}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="eyebrow">Assignments & final project</p>
                <ul className="mt-4 space-y-2">
                  {d.assignments.map((a) => (
                    <li key={a.title} className="leading-relaxed">
                      {a.title}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="eyebrow">Recorded learning</p>
                <p className="mt-4 leading-relaxed">
                  Every live session is recorded and published to enrolled learners afterwards. Missed a class? Completing the recorded lesson counts towards
                  your attendance requirement.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="wrap grid gap-12 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-5">
          <p className="eyebrow eyebrow-mark">Completion</p>
          <h2 className="display mt-5 text-4xl md:text-5xl">
            What it takes to <span className="serif text-forest">complete.</span>
          </h2>
          <ol className="mt-8 space-y-4 border-t border-ink pt-6">
            {completionRequirements.map((r, i) => (
              <li key={r} className="flex gap-4 leading-relaxed">
                <span className="tick" aria-hidden="true">✓</span>
                {i === 2 ? `Achieve at least ${c.passMarkPercent}% overall across the course assessments.` : r}
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-10 md:col-span-6 md:col-start-7">
          <div className="bg-forest-tint p-8">
            <p className="eyebrow !text-forest">For secondary-school learners</p>
            <p className="mt-4 leading-relaxed">
              Lessons include notes written for younger learners, examples from school subjects, and clear guidance on following school rules about AI. Learners
              under 18 need parent or guardian consent, and are taught never to enter passwords or personal information into AI tools.
            </p>
            <Link to="/academy/safeguarding" className="link mt-5 inline-block text-sm">
              Safeguarding and privacy →
            </Link>
          </div>
          <div className="border-t border-ink pt-6">
            <p className="eyebrow">An honest promise</p>
            <p className="mt-4 leading-relaxed text-ink-soft">
              This course builds practical skills and a real project. It does not guarantee employment, income or admission anywhere. Successful learners
              receive a Nexora Digital Academy certificate of completion, which is not a government or university qualification.
            </p>
          </div>
          <CourseAction c={summary} />
        </div>
      </section>
    </>
  )
}
