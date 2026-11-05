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

export const projects: Project[] = [
  {
    slug: 'pepper-and-puff',
    name: 'Pepper & Puff',
    industry: 'Food & catering',
    category: 'websites',
    kind: 'client',
    services: ['Website Design & Development', 'Digital Menu', 'WhatsApp Ordering'],
    problem:
      'A home-style food and bakes business needed one place where customers could browse its platters, breakfast and lunch spreads, birthday packages and small chops, then order without back-and-forth messages.',
    approach:
      'Nexora designed and built the official Pepper & Puff digital menu: a warm, photo-led site with menu categories and packages, an estimated order total, and a basket that sends the finished order straight to WhatsApp. A shareable menu link and QR code make it easy to pass around.',
    image: 'work/pepper-and-puff.jpg',
    imageAlt: 'Homepage of the Pepper & Puff digital menu, showing the headline “Made for your people” beside a photo of a party platter',
    url: 'https://pepperandpuff.com.ng',
    year: '2026',
  },
  {
    slug: 'mj-aesthetics',
    name: 'MJ Aesthetics',
    industry: 'Beauty & creative services',
    category: 'websites',
    kind: 'client',
    services: ['Website Design & Development'],
    problem:
      'A beauty and creative studio in Dagenham, Essex, offering photography, makeup artistry, lash extensions, podcast production and event decoration, needed one website that presents all five services and turns visitors into bookings.',
    approach:
      'Nexora designed and built a dark, gold-accented website with a page for each service, a portfolio of the studio’s own work, an about page, and clear “Book now” and enquiry routes throughout.',
    image: 'work/mj-aesthetics.jpg',
    imageAlt: 'Homepage of the MJ Aesthetics website, with the headline “Beauty & Creative Reimagined” over a close-up of manicured nails',
    url: 'https://www.mjasthestics.co.uk',
    year: '2026',
  },
  {
    slug: 'nexora-website',
    name: 'Nexora Technologies website',
    industry: 'Technology services',
    category: 'websites',
    kind: 'internal',
    services: ['Website Design & Development', 'Web Application', 'Online Learning Platform'],
    problem:
      'Nexora needed its own website to explain its services with published starting prices, take project enquiries, and run the Nexora Digital Academy.',
    approach:
      'Nexora designed and built the site itself: service and pricing pages, an enquiry form, and the Academy, with a course catalogue, learner accounts, lessons, progress tracking, certificates and a staff admin panel.',
    image: 'work/nexora-website.jpg',
    imageAlt: 'Homepage of the Nexora Technologies website, with the headline “Better digital systems. Built around your business.”',
    url: 'https://www.nextech.name.ng',
    year: '2026',
  },
]
