import { useState } from 'react'
import { Link, createFileRoute, notFound, useRouter } from '@tanstack/react-router'
import { academySeo } from '@/lib/academy-seo'
import { embedUrl } from '@/lib/video'
import { requireSession } from '@/lib/guards'
import { completeLesson, getLesson } from '@/server/fns/student'
import { RouteError } from '@/components/academy/RouteError'
import { Alert, ProgressBar, RichText, useAction } from '@/components/academy/ui'

export const Route = createFileRoute('/academy/learn/$slug/lesson/$lessonId')({
  beforeLoad: requireSession,
  loader: ({ params }) => {
    const id = Number(params.lessonId)
    if (!Number.isInteger(id) || id <= 0) throw notFound()
    return getLesson({ data: { lessonId: id } })
  },
  head: ({ loaderData }) => academySeo({ title: loaderData?.lesson.title ?? 'Lesson', path: '/academy/learn', noindex: true }),
  errorComponent: RouteError,
  component: LessonPage,
})

function LessonPage() {
  const { slug } = Route.useParams()
  const d = Route.useLoaderData()
  const router = useRouter()
  const [completed, setCompleted] = useState(d.completed)
  const { pending, error, run } = useAction()
  const l = d.lesson
  const embed = l.videoUrl ? embedUrl(l.videoUrl) : null
  return (
    <article className="wrap grid gap-12 py-12 md:py-16 lg:grid-cols-12">
      <div className="lg:col-span-8 lg:col-start-5 lg:row-start-1">
        <Link to="/academy/learn/$slug" params={{ slug }} className="text-sm text-muted hover:text-ink">← {d.course.title}</Link>
        {d.module && <p className="eyebrow mt-8">Week {d.module.week} · {d.module.title}</p>}
        <h1 className="display mt-4 text-4xl md:text-5xl">{l.title}</h1>
        <p className="mt-4 text-lg text-muted">{l.summary}</p>

        <div className="mt-10">
          {l.videoUrl ? (
            embed ? (
              <div className="aspect-video bg-ink">
                <iframe src={embed} title={`Recording: ${l.title}`} className="h-full w-full" allow="encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" />
              </div>
            ) : (
              <a href={l.videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Watch the recording ▶</a>
            )
          ) : l.kind !== 'reading' ? (
            <Alert tone="info">{l.isLiveSession ? 'The recording of this live session will appear here after the class.' : 'The recording for this lesson will be published soon.'}</Alert>
          ) : null}
        </div>

        <div className="mt-6"><RichText text={l.content} /></div>

        {l.secondaryNote && (
          <aside className="mt-10 bg-forest-tint p-6">
            <p className="eyebrow !text-forest">For secondary-school learners</p>
            <p className="mt-3 leading-relaxed">{l.secondaryNote}</p>
          </aside>
        )}

        <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-ink pt-8">
          {d.canTrack &&
            (completed ? (
              <>
                <span className="text-forest">✓ Lesson completed</span>
                {d.next && (
                  <Link to="/academy/learn/$slug/lesson/$lessonId" params={{ slug, lessonId: String(d.next.id) }} className="btn btn-primary">
                    Next lesson <span className="arrow" aria-hidden="true">→</span>
                  </Link>
                )}
              </>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                disabled={pending}
                onClick={async () => {
                  if (await run(() => completeLesson({ data: { lessonId: l.id } }))) {
                    setCompleted(true)
                    await router.invalidate()
                  }
                }}
              >
                {pending ? 'Saving…' : l.isLiveSession ? 'I attended / watched the recording' : 'Mark lesson complete'}
              </button>
            ))}
          {error && <Alert>{error}</Alert>}
        </div>
        <nav className="mt-10 flex justify-between gap-6 text-sm" aria-label="Lesson navigation">
          {d.prev ? <Link to="/academy/learn/$slug/lesson/$lessonId" params={{ slug, lessonId: String(d.prev.id) }} className="hover:text-forest">← {d.prev.title}</Link> : <span />}
          {d.next ? <Link to="/academy/learn/$slug/lesson/$lessonId" params={{ slug, lessonId: String(d.next.id) }} className="text-right hover:text-forest">{d.next.title} →</Link> : <span />}
        </nav>
      </div>
      <aside className="lg:col-span-4 lg:row-start-1 lg:col-start-1 lg:pr-4">
        <CourseOutline slug={slug} outline={d.outline} currentId={l.id} justCompleted={completed} />
        <div className="mt-10 border-t border-line pt-5 text-sm leading-relaxed text-muted">
          <p className="eyebrow">Using AI safely</p>
          <ul className="mt-4 list-disc space-y-2 pl-4">
            <li>Never type passwords or personal details into AI tools.</li>
            <li>Check important facts in reliable sources.</li>
            <li>Follow your school’s rules about AI in schoolwork.</li>
          </ul>
        </div>
      </aside>
    </article>
  )
}

type Outline = Awaited<ReturnType<typeof getLesson>>['outline']

/** Coursera-style course outline: every module and lesson, with ticks and the current lesson highlighted. */
function CourseOutline({ slug, outline, currentId, justCompleted }: { slug: string; outline: Outline; currentId: number; justCompleted: boolean }) {
  const current = outline.modules.flatMap((m) => m.lessons).find((x) => x.id === currentId)
  const doneCount = outline.completedCount + (justCompleted && current && !current.done ? 1 : 0)
  const pct = outline.totalCount ? (doneCount / outline.totalCount) * 100 : 0
  return (
    <nav aria-label="Course outline" className="border-t border-ink pt-5 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-muted">Lessons done</span>
        <span className="tabular-nums font-medium">
          {doneCount}/{outline.totalCount}
        </span>
      </div>
      <ProgressBar value={pct} label="Lessons completed" />
      <ol className="mt-6 space-y-6">
        {outline.modules.map((m) => (
          <li key={m.id}>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{m.week ? `Week ${m.week}` : m.title}</p>
            {m.week ? <p className="mt-1 font-medium leading-snug">{m.title}</p> : null}
            <ul className="mt-2 space-y-0.5 text-sm">
              {m.lessons.map((x) => {
                const isCurrent = x.id === currentId
                const done = x.done || (isCurrent && justCompleted)
                return (
                  <li key={x.id}>
                    <Link
                      to="/academy/learn/$slug/lesson/$lessonId"
                      params={{ slug, lessonId: String(x.id) }}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={`flex items-start gap-2.5 py-1.5 pl-2 leading-snug ${isCurrent ? '-ml-px border-l-2 border-forest bg-forest-tint font-medium text-forest' : 'text-ink-soft hover:text-ink'}`}
                    >
                      <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border text-[0.55rem] ${done ? 'border-forest bg-forest text-white' : 'border-line'}`} aria-hidden="true">
                        {done ? '✓' : ''}
                      </span>
                      <span>
                        {x.title}
                        {x.durationMinutes ? <span className="ml-1 text-xs text-muted">{x.durationMinutes} min</span> : null}
                        <span className="sr-only">{done ? ' (completed)' : ''}</span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ol>
    </nav>
  )
}
