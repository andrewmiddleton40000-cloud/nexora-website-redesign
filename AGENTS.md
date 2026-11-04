# Nexora Technologies website: agent notes

A multi-page marketing site built with TanStack Start, React 19 and Tailwind v4 on Netlify. There is no database or auth. Enquiries go through Netlify Forms.

## Layout

- `src/routes/`: file routes (`index`, `services`, `work`, `about`, `contact`). `__root.tsx` holds the document shell, fonts, global meta, header, footer and the 404 page.
- `src/components/Sections.tsx`: shared editorial sections (SectionHead, ServiceIndex, Principles, ProcessTimeline, AudienceList, WorkShowcase, ClosingCTA).
- `src/components/ContactForm.tsx`: the Netlify Forms enquiry form. It POSTs to `/__forms.html`, not `/`, because the SSR handler owns `/`.
- `public/__forms.html`: the static form registration. Its field names **must** match ContactForm.
- `src/data/site.ts`: all copy, services, principles, process steps, contact details, and the `img()`/`imgSet()` Image CDN helpers.
- `src/data/projects.ts`: portfolio entries. It is empty on purpose.
- `src/lib/seo.ts`: per-route title, description, OG and Twitter tags. Use it in every route's `head`.

## Content rules (important)

- Never invent clients, projects, metrics, testimonials, logos, emails, phone numbers, addresses, social profiles, team bios or company history. `site.email` and `site.socials` stay empty until the owner provides real values, and the UI hides them while they are empty.
- Projects need `kind: 'internal'` for demos and personal work, and the UI labels them that way.
- The photos in `public/img/` are illustrative and AI-generated. Don't caption or describe them as clients or staff.

## Design conventions

- Tokens are in the `@theme` block of `src/styles.css`: paper/ink neutrals, a single forest-green accent, and a lime `signal` used sparingly on dark backgrounds.
- Component classes: `.wrap`, `.eyebrow`, `.display`, `.serif` (italic accent words inside headings), `.btn` plus `-primary`, `-ghost` or `-signal`, `.link`, `.field`.
- Section labels are numbered, e.g. "(02) Services". Layouts are asymmetric 12-column grids with hairline borders. Avoid icon-card grids, gradients, glass effects and heavy motion.
- Motion is limited to a single `.rise` entrance on first screens plus hover states, and it respects `prefers-reduced-motion`.
- Always serve images through `img()`/`imgSet()`, never the raw `/img/...` path.

## Nexora Digital Academy (`/academy`)

- Backend: Netlify Database (Drizzle, `db/schema.ts`, migrations in `netlify/database/migrations/`), Netlify Identity for sign-in. Roles live in `users.role` (DB), not Identity metadata. The first super admin comes from `ACADEMY_SUPER_ADMIN_EMAILS`.
- Server functions: `src/server/fns/*.ts`. Each handler calls `requireUser`/`requireRole` itself; route guards are UX only. Shared rules: `src/server/learning.ts` (eligibility, access, progress), `src/server/payments.ts`, `src/server/finance.ts`.
- Throw `AppError` for messages users may see. `src/start.ts` replaces every other error with a generic message.
- **Confidential:** institutional allocation data (`school_agreements`, `school_allocations`, `reconciliation_statements`) may only be read in `src/server/finance.ts`, `src/server/fns/finance.ts` (FINANCE roles) and `schoolReconciliation` (authorised reps, released statements only). Never hard-code the allocation amount anywhere: the repo is public, and admin JS chunks are publicly downloadable.
- Never mark a payment successful except through `markPaymentSuccess` after server-side gateway verification, or after staff confirm a credit on the bank statement.
- Course seed content lives in `src/data/academy.ts` and is inserted once (`ensureSeeded`). After that, the admin panel is the source of truth.
- Testimonials are DB-managed and are published only with consent. Never add invented ones.
