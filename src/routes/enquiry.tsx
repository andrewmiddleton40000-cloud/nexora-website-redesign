import { Link, createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { site } from '@/data/site'
import { allServices, pricingNote, whatsappLink } from '@/data/pricing'
import { seo } from '@/lib/seo'
import { ContactForm, serviceOption } from '@/components/ContactForm'
import { WhatsAppIcon } from '@/components/WhatsApp'

export const Route = createFileRoute('/enquiry')({
  validateSearch: z.object({ service: z.string().optional().catch(undefined) }),
  head: () =>
    seo({
      title: 'Project Enquiry',
      path: '/enquiry',
      description:
        'Request a proposal from Nexora Technologies. Tell us about your website, e-commerce, web application or automation project and receive a tailored quotation.',
    }),
  component: EnquiryPage,
})

const steps = [
  ['01', 'We review your requirements', 'Every enquiry is read by a person, not an autoresponder.'],
  ['02', 'We clarify the details', 'A short conversation to confirm scope, priorities and timing.'],
  ['03', 'You receive a written proposal', 'Inclusions, final price and an estimated schedule, before any work starts.'],
]

function EnquiryPage() {
  const { service: serviceId } = Route.useSearch()
  const service = allServices.find((s) => s.id === serviceId)

  return (
    <section className="wrap grid gap-16 pt-16 pb-24 md:pt-24 md:pb-32 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <p className="eyebrow rise">Project enquiry</p>
        <h1 className="display rise rise-2 mt-6 text-[3rem] md:text-7xl">
          Tell us what you <span className="serif text-forest">want to build.</span>
        </h1>
        <p className="rise rise-3 mt-8 max-w-md text-lg leading-relaxed text-ink-soft">
          Share a few details about your business and project. We’ll come back to you with questions or a tailored
          proposal.
        </p>

        <ol className="mt-12 border-t border-line">
          {steps.map(([n, t, d]) => (
            <li key={n} className="grid grid-cols-[2.5rem_1fr] border-b border-line py-5">
              <span className="text-sm text-forest tabular-nums pt-0.5">{n}</span>
              <div>
                <p className="font-medium">{t}</p>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-10 max-w-md text-sm leading-relaxed text-muted">{pricingNote}</p>

        <div className="mt-10 border-t border-line pt-8">
          <p className="font-medium">Prefer to chat first?</p>
          <a
            href={whatsappLink(service)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp mt-4"
          >
            <WhatsAppIcon /> Message us on WhatsApp
          </a>
          <p className="mt-4 text-sm text-muted">
            Or see{' '}
            <Link to="/contact" className="link text-ink">
              all contact options
            </Link>
            . WhatsApp {site.whatsapp.display}.
          </p>
        </div>
      </div>

      <div className="lg:col-span-6 lg:col-start-7 lg:pt-4">
        <h2 className="sr-only">Enquiry form</h2>
        <ContactForm key={serviceId ?? ''} defaultService={service ? serviceOption(service) : ''} />
      </div>
    </section>
  )
}
