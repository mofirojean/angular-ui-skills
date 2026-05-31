# Angular UI Skills, docs site

The marketing and documentation site for the [`angular-ui-skills`](../) project. Built with Angular v21 + Tailwind v4 + Inter/JetBrains Mono fonts. Single-page landing with anchor navigation.

**Live demo:** https://angular-ui-skills-docs.vercel.app

## Run locally

```sh
npm install
npm start
```

Opens at http://localhost:4200.

## Build

```sh
npm run build
```

Output lands in `dist/docs/browser/`. The `vercel.json` here configures the Vercel deploy with SPA rewrites and cache headers for static assets.

## Editing the page

The whole landing page is a single Angular component:

- **`src/app/app.ts`** holds the data: skills list, examples list, install commands (per agent), FAQ items, architecture steps, feature cards
- **`src/app/app.html`** holds the template: nav, hero, feature strip, skills grid, examples cards, install tabs, anatomy section, FAQ, CTA, footer
- **`src/styles.css`** holds theme tokens (Angular brand red gradient, ink/paper surfaces, grid background, shield logo via clip-path)

To change a section, edit the data in `app.ts` and the template in `app.html`. Most edits are pure data, no template changes needed.

Demo URLs and the repo URL live in **`src/app/site.config.ts`**. Swap them when the custom domain lands.

## Assets

- **`public/logos/`** — library logos shown in the skills cards (Spartan/ng, PrimeNG, NG-ZORRO, Angular Material)
- **`public/projects/`** — example app screenshots (light and dark mode)
- **`public/favicon.svg`** — the shield logo as a standalone SVG (same gradient as the header)
- **`public/robots.txt`** and **`public/sitemap.xml`** — SEO essentials

When the custom domain is set up, update the canonical URL in `src/index.html`, the `og:url` and `og:image` tags, the `<link rel="canonical">`, and the URLs in `robots.txt` and `sitemap.xml`.

## SEO notes

The site ships:

- Full Open Graph + Twitter card meta tags
- JSON-LD structured data for `WebSite`, `SoftwareApplication`, and `Person` (linked via `@graph`)
- A canonical URL pointing at the live Vercel deploy (swap when the domain lands)
- Inter + JetBrains Mono fonts preloaded from rsms.me and jsDelivr

The OG image currently points at the Mission Control dark-mode screenshot. Swap to a dedicated 1200×630 branded card when one is designed.
