import { Link, createFileRoute } from '@tanstack/react-router'
import { img, imgSet, site } from '@/data/site'
import { seo } from '@/lib/seo'
import { WhatsAppIcon } from '@/components/WhatsApp'

export const Route = createFileRoute('/contact')({
  head: () =>
    seo({
      title: 'Contact',
      path: '/contact',
      description:
        'Contact Nexora Technologies on WhatsApp or by phone, or send a project enquiry to request a tailored proposal.',
    }),
  component: ContactPage,
})

function ContactPage() {
  const methods = [
    {
      label: 'WhatsApp',
      value: site.whatsapp.display,
      note: 'The quickest way to reach us. Send a message any time and we’ll reply as soon as we can.',
      href: site.whatsapp.url,
      cta: 'Chat on WhatsApp',
      external: true,
    },
    {
      label: 'Phone',
      value: site.phone.display,
      note: 'Call to discuss a project or an existing enquiry.',
      href: `tel:${site.phone.tel}`,
      cta: 'Call now',
      external: false,
    },
    ...(site.email
      ? [{ label: 'Email', value: site.email, note: 'For detailed briefs and documents.', href: `mailto:${site.email}`, cta: 'Send an email', external: false }]
      : []),
  ]

  return (
    <>
      <section className="wrap pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="eyebrow rise">Contact</p>
            <h1 className="display rise rise-2 mt-6 text-[3rem] md:text-7xl lg:text-[5.5rem]">
              Let’s talk about <span className="serif text-forest">your business.</span>
            </h1>
          </div>
          <p className="rise rise-3 text-lg leading-relaxed text-ink-soft md:col-span-4 md:self-end">
            Message us on WhatsApp, give us a call, or send a project enquiry to request a written proposal.
          </p>
        </div>

        <ul className="mt-16 grid border-t border-ink md:grid-cols-3">
          {methods.map((m) => (
            <li key={m.label} className="flex flex-col border-b border-line py-8 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0">
              <p className="eyebrow">{m.label}</p>
              <p className="mt-4 text-2xl font-medium tabular-nums tracking-[-0.02em]">{m.value}</p>
              <p className="mt-3 flex-1 leading-relaxed text-muted">{m.note}</p>
              <a
                href={m.href}
                {...(m.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className={`btn mt-6 self-start ${m.label === 'WhatsApp' ? 'btn-whatsapp' : 'btn-ghost'}`}
              >
                {m.label === 'WhatsApp' && <WhatsAppIcon />} {m.cta}
              </a>
            </li>
          ))}
          <li className="flex flex-col border-b border-line bg-forest p-8 text-paper">
            <p className="eyebrow !text-paper/60">Request a proposal</p>
            <p className="mt-4 text-2xl font-medium tracking-[-0.02em]">Have a defined project?</p>
            <p className="mt-3 flex-1 leading-relaxed text-paper/75">
              Share your requirements, budget and timeline. We’ll review them and send a tailored proposal.
            </p>
            <Link to="/enquiry" className="btn btn-signal mt-6 self-start">
              Start your enquiry <span className="arrow" aria-hidden="true">→</span>
            </Link>
          </li>
        </ul>

        {site.socials.length > 0 && (
          <p className="mt-10 flex flex-wrap gap-4 text-sm">
            {site.socials.map((s) => (
              <a key={s.href} className="link" href={s.href} target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>
            ))}
          </p>
        )}
      </section>

      <section className="border-t border-line bg-white">
        <div className="wrap grid gap-12 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-5">
            <div className="aspect-[4/3] overflow-hidden bg-paper-deep">
              <img
                src={img('office.jpg', 900)}
                srcSet={imgSet('office.jpg', [480, 768, 960])}
                sizes="(min-width: 768px) 38vw, 100vw"
                alt="An office desk with a monitor showing a simple customer pipeline board, a desk phone and stacked folders"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-6 md:col-start-7 md:self-center">
            <p className="eyebrow">What happens next</p>
            <h2 className="display mt-6 text-4xl md:text-5xl">
              A clear conversation, <span className="serif">then a written proposal.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              We’ll ask about your business, what you need the project to achieve and any features you have in mind.
              Your proposal sets out inclusions, the final price and an estimated schedule before any work begins.
            </p>
            <Link to="/services" hash="pricing" className="link mt-8 inline-block">
              View services and starting prices →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
