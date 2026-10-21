// Nexora's published price list. Every price on the site — service rows, packages,
// the enquiry form and WhatsApp messages — is read from here, so change a price
// in one place only. Amounts are whole Nigerian naira.

import { site } from './site'

export type PricedService = {
  id: string
  name: string
  price: number
  /** Recurring services are billed per month. */
  monthly?: boolean
  /** Substantial custom functionality: the price is a floor, not a fixed quote. */
  custom?: boolean
  description: string
  deliverables: string[]
}

export type ServiceCategory = {
  id: string
  number: string
  title: string
  intro: string
  services: PricedService[]
}

export const categories: ServiceCategory[] = [
  {
    id: 'websites',
    number: '01',
    title: 'Websites and Digital Experiences',
    intro:
      'From a single campaign page to a full corporate presence — designed to explain what you do clearly and turn visitors into enquiries.',
    services: [
      {
        id: 'landing-page',
        name: 'Landing Page Design',
        price: 350_000,
        description: 'One focused page for a campaign, product launch or single service offer, built to collect leads.',
        deliverables: ['Custom-designed page', 'Lead or contact form', 'Responsive layouts', 'Basic on-page SEO'],
      },
      {
        id: 'portfolio-website',
        name: 'Personal Portfolio Website',
        price: 500_000,
        description: 'A professional home for consultants, creatives and executives to present their work and credentials.',
        deliverables: ['Profile and work pages', 'Contact form', 'Responsive layouts', 'Launch and handover'],
      },
      {
        id: 'small-business-website',
        name: 'Small Business Website',
        price: 750_000,
        description: 'A compact, credible website for a new or small business that needs to be found and contacted.',
        deliverables: ['Core business pages', 'Contact form and WhatsApp link', 'Responsive layouts', 'Basic SEO setup'],
      },
      {
        id: 'standard-business-website',
        name: 'Standard Business Website',
        price: 1_000_000,
        description: 'A multi-page website for an established business, with customised design and clear enquiry routes.',
        deliverables: ['Up to 7 standard pages', 'Contact forms and WhatsApp', 'Basic technical SEO', 'Deployment and handover'],
      },
      {
        id: 'professional-business-website',
        name: 'Professional Business Website',
        price: 1_500_000,
        description: 'More pages, more structure and more polish, for firms whose website carries real sales weight.',
        deliverables: ['Expanded page structure', 'Tailored visual design', 'Lead capture', 'Analytics-ready setup'],
      },
      {
        id: 'corporate-website',
        name: 'Corporate Website',
        price: 2_500_000,
        description: 'For established organisations with extensive content, multiple audiences and brand requirements.',
        deliverables: ['Up to 12 standard pages', 'Bespoke design', 'Content management setup', 'Analytics integration'],
      },
      {
        id: 'premium-corporate-website',
        name: 'Premium Corporate Website',
        price: 4_000_000,
        custom: true,
        description: 'A flagship corporate website with a bespoke content architecture, design system and integrations.',
        deliverables: ['Bespoke design system', 'Extended content structure', 'Integrations scoped to need', 'Structured QA and launch'],
      },
      {
        id: 'website-redesign',
        name: 'Website Redesign',
        price: 500_000,
        description: 'A redesign of an existing website to improve clarity, credibility and performance on mobile.',
        deliverables: ['Review of current site', 'Redesigned layouts', 'Content restructure', 'Relaunch and redirects'],
      },
      {
        id: 'wordpress-website',
        name: 'WordPress Website',
        price: 750_000,
        description: 'A WordPress website your team can update themselves, configured cleanly without plugin clutter.',
        deliverables: ['Theme setup and styling', 'Editable pages', 'Essential plugins configured', 'Editor walkthrough'],
      },
      {
        id: 'real-estate-website',
        name: 'Real Estate Website',
        price: 1_500_000,
        description: 'Property listings presented clearly, with enquiry routes for buyers, tenants and investors.',
        deliverables: ['Property listing pages', 'Search or filtering', 'Viewing enquiry forms', 'WhatsApp contact'],
      },
      {
        id: 'hospitality-website',
        name: 'Hotel and Hospitality Website',
        price: 1_800_000,
        description: 'For hotels, short-lets and restaurants — rooms, menus and facilities shown well, with direct enquiries.',
        deliverables: ['Rooms or menu pages', 'Gallery and facilities', 'Reservation enquiries', 'Location and contact'],
      },
    ],
  },
  {
    id: 'platforms',
    number: '02',
    title: 'E-commerce and Web Applications',
    intro:
      'Online stores, booking systems and custom software built around how your business takes orders and serves customers.',
    services: [
      {
        id: 'booking-website',
        name: 'Booking and Appointment Website',
        price: 2_000_000,
        custom: true,
        description: 'Customers choose a service and time slot online, and your team sees every booking in one place.',
        deliverables: ['Service and slot setup', 'Booking confirmations', 'Admin booking view', 'Responsive design'],
      },
      {
        id: 'ecommerce-website',
        name: 'E-commerce Website',
        price: 3_000_000,
        description: 'A complete online store with catalogue, cart, checkout and one standard payment gateway.',
        deliverables: ['Product catalogue', 'Cart and checkout', 'One payment gateway', 'Order management'],
      },
      {
        id: 'advanced-ecommerce',
        name: 'Advanced E-commerce Platform',
        price: 5_000_000,
        custom: true,
        description: 'For larger catalogues and more complex selling — variants, inventory, multiple fulfilment rules.',
        deliverables: ['Advanced catalogue structure', 'Inventory handling', 'Customer accounts', 'Integrations scoped to need'],
      },
      {
        id: 'custom-web-app',
        name: 'Custom Web Application',
        price: 5_000_000,
        custom: true,
        description: 'Purpose-built software — portals, dashboards or internal tools — designed around a specific process.',
        deliverables: ['Requirements and scoping', 'User accounts and roles', 'Core application build', 'Testing and deployment'],
      },
      {
        id: 'enterprise-web-app',
        name: 'Enterprise Web Application',
        price: 10_000_000,
        custom: true,
        description: 'Larger systems with multiple user groups, integrations and higher reliability requirements.',
        deliverables: ['Discovery and architecture', 'Multi-role access', 'System integrations', 'Phased delivery plan'],
      },
    ],
  },
  {
    id: 'automation',
    number: '03',
    title: 'AI Solutions and Business Automation',
    intro:
      'Practical automation that answers customers faster, captures more leads and removes repetitive work from your team.',
    services: [
      {
        id: 'ai-chatbot',
        name: 'Website AI Chatbot',
        price: 750_000,
        description: 'A chatbot trained on your business information that answers common visitor questions on your website.',
        deliverables: ['Knowledge setup from your content', 'Website integration', 'Hand-off to a person', 'Conversation review'],
      },
      {
        id: 'ai-support-assistant',
        name: 'AI Customer Support Assistant',
        price: 1_200_000,
        description: 'An assistant that handles routine support questions and routes complex cases to your team.',
        deliverables: ['Support content setup', 'Escalation rules', 'Channel integration', 'Team handover'],
      },
      {
        id: 'whatsapp-automation',
        name: 'WhatsApp Business Automation',
        price: 850_000,
        description: 'Automated replies, enquiry capture and follow-ups on WhatsApp Business for faster customer response.',
        deliverables: ['Message flows', 'Enquiry capture', 'Quick replies and routing', 'Staff walkthrough'],
      },
      {
        id: 'ai-lead-generation',
        name: 'AI Lead Generation System',
        price: 1_500_000,
        custom: true,
        description: 'Capture, qualify and route leads automatically so the right enquiries reach your sales team quickly.',
        deliverables: ['Lead capture points', 'Qualification logic', 'CRM or inbox routing', 'Follow-up sequences'],
      },
      {
        id: 'workflow-automation',
        name: 'Business Workflow Automation',
        price: 1_500_000,
        custom: true,
        description: 'Automate a defined internal process — approvals, documents, notifications or data entry.',
        deliverables: ['Process mapping', 'Automation build', 'Notifications and logs', 'Testing and handover'],
      },
      {
        id: 'multi-system-automation',
        name: 'Advanced Multi-System Automation',
        price: 3_000_000,
        custom: true,
        description: 'Connect several tools — CRM, accounting, forms, messaging — into one reliable automated flow.',
        deliverables: ['Systems audit', 'Multi-tool integration', 'Error handling', 'Documentation'],
      },
      {
        id: 'crm-setup',
        name: 'CRM Setup and Integration',
        price: 900_000,
        description: 'A CRM configured around your sales process, connected to your website and enquiry channels.',
        deliverables: ['CRM configuration', 'Pipeline design', 'Website form integration', 'Team onboarding'],
      },
      {
        id: 'custom-ai-app',
        name: 'Custom AI-Powered Application',
        price: 5_000_000,
        custom: true,
        description: 'A bespoke application using AI for a specific business task, from document processing to assistants.',
        deliverables: ['Use-case scoping', 'Model and data setup', 'Application build', 'Evaluation and launch'],
      },
    ],
  },
  {
    id: 'growth',
    number: '04',
    title: 'Digital Growth and Technical Support',
    intro:
      'The technical groundwork that helps your website get found, load quickly, stay secure and keep improving.',
    services: [
      {
        id: 'technical-seo',
        name: 'Technical SEO Setup',
        price: 350_000,
        description: 'Fix the technical foundations that help search engines find, crawl and understand your website.',
        deliverables: ['Technical audit', 'Metadata and sitemap', 'Search Console setup', 'Fix list and changes'],
      },
      {
        id: 'speed-optimisation',
        name: 'Website Speed Optimization',
        price: 250_000,
        description: 'Improve load times, especially on mobile networks, by addressing images, scripts and hosting.',
        deliverables: ['Performance audit', 'Image and asset optimisation', 'Code and loading fixes', 'Before-and-after report'],
      },
      {
        id: 'analytics-tracking',
        name: 'Analytics and Conversion Tracking',
        price: 200_000,
        description: 'Measure where visitors come from and which actions — calls, forms, WhatsApp — they take.',
        deliverables: ['Analytics setup', 'Conversion events', 'Form and WhatsApp tracking', 'Reporting walkthrough'],
      },
      {
        id: 'digital-growth-setup',
        name: 'Digital Growth Setup',
        price: 750_000,
        description: 'A practical foundation for online growth: profiles, tracking and a prioritised action plan.',
        deliverables: ['Digital presence review', 'Business profile setup', 'Tracking foundations', 'Prioritised growth plan'],
      },
      {
        id: 'hosting-setup',
        name: 'Website Hosting and Deployment Setup',
        price: 100_000,
        description: 'Get your website properly hosted, connected to your domain and served securely over HTTPS.',
        deliverables: ['Hosting configuration', 'Domain connection', 'SSL setup', 'Deployment check'],
      },
      {
        id: 'website-maintenance',
        name: 'Website Maintenance',
        price: 150_000,
        monthly: true,
        description: 'Ongoing care for your website — updates, monitoring, backups and small agreed changes.',
        deliverables: ['Updates and monitoring', 'Backups', 'Agreed small changes', 'Monthly check-in'],
      },
      {
        id: 'seo-management',
        name: 'SEO Management',
        price: 300_000,
        monthly: true,
        description: 'Continuous search optimisation with monthly priorities, on-page improvements and reporting.',
        deliverables: ['Monthly SEO priorities', 'On-page improvements', 'Technical monitoring', 'Monthly report'],
      },
      {
        id: 'copywriting',
        name: 'Website Content and Copywriting',
        price: 250_000,
        description: 'Clear, persuasive website copy that explains your services and gives visitors a reason to act.',
        deliverables: ['Content plan', 'Page copy', 'Headlines and calls to action', 'Revision round'],
      },
      {
        id: 'security-audit',
        name: 'Website Security Audit',
        price: 250_000,
        description: 'A review of your website’s security setup with clear, prioritised recommendations.',
        deliverables: ['Configuration review', 'Software and plugin check', 'Access review', 'Prioritised findings'],
      },
    ],
  },
]

