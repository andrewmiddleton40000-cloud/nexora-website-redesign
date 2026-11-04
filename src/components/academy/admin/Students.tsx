import { useState } from 'react'
import { getStudent, listStudents, setGuardianConsent, setSchoolLink, setUserRole } from '@/server/fns/admin'
import { ROLES, roleLabels, type Role } from '@/lib/roles'
import { Alert, Badge, ProgressBar, formatDate, useAction } from '../ui'
import { L, Loading, Panel, Table, input, smallBtn, smallPrimary, td, useServerData } from './shared'

export function Students({ role }: { role: Role }) {
  const [q, setQ] = useState('')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<number | null>(null)
  const list = useServerData(() => listStudents({ data: { q: query || undefined } }), [query])
  return (
    <div className="grid gap-10 xl:grid-cols-12">
      <div className="xl:col-span-7">
        <Panel
          title="Users"
          actions={
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setQuery(q) }}>
              <input className={input} placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search users" />
              <button className={smallBtn}>Search</button>
            </form>
          }
        >
          <Loading error={list.error} loading={list.loading && !list.data} />
          {list.data && (
            <Table head={['Name', 'Role', 'School', 'Age', 'Consent', 'Joined']}>
              {list.data.map((u) => (
                <tr key={u.id} className={`cursor-pointer hover:bg-white ${selected === u.id ? 'bg-white' : ''}`} onClick={() => setSelected(u.id)}>
                  <td className={td}><span className="font-medium">{u.fullName}</span><br /><span className="text-xs text-muted">{u.email}</span></td>
                  <td className={td}>{roleLabels[u.role as Role] ?? u.role}</td>
                  <td className={td}>{u.schoolName ? <>{u.schoolName}<br /><span className="text-xs text-muted">{u.schoolLinkStatus}</span></> : '—'}</td>
                  <td className={td}>{u.ageGroup === 'under_18' ? 'Under 18' : u.ageGroup === 'adult' ? 'Adult' : '—'}</td>
                  <td className={td}>{u.ageGroup === 'under_18' ? <Badge tone={u.consent === 'verified' ? 'success' : u.consent === 'rejected' ? 'failed' : 'pending'}>{u.consent ?? 'missing'}</Badge> : '—'}</td>
                  <td className={td}>{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>
      </div>
      <div className="xl:col-span-5">{selected ? <StudentDetail key={selected} userId={selected} role={role} onChange={list.reload} /> : <p className="border-t border-ink pt-5 text-sm text-muted">Select a user to see their profile, enrolments and progress.</p>}</div>
    </div>
  )
}

function StudentDetail({ userId, role, onChange }: { userId: number; role: Role; onChange: () => void }) {
  const { data: d, error, loading, reload } = useServerData(() => getStudent({ data: { userId } }), [userId])
  const act = useAction()
  const [newRole, setNewRole] = useState<string>('')
  if (!d) return <Loading error={error} loading={loading} />
  const done = async (fn: () => Promise<unknown>) => {
    if (await act.run(fn)) {
      reload()
      onChange()
    }
  }
  const p = d.profile
  return (
    <div className="space-y-8 xl:sticky xl:top-28">
      <Panel title={p.fullName}>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-muted">Email</dt><dd className="break-all">{p.email}</dd></div>
          <div><dt className="text-muted">Phone</dt><dd>{p.phone ?? '—'}</dd></div>
          <div><dt className="text-muted">Country</dt><dd>{p.country ?? '—'}</dd></div>
          <div><dt className="text-muted">Role</dt><dd>{roleLabels[p.role as Role]} · {p.status}</dd></div>
          <div><dt className="text-muted">Intended course</dt><dd>{p.intendedCourse ?? '—'}</dd></div>
          <div><dt className="text-muted">School</dt><dd>{d.school ? `${d.school.name} (${d.school.code}) · ${p.schoolLinkStatus}` : p.schoolNameOther ?? '—'}</dd></div>
        </dl>
        {act.error && <div className="mt-4"><Alert>{act.error}</Alert></div>}
        {d.school && p.schoolLinkStatus !== 'approved' && (
          <div className="mt-4 flex gap-2">
            <button className={smallPrimary} disabled={act.pending} onClick={() => done(() => setSchoolLink({ data: { userId, status: 'approved' } }))}>Confirm school attribution</button>
            {p.schoolLinkStatus !== 'rejected' && <button className={smallBtn} disabled={act.pending} onClick={() => done(() => setSchoolLink({ data: { userId, status: 'rejected' } }))}>Reject</button>}
          </div>
        )}
        {role === 'super_admin' && (
          <div className="mt-6 flex flex-wrap items-end gap-2">
            <L label="Change role">
              <select className={input} value={newRole || p.role} onChange={(e) => setNewRole(e.target.value)}>
                {ROLES.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
              </select>
            </L>
            <button className={smallPrimary} disabled={act.pending || !newRole || newRole === p.role} onClick={() => done(() => setUserRole({ data: { userId, role: newRole as Role } }))}>Save role</button>
            <button className={smallBtn} disabled={act.pending} onClick={() => done(() => setUserRole({ data: { userId, role: p.role as Role, status: p.status === 'active' ? 'suspended' : 'active' } }))}>{p.status === 'active' ? 'Suspend account' : 'Reactivate'}</button>
          </div>
        )}
      </Panel>

      {p.ageGroup === 'under_18' && (
        <Panel title="Parent / guardian consent">
          {d.guardian ? (
            <>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div><dt className="text-muted">Name</dt><dd>{d.guardian.guardianName} ({d.guardian.relationship})</dd></div>
                <div><dt className="text-muted">Phone</dt><dd>{d.guardian.guardianPhone}</dd></div>
                <div><dt className="text-muted">Email</dt><dd className="break-all">{d.guardian.guardianEmail ?? '—'}</dd></div>
                <div><dt className="text-muted">Status</dt><dd>{d.guardian.status}{d.guardian.verifiedAt ? ` · ${formatDate(d.guardian.verifiedAt)}` : ''}</dd></div>
              </dl>
              <p className="mt-3 text-xs text-muted">Verify by contacting the guardian directly using the details above before approving.</p>
              <div className="mt-3 flex gap-2">
                <button className={smallPrimary} disabled={act.pending} onClick={() => done(() => setGuardianConsent({ data: { userId, status: 'verified' } }))}>Mark consent verified</button>
                <button className={smallBtn} disabled={act.pending} onClick={() => done(() => setGuardianConsent({ data: { userId, status: 'rejected' } }))}>Reject</button>
              </div>
            </>
          ) : <p className="text-sm text-muted">No guardian details yet — the learner must add them before enrolling.</p>}
        </Panel>
      )}

      <Panel title="Enrolments & progress">
        {d.enrolments.length ? (
          <ul className="space-y-6">
            {d.enrolments.map((e) => (
              <li key={e.id}>
                <div className="flex justify-between text-sm"><span className="font-medium">{e.courseTitle}</span><Badge tone={e.status === 'completed' ? 'completed' : e.status === 'revoked' ? 'failed' : 'enrolled'}>{e.status}</Badge></div>
                <div className="mt-2"><ProgressBar value={e.progress.percent} /></div>
                <p className="mt-2 text-xs text-muted">
                  {e.progress.percent}% · lessons {e.progress.lessonsDone}/{e.progress.lessonsTotal} · attendance {e.progress.attendancePercent}% · score {e.progress.overallScore}% · final project {e.progress.finalProjectStatus ?? '—'}
                </p>
                <ul className="mt-2 text-xs text-muted">{e.progress.assessments.map((a) => <li key={a.id}>{a.title}: {a.score != null ? `${a.score}%` : '—'}</li>)}</ul>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted">No enrolments.</p>}
      </Panel>
    </div>
  )
}
