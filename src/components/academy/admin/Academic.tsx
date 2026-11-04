import { useState } from 'react'
import { academicData, approveCompletion, assignCohort, markAttendance, recordAssessment, revokeCertificate, reviewSubmission, saveCohort, saveLiveSession, saveSchoolReport } from '@/server/fns/academic'
import { adminCourses, listSchools, listStaff } from '@/server/fns/admin'
import { Alert, Badge, formatDate, useAction } from '../ui'
import { L, Loading, Panel, Table, input, smallBtn, smallPrimary, td, useServerData } from './shared'

type Data = Awaited<ReturnType<typeof academicData>>

export function Academic() {
  const { data: d, error, loading, reload } = useServerData(() => academicData())
  const act = useAction()
  if (!d) return <Loading error={error} loading={loading} />
  const run = async (fn: () => Promise<unknown>) => {
    if (await act.run(fn)) reload()
  }
  return (
    <div className="space-y-14">
      {act.error && <Alert>{act.error}</Alert>}
      <Cohorts d={d} reload={reload} />
      <Attendance d={d} run={run} pending={act.pending} />
      <Submissions d={d} run={run} pending={act.pending} />
      <Learners d={d} run={run} pending={act.pending} />
      {d.canManage && <Reports d={d} reload={reload} />}
    </div>
  )
}

