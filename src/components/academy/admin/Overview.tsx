import { adminOverview } from '@/server/fns/admin'
import { Price, Stat } from '../ui'
import { Loading, Panel, Table, td, useServerData } from './shared'

export function Overview() {
  const { data: d, error, loading } = useServerData(() => adminOverview())
  if (!d) return <Loading error={error} loading={loading} />
  return (
    <div className="space-y-14">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="Total students" value={d.totals.students} />
        <Stat label="Partner schools" value={d.totals.schools} note="active" />
        <Stat label="Course enrolments" value={d.totals.enrolments} />
        <Stat label="Completions" value={d.totals.completions} note={d.totals.enrolments ? `${Math.round((d.totals.completions / d.totals.enrolments) * 100)}% of enrolments` : undefined} />
        <Stat label="Active courses" value={d.totals.activeCourses} />
        {d.revenue && <Stat label="Revenue collected" value={<Price kobo={d.revenue.collectedKobo} />} note={d.revenue.refundedKobo ? <>Refunded <Price kobo={d.revenue.refundedKobo} /></> : 'gross, verified payments'} />}
      </div>
      <div className="grid gap-12 lg:grid-cols-2">
        <Panel title="Work queues">
          <ul className="divide-y divide-line text-sm">
            {d.queues.awaitingPayments != null && <li className="flex justify-between py-3"><span>Bank transfers awaiting verification</span><strong>{d.queues.awaitingPayments}</strong></li>}
            <li className="flex justify-between py-3"><span>Submissions awaiting review</span><strong>{d.queues.ungraded}</strong></li>
            <li className="flex justify-between py-3"><span>Guardian consents to verify</span><strong>{d.queues.pendingConsent}</strong></li>
            <li className="flex justify-between py-3"><span>New school enquiries</span><strong>{d.queues.newEnquiries}</strong></li>
          </ul>
        </Panel>
        <Panel title="Enrolments and completions by course">
          <Table head={['Level', 'Course', 'Enrolments', 'Completed']} min="24rem">
            {d.perCourse.map((c) => (
              <tr key={c.id}>
                <td className={td}>{c.level}</td>
                <td className={td}>{c.title}</td>
                <td className={`${td} tabular-nums`}>{c.enrolments}</td>
                <td className={`${td} tabular-nums`}>{d.completionsPerCourse.find((x) => x.courseId === c.id)?.n ?? 0}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      </div>
    </div>
  )
}
