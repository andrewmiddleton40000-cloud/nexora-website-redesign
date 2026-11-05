import { createFileRoute, redirect } from '@tanstack/react-router'

// Insights was renamed to Blog. Old article links keep working.
export const Route = createFileRoute('/insights/$slug')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/blog/$slug', params: { slug: params.slug }, statusCode: 301 })
  },
})
