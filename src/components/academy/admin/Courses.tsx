import { useState, type FormEvent } from 'react'
import { adminCourses, getAssessmentForEdit, getLessonForEdit, saveAssessment, saveAssignment, saveCourse, saveLesson, saveModule } from '@/server/fns/admin'
import { formatNaira } from '@/data/academy'
import { Alert, Badge, useAction } from '../ui'
import { L, Loading, Panel, input, koboFromNaira, smallBtn, smallPrimary, useServerData } from './shared'

type Course = Awaited<ReturnType<typeof adminCourses>>[number]

export function Courses() {
  const { data, error, loading, reload } = useServerData(() => adminCourses())
  const [sel, setSel] = useState<number | 'new' | null>(null)
  const course = typeof sel === 'number' ? data?.find((c) => c.id === sel) : null
  return (
    <div className="grid gap-10 xl:grid-cols-12">
      <div className="xl:col-span-4">
        <Panel title="Courses" actions={<button className={smallPrimary} onClick={() => setSel('new')}>New course</button>}>
          <Loading error={error} loading={loading && !data} />
          <ul className="divide-y divide-line">
            {data?.map((c) => (
              <li key={c.id}>
                <button className={`flex w-full items-center justify-between gap-3 py-3 text-left ${sel === c.id ? 'text-forest' : ''}`} onClick={() => setSel(c.id)}>
                  <span><span className="text-xs text-muted">L{c.level}</span> <span className="font-medium">{c.title}</span><br /><span className="text-xs text-muted">{formatNaira(c.priceKobo) ?? 'No price set'}</span></span>
                  <Badge tone={c.status === 'available' ? 'available' : 'locked'}>{c.status}</Badge>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <div className="space-y-12 xl:col-span-8">
        {sel === 'new' && <CourseForm course={null} all={data ?? []} onDone={() => { setSel(null); reload() }} />}
        {course && (
          <>
            <CourseForm key={`c${course.id}`} course={course} all={data ?? []} onDone={reload} />
            <Curriculum key={`l${course.id}`} course={course} onDone={reload} />
            <Assessments key={`a${course.id}`} course={course} onDone={reload} />
            <Assignments key={`s${course.id}`} course={course} onDone={reload} />
          </>
        )}
        {!sel && <p className="border-t border-ink pt-5 text-sm text-muted">Select a course to edit details, prices, prerequisites, lessons and assessments.</p>}
      </div>
    </div>
  )
}

function CourseForm({ course: c, all, onDone }: { course: Course | null; all: Course[]; onDone: () => void }) {
  const { pending, error, run } = useAction()
  const [saved, setSaved] = useState(false)
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaved(false)
    const f = new FormData(e.currentTarget)
    const g = (k: string) => String(f.get(k) ?? '').trim()
    const price = g('price')
    const priceKobo = price === '' ? null : koboFromNaira(price)
    if (priceKobo !== null && Number.isNaN(priceKobo)) return
    const ok = await run(() =>
      saveCourse({
        data: {
          id: c?.id,
          slug: g('slug'),
          level: Number(g('level')),
          title: g('title'),
          levelLabel: g('levelLabel') as 'Beginner',
          summary: g('summary'),
          description: g('description'),
          outcomes: g('outcomes').split('\n').map((x) => x.trim()).filter(Boolean),
          durationLabel: g('durationLabel') || null,
          delivery: g('delivery') || null,
          audience: g('audience') || null,
          prerequisitesText: g('prerequisitesText') || null,
          prerequisiteCourseId: g('prereq') ? Number(g('prereq')) : null,
          priceKobo,
          status: g('status') as 'available',
          passMarkPercent: Number(g('pass')),
          attendanceRequirementPercent: Number(g('attendance')),
        },
      }),
    )
    if (ok) {
      setSaved(true)
      onDone()
    }
  }
  return (
    <Panel title={c ? `Course details — ${c.title}` : 'New course'}>
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-4">
        <L label="Title" className="md:col-span-2"><input name="title" className={input} required defaultValue={c?.title} /></L>
        <L label="URL slug"><input name="slug" className={input} required pattern="[a-z0-9\-]{3,80}" defaultValue={c?.slug} /></L>
        <L label="Level number"><input name="level" type="number" min={1} className={input} required defaultValue={c?.level ?? (all.length + 1)} /></L>
        <L label="Level label"><select name="levelLabel" className={input} defaultValue={c?.levelLabel ?? 'Beginner'}>{['Beginner', 'Intermediate', 'Advanced'].map((x) => <option key={x}>{x}</option>)}</select></L>
        <L label="Availability"><select name="status" className={input} defaultValue={c?.status ?? 'draft'}>{['available', 'locked', 'draft', 'archived'].map((x) => <option key={x}>{x}</option>)}</select></L>
        <L label="Price (₦) — blank = not set"><input name="price" className={input} inputMode="decimal" defaultValue={c?.priceKobo != null ? String(c.priceKobo / 100) : ''} /></L>
        <L label="Duration"><input name="durationLabel" className={input} defaultValue={c?.durationLabel ?? ''} placeholder="e.g. 4 weeks" /></L>
        <L label="Prerequisite course" className="md:col-span-2">
          <select name="prereq" className={input} defaultValue={c?.prerequisiteCourseId ?? ''}>
            <option value="">None</option>
            {all.filter((x) => x.id !== c?.id).map((x) => <option key={x.id} value={x.id}>L{x.level} — {x.title}</option>)}
          </select>
        </L>
        <L label="Pass mark %"><input name="pass" type="number" min={1} max={100} className={input} defaultValue={c?.passMarkPercent ?? 60} /></L>
        <L label="Attendance req. %"><input name="attendance" type="number" min={0} max={100} className={input} defaultValue={c?.attendanceRequirementPercent ?? 75} /></L>
        <L label="Summary" className="md:col-span-4"><input name="summary" className={input} required defaultValue={c?.summary} /></L>
        <L label="Description" className="md:col-span-4"><textarea name="description" rows={4} className={input} required defaultValue={c?.description} /></L>
        <L label="Learning outcomes (one per line)" className="md:col-span-2"><textarea name="outcomes" rows={5} className={input} defaultValue={c?.outcomes.join('\n')} /></L>
        <div className="grid gap-4 md:col-span-2">
          <L label="Delivery"><input name="delivery" className={input} defaultValue={c?.delivery ?? ''} /></L>
          <L label="Audience"><input name="audience" className={input} defaultValue={c?.audience ?? ''} /></L>
          <L label="Prerequisites (shown to learners)"><input name="prerequisitesText" className={input} defaultValue={c?.prerequisitesText ?? ''} /></L>
        </div>
        {error && <div className="md:col-span-4"><Alert>{error}</Alert></div>}
        {saved && <div className="md:col-span-4"><Alert tone="success">Saved.</Alert></div>}
        <div className="md:col-span-4"><button className={smallPrimary} disabled={pending}>{pending ? 'Saving…' : 'Save course'}</button></div>
      </form>
    </Panel>
  )
}

function Curriculum({ course: c, onDone }: { course: Course; onDone: () => void }) {
  const [editing, setEditing] = useState<number | 'new' | null>(null)
  const mod = useAction()
  return (
    <Panel title="Modules & lessons" actions={<button className={smallPrimary} onClick={() => setEditing('new')}>Add lesson</button>}>
      {editing !== null && <LessonForm course={c} lessonId={editing === 'new' ? null : editing} onDone={() => { setEditing(null); onDone() }} />}
      <ul className="divide-y divide-line text-sm">
        {[...c.modules.map((m) => ({ m, lessons: c.lessons.filter((l) => l.moduleId === m.id) })), { m: null, lessons: c.lessons.filter((l) => !l.moduleId) }].map(({ m, lessons }) =>
          m || lessons.length ? (
            <li key={m?.id ?? 'none'} className="py-4">
              <p className="font-medium">{m ? `Week ${m.week} — ${m.title}` : 'Unassigned lessons'}</p>
              <ul className="mt-2 space-y-1">
                {lessons.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-3">
                    <span><span className="tabular-nums text-muted">{l.sortOrder}.</span> {l.title} <span className="text-xs text-muted">· {l.kind}{l.isLiveSession ? ' · counts for attendance' : ''}{l.hasVideo ? ' · recording' : ''}{!l.published ? ' · hidden' : ''}</span></span>
                    <button className="text-xs underline" onClick={() => setEditing(l.id)}>Edit</button>
                  </li>
                ))}
              </ul>
            </li>
          ) : null,
        )}
      </ul>
      <form
        className="mt-6 flex flex-wrap items-end gap-2 border-t border-line pt-4"
        onSubmit={async (e) => {
          e.preventDefault()
          const form = e.currentTarget
          const f = new FormData(form)
          if (await mod.run(() => saveModule({ data: { courseId: c.id, week: Number(f.get('week')), title: String(f.get('title')), summary: String(f.get('summary') ?? '') } }))) {
            form.reset()
            onDone()
          }
        }}
      >
        <L label="Week"><input name="week" type="number" min={1} className={`${input} w-20`} required /></L>
        <L label="Module title"><input name="title" className={input} required /></L>
        <L label="Summary"><input name="summary" className={input} /></L>
        <button className={smallBtn} disabled={mod.pending}>Add module</button>
        {mod.error && <Alert>{mod.error}</Alert>}
      </form>
    </Panel>
  )
}

