import { useState, type FormEvent } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { academySeo } from '@/lib/academy-seo'
import { authErrorMessage, identity } from '@/lib/auth-client'
import { Alert, Field } from '@/components/academy/ui'

type Mode = 'login' | 'forgot' | 'reset' | 'invite'

export const Route = createFileRoute('/academy/login')({
  validateSearch: (s: Record<string, unknown>): { mode?: Mode; next?: string } => ({
    mode: (['login', 'forgot', 'reset', 'invite'].includes(String(s.mode)) ? s.mode : undefined) as Mode | undefined,
    next: typeof s.next === 'string' && s.next.startsWith('/academy') ? s.next : undefined,
  }),
  head: () => academySeo({ title: 'Sign in', path: '/academy/login', noindex: true }),
  component: Login,
})

function Login() {
  const search = Route.useSearch()
  const [mode, setMode] = useState<Mode>(search.mode ?? 'login')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const email = String(f.get('email') ?? '').trim()
    const password = String(f.get('password') ?? '')
    setPending(true)
    setError(null)
    setInfo(null)
    try {
      const id = await identity()
      if (mode === 'login') {
        await id.login(email, password)
        window.location.href = search.next ?? '/academy/dashboard'
        return
      }
      if (mode === 'forgot') {
        await id.requestPasswordRecovery(email)
        setInfo('If an account exists for that email, a password reset link is on its way. Open it on this device to choose a new password.')
        return
      }
      if (password.length < 8) throw Object.assign(new Error('Please use a password of at least 8 characters.'), { status: 0 })
      if (password !== String(f.get('password2') ?? '')) throw Object.assign(new Error('The two passwords do not match.'), { status: 0 })
      if (mode === 'reset') {
        await id.updateUser({ password })
      } else {
        const token = sessionStorage.getItem('nda_invite_token')
        if (!token) throw Object.assign(new Error('This invitation link has expired. Please open the link from your email again.'), { status: 0 })
        await id.acceptInvite(token, password)
        sessionStorage.removeItem('nda_invite_token')
      }
      window.location.href = '/academy/dashboard'
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setPending(false)
    }
  }

  const titles: Record<Mode, [string, string]> = {
    login: ['Welcome back.', 'Sign in to continue learning.'],
    forgot: ['Forgotten your password?', 'We’ll email you a reset link.'],
    reset: ['Choose a new password.', 'You are signed in — set a new password to finish.'],
    invite: ['Accept your invitation.', 'Choose a password for your account.'],
  }
  return (
    <section className="wrap grid gap-14 py-16 md:grid-cols-12 md:py-24">
      <div className="md:col-span-5">
        <p className="eyebrow">Academy account</p>
        <h1 className="display mt-6 text-5xl md:text-6xl">
          {titles[mode][0]} <span className="serif text-forest">{titles[mode][1]}</span>
        </h1>
        <p className="mt-6 leading-relaxed text-muted">Students, parents’ registered learners, school representatives and Nexora staff all sign in here.</p>
      </div>
      <form onSubmit={submit} className="md:col-span-6 md:col-start-7">
        <fieldset disabled={pending} className="grid gap-8 border-t border-ink pt-8 disabled:opacity-70">
          <legend className="sr-only">{titles[mode][0]}</legend>
          {(mode === 'login' || mode === 'forgot') && (
            <Field label="Email" htmlFor="l-email"><input id="l-email" name="email" type="email" className="field" required autoComplete="email" /></Field>
          )}
          {mode !== 'forgot' && (
            <Field label={mode === 'login' ? 'Password' : 'New password'} htmlFor="l-pw">
              <input id="l-pw" name="password" type="password" className="field" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </Field>
          )}
          {(mode === 'reset' || mode === 'invite') && (
            <Field label="Confirm new password" htmlFor="l-pw2"><input id="l-pw2" name="password2" type="password" className="field" required autoComplete="new-password" /></Field>
          )}
          {error && <Alert>{error}</Alert>}
          {info && <Alert tone="success">{info}</Alert>}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button type="submit" className="btn btn-primary">
              {pending ? 'Please wait…' : mode === 'login' ? 'Sign in' : mode === 'forgot' ? 'Send reset link' : 'Save password'} <span className="arrow" aria-hidden="true">→</span>
            </button>
            {mode === 'login' ? (
              <button type="button" className="link text-sm" onClick={() => { setMode('forgot'); setError(null) }}>Forgot password?</button>
            ) : mode === 'forgot' ? (
              <button type="button" className="link text-sm" onClick={() => { setMode('login'); setInfo(null) }}>Back to sign in</button>
            ) : null}
          </div>
          {mode === 'login' && (
            <p className="text-sm text-muted">New to the Academy? <Link to="/academy/register" className="link">Create an account</Link>.</p>
          )}
        </fieldset>
      </form>
    </section>
  )
}
