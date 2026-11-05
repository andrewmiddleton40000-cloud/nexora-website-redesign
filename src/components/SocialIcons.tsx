import { site } from '@/data/site'
import { WhatsAppIcon } from './WhatsApp'

const paths: Record<string, string> = {
  YouTube:
    'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  Substack: 'M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z',
  Telegram:
    'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z',
  Phone:
    'M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z',
}

/** Official brand colours, so each logo appears as the original. */
const brand: Record<string, string> = {
  WhatsApp: '#25D366',
  Phone: '#1f4b3a',
  YouTube: '#FF0000',
  Substack: '#FF6719',
  Telegram: '#26A5E4',
}

export function SocialIcon({ label, className = 'h-5 w-5' }: { label: string; className?: string }) {
  if (label === 'WhatsApp') return <WhatsAppIcon className={className} />
  const d = paths[label]
  if (!d) return null
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

export function PhoneIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return <SocialIcon label="Phone" className={className} />
}

/**
 * Round logo buttons: WhatsApp and phone first (unless `contact` is false),
 * then every profile in site.socials.
 */
export function SocialLinks({
  contact = true,
  className = '',
}: {
  contact?: boolean
  className?: string
}) {
  const items = [
    ...(contact
      ? [
          { icon: 'WhatsApp', href: site.whatsapp.url, name: `Chat with Nexora on WhatsApp`, title: `WhatsApp ${site.whatsapp.display}`, external: true },
          { icon: 'Phone', href: `tel:${site.phone.tel}`, name: `Call Nexora on ${site.phone.display}`, title: `Call ${site.phone.display}`, external: false },
        ]
      : []),
    ...site.socials.map((s) => ({ icon: s.label, href: s.href, name: `Nexora on ${s.label}`, title: s.label, external: true })),
  ]
  if (items.length === 0) return null
  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {items.map((s) => (
        <li key={s.href}>
          <a
            href={s.href}
            {...(s.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            aria-label={s.name}
            title={s.title}
            style={{ color: brand[s.icon] ?? 'var(--color-forest)' }}
            className="social-btn"
          >
            {s.icon === 'WhatsApp' || paths[s.icon] ? (
              <SocialIcon label={s.icon} className="h-6 w-6" />
            ) : (
              <span className="text-xs text-ink">{s.icon}</span>
            )}
          </a>
        </li>
      ))}
    </ul>
  )
}
