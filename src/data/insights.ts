// Insights articles. To publish a new one, add an entry to the top of the list —
// it appears on /insights and at /insights/<slug>. Blocks render in order:
// 'p' for paragraphs, 'h2' for sub-headings and 'ul' for bullet lists.

export type Block = { type: 'p' | 'h2'; text: string } | { type: 'ul'; items: string[] }

export type Article = {
  slug: string
  title: string
  summary: string
  topic: 'Website development' | 'AI automation' | 'Business technology' | 'Digital growth'
  /** ISO date, e.g. '2026-10-21' */
  published: string
  readingMinutes: number
  body: Block[]
}

export const topics: Article['topic'][] = ['Website development', 'AI automation', 'Business technology', 'Digital growth']

export const articles: Article[] = [
  {
    slug: 'prepare-before-commissioning-a-website',
    title: 'What to prepare before you commission a business website',
    summary:
      'A short checklist of decisions and materials that make a website project faster, cheaper to change and more useful once it launches.',
    topic: 'Website development',
    published: '2026-10-21',
    readingMinutes: 5,
    body: [
      {
        type: 'p',
        text: 'Most website projects that run late do so for the same reason: the content and decisions the website depends on are not ready. Design and development are rarely the slow part. Preparing a few things in advance gives you a clearer quotation and a smoother build.',
      },
      { type: 'h2', text: 'Be clear about the one job the website must do' },
      {
        type: 'p',
        text: 'A website can do many things, but it should do one thing best. For a law firm that might be booking consultations; for a hotel, direct reservation enquiries; for a manufacturer, distributor applications. Write down the single action you most want a visitor to take. Every page should make that action easy.',
      },
      { type: 'h2', text: 'List your pages before you think about design' },
      {
        type: 'p',
        text: 'A simple page list is the most useful document you can bring to a first conversation. It sets the scope, and scope sets the price. A typical business website might include:',
      },
      {
        type: 'ul',
        items: ['Home', 'About the business', 'Services, with a page for each major service', 'Portfolio or projects', 'Contact and location', 'Privacy policy'],
      },
      { type: 'h2', text: 'Gather your content early' },
      {
        type: 'p',
        text: 'Collect your logo files, any brand colours, current service descriptions, real photographs of your premises, team and work, and the contact details you want published. If you do not have written content, decide now whether you will write it or commission copywriting — it is usually the longest-running task in a project.',
      },
      { type: 'h2', text: 'Know what you already own' },
      {
        type: 'p',
        text: 'Find out who controls your domain name, where any existing website is hosted, and who has the login details. Domain and hosting access problems are a common cause of launch delays, and they are much easier to resolve before the build starts than on launch day.',
      },
      { type: 'h2', text: 'Separate what you need now from what you want later' },
      {
        type: 'p',
        text: 'Online payments, customer accounts, booking systems and integrations are all possible, but each adds time and cost. Mark each feature as essential for launch or useful later. A focused first version that launches well is more valuable than an ambitious one that stalls.',
      },
    ],
  },
  {
    slug: 'whatsapp-automation-where-it-helps',
    title: 'WhatsApp automation: where it helps, and where a person is still better',
    summary:
      'Automated WhatsApp replies can save hours each week — if you automate the right conversations and hand off the rest quickly.',
    topic: 'AI automation',
    published: '2026-10-21',
    readingMinutes: 4,
    body: [
      {
        type: 'p',
        text: 'For many businesses, WhatsApp is the main sales channel. That makes it tempting to automate everything. In practice, automation works best on predictable, repetitive conversations, and works against you when a customer needs judgement or reassurance.',
      },
      { type: 'h2', text: 'Good candidates for automation' },
      {
        type: 'ul',
        items: [
          'Opening hours, location and directions',
          'Price lists, menus and catalogues',
          'Collecting the details you always ask for — name, service, preferred date',
          'Order and booking confirmations',
          'Follow-up reminders for quotes or appointments',
        ],
      },
      { type: 'h2', text: 'Conversations to keep human' },
      {
        type: 'p',
        text: 'Complaints, negotiations, complex quotes and anything involving a refund should reach a person quickly. A good automated flow recognises these and passes the conversation to your team with the context already collected, so the customer does not have to repeat themselves.',
      },
      { type: 'h2', text: 'Start with your last fifty conversations' },
      {
        type: 'p',
        text: 'Before building anything, read back through recent chats and group them by topic. The topics that appear most often, with the most predictable answers, are where automation will make the biggest difference. That review also gives you the wording for your automated replies — in the language your customers already use.',
      },
      { type: 'h2', text: 'Measure response, not just volume' },
      {
        type: 'p',
        text: 'The goal of automation is faster, more consistent service, not fewer conversations. Track how quickly customers receive a useful answer and how many enquiries become orders or bookings. If those improve, the automation is doing its job.',
      },
    ],
  },
  {
    slug: 'technical-seo-checks-for-new-websites',
    title: 'Six technical SEO checks every new business website needs',
    summary:
      'Before investing in content or advertising, make sure search engines can find, read and trust your website.',
    topic: 'Digital growth',
    published: '2026-10-21',
    readingMinutes: 5,
    body: [
      {
        type: 'p',
        text: 'Technical SEO is the groundwork that lets search engines discover and understand your website. It does not replace good content, but without it good content can go unseen. These checks apply to almost every business website.',
      },
      { type: 'h2', text: '1. Every page has a unique title and description' },
      {
        type: 'p',
        text: 'The page title and meta description are often what appears in search results. Each page should have its own, describing that page specifically — not the business name repeated on every page.',
      },
      { type: 'h2', text: '2. The site is served securely over HTTPS' },
      {
        type: 'p',
        text: 'Browsers warn visitors about insecure pages, and search engines prefer secure ones. Make sure every version of your address redirects to a single secure version.',
      },
      { type: 'h2', text: '3. A sitemap is published and submitted' },
      {
        type: 'p',
        text: 'A sitemap lists the pages you want indexed. Submit it in Google Search Console, which also shows you which pages are indexed and flags problems.',
      },
      { type: 'h2', text: '4. Pages load quickly on mobile networks' },
      {
        type: 'p',
        text: 'Many visitors will arrive on a phone, often on mobile data. Oversized images are the most common cause of slow pages. Serve images at the size they are displayed, in modern formats.',
      },
      { type: 'h2', text: '5. Headings describe the page structure' },
      {
        type: 'p',
        text: 'Each page should have one main heading that states what the page is about, followed by sub-headings for its sections. This helps both search engines and visitors scanning the page.',
      },
      { type: 'h2', text: '6. Your business details are consistent everywhere' },
      {
        type: 'p',
        text: 'Your business name, phone number and address should match across your website, Google Business Profile and directories. Inconsistencies make it harder for search engines to connect the information to your business.',
      },
    ],
  },
]

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug)
}

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
export const formatDate = (iso: string) => dateFmt.format(new Date(`${iso}T00:00:00Z`))
