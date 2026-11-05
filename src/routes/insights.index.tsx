import { createFileRoute, redirect } from '@tanstack/react-router'

// Insights was renamed to Blog. Old links keep working.
export const Route = createFileRoute('/insights/')({
  beforeLoad: () => {
    throw redirect({ to: '/blog', statusCode: 301 })
  },
})
