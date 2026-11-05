import { useState, type FormEvent } from 'react'
import { Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { countries } from '@/data/academy'
import { academySeo } from '@/lib/academy-seo'
import { requireSession } from '@/lib/guards'
import { signOut } from '@/lib/auth-client'
import { getDashboard, updateProfile } from '@/server/fns/student'
import { ADMIN_AREA, hasRole, roleLabels, type Role } from '@/lib/roles'
import { RouteError } from '@/components/academy/RouteError'
import { CourseAction } from '@/components/academy/CourseCard'
import { Alert, Badge, EmptyState, Field, Price, ProgressBar, formatDate, useAction } from '@/components/academy/ui'

export const Route = createFileRoute('/academy/dashboard')({
  beforeLoad: (ctx) => {
    const { session } = requireSession(ctx)
    if (session.role === 'school_partner') throw redirect({ to: '/academy/school' })
  },
  loader: () => getDashboard(),
  head: () => academySeo({ title: 'My dashboard', path: '/academy/dashboard', noindex: true }),
  errorComponent: RouteError,
  component: Dashboard,
})

const statusText: Record<string, string> = { not_submitted: 'Not submitted', submitted: 'Submitted — awaiting review', returned: 'Returned — please revise', approved: 'Approved' }
const payText: Record<string, string> = { pending: 'Started', awaiting_verification: 'Awaiting verification', success: 'Paid', failed: 'Unsuccessful', abandoned: 'Abandoned', refunded: 'Refunded' }

function Dashboard() {
  const d = Route.useLoaderData()
  const p = d.profile
  const [editing, setEditing] = useState(!p.country || !p.ageGroup)
  const active = d.enrolments.find((e) => e.status === 'active') ?? null
  const completed = d.enrolments.filter((e) => e.status === 'completed')
  const nextEligible = d.catalogue.find((c) => c.availability.state === 'eligible' || c.availability.state === 'payment_pending' || c.availability.state === 'needs_guardian_consent')
  const locked = d.catalogue.filter((c) => c.availability.state === 'needs_prerequisite' || c.availability.state === 'not_open' || c.availability.state === 'awaiting_price')
  const staff = hasRole(p.role, ADMIN_AREA)
  const firstName = p.fullName.split(' ')[0]

  return (
    <div className="pb-24">
      <section className="border-b border-line bg-white">
        <div className="wrap flex flex-col gap-6 py-12 md:flex-row md:items-end md:justify-between md:py-16">
          <div>
            <p className="eyebrow">My dashboard</p>
            <h1 className="display mt-4 text-5xl md:text-6xl">Welcome, <span className="serif text-gradient pr-1">{firstName}.</span></h1>
            <p className="mt-3 text-muted">{active ? `You are enrolled in ${active.course.title}.` : 'Choose a course below to get started.'}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {staff && <Link to="/academy/admin" className="btn btn-primary">Open administration</Link>}
            <button type="button" onClick={() => signOut()} className="btn btn-ghost">Sign out</button>
          </div>
        </div>
      </section>

      <div className="wrap mt-10 grid gap-12 lg:grid-cols-12">
        <div className="space-y-14 lg:col-span-8">
          {p.ageGroup === 'under_18' && p.guardian?.status !== 'verified' && (
            <Alert tone="info">
              {p.guardian
                ? p.guardian.status === 'rejected'
                  ? 'We could not verify your parent or guardian’s consent. Please update their details in your profile or contact us.'
                  : `We are verifying consent with ${p.guardian.guardianName}. You can enrol as soon as this is confirmed.`
                : 'Please add a parent or guardian in your profile. Their consent is required before you can enrol.'}
            </Alert>
          )}

          {/* Active course */}
          <section aria-labelledby="active-h">
            <h2 id="active-h" className="eyebrow">Active course</h2>
            {active ? (
              <div className="mt-4 border-t border-ink pt-6">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <h3 className="display text-3xl md:text-4xl">{active.course.title}</h3>
                  <span className="text-3xl font-medium tabular-nums">{active.progress.percent}%</span>
                </div>
                <div className="mt-5"><ProgressBar value={active.progress.percent} label="Course progress" /></div>
                <dl className="mt-6 grid grid-cols-2 gap-6 text-sm sm:grid-cols-4">
                  <div><dt className="text-muted">Lessons</dt><dd className="mt-1 text-lg font-medium tabular-nums">{active.progress.lessonsDone}/{active.progress.lessonsTotal}</dd></div>
                  <div><dt className="text-muted">Attendance</dt><dd className="mt-1 text-lg font-medium tabular-nums">{active.progress.attendancePercent}%<span className="text-xs font-normal text-muted"> / {active.progress.attendanceRequired}%</span></dd></div>
                  <div><dt className="text-muted">Overall score</dt><dd className="mt-1 text-lg font-medium tabular-nums">{active.progress.overallScore}%<span className="text-xs font-normal text-muted"> / {active.progress.passMark}%</span></dd></div>
                  <div><dt className="text-muted">Final project</dt><dd className="mt-1 text-lg font-medium">{statusText[active.progress.finalProjectStatus ?? 'not_submitted'].split(' —')[0]}</dd></div>
                </dl>
                <div className="mt-8 flex flex-wrap gap-3">
                  {active.nextLesson ? (
                    <Link to="/academy/learn/$slug/lesson/$lessonId" params={{ slug: active.course.slug, lessonId: String(active.nextLesson.id) }} className="btn btn-primary">
                      Continue: {active.nextLesson.title.split('—').pop()?.trim()} <span className="arrow" aria-hidden="true">→</span>
                    </Link>
                  ) : null}
                  <Link to="/academy/learn/$slug" params={{ slug: active.course.slug }} className="btn btn-ghost">Course overview</Link>
                </div>
                {active.progress.readyForVerification && !active.progress.checks.verified && (
                  <div className="mt-6"><Alert tone="success">You have met every requirement. Your completion is now awaiting verification by a Nexora administrator.</Alert></div>
                )}
              </div>
            ) : (
              <div className="mt-4"><EmptyState title="No active course yet">Enrol in a course below. Access opens as soon as your payment is verified.</EmptyState></div>
            )}
          </section>

          {/* Upcoming live classes */}
          <section aria-labelledby="live-h">
            <h2 id="live-h" className="eyebrow">Upcoming live classes</h2>
            {d.sessions.length ? (
              <ul className="mt-4 divide-y divide-line border-y border-ink">
                {d.sessions.map((s) => (
                  <li key={s.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{s.title}</p>
                      <p className="text-sm text-muted">{formatDate(s.startsAt, true)} · {s.durationMinutes} min</p>
                    </div>
                    {s.meetingUrl ? <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !min-h-[2.4rem] text-sm">Join class</a> : <span className="text-sm text-muted">Link shared before class</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4"><EmptyState title="No live classes scheduled">{active ? 'Your class schedule appears here once you have been placed in a cohort.' : 'Live classes appear here after you enrol.'}</EmptyState></div>
            )}
          </section>

          {/* Recorded lessons */}
          {active && (
            <section aria-labelledby="rec-h">
              <h2 id="rec-h" className="eyebrow">Recorded lessons</h2>
              {d.recordedLessons.length ? (
                <ul className="mt-4 divide-y divide-line border-y border-ink">
                  {d.recordedLessons.map((l) => (
                    <li key={l.id} className="py-3">
                      <Link to="/academy/learn/$slug/lesson/$lessonId" params={{ slug: l.courseSlug, lessonId: String(l.id) }} className="hover:text-forest">▶ {l.title}</Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted">Recordings are published after each live session.</p>
              )}
            </section>
          )}

          {/* Assignments & assessments */}
          {active && (
            <section className="grid gap-10 md:grid-cols-2">
              <div>
                <h2 className="eyebrow">Assignments & final project</h2>
                <ul className="mt-4 divide-y divide-line border-y border-ink">
                  {active.progress.assignments.map((a) => (
                    <li key={a.id} className="py-3">
                      <p className="font-medium">{a.title}</p>
                      <p className="text-sm text-muted">{statusText[a.status] ?? a.status}{a.score != null ? ` · ${a.score}%` : ''}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="eyebrow">Assessment results</h2>
                <ul className="mt-4 divide-y divide-line border-y border-ink">
                  {active.progress.assessments.map((a) => (
                    <li key={a.id} className="flex items-baseline justify-between gap-4 py-3">
                      <span>{a.title}</span>
                      <span className="tabular-nums text-muted">{a.score != null ? `${a.score}%` : a.kind === 'quiz' ? 'Not taken' : 'Pending'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Certificates & completed */}
          <section aria-labelledby="cert-h">
            <h2 id="cert-h" className="eyebrow">Certificates & completed courses</h2>
            {d.certificates.length || completed.length ? (
              <ul className="mt-4 divide-y divide-line border-y border-ink">
                {completed.map((e) => {
                  const cert = d.certificates.find((c) => c.courseTitle === e.course.title)
                  return (
                    <li key={e.enrolmentId} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{e.course.title}</p>
                        {cert && <p className="text-sm text-muted">Certificate {cert.number} · completed {formatDate(cert.completedOn)}</p>}
                      </div>
                      {cert && (
                        <div className="flex gap-3 text-sm">
                          <a href={`/api/academy/certificate/${cert.number}`} className="btn btn-primary !min-h-[2.4rem]">Download PDF</a>
                          <Link to="/academy/verify/$code" params={{ code: cert.verificationCode }} className="btn btn-ghost !min-h-[2.4rem]">Verification page</Link>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">Certificates are issued once your course completion has been verified.</p>
            )}
          </section>

          {/* Next & locked */}
          <section aria-labelledby="next-h">
            <h2 id="next-h" className="eyebrow">Your pathway</h2>
            <ol className="mt-4 divide-y divide-line border-y border-ink">
              {d.catalogue.map((c) => (
                <li key={c.slug} className="grid gap-3 py-5 sm:grid-cols-12 sm:items-center">
                  <span className="text-sm tabular-nums text-muted sm:col-span-1">L{c.level}</span>
                  <div className="sm:col-span-6">
                    <Link to="/academy/courses/$slug" params={{ slug: c.slug }} className="font-medium hover:text-forest">{c.title}</Link>
                    <p className="text-sm text-muted">{c.levelLabel}{c.priceKobo ? <> · <Price kobo={c.priceKobo} /></> : ''}</p>
                  </div>
                  <div className="sm:col-span-5 sm:text-right">
                    <CourseAction c={{ ...c, summary: '', durationLabel: null, prerequisitesText: null, status: '', image: null }} />
                  </div>
                </li>
              ))}
            </ol>
            {nextEligible && <p className="mt-4 text-sm text-muted">Next eligible course: <strong className="text-ink">{nextEligible.title}</strong>. Each level is a separate enrolment.</p>}
            {locked.length > 0 && <p className="mt-2 text-sm text-muted">{locked.length} advanced level{locked.length > 1 ? 's are' : ' is'} locked until the previous level is completed and enrolment opens.</p>}
          </section>

          {/* Payments */}
          <section aria-labelledby="pay-h">
            <h2 id="pay-h" className="eyebrow">Payment history</h2>
            {d.payments.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[34rem] border-y border-ink text-left text-sm">
                  <thead className="text-muted"><tr><th className="py-3 font-normal">Reference</th><th className="font-normal">Course</th><th className="font-normal">Amount</th><th className="font-normal">Method</th><th className="font-normal">Status</th><th className="font-normal">Date</th></tr></thead>
                  <tbody className="divide-y divide-line">
                    {d.payments.map((x) => (
                      <tr key={x.reference}>
                        <td className="py-3 font-mono text-xs">{x.reference}</td>
                        <td>{x.courseTitle}</td>
                        <td><Price kobo={x.amountKobo} /></td>
                        <td className="capitalize">{x.provider.replace('_', ' ')}</td>
                        <td><Badge tone={x.status === 'success' ? 'success' : x.status === 'failed' ? 'failed' : 'pending'}>{payText[x.status] ?? x.status}</Badge></td>
                        <td>{formatDate(x.verifiedAt ?? x.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">No payments yet.</p>
            )}
          </section>
        </div>

        {/* Profile */}
        <aside className="lg:col-span-4">
          <div className="border-t border-ink pt-6 lg:sticky lg:top-28">
            <div className="flex items-baseline justify-between">
              <h2 className="eyebrow">My profile</h2>
              <button type="button" className="link text-sm" onClick={() => setEditing((v) => !v)}>{editing ? 'Cancel' : 'Edit'}</button>
            </div>
            {editing ? (
              <ProfileForm profile={p} onDone={() => setEditing(false)} />
            ) : (
              <dl className="mt-5 space-y-4 text-sm">
                <div><dt className="text-muted">Name</dt><dd className="mt-1 font-medium">{p.fullName}</dd></div>
                <div><dt className="text-muted">Email</dt><dd className="mt-1 break-all">{p.email}</dd></div>
                <div><dt className="text-muted">Phone</dt><dd className="mt-1">{p.phone ?? '—'}</dd></div>
                <div><dt className="text-muted">Country</dt><dd className="mt-1">{p.country ?? '—'}</dd></div>
                <div><dt className="text-muted">Account type</dt><dd className="mt-1">{roleLabels[p.role as Role] ?? p.role}</dd></div>
                <div>
                  <dt className="text-muted">School</dt>
                  <dd className="mt-1">{p.school ? <>{p.school.name}{p.school.code && <span className="ml-2 text-xs text-muted">({p.school.linkStatus === 'approved' ? 'confirmed by school' : p.school.linkStatus === 'pending' ? 'awaiting school confirmation' : p.school.linkStatus})</span>}</> : '—'}</dd>
                </div>
                {p.ageGroup === 'under_18' && (
                  <div><dt className="text-muted">Parent / guardian</dt><dd className="mt-1">{p.guardian ? `${p.guardian.guardianName} · consent ${p.guardian.status}` : 'Not added'}</dd></div>
                )}
              </dl>
            )}
            <p className="mt-8 text-xs leading-relaxed text-muted">Never share your password. Nexora staff will never ask for it. <Link to="/academy/safeguarding" className="link">Safeguarding & privacy</Link></p>
          </div>
        </aside>
      </div>
    </div>
  )
}

type Profile = Awaited<ReturnType<typeof getDashboard>>['profile']

function ProfileForm({ profile: p, onDone }: { profile: Profile; onDone: () => void }) {
  const router = useRouter()
  const { pending, error, run } = useAction()
  const [minor, setMinor] = useState(p.ageGroup === 'under_18')
  const needsGuardian = minor && (!p.guardian || p.guardian.status !== 'verified')
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const g = (k: string) => String(f.get(k) ?? '').trim()
    const ok = await run(() =>
      updateProfile({
        data: {
          fullName: g('fullName'),
          phone: g('phone'),
          country: g('country'),
          ageGroup: minor ? 'under_18' : 'adult',
          schoolCode: g('schoolCode') || undefined,
          schoolName: g('schoolName') || undefined,
          guardian: needsGuardian ? { name: g('gName'), phone: g('gPhone'), email: g('gEmail'), relationship: g('gRel'), consent: f.get('gConsent') === 'on' ? true : (false as unknown as true) } : undefined,
        },
      }),
    )
    if (ok) {
      onDone()
      router.invalidate()
    }
  }
  return (
    <form onSubmit={submit} className="mt-5 grid gap-6">
      <Field label="Full name" htmlFor="p-name"><input id="p-name" name="fullName" className="field" defaultValue={p.fullName} required minLength={2} /></Field>
      <Field label="Phone" htmlFor="p-phone"><input id="p-phone" name="phone" className="field" defaultValue={p.phone ?? ''} required pattern="[0-9+\(\)\-\s]{7,}" /></Field>
      <Field label="Country" htmlFor="p-country">
        <select id="p-country" name="country" className="field" defaultValue={p.country ?? 'Nigeria'}>{countries.map((c) => <option key={c}>{c}</option>)}</select>
      </Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={minor} onChange={(e) => setMinor(e.target.checked)} /> I am under 18</label>
      {!p.school?.code && (
        <>
          <Field label="Partner school code" htmlFor="p-code"><input id="p-code" name="schoolCode" className="field uppercase" placeholder="NXS-…" /></Field>
          <Field label="Or school name" htmlFor="p-school"><input id="p-school" name="schoolName" className="field" defaultValue={p.school?.name ?? ''} /></Field>
        </>
      )}
      {needsGuardian && (
        <div className="grid gap-5 bg-forest-tint/60 p-4">
          <p className="text-sm">Parent or guardian details</p>
          <Field label="Name" htmlFor="p-gn"><input id="p-gn" name="gName" className="field" required /></Field>
          <Field label="Relationship" htmlFor="p-gr"><input id="p-gr" name="gRel" className="field" required placeholder="Mother, father, guardian…" /></Field>
          <Field label="Phone" htmlFor="p-gp"><input id="p-gp" name="gPhone" className="field" required pattern="[0-9+\(\)\-\s]{7,}" /></Field>
          <Field label="Email (optional)" htmlFor="p-ge"><input id="p-ge" name="gEmail" type="email" className="field" /></Field>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="gConsent" required className="mt-1" /> My parent or guardian agrees to my participation and to Nexora contacting them.</label>
        </div>
      )}
      {error && <Alert>{error}</Alert>}
      <button className="btn btn-primary justify-center" disabled={pending}>{pending ? 'Saving…' : 'Save profile'}</button>
    </form>
  )
}
