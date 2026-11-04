import { useState } from 'react'
import { Link, createFileRoute, notFound, useRouter } from '@tanstack/react-router'
import { academySeo } from '@/lib/academy-seo'
import { requireSession } from '@/lib/guards'
import { completeLesson, getLesson } from '@/server/fns/student'
import { RouteError } from '@/components/academy/RouteError'
import { Alert, RichText, useAction } from '@/components/academy/ui'

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

/** Converts common share links to embeddable players; anything else is shown as a link. */
function embedUrl(url: string) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) return `https://www.youtube-nocookie.com/embed/${u.searchParams.get('v')}`
    if (u.hostname === 'youtu.be') return `https://www.youtube-nocookie.com/embed${u.pathname}`
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop()
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`
    }
    if (u.hostname === 'drive.google.com' && u.pathname.includes('/file/d/')) return url.replace(/\/view.*$/, '/preview')
  } catch {
    /* ignore */
  }
  return null
}

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
      <div className="lg:col-span-8">
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
              <span className="text-forest">✓ Lesson completed</span>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                disabled={pending}
                onClick={async () => {
                  if (await run(() => completeLesson({ data: { lessonId: l.id } }))) {
                    setCompleted(true)
                    router.invalidate()
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
      <aside className="text-sm leading-relaxed text-muted lg:col-span-3 lg:col-start-10">
        <div className="border-t border-ink pt-5">
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
