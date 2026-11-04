import { site } from '@/data/site'
import { academy } from '@/data/academy'

/** Academy variant of seo(): Academy branding and an Academy share image. */
export function academySeo({ title, description, path, noindex }: { title?: string; description?: string; path: string; noindex?: boolean }) {
  const fullTitle = title ? `${title} — ${academy.name}` : `${academy.name} — ${academy.tagline}`
  const desc = description ?? academy.description
  const url = `${site.url}${path}`
  const image = `${site.url}/.netlify/images?url=/img/academy/hero.jpg&w=1200&h=630&fit=cover&fm=jpg`
  return {
    meta: [
      { title: fullTitle },
      { name: 'description', content: desc },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: desc },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
      { property: 'og:image:alt', content: 'Secondary-school students working together on laptops in a classroom' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: desc },
      { name: 'twitter:image', content: image },
      ...(noindex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}
