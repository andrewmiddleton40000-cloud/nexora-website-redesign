import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { academySeo } from '@/lib/academy-seo'
import { requireSession } from '@/lib/guards'
import { signOut } from '@/lib/auth-client'
import { schoolApproveLearner, schoolDashboard } from '@/server/fns/school'
import { RouteError } from '@/components/academy/RouteError'
import { Alert, Badge, EmptyState, ProgressBar, Stat, formatDate, useAction } from '@/components/academy/ui'

export const Route = createFileRoute('/academy/school/')({
  beforeLoad: requireSession,
  loader: () => schoolDashboard(),
  head: () => academySeo({ title: 'School dashboard', path: '/academy/school', noindex: true }),
  errorComponent: RouteError,
  component: SchoolDashboard,
})

function SchoolDashboard() {
  const d = Route.useLoaderData()
  const router = useRouter()
  const { pending, error, run } = useAction()
  const pendingLearners = d.learners.filter((l) => l.status === 'pending')
  const avg = (k: 'percent' | 'overallScore') => (d.progress.length ? Math.round(d.progress.reduce((s, p) => s + p[k], 0) / d.progress.length) : 0)

  async function decide(userId: number, status: 'approved' | 'rejected') {
    if (await run(() => schoolApproveLearner({ data: { userId, status } }))) router.invalidate()
  }

  return (
    <div className="pb-24">
      <section className="border-b border-line bg-white">
        <div className="wrap flex flex-col gap-6 py-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">School partner dashboard</p>
            <h1 className="display mt-4 text-5xl md:text-6xl">{d.school.name}</h1>
            <p className="mt-3 text-muted">{[d.school.location, d.school.schoolType].filter(Boolean).join(' · ')} · School code <span className="font-mono text-ink">{d.school.code}</span></p>
          </div>
          <div className="flex flex-wrap gap-3">
            {d.canViewReconciliation && <Link to="/academy/school/reconciliation" className="btn btn-ghost">Institutional reconciliation</Link>}
            <button type="button" onClick={() => signOut()} className="btn btn-ghost">Sign out</button>
          </div>
        </div>
      </section>
      <div className="wrap mt-10 space-y-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <Stat label="Registered students" value={d.counts.registered} note={d.counts.pending ? `${d.counts.pending} awaiting confirmation` : undefined} />
          <Stat label="Successful enrolments" value={d.counts.enrolments} />
          <Stat label="Completed" value={d.counts.completed} />
          <Stat label="Active cohorts" value={d.counts.activeCohorts} />
          <Stat label="Average progress" value={`${avg('percent')}%`} />
        </div>

        <section>
          <h2 className="eyebrow">Confirm your students</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">Students who registered with your school code appear here. Confirm only students who belong to your school.</p>
          {error && <div className="mt-4"><Alert>{error}</Alert></div>}
          {pendingLearners.length ? (
            <ul className="mt-4 divide-y divide-line border-y border-ink">
              {pendingLearners.map((l) => (
                <li key={l.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="font-medium">{l.fullName}</p><p className="text-sm text-muted">Registered {formatDate(l.createdAt)}</p></div>
                  <div className="flex gap-2">
                    <button disabled={pending} onClick={() => decide(l.id, 'approved')} className="btn btn-primary !min-h-[2.4rem] text-sm">Confirm</button>
                    <button disabled={pending} onClick={() => decide(l.id, 'rejected')} className="btn btn-ghost !min-h-[2.4rem] text-sm">Not our student</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">No students awaiting confirmation.</p>
          )}
        </section>

        <section>
          <h2 className="eyebrow">Student progress</h2>
          {d.progress.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[40rem] border-y border-ink text-left text-sm">
                <thead className="text-muted"><tr><th className="py-3 font-normal">Student</th><th className="font-normal">Course</th><th className="w-48 font-normal">Progress</th><th className="font-normal">Attendance</th><th className="font-normal">Score</th><th className="font-normal">Status</th></tr></thead>
                <tbody className="divide-y divide-line">
                  {d.progress.map((p) => (
                    <tr key={p.enrolmentId}>
                      <td className="py-3 font-medium">{p.name}</td>
                      <td>{p.courseTitle}</td>
                      <td><div className="flex items-center gap-3"><div className="flex-1"><ProgressBar value={p.percent} /></div><span className="tabular-nums">{p.percent}%</span></div></td>
                      <td className="tabular-nums">{p.attendancePercent}%</td>
                      <td className="tabular-nums">{p.overallScore}%</td>
                      <td><Badge tone={p.status === 'completed' ? 'completed' : 'enrolled'}>{p.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-4"><EmptyState title="No enrolled students yet">Progress appears here once your confirmed students enrol.</EmptyState></div>
          )}
          <p className="mt-4 text-sm text-muted">Completion rate: {d.counts.enrolments ? Math.round((d.counts.completed / d.counts.enrolments) * 100) : 0}% · Average assessment score: {avg('overallScore')}%</p>
        </section>

        <section className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="eyebrow">Cohorts</h2>
            {d.cohorts.length ? (
              <ul className="mt-4 divide-y divide-line border-y border-ink">
                {d.cohorts.map((c) => (
                  <li key={c.id} className="py-4"><p className="font-medium">{c.name}</p><p className="text-sm text-muted">{c.courseTitle} · {c.status} · {formatDate(c.startsOn)} – {formatDate(c.endsOn)}</p></li>
                ))}
              </ul>
            ) : <p className="mt-4 text-sm text-muted">Nexora will create your cohorts after the partnership is confirmed.</p>}
          </div>
          <div>
            <h2 className="eyebrow">Approved academic reports</h2>
            {d.reports.length ? (
              <ul className="mt-4 space-y-6 border-t border-ink pt-4">
                {d.reports.map((r) => (
                  <li key={r.id}>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-sm text-muted">Approved {formatDate(r.approvedAt)}</p>
                    <p className="mt-2 whitespace-pre-line leading-relaxed">{r.summary}</p>
                    <p className="mt-2 text-sm text-muted">{Object.entries(r.stats).map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${v}`).join(' · ')}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-4 text-sm text-muted">No reports published yet.</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