function LessonForm({ course: c, lessonId, onDone }: { course: Course; lessonId: number | null; onDone: () => void }) {
  const existing = useServerData(() => (lessonId ? getLessonForEdit({ data: { lessonId } }) : Promise.resolve(null)), [lessonId])
  const { pending, error, run } = useAction()
  if (lessonId && !existing.data) return <Loading error={existing.error} loading />
  const l = existing.data
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const g = (k: string) => String(f.get(k) ?? '').trim()
    const ok = await run(() =>
      saveLesson({
        data: {
          id: lessonId ?? undefined,
          courseId: c.id,
          moduleId: g('moduleId') ? Number(g('moduleId')) : null,
          sortOrder: Number(g('sortOrder')),
          title: g('title'),
          kind: g('kind') as 'live',
          summary: g('summary'),
          content: String(f.get('content') ?? ''),
          secondaryNote: g('secondaryNote') || null,
          videoUrl: g('videoUrl') || null,
          durationMinutes: g('duration') ? Number(g('duration')) : null,
          isRequired: f.get('isRequired') === 'on',
          isLiveSession: f.get('isLiveSession') === 'on',
          published: f.get('published') === 'on',
        },
      }),
    )
    if (ok) onDone()
  }
  const nextOrder = Math.max(0, ...c.lessons.map((x) => x.sortOrder)) + 1
  return (
    <form onSubmit={submit} className="mb-8 grid gap-4 bg-white p-5 md:grid-cols-4">
      <L label="Title" className="md:col-span-2"><input name="title" className={input} required defaultValue={l?.title} /></L>
      <L label="Module"><select name="moduleId" className={input} defaultValue={l?.moduleId ?? ''}><option value="">None</option>{c.modules.map((m) => <option key={m.id} value={m.id}>Week {m.week}</option>)}</select></L>
      <L label="Order"><input name="sortOrder" type="number" min={0} className={input} required defaultValue={l?.sortOrder ?? nextOrder} /></L>
      <L label="Type"><select name="kind" className={input} defaultValue={l?.kind ?? 'reading'}>{['live', 'recorded', 'reading'].map((k) => <option key={k}>{k}</option>)}</select></L>
      <L label="Duration (min)"><input name="duration" type="number" min={0} className={input} defaultValue={l?.durationMinutes ?? ''} /></L>
      <L label="Recording URL (https)" className="md:col-span-2"><input name="videoUrl" type="url" className={input} defaultValue={l?.videoUrl ?? ''} placeholder="YouTube (unlisted), Vimeo or Google Drive link" /></L>
      <L label="Summary" className="md:col-span-4"><input name="summary" className={input} defaultValue={l?.summary} /></L>
      <L label="Lesson content — blank line between paragraphs, “- ” for bullets" className="md:col-span-4"><textarea name="content" rows={10} className={`${input} font-mono`} defaultValue={l?.content} /></L>
      <L label="Note for secondary-school learners" className="md:col-span-4"><textarea name="secondaryNote" rows={2} className={input} defaultValue={l?.secondaryNote ?? ''} /></L>
      <div className="flex flex-wrap gap-5 text-sm md:col-span-4">
        <label className="flex items-center gap-2"><input type="checkbox" name="isRequired" defaultChecked={l?.isRequired ?? true} /> Required for completion</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="isLiveSession" defaultChecked={l?.isLiveSession ?? false} /> Live session (counts towards attendance)</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="published" defaultChecked={l?.published ?? true} /> Published</label>
      </div>
      {error && <div className="md:col-span-4"><Alert>{error}</Alert></div>}
      <div className="flex gap-2 md:col-span-4"><button className={smallPrimary} disabled={pending}>Save lesson</button><button type="button" className={smallBtn} onClick={onDone}>Cancel</button></div>
    </form>
  )
}

