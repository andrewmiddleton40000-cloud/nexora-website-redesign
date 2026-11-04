import { useState } from 'react'
import { financeOverview, generateStatement, markAllocationsPaid, releaseStatement, runAllocationCalculation, saveAgreement } from '@/server/fns/finance'
import { Alert, Badge, Price, formatDate, useAction } from '../ui'
import { L, Loading, Panel, Table, input, koboFromNaira, smallBtn, smallPrimary, td, useServerData } from './shared'

export function Finance() {
  const { data: d, error, loading, reload } = useServerData(() => financeOverview())
  const act = useAction()
  const [selected, setSelected] = useState<number[]>([])
  const [calc, setCalc] = useState<string | null>(null)
  const [schoolFilter, setSchoolFilter] = useState<number | null>(null)
  if (!d) return <Loading error={error} loading={loading} />
  const allocations = d.allocations.filter((a) => !schoolFilter || a.schoolId === schoolFilter)
  return (
    <div className="space-y-14">
      <Alert tone="info">
        <strong className="font-medium">Restricted.</strong> Institutional allocation terms and amounts are confidential to Nexora finance and super administrators. Do not copy them into learner, parent, instructor or general school communications.
      </Alert>
      {act.error && <Alert>{act.error}</Alert>}

      <Panel
        title="School-level summary"
        actions={
          <button className={smallPrimary} disabled={act.pending} onClick={async () => { const r = await act.run(() => runAllocationCalculation()); if (r) { setCalc(`Scanned ${r.scanned} attributed payments; created ${r.created} new allocations.`); reload() } }}>
            Calculate allocations
          </button>
        }
      >
        {calc && <div className="mb-4"><Alert tone="success">{calc}</Alert></div>}
        <Table head={['School', 'Code', 'Paid enrolments', 'Gross collected', 'Allocations outstanding', 'Allocations paid', 'Nexora share (before costs)']} min="56rem">
          {d.schools.map((s) => {
            const alloc = s.outstandingKobo + s.paidKobo
            return (
              <tr key={s.id}>
                <td className={td}><button className="underline" onClick={() => setSchoolFilter(schoolFilter === s.id ? null : s.id)}>{s.name}</button></td>
                <td className={`${td} font-mono text-xs`}>{s.code}</td>
                <td className={`${td} tabular-nums`}>{s.enrolments}</td>
                <td className={td}><Price kobo={s.grossKobo} /></td>
                <td className={td}><Price kobo={s.outstandingKobo} /></td>
                <td className={td}><Price kobo={s.paidKobo} /></td>
                <td className={td}><Price kobo={s.grossKobo - alloc} /></td>
              </tr>
            )
          })}
        </Table>
      </Panel>

      <Agreements d={d} reload={reload} />

      <Panel title={`Allocation records${schoolFilter ? ` — ${d.schools.find((s) => s.id === schoolFilter)?.name}` : ''}`}>
        <PayoutForm ids={selected} onDone={() => { setSelected([]); reload() }} />
        <Table head={['', 'Date', 'School', 'Course', 'Payment ref', 'Course fee', 'Allocation', 'Status', 'Payout']} min="64rem">
          {allocations.map((a) => (
            <tr key={a.id}>
              <td className={td}>{a.status === 'outstanding' && <input type="checkbox" aria-label="Select allocation" checked={selected.includes(a.id)} onChange={(e) => setSelected((s) => (e.target.checked ? [...s, a.id] : s.filter((x) => x !== a.id)))} />}</td>
              <td className={td}>{formatDate(a.createdAt)}</td>
              <td className={td}>{a.schoolName}</td>
              <td className={td}>{a.courseTitle}</td>
              <td className={`${td} font-mono text-xs`}>{a.reference}</td>
              <td className={td}><Price kobo={a.amountPaidKobo} /></td>
              <td className={td}><Price kobo={a.amountKobo} /></td>
              <td className={td}><Badge tone={a.status === 'paid' ? 'success' : a.status === 'void' ? 'refunded' : 'pending'}>{a.status}</Badge>{a.note && <p className="mt-1 text-xs text-muted">{a.note}</p>}</td>
              <td className={`${td} text-xs`}>{a.payoutReference ? `${a.payoutReference} · ${formatDate(a.paidAt)}` : '—'}</td>
            </tr>
          ))}
        </Table>
        {!allocations.length && <p className="mt-3 text-sm text-muted">No allocation records yet. Allocations are created automatically for successful paid enrolments of learners whose school attribution is confirmed and whose school has an active agreement.</p>}
      </Panel>

      <Statements d={d} reload={reload} />
    </div>
  )
}

type D = Awaited<ReturnType<typeof financeOverview>>

