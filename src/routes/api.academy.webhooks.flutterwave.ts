import { createFileRoute } from '@tanstack/react-router'
import { confirmGatewayPayment, verifyFlutterwaveHash } from '@/server/payments'

// Configure in Flutterwave: Settings → Webhooks → URL = https://<site>/api/academy/webhooks/flutterwave,
// and set the same "Secret hash" as FLUTTERWAVE_WEBHOOK_HASH.
export const Route = createFileRoute('/api/academy/webhooks/flutterwave')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!verifyFlutterwaveHash(request.headers.get('verif-hash'))) return new Response('Invalid signature', { status: 401 })
        const body = (await request.json().catch(() => null)) as { event?: string; data?: { tx_ref?: string } } | null
        if (body?.event === 'charge.completed' && body.data?.tx_ref) {
          try {
            await confirmGatewayPayment(body.data.tx_ref, null)
          } catch (e) {
            console.error('flutterwave webhook processing failed', e)
            return new Response('Retry later', { status: 500 })
          }
        }
        return new Response('ok')
      },
    },
  },
})
