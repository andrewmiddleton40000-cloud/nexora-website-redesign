import { useState, type FormEvent } from 'react'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { countries, seedCourses } from '@/data/academy'
import { academySeo } from '@/lib/academy-seo'
import { authErrorMessage, identity } from '@/lib/auth-client'
import { Alert, Field, PageIntro, labelCls } from '@/components/academy/ui'

export const Route = createFileRoute('/academy/register')({
  validateSearch: (s: Record<string, unknown>): { course?: string } => ({ course: typeof s.course === 'string' ? s.course : undefined }),
  beforeLoad: ({ context }) => {
    if (context.session) throw redirect({ to: '/academy/dashboard' })
  },
  head: () => academySeo({ title: 'Register', path: '/academy/register', description: 'Create your Nexora Digital Academy learner account.' }),
  component: Register,
})

function Register() {
  const { course } = Route.useSearch()
  const [minor, setMinor] = useState<boolean | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const g = (k: string) => String(f.get(k) ?? '').trim()
    if (g('password') !== g('password2')) return setError('The two passwords do not match.')
    if (g('password').length < 8) return setError('Please use a password of at least 8 characters.')
    if (minor && f.get('guardian_consent') !== 'on') return setError('A parent or guardian must agree to your participation before you can register.')
    setPending(true)
    setError(null)
    try {
      const { signup } = await identity()
      // Registration details are stored with the account and copied into the Academy record on first sign-in.
      const user = await signup(g('email'), g('password'), {
        full_name: g('full_name'),
        phone: g('phone'),
        country: g('country'),
        age_group: minor ? 'under_18' : 'adult',
        school_code: g('school_code').toUpperCase(),
        school_name: g('school_name'),
        course: g('course'),
        ...(minor
          ? { guardian_name: g('guardian_name'), guardian_relationship: g('guardian_relationship'), guardian_phone: g('guardian_phone'), guardian_email: g('guardian_email'), guardian_consent: true }
          : {}),
      })
      if (user.confirmedAt) {
        window.location.href = '/academy/dashboard'
        return
      }
      setDone(g('email'))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setPending(false)
    }
  }

  if (done)
    return (
      <section className="wrap py-24 md:py-32">
        <p className="eyebrow">Almost there</p>
        <h1 className="display mt-6 max-w-3xl text-5xl md:text-6xl">
          Check your inbox to <span className="serif text-forest">confirm your email.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          We sent a confirmation link to <strong className="text-ink">{done}</strong>. Open it to activate your account, then sign in. If it does not arrive within a few minutes, check your spam folder.
        </p>
        <Link to="/academy/login" className="btn btn-primary mt-10">Go to sign in</Link>
      </section>
    )

  return (
    <>
      <PageIntro eyebrow="Learner registration" title={<>Create your <span className="serif text-forest">Academy account.</span></>} intro={<>Already registered? <Link to="/academy/login" className="link">Sign in</Link>.</>} />
      <section className="wrap pb-24">
        <form onSubmit={submit} className="grid gap-14 md:grid-cols-12">
          <fieldset disabled={pending} className="grid gap-8 disabled:opacity-70 md:col-span-8 md:grid-cols-2">
            <legend className="eyebrow mb-2 md:col-span-2">Your details</legend>
            <Field label="Full name *" htmlFor="r-name" hint="As it should appear on your certificate."><input id="r-name" name="full_name" className="field" required minLength={2} maxLength={120} autoComplete="name" /></Field>
            <Field label="Email *" htmlFor="r-email"><input id="r-email" name="email" type="email" className="field" required maxLength={254} autoComplete="email" /></Field>
            <Field label="Phone number *" htmlFor="r-phone"><input id="r-phone" name="phone" type="tel" className="field" required pattern="[0-9+\(\)\-\s]{7,}" maxLength={40} autoComplete="tel" /></Field>
            <Field label="Country *" htmlFor="r-country">
              <select id="r-country" name="country" className="field cursor-pointer appearance-none" required defaultValue="Nigeria">
                {countries.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Password *" htmlFor="r-pw" hint="At least 8 characters. Never share it with anyone."><input id="r-pw" name="password" type="password" className="field" required minLength={8} autoComplete="new-password" /></Field>
            <Field label="Confirm password *" htmlFor="r-pw2"><input id="r-pw2" name="password2" type="password" className="field" required minLength={8} autoComplete="new-password" /></Field>
            <Field label="Course *" htmlFor="r-course" className="md:col-span-2">
              <select id="r-course" name="course" className="field cursor-pointer appearance-none" required defaultValue={course ?? 'ai-prompt-engineering'}>
                {seedCourses.map((c) => (
                  <option key={c.slug} value={c.slug} disabled={c.level > 1}>
                    Level {c.level} — {c.title}{c.level > 1 ? ' (requires previous level)' : ''}
                  </option>
                ))}
              </select>
            </Field>

            <p className="eyebrow mt-6 md:col-span-2">School (where applicable)</p>
            <Field label="Partner school code" htmlFor="r-code" hint="If your school is a Nexora partner, it will give you a code like NXS-AB12CD. Your school will confirm that you are one of its students."><input id="r-code" name="school_code" className="field uppercase" maxLength={20} placeholder="NXS-…" /></Field>
            <Field label="Or school name" htmlFor="r-school"><input id="r-school" name="school_name" className="field" maxLength={160} /></Field>

            <div className="md:col-span-2">
              <p className={labelCls}>Are you under 18? *</p>
              <div className="mt-4 flex flex-wrap gap-6">
                <label className="flex items-center gap-2"><input type="radio" name="age" required checked={minor === true} onChange={() => setMinor(true)} /> Yes, I am under 18</label>
                <label className="flex items-center gap-2"><input type="radio" name="age" required checked={minor === false} onChange={() => setMinor(false)} /> No, I am 18 or older</label>
              </div>
            </div>

            {minor && (
              <div className="grid gap-8 bg-forest-tint/60 p-6 md:col-span-2 md:grid-cols-2">
                <p className="leading-relaxed md:col-span-2">
                  <strong className="font-medium">Parent or guardian consent.</strong> Learners under 18 need permission from a parent or guardian. Nexora will contact them to verify consent before your enrolment is activated.
                </p>
                <Field label="Parent / guardian name *" htmlFor="g-name"><input id="g-name" name="guardian_name" className="field" required minLength={2} maxLength={120} /></Field>
                <Field label="Relationship *" htmlFor="g-rel">
                  <select id="g-rel" name="guardian_relationship" className="field cursor-pointer appearance-none" required defaultValue="">
                    <option value="" disabled>Select</option>
                    {['Mother', 'Father', 'Legal guardian', 'Other family guardian'].map((r) => <option key={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Guardian phone *" htmlFor="g-phone"><input id="g-phone" name="guardian_phone" type="tel" className="field" required pattern="[0-9+\(\)\-\s]{7,}" maxLength={40} /></Field>
                <Field label="Guardian email" htmlFor="g-email"><input id="g-email" name="guardian_email" type="email" className="field" maxLength={254} /></Field>
                <label className="flex items-start gap-3 leading-relaxed md:col-span-2">
                  <input type="checkbox" name="guardian_consent" required className="mt-1.5" />
                  <span>My parent or guardian has agreed to my participation in Nexora Digital Academy and to Nexora contacting them to confirm this.</span>
                </label>
              </div>
            )}

            <label className="flex items-start gap-3 leading-relaxed md:col-span-2">
              <input type="checkbox" required className="mt-1.5" />
              <span>I have read the <Link to="/academy/safeguarding" className="link" target="_blank">safeguarding and privacy information</Link> and will keep my account details private.</span>
            </label>
            {error && <div className="md:col-span-2"><Alert>{error}</Alert></div>}
            <div className="md:col-span-2">
              <button type="submit" className="btn btn-primary">{pending ? 'Creating account…' : 'Create account'} <span className="arrow" aria-hidden="true">→</span></button>
            </div>
          </fieldset>
          <aside className="space-y-6 text-sm leading-relaxed text-muted md:col-span-3 md:col-start-10">
            <div className="border-t border-ink pt-5">
              <p className="eyebrow">What happens next</p>
              <ol className="mt-4 list-decimal space-y-2 pl-4">
                <li>Confirm your email address.</li>
                <li>Sign in to your dashboard.</li>
                <li>Pay for your course by bank transfer.</li>
                <li>Join your cohort and start learning.</li>
              </ol>
            </div>
            <div className="border-t border-ink pt-5">
              <p className="eyebrow">Minimal data</p>
              <p className="mt-4">We only ask for what we need to run your course. We never ask for your date of birth, home address or ID documents.</p>
            </div>
          </aside>
        </form>
      </section>
    </>
  )
}
