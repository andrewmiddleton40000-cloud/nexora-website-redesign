# Nexora Technologies — website

The marketing website for Nexora Technologies, a digital solutions partner for small and medium-sized businesses. It covers websites, AI and business automation, e-commerce, CRM and workflow systems, custom web applications and digital strategy.

## Pages

- `/`: home page with the hero, approach, services, selected work, why Nexora, process, about and consultation sections
- `/services`: the full service index, with what each service includes
- `/work`: the portfolio, loaded from `src/data/projects.ts`
- `/about`: company introduction and working principles
- `/contact`: consultation and enquiry form, handled by Netlify Forms

## Technology

- TanStack Start (React 19) with file-based routes, deployed on Netlify
- Tailwind CSS v4. All design tokens live in `src/styles.css`
- Netlify Forms for enquiries (form name: `enquiry`)
- Netlify Image CDN for responsive WebP images (`/.netlify/images?url=/img/…`)
- Type: Schibsted Grotesk for text and Instrument Serif italic for accents, loaded from Google Fonts

## Running locally

```bash
pnpm install
netlify dev   # emulates Forms and the Image CDN
```

## Content to add

- **Contact details:** set the verified `email` and `socials` in `src/data/site.ts`. Neither is shown until it is set.
- **Portfolio:** add real, approved projects to `src/data/projects.ts` and put the screenshots in `public/img/work/`. Until then, the work section shows an honest "case studies in preparation" panel.
- **Photography:** the images in `public/img/` are art-directed illustrative images. They do not show clients or team members. Replace them with commissioned or licensed photography when it's available.
