import { useState, type FormEvent } from 'react'
import { addSchoolMember, listSchools, removeSchoolMember, saveSchool } from '@/server/fns/admin'
import { schoolTypes } from '@/data/academy'
import type { Role } from '@/lib/roles'
import { Alert, Badge, useAction } from '../ui'
import { L, Loading, Panel, input, smallBtn, smallPrimary, useServerData } from './shared'

type School = Awaited<ReturnType<typeof listSchools>>[number]

export function Schools({ role }: { role: Role }) {
  const { data, error, loading, reload } = useServerData(() => listSchools())
  const [editing, setEditing] = useState<School | 'new' | null>(null)
  return (
    <div className="space-y-10">
      <Panel title="Partner schools" actions={<button className={smallPrimary} onClick={() => setEditing('new')}>Add school</button>}>
        {editing && <SchoolForm school={editing === 'new' ? null : editing} onDone={() => { setEditing(null); reload() }} />}
        <Loading error={error} loading={loading && !data} />
        <ul className="divide-y divide-line">
          {data?.map((s) => (
            <li key={s.id} className="grid gap-4 py-6 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="text-lg font-medium">{s.name}</p>
                <p className="text-sm text-muted">{[s.location, s.schoolType].filter(Boolean).join(' · ')}</p>
                <p className="mt-2 text-sm">School code <span className="font-mono">{s.code}</span> <Badge tone={s.status === 'active' ? 'success' : 'pending'}>{s.status}</Badge></p>
                <button className="link mt-2 text-xs" onClick={() => setEditing(s)}>Edit record</button>
              </div>
              <dl className="grid grid-cols-3 gap-3 text-sm lg:col-span-3">
                <div><dt className="text-muted">Attributed</dt><dd className="text-lg tabular-nums">{s.approvedStudents}</dd></div>
                <div><dt className="text-muted">Pending</dt><dd className="text-lg tabular-nums">{s.pendingStudents}</dd></div>
                <div><dt className="text-muted">Enrolments</dt><dd className="text-lg tabular-nums">{s.enrolments}</dd></div>
              </dl>
              <div className="lg:col-span-5">
                <p className="text-xs uppercase tracking-[0.1em] text-muted">Representatives</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {s.members.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-3">
                      <span>{m.name} <span className="text-muted">· {m.position ?? 'Representative'}{m.canViewReconciliation ? ' · reconciliation access' : ''}</span></span>
                      <RemoveMember id={m.id} onDone={reload} />
                    </li>
                  ))}
                  {!s.members.length && <li className="text-muted">None yet</li>}
                </ul>
                <AddMember schoolId={s.id} canGrantReconciliation={role === 'super_admin'} onDone={reload} />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted">Partnership agreements and their commercial terms are managed in Restricted finance.</p>
      </Panel>
    </div>
  )
}

function SchoolForm({ school, onDone }: { school: School | null; onDone: () => void }) {
  const { pending, error, run } = useAction()
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const g = (k: string) => String(f.get(k) ?? '').trim()
    const ok = await run(() =>
      saveSchool({ data: { id: school?.id, name: g('name'), location: g('location'), country: g('country'), schoolType: g('schoolType'), contactName: g('contactName'), contactPosition: g('contactPosition'), contactEmail: g('contactEmail'), contactPhone: g('contactPhone'), status: g('status') as 'active', notes: g('notes') } }),
    )
    if (ok) onDone()
  }
  return (
    <form onSubmit={submit} className="mb-8 grid gap-4 bg-white p-5 md:grid-cols-3">
      <L label="Name"><input name="name" className={input} required defaultValue={school?.name} /></L>
      <L label="Location"><input name="location" className={input} defaultValue={school?.location} /></L>
      <L label="Country"><input name="country" className={input} defaultValue={school?.country ?? 'Nigeria'} /></L>
      <L label="Type"><select name="schoolType" className={input} defaultValue={school?.schoolType ?? schoolTypes[0]}>{schoolTypes.map((t) => <option key={t}>{t}</option>)}</select></L>
      <L label="Status"><select name="status" className={input} defaultValue={school?.status ?? 'prospect'}>{['prospect', 'active', 'paused', 'ended'].map((s) => <option key={s}>{s}</option>)}</select></L>
      <L label="Contact name"><input name="contactName" className={input} defaultValue={school?.contactName ?? ''} /></L>
      <L label="Contact position"><input name="contactPosition" className={input} defaultValue={school?.contactPosition ?? ''} /></L>
      <L label="Contact email"><input name="contactEmail" type="email" className={input} defaultValue={school?.contactEmail ?? ''} /></L>
      <L label="Contact phone"><input name="contactPhone" className={input} defaultValue={school?.contactPhone ?? ''} /></L>
      <L label="Notes" className="md:col-span-3"><textarea name="notes" className={input} rows={2} defaultValue={school?.notes ?? ''} /></L>
      {error && <div className="md:col-span-3"><Alert>{error}</Alert></div>}
      <div className="flex gap-2 md:col-span-3"><button className={smallPrimary} disabled={pending}>Save school</button><button type="button" className={smallBtn} onClick={onDone}>Cancel</button></div>
    </form>
  )
}

function AddMember({ schoolId, canGrantReconciliation, onDone }: { schoolId: number; canGrantReconciliation: boolean; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const { pending, error, run } = useAction()
  if (!open) return <button className="link mt-2 text-xs" onClick={() => setOpen(true)}>Add representative</button>
  return (
    <form
      className="mt-3 grid gap-2 bg-white p-3"
      onSubmit={async (e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        if (await run(() => addSchoolMember({ data: { schoolId, email: String(f.get('email')), position: String(f.get('position') ?? ''), canViewReconciliation: f.get('recon') === 'on' } }))) {
          setOpen(false)
          onDone()
        }
      }}
    >
      <input name="email" type="email" required className={input} placeholder="Registered account email" />
      <input name="position" className={input} placeholder="Position, e.g. Principal" />
      {canGrantReconciliation && <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="recon" /> Authorised to receive private reconciliation statements</label>}
      {error && <Alert>{error}</Alert>}
      <div className="flex gap-2"><button className={smallPrimary} disabled={pending}>Add</button><button type="button" className={smallBtn} onClick={() => setOpen(false)}>Cancel</button></div>
    </form>
  )
}

function RemoveMember({ id, onDone }: { id: number; onDone: () => void }) {
  const { pending, run } = useAction()
  return <button className="text-xs text-muted hover:text-ink" disabled={pending} onClick={async () => { if (confirm('Remove this representative?') && (await run(() => removeSchoolMember({ data: { memberId: id } })))) onDone() }}>Remove</button>
}
