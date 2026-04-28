# Rants — chris-birch.com

Personal blog. Astro static site with a custom design system ported from
ichrisbirch — neumorphic shadow vocabulary, OKLCH-derived color scales,
14 named themes, 14 selectable fonts, runtime theme + font picker.

## Stack

- **Astro** — static site generator with MDX, RSS, sitemap, image
  optimization, and content collections (frontmatter validated).
- **Vanilla TypeScript** — the preferences picker lives in
  `src/scripts/preferences.ts`. No Vue or React; preserves Astro's
  zero-JS-by-default property where possible.
- **Self-hosted fonts in `public/fonts/`** — runtime font switching
  needs stable URLs that Vite won't hash.
- **CSS data-attribute theming** — `[data-theme="kanagawa"] { ... }`
  on `<html>`. FOUC prevented by an inline `<head>` script that reads
  localStorage and sets the data-attributes before first paint.

## Commands

| Command           | Action                                  |
| ----------------- | --------------------------------------- |
| `npm install`     | Install dependencies                    |
| `npm run dev`     | Start dev server at `localhost:4321`    |
| `npm run build`   | Build static site to `./dist/`          |
| `npm run preview` | Preview production build locally        |

## Where things live

- `src/styles/global.css` — design tokens, theme rules,
  `@font-face` declarations, base element styles.
- `src/components/PreferencesPicker.astro` — gear-icon picker mounted
  in the site header.
- `src/scripts/preferences.ts` — apply/persist theme and font; lazy-loads
  Google Fonts on first selection.
- `src/content/blog/` — markdown / MDX posts.
- `src/layouts/BlogPost.astro` — post template (3D-text title, neumorphic
  shadow on code blocks, prose styling via Astro's `:global()`).
