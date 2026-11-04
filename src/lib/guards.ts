import { redirect } from '@tanstack/react-router'
import type { SessionInfo } from '@/components/academy/AcademyBar'

/** UX guard for private Academy routes. Real authorisation happens in every server function. */
export function requireSession({ context, location }: { context: { session?: SessionInfo }; location: { href: string } }) {
  if (!context.session) throw redirect({ to: '/academy/login', search: { next: location.href } })
  return { session: context.session }
}
