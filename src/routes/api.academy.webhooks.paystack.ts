import { createFileRoute } from '@tanstack/react-router'
import { confirmGatewayPayment, verifyPaystackSignature } from '@/server/payments'

// Configure in Paystack: Settings → API Keys & Webhooks → Webhook URL = https://<site>/api/academy/webhooks/paystack
export const Route = createFileRoute('/api/academy/webhooks/paystack')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text()
        if (!verifyPaystackSignature(raw, request.headers.get('x-paystack-signature'))) return new Response('Invalid signature', { status: 401 })
        let event: { event?: string; data?: { reference?: string } }
        try {
          event = JSON.parse(raw)
        } catch {
          return new Response('Bad payload', { status: 400 })
        }
        // The webhook is only a trigger: we always re-verify with Paystack's API before granting access.
        if (event.event === 'charge.success' && event.data?.reference) {
          try {
            await confirmGatewayPayment(event.data.reference, null)
          } catch (e) {
            console.error('paystack webhook processing failed', e)
            return new Response('Retry later', { status: 500 })
          }
        }
        return new Response('ok')
      },
    },
  },
})