/** Quiz text format: question on one line, options below; prefix the correct option with "* " and others with "- ". */
function toText(qs: Array<{ q: string; options: string[]; answer: number }>) {
  return qs.map((q) => [q.q, ...q.options.map((o, i) => `${i === q.answer ? '*' : '-'} ${o}`)].join('\n')).join('\n\n')
}
function fromText(t: string) {
  return t
    .split(/\n\s*\n/)
    .map((b) => b.split('\n').map((l) => l.trim()).filter(Boolean))
    .filter((b) => b.length)
    .map((lines) => {
      const opts = lines.slice(1).filter((l) => /^[-*]\s+/.test(l))
      return { q: lines[0], options: opts.map((o) => o.replace(/^[-*]\s+/, '')), answer: Math.max(0, opts.findIndex((o) => o.startsWith('*'))) }
    })
}

function Assessments({ course: c, onDone }: { course: Course; onDone: () => void }) {
  const [editing, setEditing] = useState<number | 'new' | null>(null)
  return (
    <Panel title="Assessments" actions={<button className={smallPrimary} onClick={() => setEditing('new')}>Create assessment</button>}>
      {editing !== null && <AssessmentForm course={c} assessmentId={editing === 'new' ? null : editing} onDone={() => { setEditing(null); onDone() }} />}
      <ul className="divide-y divide-line text-sm">
        {c.assessments.map((a) => (
          <li key={a.id} className="flex items-center justify-between py-3">
            <span>{a.title} <span className="text-xs text-muted">· {a.kind === 'quiz' ? `${a.questionCount} questions` : 'instructor-scored'} · weight {a.weight}{!a.published ? ' · hidden' : ''}</span></span>
            <button className="text-xs underline" onClick={() => setEditing(a.id)}>Edit</button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">Overall score = weighted average of all published assessments (missing results count as 0).</p>
    </Panel>
  )
}

function AssessmentForm({ course: c, assessmentId, onDone }: { course: Course; assessmentId: number | null; onDone: () => void }) {
  const existing = useServerData(() => (assessmentId ? getAssessmentForEdit({ data: { assessmentId } }) : Promise.resolve(null)), [assessmentId])
  const { pending, error, run } = useAction()
  if (assessmentId && !existing.data) return <Loading error={existing.error} loading />
  const a = existing.data
  return (
    <form
      className="mb-8 grid gap-4 bg-white p-5 md:grid-cols-4"
      onSubmit={async (e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        const g = (k: string) => String(f.get(k) ?? '').trim()
        const kind = g('kind') as 'quiz'
        const ok = await run(() =>
          saveAssessment({ data: { id: assessmentId ?? undefined, courseId: c.id, title: g('title'), description: g('description'), kind, weight: Number(g('weight')), maxAttempts: Number(g('maxAttempts')), sortOrder: Number(g('sortOrder')), published: f.get('published') === 'on', questions: kind === 'quiz' ? fromText(String(f.get('questions') ?? '')) : [] } }),
        )
        if (ok) onDone()
      }}
    >
      <L label="Title" className="md:col-span-2"><input name="title" className={input} required defaultValue={a?.title} /></L>
      <L label="Type"><select name="kind" className={input} defaultValue={a?.kind ?? 'quiz'}><option value="quiz">Auto-marked quiz</option><option value="instructor">Instructor-scored</option></select></L>
      <L label="Order"><input name="sortOrder" type="number" className={input} defaultValue={a?.sortOrder ?? c.assessments.length + 1} /></L>
      <L label="Weight"><input name="weight" type="number" min={0} className={input} defaultValue={a?.weight ?? 1} /></L>
      <L label="Max attempts"><input name="maxAttempts" type="number" min={1} max={10} className={input} defaultValue={a?.maxAttempts ?? 3} /></L>
      <L label="Description" className="md:col-span-2"><input name="description" className={input} defaultValue={a?.description} /></L>
      <L label="Questions (quiz only) — question line, then options; mark the correct one with “* ”, others with “- ”. Blank line between questions." className="md:col-span-4">
        <textarea name="questions" rows={12} className={`${input} font-mono`} defaultValue={a ? toText(a.questions) : 'What does AI stand for?\n* Artificial intelligence\n- Automatic internet'} />
      </L>
      <label className="flex items-center gap-2 text-sm md:col-span-4"><input type="checkbox" name="published" defaultChecked={a?.published ?? true} /> Published</label>
      {error && <div className="md:col-span-4"><Alert>{error}</Alert></div>}
      <div className="flex gap-2 md:col-span-4"><button className={smallPrimary} disabled={pending}>Save assessment</button><button type="button" className={smallBtn} onClick={onDone}>Cancel</button></div>
    </form>
  )
}

function Assignments({ course: c, onDone }: { course: Course; onDone: () => void }) {
  const [editing, setEditing] = useState<Course['assignments'][number] | 'new' | null>(null)
  const { pending, error, run } = useAction()
  const a = editing && editing !== 'new' ? editing : null
  return (
    <Panel title="Assignments & final project" actions={<button className={smallPrimary} onClick={() => setEditing('new')}>Add assignment</button>}>
      {editing && (
        <form
          className="mb-8 grid gap-4 bg-white p-5 md:grid-cols-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            const g = (k: string) => String(f.get(k) ?? '').trim()
            if (await run(() => saveAssignment({ data: { id: a?.id, courseId: c.id, title: g('title'), instructions: g('instructions'), kind: g('kind') as 'assignment', isRequired: f.get('isRequired') === 'on', sortOrder: Number(g('sortOrder')) } }))) {
              setEditing(null)
              onDone()
            }
          }}
        >
          <L label="Title" className="md:col-span-2"><input name="title" className={input} required defaultValue={a?.title} /></L>
          <L label="Type"><select name="kind" className={input} defaultValue={a?.kind ?? 'assignment'}><option value="assignment">Assignment</option><option value="final_project">Final project</option></select></L>
          <L label="Order"><input name="sortOrder" type="number" className={input} defaultValue={a?.sortOrder ?? c.assignments.length + 1} /></L>
          <L label="Instructions" className="md:col-span-4"><textarea name="instructions" rows={4} className={input} required defaultValue={a?.instructions} /></L>
          <label className="flex items-center gap-2 text-sm md:col-span-4"><input type="checkbox" name="isRequired" defaultChecked={a?.isRequired ?? true} /> Required</label>
          {error && <div className="md:col-span-4"><Alert>{error}</Alert></div>}
          <div className="flex gap-2 md:col-span-4"><button className={smallPrimary} disabled={pending}>Save</button><button type="button" className={smallBtn} onClick={() => setEditing(null)}>Cancel</button></div>
        </form>
      )}
      <ul className="divide-y divide-line text-sm">
        {c.assignments.map((x) => (
          <li key={x.id} className="flex items-center justify-between py-3">
            <span>{x.title} <span className="text-xs text-muted">· {x.kind === 'final_project' ? 'final project' : 'assignment'}{x.isRequired ? '' : ' · optional'}</span></span>
            <button className="text-xs underline" onClick={() => setEditing(x)}>Edit</button>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
