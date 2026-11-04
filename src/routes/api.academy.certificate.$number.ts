import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { currentUser, db, schema } from '@/server/core'
import { renderCertificate } from '@/server/certificate'
import { ACADEMIC, hasRole } from '@/lib/roles'

export const Route = createFileRoute('/api/academy/certificate/$number')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const user = await currentUser()
        if (!user) return new Response('Please sign in to download certificates.', { status: 401 })
        const [c] = await db().select().from(schema.certificates).where(eq(schema.certificates.number, params.number))
        if (!c || (c.userId !== user.id && !hasRole(user.role, ACADEMIC))) return new Response('Certificate not found.', { status: 404 })
        if (c.revokedAt) return new Response('This certificate has been revoked.', { status: 410 })
        const origin = new URL(request.url).origin
        const bytes = await renderCertificate({ ...c, verifyUrl: `${origin}/academy/verify/${c.verificationCode}` })
        return new Response(bytes as unknown as BodyInit, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="nexora-certificate-${c.number}.pdf"`,
            'Cache-Control': 'private, no-store',
          },
        })
      },
    },
  },
})
