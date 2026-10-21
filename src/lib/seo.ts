import { site } from '@/data/site'

/** Per-route title, description and social-sharing tags. */
export function seo({ title, description, path = '/' }: { title?: string; description?: string; path?: string }) {
  const fullTitle = title ? `${title} — ${site.name}` : `${site.name} — Better digital systems for growing businesses`
  const desc = description ?? site.description
  const url = `${site.url}${path}`
  const image = `${site.url}/.netlify/images?url=/img/hero.jpg&w=1200&h=630&fit=cover&fm=jpg`
  return {
    meta: [
      { title: fullTitle },
      { name: 'description', content: desc },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: desc },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
      { property: 'og:image:alt', content: 'A business owner reviewing orders on a laptop in her shop' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: desc },
      { name: 'twitter:image', content: image },
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}