function Cohorts({ d, reload }: { d: Data; reload: () => void }) {
  const [open, setOpen] = useState(false)
  const [sessionFor, setSessionFor] = useState<number | null>(null)
  return (
    <Panel title="Cohorts & live classes" actions={d.canManage && <button className={smallPrimary} onClick={() => setOpen((v) => !v)}>{open ? 'Close' : 'Create cohort'}</button>}>
      {open && <CohortForm onDone={() => { setOpen(false); reload() }} />}
      {d.cohorts.length === 0 && <p className="text-sm text-muted">{d.canManage ? 'No cohorts yet.' : 'You have not been assigned to a cohort yet.'}</p>}
      <ul className="divide-y divide-line">
        {d.cohorts.map((c) => {
          const sessions = d.sessions.filter((s) => s.cohortId === c.id)
          return (
            <li key={c.id} className="py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="font-medium">{c.name} <span className="text-sm font-normal text-muted">· {c.courseTitle}{c.schoolName ? ` · ${c.schoolName}` : ''} · instructor {c.instructorName ?? 'unassigned'}</span></p>
                <Badge tone={c.status === 'running' ? 'enrolled' : 'pending'}>{c.status}</Badge>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {sessions.map((s) => <li key={s.id}>{formatDate(s.startsAt, true)} — {s.title} {s.meetingUrl ? <span className="text-xs text-forest">· link set</span> : <span className="text-xs text-muted">· no link yet</span>}</li>)}
              </ul>
              <button className="link mt-2 text-xs" onClick={() => setSessionFor(sessionFor === c.id ? null : c.id)}>Schedule live session</button>
              {sessionFor === c.id && <SessionForm cohortId={c.id} courseId={c.courseId} onDone={() => { setSessionFor(null); reload() }} />}
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

function CohortForm({ onDone }: { onDone: () => void }) {
  const courses = useServerData(() => adminCourses())
  const schools = useServerData(() => listSchools())
  const staff = useServerData(() => listStaff())
  const { pending, error, run } = useAction()
  return (
    <form
      className="mb-6 grid gap-3 bg-white p-5 md:grid-cols-4"
      onSubmit={async (e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        const g = (k: string) => String(f.get(k) ?? '')
        if (await run(() => saveCohort({ data: { courseId: Number(g('courseId')), name: g('name'), schoolId: g('schoolId') ? Number(g('schoolId')) : null, instructorId: g('instructorId') ? Number(g('instructorId')) : null, startsOn: g('startsOn') || null, endsOn: g('endsOn') || null, status: g('status') as 'planned' } }))) onDone()
      }}
    >
      <L label="Name"><input name="name" className={input} required placeholder="e.g. Level 1 — Jan 2027 — Greenfield" /></L>
      <L label="Course"><select name="courseId" className={input} required>{courses.data?.map((c) => <option key={c.id} value={c.id}>L{c.level} {c.title}</option>)}</select></L>
      <L label="Partner school (optional)"><select name="schoolId" className={input}><option value="">Open cohort</option>{schools.data?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></L>
      <L label="Instructor"><select name="instructorId" className={input}><option value="">Unassigned</option>{staff.data?.map((s) => <option key={s.id} value={s.id}>{s.fullName} ({s.role})</option>)}</select></L>
      <L label="Starts"><input name="startsOn" type="date" className={input} /></L>
      <L label="Ends"><input name="endsOn" type="date" className={input} /></L>
      <L label="Status"><select name="status" className={input}>{['planned', 'running', 'finished'].map((s) => <option key={s}>{s}</option>)}</select></L>
      <div className="flex items-end"><button className={smallPrimary} disabled={pending}>Save cohort</button></div>
      {error && <div className="md:col-span-4"><Alert>{error}</Alert></div>}
    </form>
  )
}

function SessionForm({ cohortId, courseId, onDone }: { cohortId: number; courseId: number; onDone: () => void }) {
  const courses = useServerData(() => adminCourses().catch(() => []))
  const lessons = courses.data?.find((c) => c.id === courseId)?.lessons.filter((l) => l.isLiveSession) ?? []
  const { pending, error, run } = useAction()
  return (
    <form
      className="mt-3 grid gap-3 bg-white p-4 md:grid-cols-5"
      onSubmit={async (e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        const g = (k: string) => String(f.get(k) ?? '')
        if (await run(() => saveLiveSession({ data: { cohortId, lessonId: g('lessonId') ? Number(g('lessonId')) : null, title: g('title'), startsAt: new Date(g('startsAt')).toISOString(), durationMinutes: Number(g('duration')), meetingUrl: g('meetingUrl') } }))) onDone()
      }}
    >
      <L label="Title"><input name="title" className={input} required /></L>
      <L label="Linked lesson"><select name="lessonId" className={input}><option value="">None</option>{lessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}</select></L>
      <L label="Date & time"><input name="startsAt" type="datetime-local" className={input} required /></L>
      <L label="Minutes"><input name="duration" type="number" min={10} defaultValue={60} className={input} /></L>
      <L label="Meeting link (https)"><input name="meetingUrl" type="url" className={input} /></L>
      <div className="md:col-span-5"><button className={smallPrimary} disabled={pending}>Add session</button></div>
      {error && <div className="md:col-span-5"><Alert>{error}</Alert></div>}
      <p className="text-xs text-muted md:col-span-5">Link the session to its course lesson so attendance counts towards that lesson’s requirement. Meeting links are shown only to enrolled learners in this cohort.</p>
    </form>
  )
}

function Attendance({ d, run, pending }: { d: Data; run: (fn: () => Promise<unknown>) => void; pending: boolean }) {
  const [sid, setSid] = useState<number | null>(null)
  const session = d.sessions.find((s) => s.id === sid)
  const learners = session ? d.learners.filter((l) => l.cohortId === session.cohortId) : []
  return (
    <Panel title="Attendance">
      <select className={`${input} max-w-md`} value={sid ?? ''} onChange={(e) => setSid(e.target.value ? Number(e.target.value) : null)} aria-label="Choose a live session">
        <option value="">Choose a live session…</option>
        {d.sessions.map((s) => <option key={s.id} value={s.id}>{formatDate(s.startsAt, true)} — {s.title} ({d.cohorts.find((c) => c.id === s.cohortId)?.name})</option>)}
      </select>
      {session && (
        <ul className="mt-4 divide-y divide-line text-sm">
          {learners.map((l) => {
            const cur = d.attendance.find((a) => a.liveSessionId === session.id && a.enrolmentId === l.enrolmentId)?.status
            return (
              <li key={l.enrolmentId} className="flex items-center justify-between gap-3 py-2">
                <span>{l.name}</span>
                <span className="flex gap-1">
                  {(['present', 'absent', 'excused'] as const).map((st) => (
                    <button key={st} disabled={pending} onClick={() => run(() => markAttendance({ data: { liveSessionId: session.id, enrolmentId: l.enrolmentId, status: st } }))} className={cur === st ? smallPrimary : smallBtn}>{st}</button>
                  ))}
                </span>
              </li>
            )
          })}
          {!learners.length && <li className="py-2 text-muted">No learners assigned to this cohort.</li>}
        </ul>
      )}
    </Panel>
  )
}

function Submissions({ d, run, pending }: { d: Data; run: (fn: () => Promise<unknown>) => void; pending: boolean }) {
  const [filter, setFilter] = useState<'submitted' | 'all'>('submitted')
  const list = d.submissions.filter((s) => filter === 'all' || s.status === 'submitted')
  return (
    <Panel title="Assignment review" actions={<select className={`${input} w-auto`} value={filter} onChange={(e) => setFilter(e.target.value as 'all')}><option value="submitted">Awaiting review</option><option value="all">All submissions</option></select>}>
      {!list.length && <p className="text-sm text-muted">Nothing to review.</p>}
      <ul className="space-y-6">
        {list.map((s) => (
          <li key={s.id} className="border border-line bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <p><span className="font-medium">{s.name}</span> · {s.title} {s.kind === 'final_project' && <Badge tone="eligible">Final project</Badge>}</p>
              <span className="text-muted">{formatDate(s.submittedAt, true)} · {s.status}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{s.content}</p>
            {s.linkUrl && <a href={s.linkUrl} target="_blank" rel="noopener noreferrer nofollow" className="link mt-2 inline-block text-sm">{s.linkUrl}</a>}
            <form
              className="mt-4 grid gap-2 md:grid-cols-6"
              onSubmit={(e) => {
                e.preventDefault()
                const f = new FormData(e.currentTarget)
                const status = (e.nativeEvent as SubmitEvent).submitter?.getAttribute('value') as 'approved' | 'returned'
                run(() => reviewSubmission({ data: { submissionId: s.id, status, score: f.get('score') ? Number(f.get('score')) : null, feedback: String(f.get('feedback') ?? '') } }))
              }}
            >
              <input name="score" type="number" min={0} max={100} placeholder="Score %" className={input} defaultValue={s.score ?? ''} aria-label="Score" />
              <input name="feedback" className={`${input} md:col-span-3`} placeholder="Feedback for the learner" defaultValue={s.feedback ?? ''} aria-label="Feedback" />
              <button name="status" value="approved" className={smallPrimary} disabled={pending}>Approve</button>
              <button name="status" value="returned" className={smallBtn} disabled={pending}>Return for changes</button>
            </form>
            <p className="mt-2 text-xs text-muted">Return any submission containing personal information or inappropriate content, with a note explaining why.</p>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

function Learners({ d, run, pending }: { d: Data; run: (fn: () => Promise<unknown>) => void; pending: boolean }) {
  const [scoreFor, setScoreFor] = useState<number | null>(null)
  return (
    <Panel title="Learners, assessments & completion">
      <Table head={['Learner', 'Cohort', 'Lessons', 'Attend.', 'Score', 'Project', 'Completion', '']} min="60rem">
        {d.learners.map((l) => {
          const p = l.progress
          const cohorts = d.cohorts.filter((c) => c.courseId === l.courseId)
          const ias = d.instructorAssessments.filter((a) => a.courseId === l.courseId)
          return (
            <tr key={l.enrolmentId}>
              <td className={td}><span className="font-medium">{l.name}</span><br /><span className="text-xs text-muted">{l.courseTitle}</span></td>
              <td className={td}>
                {d.canManage ? (
                  <select className={input} value={l.cohortId ?? ''} disabled={pending} onChange={(e) => run(() => assignCohort({ data: { enrolmentId: l.enrolmentId, cohortId: e.target.value ? Number(e.target.value) : null } }))} aria-label="Cohort">
                    <option value="">None</option>
                    {cohorts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                ) : d.cohorts.find((c) => c.id === l.cohortId)?.name}
              </td>
              <td className={`${td} tabular-nums`}>{p.lessonsDone}/{p.lessonsTotal}</td>
              <td className={`${td} tabular-nums ${p.checks.attendance ? '' : 'text-[#8a3520]'}`}>{p.attendancePercent}%</td>
              <td className={`${td} tabular-nums ${p.checks.score ? '' : 'text-[#8a3520]'}`}>{p.overallScore}%</td>
              <td className={td}>{p.finalProjectStatus ?? '—'}</td>
              <td className={td}>
                {l.certificate ? (
                  <span className="text-xs">✓ {l.certificate.number}{l.certificate.revokedAt ? ' (revoked)' : ''}</span>
                ) : p.readyForVerification ? <Badge tone="eligible">Ready</Badge> : <span className="text-xs text-muted">In progress</span>}
              </td>
              <td className={`${td} space-y-1 whitespace-nowrap`}>
                {ias.length > 0 && <button className={smallBtn} onClick={() => setScoreFor(scoreFor === l.enrolmentId ? null : l.enrolmentId)}>Record score</button>}
                {scoreFor === l.enrolmentId && (
                  <form
                    className="mt-1 flex gap-1"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const f = new FormData(e.currentTarget)
                      run(() => recordAssessment({ data: { assessmentId: Number(f.get('a')), enrolmentId: l.enrolmentId, scorePercent: Number(f.get('score')), note: '' } }))
                      setScoreFor(null)
                    }}
                  >
                    <select name="a" className={input} aria-label="Assessment">{ias.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}</select>
                    <input name="score" type="number" min={0} max={100} required className={`${input} w-20`} placeholder="%" aria-label="Score percent" />
                    <button className={smallPrimary}>Save</button>
                  </form>
                )}
                {d.canManage && !l.certificate && (
                  <button className={smallPrimary} disabled={pending || !p.readyForVerification} title={p.readyForVerification ? '' : 'All requirements must be met first'} onClick={() => confirm(`Verify completion for ${l.name} and issue a certificate?`) && run(() => approveCompletion({ data: { enrolmentId: l.enrolmentId } }))}>
                    Approve completion
                  </button>
                )}
                {d.canManage && l.certificate && !l.certificate.revokedAt && (
                  <>
                    <a className={smallBtn} href={`/api/academy/certificate/${l.certificate.number}`}>PDF</a>{' '}
                    <button className={smallBtn} disabled={pending} onClick={() => confirm('Revoke this certificate?') && run(() => revokeCertificate({ data: { number: l.certificate!.number } }))}>Revoke</button>
                  </>
                )}
              </td>
            </tr>
          )
        })}
      </Table>
      {!d.learners.length && <p className="mt-3 text-sm text-muted">No enrolled learners yet.</p>}
    </Panel>
  )
}

function Reports({ d, reload }: { d: Data; reload: () => void }) {
  const schools = useServerData(() => listSchools())
  const { pending, error, run } = useAction()
  const [done, setDone] = useState(false)
  return (
    <Panel title="Publish an academic report to a school">
      <form
        className="grid gap-3 md:grid-cols-4"
        onSubmit={async (e) => {
          e.preventDefault()
          const form = e.currentTarget
          const f = new FormData(form)
          const g = (k: string) => String(f.get(k) ?? '')
          if (await run(() => saveSchoolReport({ data: { schoolId: Number(g('schoolId')), cohortId: g('cohortId') ? Number(g('cohortId')) : null, title: g('title'), summary: g('summary') } }))) {
            form.reset()
            setDone(true)
            reload()
          }
        }}
      >
        <L label="School"><select name="schoolId" className={input} required>{schools.data?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></L>
        <L label="Cohort (optional)"><select name="cohortId" className={input}><option value="">All cohorts</option>{d.cohorts.filter((c) => c.schoolId).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></L>
        <L label="Title" className="md:col-span-2"><input name="title" className={input} required /></L>
        <L label="Summary" className="md:col-span-4"><textarea name="summary" rows={3} className={input} required minLength={10} /></L>
        <p className="text-xs text-muted md:col-span-3">Learner counts, completion and average progress/score are calculated automatically. Reports never include financial information.</p>
        <button className={smallPrimary} disabled={pending}>Approve & publish</button>
        {error && <div className="md:col-span-4"><Alert>{error}</Alert></div>}
        {done && <div className="md:col-span-4"><Alert tone="success">Report published to the school dashboard.</Alert></div>}
      </form>
    </Panel>
  )
}
