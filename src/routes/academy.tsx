import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AcademyBar } from '@/components/academy/AcademyBar'
import { getSession } from '@/server/fns/public'

export const Route = createFileRoute('/academy')({
  beforeLoad: async () => ({ session: await getSession().catch(() => null) }),
  component: AcademyLayout,
})

function AcademyLayout() {
  const { session } = Route.useRouteContext()
  return (
    <>
      <AcademyBar session={session} />
      <Outlet />
    </>
  )
}
