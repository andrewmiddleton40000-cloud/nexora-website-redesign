import { createFileRoute } from '@tanstack/react-router'
import { getStore } from '@netlify/blobs'
import { MEDIA_KEY, MEDIA_STORE, MEDIA_TYPES } from '@/server/blog'

/** Serves uploaded blog images. Keys are random and never reused, so they cache forever. */
export const Route = createFileRoute('/api/blog/media/$key')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!MEDIA_KEY.test(params.key)) return new Response('Not found', { status: 404 })
        const data = await getStore(MEDIA_STORE).get(params.key, { type: 'arrayBuffer' })
        if (!data) return new Response('Not found', { status: 404 })
        const ext = params.key.split('.').pop()!
        return new Response(data, {
          headers: {
            'Content-Type': MEDIA_TYPES[ext],
            'Cache-Control': 'public, max-age=31536000, immutable',
            'X-Content-Type-Options': 'nosniff',
          },
        })
      },
    },
  },
})
