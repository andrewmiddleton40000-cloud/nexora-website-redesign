// Single source of truth for Nexora's copy and business details.
// Only add contact details and social profiles that are real and verified.

export const site = {
  name: 'Nexora Technologies',
  shortName: 'Nexora',
  url: 'https://nexora-website-redesign.netlify.app',
  description:
    'Nexora Technologies builds professional websites, e-commerce platforms, web applications, AI solutions and business automation for Nigerian and international businesses — with transparent naira pricing.',
  positioning:
    'We help businesses work smarter, serve customers better, and grow with technology that solves real problems.',
  // Add the verified business email here, e.g. 'hello@yourdomain.com'. Leave null to hide it.
  email: null as string | null,
  phone: { display: '0902 077 4803', tel: '+2349020774803' },
  whatsapp: { display: '+234 902 077 4803', url: 'https://wa.me/2349020774803' },
  // Add verified profiles only, e.g. { label: 'LinkedIn', href: 'https://linkedin.com/company/…' }
  socials: [] as Array<{ label: string; href: string }>,
}

export const nav = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Portfolio', to: '/work' },
  { label: 'About', to: '/about' },
  { label: 'Insights', to: '/insights' },
  { label: 'Contact', to: '/contact' },
] as const

export const principles = [
  {
    title: 'Understand the business first',
    body: 'We start with how you operate, who you serve and where time is lost — before recommending any tool.',
  },
  {
    title: 'Fit real operational needs',
    body: 'Solutions are shaped around your team, your customers and your budget, not around a trend.',
  },
  {
    title: 'Communicate clearly',
    body: 'Plain language, agreed priorities and regular updates throughout delivery. No surprises.',
  },
  {
    title: 'Build for the long term',
    body: 'Usable, maintainable work your team can understand, update and grow with.',
  },
  {
    title: 'Keep it practical',
    body: 'We avoid unnecessary complexity. The simplest solution that solves the problem is usually the right one.',
  },
]

export const processSteps = [
  { number: '01', title: 'Discover', body: 'Understand the business, challenges, and objectives.' },
  { number: '02', title: 'Plan', body: 'Define the right solution, priorities, and scope.' },
  { number: '03', title: 'Build', body: 'Design and implement the agreed digital solution.' },
  { number: '04', title: 'Launch', body: 'Test carefully and deploy the finished work.' },
  { number: '05', title: 'Improve', body: 'Provide agreed support and identify opportunities for improvement.' },
]

export const audiences = [
  'Professional service firms',
  'Hospitality businesses',
  'Property companies',
  'Retailers',
  'Established business owners',
  'Entrepreneurs',
  'Growing companies',
]

export const benefits = [
  {
    title: 'Look as credible online as you are in person',
    body: 'Clear structure, considered design and copy that explains your value help serious buyers trust you before the first call.',
  },
  {
    title: 'Turn more visitors into conversations',
    body: 'Enquiry forms, WhatsApp routes and calls to action placed where people actually decide to get in touch.',
  },
  {
    title: 'Spend less time on repetitive work',
    body: 'Automation and AI assistants handle routine questions, follow-ups and data entry so your team can focus on customers.',
  },
  {
    title: 'Know what you are paying for',
    body: 'Published naira starting prices, written proposals and clearly listed inclusions — with extras scoped separately.',
  },
]

/** Builds a Netlify Image CDN URL so pages never ship full-resolution originals. */
export function img(file: string, width: number, extra = '') {
  return `/.netlify/images?url=/img/${file}&w=${width}&fm=webp&q=75${extra}`
}

export function imgSet(file: string, widths: number[], extra = '') {
  return widths.map((w) => `${img(file, w, extra)} ${w}w`).join(', ')
}