export const allServices = categories.flatMap((c) => c.services)

export function getService(id: string) {
  const s = allServices.find((x) => x.id === id)
  if (!s) throw new Error(`Unknown service: ${id}`)
  return s
}

const naira = new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 })

/** "₦350,000" or "₦150,000/month". */
export function formatPrice(s: Pick<PricedService, 'price' | 'monthly'>) {
  return `₦${naira.format(s.price)}${s.monthly ? '/month' : ''}`
}

/** Short label shown above a price. */
export function priceLabel(s: PricedService) {
  return s.monthly ? 'From, billed monthly' : 'Starting from'
}

/** wa.me link with a prefilled message that names the service and its listed price. */
export function whatsappLink(service?: PricedService) {
  if (!service) return site.whatsapp.url
  const price = `₦${naira.format(service.price)}${service.monthly ? ' per month' : ''}`
  const text = `Hello Nexora Technologies, I'm interested in your ${service.name} service starting at ${price}. Please share the deliverables, timeline, and next steps.`
  return `${site.whatsapp.url}?text=${encodeURIComponent(text)}`
}

// The four main website packages. Each one points at a service above, so the
// package price can never drift from the price list.
export const packages = [
  {
    serviceId: 'landing-page',
    title: 'Landing Page',
    audience: 'For focused marketing campaigns, product launches, lead generation and individual service offers.',
    includes: [
      'One custom-designed landing page',
      'Responsive mobile and desktop layouts',
      'Contact or lead-generation form',
      'Call-to-action buttons',
      'Basic on-page SEO',
      'Deployment and launch testing',
    ],
  },
  {
    serviceId: 'standard-business-website',
    title: 'Business Website',
    audience: 'For businesses that need a professional, multi-page online presence.',
    includes: [
      'Up to 7 standard pages',
      'Customised visual design',
      'Contact forms and WhatsApp integration',
      'Responsive layouts',
      'Basic technical SEO',
      'Deployment and handover',
    ],
  },
  {
    serviceId: 'corporate-website',
    title: 'Corporate Website',
    audience: 'For established businesses with more extensive content, branding and operational requirements.',
    includes: [
      'Up to 12 standard pages',
      'Bespoke design and content structure',
      'Lead-generation features',
      'Analytics integration',
      'Content management configuration',
      'Testing, deployment and handover',
    ],
  },
  {
    serviceId: 'ecommerce-website',
    title: 'E-commerce Website',
    audience: 'For businesses selling products online.',
    includes: [
      'Product catalogue',
      'Shopping cart and checkout',
      'One standard payment gateway integration',
      'Order management',
      'Customer notifications',
      'Responsive design and launch testing',
    ],
  },
].map((p) => ({ ...p, service: getService(p.serviceId) }))

