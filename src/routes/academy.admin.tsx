import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { academySeo } from '@/lib/academy-seo'
import { requireSession } from '@/lib/guards'
import { signOut } from '@/lib/auth-client'
import { adminTabs, hasRole, roleLabels, ADMIN_AREA, type AdminTab, type Role } from '@/lib/roles'
import { Overview } from '@/components/academy/admin/Overview'
import { Students } from '@/components/academy/admin/Students'
import { Schools } from '@/components/academy/admin/Schools'
import { Courses } from '@/components/academy/admin/Courses'
import { Academic } from '@/components/academy/admin/Academic'
import { Payments } from '@/components/academy/admin/Payments'
import { Finance } from '@/components/academy/admin/Finance'
import { Content } from '@/components/academy/admin/Content'
import { Blog } from '@/components/academy/admin/Blog'

export const Route = createFileRoute('/academy/admin')({
  validateSearch: (s: Record<string, unknown>): { tab?: AdminTab } => ({ tab: (adminTabs.some((t) => t.id === s.tab) ? s.tab : 'overview') as AdminTab }),
  beforeLoad: (ctx) => {
    const { session } = requireSession(ctx)
    // UX redirect only; every admin server function re-checks the role.
    if (!hasRole(session.role, ADMIN_AREA)) throw redirect({ to: '/academy/dashboard' })
    return { session }
  },
  head: () => academySeo({ title: 'Administration', path: '/academy/admin', noindex: true }),
  component: Admin,
})

function Admin() {
  const { session } = Route.useRouteContext()
  const { tab = 'overview' } = Route.useSearch()
  const role = session.role as Role
  const tabs = adminTabs.filter((t) => hasRole(role, t.roles))
  const current = tabs.find((t) => t.id === tab) ?? tabs[0]
  return (
    <div className="pb-24">
      <section className="border-b border-line bg-white">
        <div className="wrap flex flex-col gap-4 pt-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Nexora Digital Academy · Administration</p>
            <h1 className="display mt-3 text-4xl md:text-5xl">{current.label}</h1>
            <p className="mt-2 text-sm text-muted">Signed in as {session.fullName} · {roleLabels[role]}</p>
          </div>
          <div className="flex gap-3 pb-1 text-sm">
            <Link to="/academy/dashboard" className="link">Learner view</Link>
            <button type="button" className="link" onClick={() => signOut()}>Sign out</button>
          </div>
        </div>
        <nav aria-label="Administration sections" className="wrap mt-8 overflow-x-auto">
          <ul className="flex gap-6 whitespace-nowrap text-sm">
            {tabs.map((t) => (
              <li key={t.id}>
                <Link
                  to="/academy/admin"
                  search={{ tab: t.id }}
                  className={`inline-block border-b-2 pb-3 ${t.id === current.id ? 'border-forest font-medium text-ink' : 'border-transparent text-muted hover:text-ink'}`}
                  aria-current={t.id === current.id ? 'page' : undefined}
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>
      <div className="wrap mt-10">
        {current.id === 'overview' && <Overview />}
        {current.id === 'students' && <Students role={role} />}
        {current.id === 'schools' && <Schools role={role} />}
        {current.id === 'courses' && <Courses />}
        {current.id === 'academic' && <Academic />}
        {current.id === 'payments' && <Payments />}
        {current.id === 'finance' && <Finance />}
        {current.id === 'content' && <Content role={role} />}
        {current.id === 'blog' && <Blog />}
      </div>
    </div>
  )
}
