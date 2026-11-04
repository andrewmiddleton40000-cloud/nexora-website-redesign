import { useState } from 'react'
import { getBankSettings, listPayments, recordRefund, rejectPayment, reverifyPayment, saveBankSettings, verifyBankTransfer } from '@/server/fns/finance'
import { Alert, Badge, Price, formatDate, useAction } from '../ui'
import { L, Loading, Panel, Table, input, koboFromNaira, smallBtn, smallPrimary, td, useServerData } from './shared'

type P = Awaited<ReturnType<typeof listPayments>>['payments'][number]
const statuses = ['', 'awaiting_verification', 'pending', 'success', 'failed', 'refunded']

export function Payments() {
  const [status, setStatus] = useState('awaiting_verification')
  const { data, error, loading, reload } = useServerData(() => listPayments({ data: { status: status || undefined } }), [status])
  const [open, setOpen] = useState<{ p: P; mode: 'verify' | 'refund' | 'reject' } | null>(null)
  const act = useAction()
  return (
    <div className="space-y-12">
      {data && (
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <p>Paystack: {data.gateways.paystack ? <Badge tone="success">configured</Badge> : <Badge>not configured</Badge>}</p>
          <p>Flutterwave: {data.gateways.flutterwave ? <Badge tone="success">configured</Badge> : <Badge>not configured</Badge>}</p>
          <p>Bank transfer: manual verification below</p>
        </div>
      )}
      <Panel
        title="Payments"
        actions={
          <select className={`${input} w-auto`} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            {statuses.map((s) => <option key={s} value={s}>{s ? s.replace('_', ' ') : 'All payments'}</option>)}
          </select>
        }
      >
        <Loading error={error} loading={loading && !data} />
        {act.error && <div className="mb-4"><Alert>{act.error}</Alert></div>}
        {open && <ActionForm {...open} onDone={() => { setOpen(null); reload() }} />}
        {data && (
          <Table head={['Reference', 'Learner', 'Course', 'Amount', 'Method', 'Status', 'Details', '']} min="64rem">
            {data.payments.map((p) => (
              <tr key={p.id}>
                <td className={`${td} font-mono text-xs`}>{p.reference}<br /><span className="text-muted">{formatDate(p.createdAt, true)}</span></td>
                <td className={td}>{p.name}<br /><span className="text-xs text-muted">{p.email}</span></td>
                <td className={td}>{p.courseTitle}</td>
                <td className={td}><Price kobo={p.amountKobo} /></td>
                <td className={td}>{p.provider.replace('_', ' ')}</td>
                <td className={td}><Badge tone={p.status === 'success' ? 'success' : p.status === 'failed' ? 'failed' : p.status === 'refunded' ? 'refunded' : 'pending'}>{p.status.replace('_', ' ')}</Badge></td>
                <td className={`${td} max-w-[16rem] text-xs text-muted`}>
                  {p.payerName && <>Payer: {p.payerName}<br /></>}
                  {p.transferNote && <>Note: {p.transferNote}<br /></>}
                  {p.providerTransactionId && <>Txn: {p.providerTransactionId}<br /></>}
                  {p.verifiedAt && <>Verified {formatDate(p.verifiedAt)}<br /></>}
                  {p.failureReason && <>Reason: {p.failureReason}<br /></>}
                  {p.refundReference && <>Refund: {p.refundReference} — {p.refundReason}</>}
                </td>
                <td className={`${td} space-x-1 space-y-1 whitespace-nowrap`}>
                  {p.provider === 'bank_transfer' && p.status === 'awaiting_verification' && (
                    <>
                      <button className={smallPrimary} onClick={() => setOpen({ p, mode: 'verify' })}>Verify</button>
                      <button className={smallBtn} onClick={() => setOpen({ p, mode: 'reject' })}>Reject</button>
                    </>
                  )}
                  {p.provider !== 'bank_transfer' && (p.status === 'pending' || p.status === 'failed') && (
                    <button className={smallBtn} disabled={act.pending} onClick={async () => { await act.run(() => reverifyPayment({ data: { paymentId: p.id } })); reload() }}>Re-check with gateway</button>
                  )}
                  {p.status === 'success' && <button className={smallBtn} onClick={() => setOpen({ p, mode: 'refund' })}>Record refund</button>}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
      <BankSettings />
    </div>
  )
}

function ActionForm({ p, mode, onDone }: { p: P; mode: 'verify' | 'refund' | 'reject'; onDone: () => void }) {
  const { pending, error, run } = useAction()
  return (
    <form
      className="mb-6 grid gap-3 border border-forest bg-white p-5 md:grid-cols-4"
      onSubmit={async (e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        const g = (k: string) => String(f.get(k) ?? '').trim()
        const ok = await run(() =>
          mode === 'verify'
            ? verifyBankTransfer({ data: { paymentId: p.id, bankTransactionRef: g('ref'), amountConfirmedKobo: koboFromNaira(g('amount')), statementChecked: f.get('checked') === 'on' ? true : (false as unknown as true) } })
            : mode === 'refund'
              ? recordRefund({ data: { paymentId: p.id, refundReference: g('ref'), reason: g('reason') } })
              : rejectPayment({ data: { paymentId: p.id, reason: g('reason') } }),
        )
        if (ok) onDone()
      }}
    >
      <p className="font-medium md:col-span-4">
        {mode === 'verify' ? 'Verify bank transfer' : mode === 'refund' ? 'Record refund' : 'Reject transfer claim'} — {p.reference} · {p.name} · <Price kobo={p.amountKobo} />
      </p>
      {mode !== 'reject' && <L label={mode === 'verify' ? 'Bank statement transaction reference' : 'Refund reference (gateway or bank)'}><input name="ref" className={input} required minLength={3} /></L>}
      {mode === 'verify' && <L label="Amount received (₦)"><input name="amount" className={input} required inputMode="decimal" /></L>}
      {mode !== 'verify' && <L label="Reason" className="md:col-span-2"><input name="reason" className={input} required minLength={3} /></L>}
      {mode === 'verify' && (
        <label className="flex items-start gap-2 text-sm md:col-span-2">
          <input type="checkbox" name="checked" required className="mt-1" /> I have confirmed this credit on Nexora’s bank statement or banking app. (Screenshots from the payer are not proof.)
        </label>
      )}
      {mode === 'refund' && <p className="text-xs text-muted md:col-span-4">Process the refund itself in the Paystack/Flutterwave dashboard or by bank transfer first, then record it here. Recording a refund revokes the learner’s access to this course.</p>}
      {error && <div className="md:col-span-4"><Alert>{error}</Alert></div>}
      <div className="flex gap-2 md:col-span-4"><button className={smallPrimary} disabled={pending}>Confirm</button><button type="button" className={smallBtn} onClick={onDone}>Cancel</button></div>
    </form>
  )
}

function BankSettings() {
  const { data, error, loading, reload } = useServerData(() => getBankSettings())
  const { pending, error: saveErr, run } = useAction()
  const [saved, setSaved] = useState(false)
  if (!data) return <Loading error={error} loading={loading} />
  return (
    <Panel title="Bank transfer details shown to learners">
      <form
        className="grid gap-3 md:grid-cols-3"
        onSubmit={async (e) => {
          e.preventDefault()
          const f = new FormData(e.currentTarget)
          const g = (k: string) => String(f.get(k) ?? '').trim()
          if (await run(() => saveBankSettings({ data: { bankName: g('bankName'), accountName: g('accountName'), accountNumber: g('accountNumber'), instructions: g('instructions') } }))) {
            setSaved(true)
            reload()
          }
        }}
      >
        <L label="Bank name"><input name="bankName" className={input} defaultValue={data.bankName} /></L>
        <L label="Account name"><input name="accountName" className={input} defaultValue={data.accountName} /></L>
        <L label="Account number"><input name="accountNumber" className={input} pattern="[0-9]{0,20}" defaultValue={data.accountNumber} /></L>
        <L label="Extra instructions" className="md:col-span-3"><input name="instructions" className={input} defaultValue={data.instructions} /></L>
        <p className="text-xs text-muted md:col-span-2">Bank transfer is offered to learners only when an account number is set. Use Nexora Technologies’ official business account.</p>
        <button className={smallPrimary} disabled={pending}>Save</button>
        {saveErr && <div className="md:col-span-3"><Alert>{saveErr}</Alert></div>}
        {saved && <div className="md:col-span-3"><Alert tone="success">Saved.</Alert></div>}
      </form>
    </Panel>
  )
}
