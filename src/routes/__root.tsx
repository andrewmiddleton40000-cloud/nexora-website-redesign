import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { WhatsAppFloat } from '@/components/WhatsApp'
import { site } from '@/data/site'
import { seo } from '@/lib/seo'

import '../styles.css'

export const Route = createRootRoute({
  head: () => {
    const base = seo({})
    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#f3efe6' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: site.name },
        { name: 'twitter:card', content: 'summary_large_image' },
        ...base.meta,
      ],
      links: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Schibsted+Grotesk:wght@400;500;600&display=swap',
        },
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ProfessionalService',
            name: site.name,
            url: site.url,
            description: site.description,
            telephone: site.phone.tel,
            image: `${site.url}/.netlify/images?url=/img/hero.jpg&w=1200&h=630&fit=cover&fm=jpg`,
            areaServed: ['NG', 'Worldwide'],
            priceRange: '₦100,000 – ₦10,000,000+',
            ...(site.email ? { email: site.email } : {}),
            ...(site.socials.length ? { sameAs: site.socials.map((s) => s.href) } : {}),
          }),
        },
      ],
    }
  },
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <WhatsAppFloat />
        <Scripts />
      </body>
    </html>
  )
}

function NotFound() {
  return (
    <section className="wrap py-32 md:py-44">
      <p className="eyebrow">Error 404</p>
      <h1 className="display mt-6 text-5xl md:text-7xl max-w-3xl">
        This page isn’t here. <span className="serif">Let’s get you back on track.</span>
      </h1>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/" className="btn btn-primary">Back to home</Link>
        <Link to="/contact" className="btn btn-ghost">Contact us</Link>
        <Link to="/insights" className="btn btn-ghost">Read insights</Link>
      </div>
    </section>
  )
}
