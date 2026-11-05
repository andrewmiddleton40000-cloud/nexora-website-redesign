import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { academySeo } from '@/lib/academy-seo'
import { embedUrl } from '@/lib/video'
import { getPreviewLesson } from '@/server/fns/public'
import { CourseAction } from '@/components/academy/CourseCard'
import { Alert, Price, RichText } from '@/components/academy/ui'

export const Route = createFileRoute('/academy/courses/$slug_/preview/$lessonId')({
  loader: async ({ params }) => {
    const id = Number(params.lessonId)
    if (!Number.isInteger(id) || id <= 0) throw notFound()
    const d = await getPreviewLesson({ data: { slug: params.slug, lessonId: id } })
    if (!d) throw notFound()
    return d
  },
  head: ({ loaderData, params }) =>
    academySeo({
      title: loaderData ? `Free lesson: ${loaderData.lesson.title}` : 'Free lesson',
      description: loaderData?.lesson.summary,
      path: `/academy/courses/${params.slug}/preview/${params.lessonId}`,
    }),
  component: PreviewLesson,
})

function PreviewLesson() {
  const d = Route.useLoaderData()
  const { course: c, lesson: l } = d
  const embed = l.videoUrl ? embedUrl(l.videoUrl) : null
  return (
    <article className="wrap grid gap-12 py-12 md:py-16 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <Link to="/academy/courses/$slug" params={{ slug: c.slug }} className="text-sm text-muted hover:text-ink">
          ← {c.title}
        </Link>
        <p className="eyebrow eyebrow-mark mt-8">Free preview{d.module ? ` · Week ${d.module.week}` : ''}</p>
        <h1 className="display mt-4 text-4xl md:text-5xl">{l.title}</h1>
        <p className="mt-4 text-lg text-muted">{l.summary}</p>
        {l.videoUrl && (
          <div className="mt-10">
            {embed ? (
              <div className="aspect-video bg-ink">
                <iframe src={embed} title={`Recording: ${l.title}`} className="h-full w-full" allow="encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" />
              </div>
            ) : (
              <a href={l.videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Watch the recording ▶
              </a>
            )}
          </div>
        )}
        {!l.videoUrl && l.kind === 'live' && (
          <div className="mt-10">
            <Alert tone="info">This is taught as a live class. Enrolled learners also get the recording afterwards.</Alert>
          </div>
        )}
        <div className="mt-6">
          <RichText text={l.content} />
        </div>
        {l.secondaryNote && (
          <aside className="mt-10 bg-forest-tint p-6">
            <p className="eyebrow !text-forest">For secondary-school learners</p>
            <p className="mt-3 leading-relaxed">{l.secondaryNote}</p>
          </aside>
        )}
      </div>
      <aside className="lg:col-span-4">
        <div className="border-t border-ink pt-6 lg:sticky lg:top-28">
          <p className="eyebrow">Enjoying this lesson?</p>
          <h2 className="display mt-4 text-3xl">{c.title}</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">{c.summary}</p>
          <p className="mt-5 text-sm text-muted">
            Level {c.level} · {c.levelLabel} · {c.durationLabel ?? 'Duration to be announced'}
          </p>
          <p className="mt-2 text-xl font-medium">
            <Price kobo={c.priceKobo} />
          </p>
          <div className="mt-6">
            <CourseAction c={{ ...c, availability: d.availability }} />
          </div>
          {d.otherPreviews.length > 0 && (
            <>
              <p className="eyebrow mt-10">More free lessons</p>
              <ul className="mt-3 space-y-2">
                {d.otherPreviews.map((o) => (
                  <li key={o.id}>
                    <Link to="/academy/courses/$slug/preview/$lessonId" params={{ slug: c.slug, lessonId: String(o.id) }} className="link">
                      {o.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </aside>
    </article>
  )
}
