import type { ServiceCategory } from './pricing'

// Nexora portfolio. Add genuine, approved projects only — never placeholders
// presented as client work. Screenshots go in /public/img/work/.
//
// `kind` keeps labelling honest: use 'client' for delivered client work and
// 'internal' for Nexora's own products, demonstrations or personal projects.
//
// Example entry (copy, fill in real details, and uncomment):
// {
//   slug: 'example-hotel',
//   name: 'Project name',
//   industry: 'Hospitality',
//   category: 'websites', // one of the service category ids in src/data/pricing.ts
//   kind: 'client',
//   services: ['Website Design & Development', 'CRM & Workflow Systems'],
//   problem: 'One or two sentences on the problem the business needed solved.',
//   approach: 'What Nexora built and how it addressed the problem.',
//   outcome: 'Only results you can verify, e.g. "Bookings now arrive through the website instead of phone calls."',
//   image: 'work/example-hotel.jpg',
//   imageAlt: 'Homepage of the example hotel website on a laptop',
//   url: 'https://example.com',
//   year: '2026',
// },

export type Project = {
  slug: string
  name: string
  industry: string
  category: ServiceCategory['id']
  kind: 'client' | 'internal'
  services: string[]
  problem: string
  approach?: string
  /** Documented, verifiable outcome only. Leave out rather than estimate. */
  outcome?: string
  image: string
  imageAlt: string
  url?: string
  year?: string
}

export const projects: Project[] = []