function Agreements({ d, reload }: { d: D; reload: () => void }) {
  const { pending, error, run } = useAction()
  const [open, setOpen] = useState(false)
  return (
    <Panel title="Partnership agreements (confidential terms)" actions={<button className={smallPrimary} onClick={() => setOpen((v) => !v)}>{open ? 'Close' : 'Record agreement'}</button>}>
      {open && (
        <form
          className="mb-6 grid gap-3 bg-white p-5 md:grid-cols-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            const g = (k: string) => String(f.get(k) ?? '').trim()
            if (await run(() => saveAgreement({ data: { schoolId: Number(g('schoolId')), allocationPerEnrolmentKobo: koboFromNaira(g('amount')), startsOn: g('startsOn'), endsOn: g('endsOn') || null, status: 'active', documentRef: g('documentRef'), notes: g('notes') } }))) {
              setOpen(false)
              reload()
            }
          }}
        >
          <L label="School"><select name="schoolId" className={input} required>{d.schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></L>
          <L label="Allocation per paid enrolment (₦)"><input name="amount" className={input} required inputMode="decimal" placeholder="As stated in the signed agreement" /></L>
          <L label="Starts"><input name="startsOn" type="date" className={input} required /></L>
          <L label="Ends (optional)"><input name="endsOn" type="date" className={input} /></L>
          <L label="Signed document reference" className="md:col-span-2"><input name="documentRef" className={input} /></L>
          <L label="Notes" className="md:col-span-2"><input name="notes" className={input} /></L>
          {error && <div className="md:col-span-4"><Alert>{error}</Alert></div>}
          <div className="md:col-span-4"><button className={smallPrimary} disabled={pending}>Save agreement</button></div>
        </form>
      )}
      <Table head={['School', 'Allocation / enrolment', 'Period', 'Status', 'Document', '']} min="44rem">
        {d.agreements.map((a) => (
          <tr key={a.id}>
            <td className={td}>{d.schools.find((s) => s.id === a.schoolId)?.name}</td>
            <td className={td}><Price kobo={a.allocationPerEnrolmentKobo} /></td>
            <td className={td}>{formatDate(a.startsOn)} – {a.endsOn ? formatDate(a.endsOn) : 'open'}</td>
            <td className={td}><Badge tone={a.status === 'active' ? 'success' : 'refunded'}>{a.status}</Badge></td>
            <td className={`${td} text-xs`}>{a.documentRef ?? '—'}</td>
            <td className={td}>{a.status === 'active' && <button className={smallBtn} disabled={pending} onClick={async () => { if (confirm('End this agreement today?') && (await run(() => saveAgreement({ data: { id: a.id, schoolId: a.schoolId, allocationPerEnrolmentKobo: a.allocationPerEnrolmentKobo, startsOn: a.startsOn, endsOn: new Date().toISOString().slice(0, 10), status: 'ended', documentRef: a.documentRef ?? '', notes: a.notes ?? '' } })))) reload() }}>End</button>}</td>
          </tr>
        ))}
      </Table>
      {!d.agreements.length && <p className="mt-3 text-sm text-muted">No agreements recorded. Allocations are only created for schools with an active agreement.</p>}
    </Panel>
  )
}

function PayoutForm({ ids, onDone }: { ids: number[]; onDone: () => void }) {
  const { pending, error, run } = useAction()
  if (!ids.length) return <p className="mb-4 text-xs text-muted">Select outstanding allocations to record a payout.</p>
  return (
    <form
      className="mb-6 flex flex-wrap items-end gap-3 bg-white p-4"
      onSubmit={async (e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        if (await run(() => markAllocationsPaid({ data: { allocationIds: ids, payoutReference: String(f.get('ref')), paidOn: String(f.get('paidOn')) } }))) onDone()
      }}
    >
      <p className="text-sm">{ids.length} selected</p>
      <L label="Payout reference"><input name="ref" className={input} required minLength={3} /></L>
      <L label="Paid on"><input name="paidOn" type="date" className={input} required defaultValue={new Date().toISOString().slice(0, 10)} /></L>
      <button className={smallPrimary} disabled={pending}>Mark as paid</button>
      {error && <Alert>{error}</Alert>}
    </form>
  )
}

function Statements({ d, reload }: { d: D; reload: () => void }) {
  const { pending, error, run } = useAction()
  return (
    <Panel title="Private reconciliation statements">
      <form
        className="mb-6 grid gap-3 md:grid-cols-4"
        onSubmit={async (e) => {
          e.preventDefault()
          const f = new FormData(e.currentTarget)
          if (await run(() => generateStatement({ data: { schoolId: Number(f.get('schoolId')), periodStart: String(f.get('from')), periodEnd: String(f.get('to')) } }))) reload()
        }}
      >
        <L label="School"><select name="schoolId" className={input} required>{d.schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></L>
        <L label="From"><input name="from" type="date" className={input} required /></L>
        <L label="To"><input name="to" type="date" className={input} required /></L>
        <div className="flex items-end"><button className={smallPrimary} disabled={pending}>Generate statement</button></div>
        {error && <div className="md:col-span-4"><Alert>{error}</Alert></div>}
      </form>
      <Table head={['School', 'Period', 'Enrolments', 'Total', 'Paid', 'Outstanding', 'Shared with school', '']} min="56rem">
        {d.statements.map((s) => (
          <tr key={s.id}>
            <td className={td}>{d.schools.find((x) => x.id === s.schoolId)?.name}</td>
            <td className={td}>{formatDate(s.periodStart)} – {formatDate(s.periodEnd)}</td>
            <td className={`${td} tabular-nums`}>{s.enrolmentCount}</td>
            <td className={td}><Price kobo={s.totalKobo} /></td>
            <td className={td}><Price kobo={s.paidKobo} /></td>
            <td className={td}><Price kobo={s.outstandingKobo} /></td>
            <td className={td}>{s.releasedToSchool ? `Yes · ${formatDate(s.releasedAt)}` : 'No'}</td>
            <td className={td}><button className={smallBtn} disabled={pending} onClick={async () => { if (await run(() => releaseStatement({ data: { statementId: s.id, released: !s.releasedToSchool } }))) reload() }}>{s.releasedToSchool ? 'Withdraw' : 'Release to authorised rep'}</button></td>
          </tr>
        ))}
      </Table>
      <p className="mt-3 text-xs text-muted">Released statements are visible only to that school’s representatives who have been explicitly authorised for reconciliation, on a separate page from the school’s learning dashboard. Statements contain no learner names.</p>
    </Panel>
  )
}
