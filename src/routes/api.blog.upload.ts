import { createFileRoute } from '@tanstack/react-router'
import { getStore } from '@netlify/blobs'
import { audit, currentUser } from '@/server/core'
import { MEDIA_STORE } from '@/server/blog'
import { BLOG, hasRole } from '@/lib/roles'

const MAX_BYTES = 5 * 1024 * 1024
const EXT: Record<string, string> = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif' }

/** Image upload for blog authors. Returns the public path to use in a post. */
export const Route = createFileRoute('/api/blog/upload')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const user = await currentUser()
        if (!user || !hasRole(user.role, BLOG)) return Response.json({ error: 'You do not have permission to upload images.' }, { status: 403 })
        const form = await request.formData().catch(() => null)
        const file = form?.get('file')
        if (!(file instanceof File)) return Response.json({ error: 'Choose an image to upload.' }, { status: 400 })
        const ext = EXT[file.type]
        if (!ext) return Response.json({ error: 'Upload a JPG, PNG, WebP or GIF image.' }, { status: 400 })
        if (file.size > MAX_BYTES) return Response.json({ error: 'Images must be 5 MB or smaller.' }, { status: 400 })
        const base = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'image'
        const key = `${base}-${crypto.randomUUID().slice(0, 8)}.${ext}`
        await getStore(MEDIA_STORE).set(key, await file.arrayBuffer())
        await audit(user.id, 'blog.media_uploaded', 'blog_media', key)
        return Response.json({ path: `/api/blog/media/${key}` })
      },
    },
  },
})
