# Nexora Technologies website: agent notes

A multi-page marketing site built with TanStack Start, React 19 and Tailwind v4 on Netlify. There is no database or auth. Enquiries go through Netlify Forms.

## Layout

- `src/routes/`: file routes (`index`, `services`, `work`, `about`, `contact`, `blog`). `__root.tsx` holds the document shell, fonts, global meta, header, footer and the 404 page.
- `src/components/Sections.tsx`: shared editorial sections (SectionHead, ServiceIndex, Principles, ProcessTimeline, AudienceList, WorkShowcase, ClosingCTA).
- `src/components/ContactForm.tsx`: the Netlify Forms enquiry form. It POSTs to `/__forms.html`, not `/`, because the SSR handler owns `/`.
- `public/__forms.html`: the static form registration. Its field names **must** match ContactForm.
- `src/data/site.ts`: all copy, services, principles, process steps, contact details, and the `img()`/`imgSet()` Image CDN helpers.
- `src/data/projects.ts`: portfolio entries. It is empty on purpose.
- `src/lib/seo.ts`: per-route title, description, OG and Twitter tags. Use it in every route's `head`.

## Content rules (important)

- Never invent clients, projects, metrics, testimonials, logos, emails, phone numbers, addresses, social profiles, team bios or company history. `site.email` stays empty until the owner provides a real value, and the UI hides it while empty. `site.socials` holds only owner-provided profiles (currently YouTube, Substack and Telegram). `SocialLinks` renders WhatsApp and phone as logo buttons first, then the socials.
- Projects need `kind: 'internal'` for demos and personal work, and the UI labels them that way.
- The photos in `public/img/` are free-licence Unsplash stock photography (real photos, not clients or staff). The owner wants a mix of races and no photos of white men; check any new photo against this. Don't caption or describe them as clients, staff or projects. Ad slots ("Sponsored") were removed at the owner's request.

## Design conventions

- Tokens are in the `@theme` block of `src/styles.css`: paper/ink neutrals, a single forest-green accent, and a lime `signal` used sparingly on dark backgrounds.
- Component classes: `.wrap`, `.eyebrow`, `.display`, `.serif` (italic accent words inside headings), `.btn` plus `-primary`, `-ghost` or `-signal`, `.link`, `.field`.
- Section labels are not numbered: use `.eyebrow .eyebrow-mark` (a short gradient rule before the label). In lists, use `.orb`, `.dot-mark` or `.tick` instead of 01/02 numbers, and `.chip` for tag lists. The owner asked for no numbering.
- The owner found the original site too plain and asked for a bolder look (Nov 2026), so gradients, glow and texture are now welcome. The bold layer at the end of `src/styles.css` adds film grain, a colour wash and grid behind every page's first section, glowing `section.bg-ink`/`section.bg-forest` panels, gradient buttons, `.card` / `.card-dark` / `.card-forest` surfaces, `.orb` markers, `.text-gradient` / `.text-gradient-signal` accent words, `.hl` highlighter, `.photo-frame`, `.rings` and `.wordmark`. Use these instead of inventing new effects. Keep one `.card-forest` feature card per group at most.
- Motion: `.rise` entrance on first screens, scroll-in reveal for top-level sections (`Reveal` in `__root.tsx`), the `Marquee` ticker, `.float-slow`, and hover lifts. Everything respects `prefers-reduced-motion`, and content stays visible without JS.
- Always serve images through `img()`/`imgSet()`, never the raw `/img/...` path.

## Nexora Digital Academy (`/academy`)

- Backend: Netlify Database (Drizzle, `db/schema.ts`, migrations in `netlify/database/migrations/`), Netlify Identity for sign-in. Roles live in `users.role` (DB), not Identity metadata. The first super admin comes from `ACADEMY_SUPER_ADMIN_EMAILS`.
- Server functions: `src/server/fns/*.ts`. Each handler calls `requireUser`/`requireRole` itself; route guards are UX only. Shared rules: `src/server/learning.ts` (eligibility, access, progress), `src/server/payments.ts`, `src/server/finance.ts`.
- Throw `AppError` for messages users may see. `src/start.ts` replaces every other error with a generic message.
- **Confidential:** institutional allocation data (`school_agreements`, `school_allocations`, `reconciliation_statements`) may only be read in `src/server/finance.ts`, `src/server/fns/finance.ts` (FINANCE roles) and `schoolReconciliation` (authorised reps, released statements only). Never hard-code the allocation amount anywhere: the repo is public, and admin JS chunks are publicly downloadable.
- Payments are bank transfer only at the owner's request (`ONLINE_PAYMENTS_ENABLED = false` in `src/server/payments.ts`; gateway code is kept but switched off). Bank details are entered by staff in the Academy admin, Payments tab.
- Never mark a payment successful except through `markPaymentSuccess` after server-side gateway verification, or after staff confirm a credit on the bank statement.
- Course seed content lives in `src/data/academy.ts` and is inserted once (`ensureSeeded`). After that, the admin panel is the source of truth.
- Testimonials are DB-managed and are published only with consent. Never add invented ones.
- Catalogue (`/academy/courses`): search plus subject/level/open filters, held in the URL search params. Courses have `category`, `skills`, `instructorName`/`instructorBio` and `faqs`, all staff-edited in the admin Courses tab. `level` is no longer unique. Instructor details and FAQs are shown only when staff enter them, so never fill them with invented people or claims.
- Free previews: lessons with `isPreview` are public at `/academy/courses/$slug/preview/$lessonId` (served only by `getPreviewLesson`, which checks the flag). Everything else still goes through the access-checked `getLesson`.

## Blog (`/blog`)

- Formerly "Insights". `/insights` and `/insights/<slug>` 301-redirect to `/blog`.
- Posts live in `blog_posts` (Netlify Database). Server functions are in `src/server/fns/blog.ts`, and the shared rules are in `src/server/blog.ts`. Public readers only see posts where `status = 'published'` and `published_at <= now()`, so a future `published_at` schedules a post. There is no cron job.
- Writers are the `super_admin` and `editor` (Blog Editor) roles (`BLOG` in `src/lib/roles.ts`). They work in the Academy admin, Blog tab. Editors can only open the Blog tab. Saves check `expectedUpdatedAt`, so two writers can't silently overwrite each other.
- Bodies are a small Markdown subset rendered by `src/lib/markdown.tsx` into React elements. Never render post HTML with `dangerouslySetInnerHTML`.
- Uploaded images go to the `blog-media` Netlify Blobs store through `POST /api/blog/upload` (BLOG roles only), and are served from `/api/blog/media/<key>`.
- The three original articles are seeded once from `src/data/blog-seed.ts`. After that, the admin is the source of truth.
- Substack is the newsletter (subscribe prompts on the blog); the site is the home for posts. The RSS feed is at `/blog/rss.xml`.
- Don't publish invented case studies, clients, statistics or quotes in posts. Author names appear only when entered.
