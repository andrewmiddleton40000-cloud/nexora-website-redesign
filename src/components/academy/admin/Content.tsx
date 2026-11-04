import { useState } from 'react'
import { listAudit, listEnquiries, listTestimonials, saveTestimonial, setEnquiryStatus } from '@/server/fns/admin'
import type { Role } from '@/lib/roles'
import { Alert, formatDate, useAction } from '../ui'
import { L, Loading, Panel, Table, input, smallPrimary, td, useServerData } from './shared'

export function Content({ role }: { role: Role }) {
  return (
    <div className="space-y-14">
      <Enquiries />
      <Testimonials />
      {role === 'super_admin' && <Audit />}
    </div>
  )
}

function Enquiries() {
  const { data, error, loading, reload } = useServerData(() => listEnquiries())
  const { run } = useAction()
  return (
    <Panel title="School partnership enquiries">
      <Loading error={error} loading={loading && !data} />
      {data && (
        <Table head={['Received', 'School', 'Contact', 'Students / year group', 'Message', 'Status']} min="60rem">
          {data.map((e) => (
            <tr key={e.id}>
              <td className={td}>{formatDate(e.createdAt)}</td>
              <td className={td}><span className="font-medium">{e.schoolName}</span><br /><span className="text-xs text-muted">{e.location} · {e.schoolType}</span></td>
              <td className={td}>{e.contactName}, {e.position}<br /><a className="text-xs underline" href={`mailto:${e.email}`}>{e.email}</a> · <span className="text-xs">{e.phone}</span></td>
              <td className={td}>{e.studentPopulation} · {e.yearGroup}</td>
              <td className={`${td} max-w-xs text-xs`}>{e.message ?? '—'}</td>
              <td className={td}>
                <select className={input} value={e.status} onChange={async (ev) => { await run(() => setEnquiryStatus({ data: { id: e.id, status: ev.target.value as 'new' } })); reload() }} aria-label="Enquiry status">
                  {['new', 'contacted', 'converted', 'closed'].map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </Table>
      )}
      <p className="mt-3 text-xs text-muted">Enquiries are also delivered to Netlify Forms (form “school-partnership”), where email notifications can be configured.</p>
    </Panel>
  )
}

function Testimonials() {
  const { data, reload } = useServerData(() => listTestimonials())
  const { pending, error, run } = useAction()
  const [editing, setEditing] = useState<NonNullable<typeof data>[number] | 'new' | null>(null)
  const t = editing && editing !== 'new' ? editing : null
  return (
    <Panel title="Testimonials" actions={<button className={smallPrimary} onClick={() => setEditing('new')}>Add testimonial</button>}>
      {editing && (
        <form
          className="mb-6 grid gap-3 bg-white p-5 md:grid-cols-3"
          onSubmit={async (e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            const g = (k: string) => String(f.get(k) ?? '').trim()
            if (await run(() => saveTestimonial({ data: { id: t?.id, name: g('name'), context: g('context'), quote: g('quote'), consentConfirmed: f.get('consent') === 'on', published: f.get('published') === 'on' } }))) {
              setEditing(null)
              reload()
            }
          }}
        >
          <L label="Name as published"><input name="name" className={input} required defaultValue={t?.name} placeholder="e.g. Amaka O." /></L>
          <L label="Context" className="md:col-span-2"><input name="context" className={input} defaultValue={t?.context} placeholder="e.g. SS 2 learner, Level 1 — Jan 2027 cohort" /></L>
          <L label="Quote" className="md:col-span-3"><textarea name="quote" className={input} rows={3} required defaultValue={t?.quote} /></L>
          <label className="flex items-start gap-2 text-sm md:col-span-3"><input type="checkbox" name="consent" defaultChecked={t?.consentConfirmed} className="mt-1" /> Written consent to publish is on file (and guardian consent if the learner is under 18).</label>
          <label className="flex items-center gap-2 text-sm md:col-span-3"><input type="checkbox" name="published" defaultChecked={t?.published} /> Publish on the Academy homepage</label>
          {error && <div className="md:col-span-3"><Alert>{error}</Alert></div>}
          <div className="md:col-span-3"><button className={smallPrimary} disabled={pending}>Save</button></div>
        </form>
      )}
      <ul className="divide-y divide-line text-sm">
        {data?.map((x) => (
          <li key={x.id} className="flex items-start justify-between gap-4 py-3">
            <span>“{x.quote}” — {x.name} <span className="text-xs text-muted">{x.published ? '· published' : '· draft'}{x.consentConfirmed ? '' : ' · no consent'}</span></span>
            <button className="text-xs underline" onClick={() => setEditing(x)}>Edit</button>
          </li>
        ))}
        {data && !data.length && <li className="py-3 text-muted">No testimonials yet. Only add real feedback with consent.</li>}
      </ul>
    </Panel>
  )
}

function Audit() {
  const { data, error, loading } = useServerData(() => listAudit())
  return (
    <Panel title="Audit log (latest 150)">
      <Loading error={error} loading={loading && !data} />
      {data && (
        <Table head={['When', 'Actor', 'Action', 'Entity']} min="40rem">
          {data.map((a) => (
            <tr key={a.id}><td className={td}>{formatDate(a.createdAt, true)}</td><td className={td}>{a.actor ?? 'system'}</td><td className={`${td} font-mono text-xs`}>{a.action}</td><td className={`${td} text-xs`}>{a.entityType} {a.entityId}</td></tr>
          ))}
        </Table>
      )}
    </Panel>
  )
}