export const pricingNote =
  'Every business has different requirements. Our prices provide a starting point, and your final proposal is tailored to your goals, project scope, and required functionality.'

export const separateCosts = [
  'Domain registration',
  'Recurring hosting',
  'Premium plugins',
  'Third-party licences',
  'Paid APIs',
  'Payment processing fees',
  'Ongoing content management',
]

export const faqs: Array<{ q: string; a: string }> = [
  {
    q: 'What is included in each package?',
    a: 'Each package lists its inclusions on this page — for example, the Business Website covers up to 7 standard pages, customised design, contact forms, WhatsApp integration, responsive layouts, basic technical SEO, deployment and handover. Anything not listed, such as extra pages, integrations or custom features, is scoped and priced separately, and your proposal confirms exactly what is included.',
  },
  {
    q: 'How long does a project take?',
    a: 'It depends on the scope, the number of pages or features, and how quickly content and feedback are available. We agree an estimated schedule with you in the proposal before any work begins.',
  },
  {
    q: 'Are domain and hosting fees included?',
    a: 'No. Domain registration, recurring hosting, premium plugins, third-party licences, paid APIs and payment processing fees are separate unless a package or proposal expressly includes them. We can set up hosting and deployment for you as a separate service.',
  },
  {
    q: 'Can I request custom functionality?',
    a: 'Yes. Custom features are scoped against your requirements and quoted separately. For substantial custom work — web applications, enterprise systems and AI solutions — the listed amount is a starting price, and the final quotation depends on what you need.',
  },
  {
    q: 'How many revisions are included?',
    a: 'The number of revision rounds is agreed in your proposal and depends on the package and scope. We confirm it in writing before the project starts, so there is no ambiguity later.',
  },
  {
    q: 'Do you offer ongoing maintenance?',
    a: `Yes. Website Maintenance starts from ${formatPrice(getService('website-maintenance'))} and SEO Management from ${formatPrice(getService('seo-management'))}. Ongoing content management is separate unless it is expressly included.`,
  },
  {
    q: 'How can I obtain a final quotation?',
    a: 'Send a project enquiry or message us on WhatsApp with what you need. We review your requirements, discuss any questions with you, and then send a written proposal with the final price.',
  },
]
