import { Link } from '@tanstack/react-router'
import { nav, site } from '@/data/site'
import { categories } from '@/data/pricing'
import { Logo } from './Logo'

export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-ink text-paper">
      <div className="wrap pt-20 pb-24 md:pb-10">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo tone="paper" />
            <p className="mt-6 max-w-sm text-paper/70 leading-relaxed">
              A digital solutions partner for ambitious businesses — websites, e-commerce, web applications, AI and
              automation built around how you actually work.
            </p>
            {site.email && (
              <a href={`mailto:${site.email}`} className="link mt-8 inline-block text-xl">
                {site.email}
              </a>
            )}
          </div>

          <div className="md:col-span-2">
            <h2 className="eyebrow !text-paper/50">Navigate</h2>
            <ul className="mt-5 space-y-3">
              {nav.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-paper/85 hover:text-signal transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h2 className="eyebrow !text-paper/50">Services</h2>
            <ul className="mt-5 space-y-3">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to="/services" hash={c.id} className="text-paper/85 hover:text-signal transition-colors">
                    {c.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/services" hash="faq" className="text-paper/85 hover:text-signal transition-colors">
                  Pricing FAQs
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h2 className="eyebrow !text-paper/50">Start</h2>
            <ul className="mt-5 space-y-3">
              <li>
                <Link to="/enquiry" className="text-paper/85 hover:text-signal transition-colors">
                  Request a proposal
                </Link>
              </li>
              <li>
                <a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer" className="text-paper/85 hover:text-signal transition-colors">
                  WhatsApp {site.whatsapp.display}
                </a>
              </li>
              <li>
                <a href={`tel:${site.phone.tel}`} className="text-paper/85 hover:text-signal transition-colors">
                  Call {site.phone.display}
                </a>
              </li>
              {site.socials.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-paper/85 hover:text-signal transition-colors">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p aria-hidden="true" className="display mt-24 select-none text-[19vw] leading-[0.8] text-paper/[0.07] md:text-[13.5rem]">
          Nexora
        </p>

        <div className="mt-6 flex flex-col gap-3 border-t border-line-dark pt-6 text-sm text-paper/50 md:flex-row md:justify-between">
          <p>© {year} {site.name}. All rights reserved.</p>
          <p className="md:pr-20">Practical technology for growing businesses.</p>
        </div>
      </div>
    </footer>
  )
}
