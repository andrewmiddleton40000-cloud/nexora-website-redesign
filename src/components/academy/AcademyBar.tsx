import { Link } from '@tanstack/react-router'
import { academy, academyNav } from '@/data/academy'

export type SessionInfo = { id: number; fullName: string; email: string; role: string } | null

/** Secondary navigation that gives the Academy its own identity inside the Nexora site. */
export function AcademyBar({ session }: { session: SessionInfo }) {
  const staff = session && ['super_admin', 'academic_admin', 'finance_admin', 'instructor'].includes(session.role)
  const accountTo = !session ? '/academy/login' : staff ? '/academy/admin' : session.role === 'school_partner' ? '/academy/school' : '/academy/dashboard'
  return (
    <div className="bg-ink text-paper">
      <div className="wrap flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
        <Link to="/academy" className="inline-flex items-center gap-2.5" aria-label={`${academy.name} — home`}>
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-signal" aria-hidden="true" />
          <span className="text-sm font-semibold tracking-[-0.01em]">
            Nexora <span className="font-normal text-paper/60">Digital Academy</span>
          </span>
        </Link>
        <nav aria-label="Academy" className="order-3 w-full overflow-x-auto sm:order-none sm:w-auto">
          <ul className="flex items-center gap-5 whitespace-nowrap text-sm">
            {academyNav.map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  className="text-paper/70 transition-colors hover:text-signal"
                  activeOptions={{ exact: n.to === '/academy' }}
                  activeProps={{ className: '!text-signal', 'aria-current': 'page' }}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          {session ? (
            <Link to={accountTo} className="btn btn-signal !min-h-[2.2rem] !px-4 text-sm">
              {staff ? 'Admin' : session.role === 'school_partner' ? 'School dashboard' : 'My dashboard'}
            </Link>
          ) : (
            <>
              <Link to="/academy/login" className="text-paper/80 hover:text-signal">
                Sign in
              </Link>
              <Link to="/academy/register" className="btn btn-signal !min-h-[2.2rem] !px-4 text-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
