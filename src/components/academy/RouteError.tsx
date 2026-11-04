import { Link, type ErrorComponentProps } from '@tanstack/react-router'
import { errMsg } from './ui'

export function RouteError({ error }: ErrorComponentProps) {
  const msg = errMsg(error)
  const signIn = /sign in/i.test(msg)
  return (
    <section className="wrap py-24 md:py-32">
      <p className="eyebrow">{signIn ? 'Sign in required' : 'Not available'}</p>
      <h1 className="display mt-6 max-w-3xl text-4xl md:text-6xl">{msg}</h1>
      <div className="mt-10 flex flex-wrap gap-3">
        {signIn ? (
          <Link to="/academy/login" className="btn btn-primary">Sign in</Link>
        ) : (
          <Link to="/academy/dashboard" className="btn btn-primary">Go to my dashboard</Link>
        )}
        <Link to="/academy/courses" className="btn btn-ghost">Browse courses</Link>
      </div>
    </section>
  )
}
