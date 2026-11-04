import { useState, type FormEvent } from 'react'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { academySeo } from '@/lib/academy-seo'
import { requireSession } from '@/lib/guards'
import { getCourseWorkspace, submitAssignment } from '@/server/fns/student'
import { RouteError } from '@/components/academy/RouteError'
import { Alert, Badge, Field, ProgressBar, formatDate, useAction } from '@/components/academy/ui'

export const Route = createFileRoute('/academy/learn/$slug/')({
  beforeLoad: requireSession,
  loader: ({ params }) => getCourseWorkspace({ data: { slug: params.slug } }),
  head: ({ params }) => academySeo({ title: 'Course', path: `/academy/learn/${params.slug}`, noindex: true }),
  errorComponent: RouteError,
  component: Workspace,
})

const kindLabel: Record<string, string> = { live: 'Live', recorded: 'Recorded', reading: 'Reading' }

function Workspace() {
  const w = Route.useLoaderData()
  const p = w.progress
  const done = new Set(p?.completedLessonIds ?? [])
  const checks = p
    ? [
        ['Required lessons completed', p.checks.lessons, `${p.lessonsDone}/${p.lessonsTotal}`],
        ['Attendance or recorded learning', p.checks.attendance, `${p.attendancePercent}% of ${p.attendanceRequired}% required`],
        ['Overall assessment score', p.checks.score, `${p.overallScore}% of ${p.passMark}% required`],
        ['Final project submitted', p.checks.finalProject, p.finalProjectStatus ?? 'not submitted'],
        ['Completion verified by Nexora', p.checks.verified, p.checks.verified ? formatDate(p.completedAt) : 'pending'],
      ]
    : []
  return (
    <div className="pb-24">
      <section className="border-b border-line bg-white">
        <div className="wrap py-10 md:py-14">
          <Link to="/academy/dashboard" className="text-sm text-muted hover:text-ink">← My dashboard</Link>
          <p className="eyebrow mt-6">Level {w.course.level}</p>
          <h1 className="display mt-3 text-4xl md:text-6xl">{w.course.title}</h1>
          {w.staffPreview && <div className="mt-6"><Alert tone="info">Staff preview — you can view content, but progress is not tracked.</Alert></div>}
          {p && (
            <div className="mt-8 max-w-xl">
              <div className="mb-2 flex justify-between text-sm"><span className="text-muted">Progress</span><span className="tabular-nums font-medium">{p.percent}%</span></div>
              <ProgressBar value={p.percent} />
            </div>
          )}
        </div>
      </section>
      <div className="wrap mt-12 grid gap-14 lg:grid-cols-12">
        <div className="space-y-14 lg:col-span-8">
          <section>
            <h2 className="eyebrow">Lessons</h2>
            <ol className="mt-4 border-t border-ink">
              {w.modules.map((m) => (
                <li key={m.id} className="border-b border-line py-6">
                  <p className="text-sm text-muted">Week {m.week}</p>
                  <h3 className="mt-1 text-xl font-medium">{m.title}</h3>
                  <ul className="mt-4 space-y-1">
                    {m.lessons.map((l) => (
                      <li key={l.id}>
                        <Link to="/academy/learn/$slug/lesson/$lessonId" params={{ slug: w.course.slug, lessonId: String(l.id) }} className="group flex items-center justify-between gap-4 py-2">
                          <span className="flex items-center gap-3">
                            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[0.6rem] ${done.has(l.id) ? 'border-forest bg-forest text-white' : 'border-line'}`} aria-hidden="true">{done.has(l.id) ? '✓' : ''}</span>
                            <span className="group-hover:text-forest">{l.title}</span>
                          </span>
                          <span className="shrink-0 text-xs uppercase tracking-[0.12em] text-muted">{kindLabel[l.kind]}{l.hasVideo ? ' · ▶' : ''}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="eyebrow">Assessments</h2>
            <ul className="mt-4 divide-y divide-line border-y border-ink">
              {w.assessments.map((a) => {
                const r = p?.assessments.find((x) => x.id === a.id)
                return (
                  <li key={a.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{a.title}</p>
                      <p className="text-sm text-muted">{a.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {r?.score != null && <span className="tabular-nums font-medium">{r.score}%</span>}
                      {a.kind === 'quiz' ? (
                        <Link to="/academy/learn/$slug/quiz/$assessmentId" params={{ slug: w.course.slug, assessmentId: String(a.id) }} className="btn btn-ghost !min-h-[2.4rem] text-sm">
                          {r?.attempts ? `Attempts ${r.attempts}/${a.maxAttempts}` : 'Start quiz'}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted">{r?.score != null ? 'Recorded by instructor' : 'Assessed by your instructor'}</span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>

          <section>
            <h2 className="eyebrow">Assignments & final project</h2>
            <ul className="mt-4 space-y-8 border-t border-ink pt-6">
              {w.assignments.map((a) => (
                <AssignmentItem key={a.id} a={a} canSubmit={!!p && !w.staffPreview} />
              ))}
            </ul>
          </section>
        </div>
        <aside className="lg:col-span-4">
          <div className="border-t border-ink pt-6 lg:sticky lg:top-28">
            <h2 className="eyebrow">Completion requirements</h2>
            <ul className="mt-5 space-y-4">
              {checks.map(([label, ok, detail]) => (
                <li key={label as string} className="flex gap-3">
                  <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.65rem] ${ok ? 'bg-forest text-white' : 'border border-line'}`} aria-label={ok ? 'Met' : 'Not yet met'}>{ok ? '✓' : ''}</span>
                  <span><span className="block">{label}</span><span className="text-sm text-muted">{detail}</span></span>
                </li>
              ))}
            </ul>
            {w.certificateNumber && (
              <a href={`/api/academy/certificate/${w.certificateNumber}`} className="btn btn-primary mt-8">Download certificate</a>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

type Assignment = Awaited<ReturnType<typeof getCourseWorkspace>>['assignments'][number]

function AssignmentItem({ a, canSubmit }: { a: Assignment; canSubmit: boolean }) {
  const router = useRouter()
  const s = a.submission
  const [open, setOpen] = useState(!s || s.status === 'returned')
  const { pending, error, run } = useAction()
  const [saved, setSaved] = useState(false)
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const ok = await run(() => submitAssignment({ data: { assignmentId: a.id, content: String(f.get('content') ?? ''), linkUrl: String(f.get('linkUrl') ?? '') } }))
    if (ok) {
      setSaved(true)
      setOpen(false)
      router.invalidate()
    }
  }
  const tone = s?.status === 'approved' ? 'success' : s?.status === 'returned' ? 'failed' : s ? 'pending' : 'locked'
  return (
    <li className="border-b border-line pb-8">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-lg font-medium">{a.title}</h3>
        {a.kind === 'final_project' && <Badge tone="eligible">Final project</Badge>}
        <Badge tone={tone}>{s ? s.status : 'Not submitted'}</Badge>
        {s?.score != null && <span className="tabular-nums text-sm">{s.score}%</span>}
      </div>
      <p className="mt-3 leading-relaxed text-ink-soft">{a.instructions}</p>
      {s?.feedback && <div className="mt-4"><Alert tone="info"><strong className="font-medium">Instructor feedback:</strong> {s.feedback}</Alert></div>}
      {saved && <div className="mt-4"><Alert tone="success">Your work has been submitted for review.</Alert></div>}
      {canSubmit && s?.status !== 'approved' && (
        <>
          {!open && <button type="button" className="link mt-4 text-sm" onClick={() => setOpen(true)}>{s ? 'Edit submission' : 'Submit work'}</button>}
          {open && (
            <form onSubmit={submit} className="mt-5 grid gap-5">
              <Field label="Your work" htmlFor={`a-${a.id}`} hint="Write in your own words. Do not include passwords or anyone’s private personal information.">
                <textarea id={`a-${a.id}`} name="content" rows={7} required minLength={20} maxLength={10000} className="field resize-y" defaultValue={s?.content ?? ''} />
              </Field>
              <Field label="Link (optional)" htmlFor={`al-${a.id}`} hint="A view-only link to a document or slides (https://…).">
                <input id={`al-${a.id}`} name="linkUrl" type="url" pattern="https://.*" className="field" defaultValue={s?.linkUrl ?? ''} />
              </Field>
              {error && <Alert>{error}</Alert>}
              <div><button className="btn btn-primary" disabled={pending}>{pending ? 'Submitting…' : 'Submit for review'}</button></div>
            </form>
          )}
        </>
      )}
    </li>
  )
}
