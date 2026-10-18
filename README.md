# chris-birch

The source of chris-birch.com, a personal blog titled "Rants". It is a
static Astro site with MDX, an RSS feed, a sitemap and image
optimization. Each visitor picks a color theme and a font. Their
browser keeps the choice.

The posts are Markdown in git, never rows in a CMS. Markdown outlives
any generator. Nothing runs at request time. There is no server
adapter. `npm run build` renders every page, the feed and the sitemap
ahead of time. A feature that needs a server has nowhere to run here.

## Install

```bash
git clone https://github.com/datapointchris/chris-birch.git
cd chris-birch
npm pkg get engines.node   # the Node release the site needs
npm ci                     # installs what package-lock.json pins, never rewriting it
```

On a machine with a system-wide libvips, `npm ci` fails while
installing sharp, the image optimizer. sharp finds that libvips and
tries to compile against it. `SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm ci`
makes it take its prebuilt binary instead.

## Starting from scratch

```bash
npm run dev                             # serves the site at http://localhost:4321, reloading on save
$EDITOR src/content/blog/first-post.md  # a post, served at /blog/first-post/
npm run build                           # renders every page, /rss.xml and the sitemap into dist/
npm run preview                         # serves dist/ at http://localhost:4321, the files a deploy ships
```

A post opens with frontmatter. `src/content.config.ts` holds its
schema. These three fields are required:

```markdown
---
title: 'First post'
description: 'The meta description, the link preview and the RSS summary.'
pubDate: '2026-10-18'
---
```

`updatedDate` and `heroImage` are optional. `heroImage` is a path
relative to the post. The build optimizes it, shows it above the post,
and uses it as the link-preview image.

A post that fails the schema fails `npm run build`. The error names the
post and each field that failed. The deploy runs the same
`npm run build`. A post that builds here builds there.

## Posts — Markdown and MDX in git, read by nothing but the schema

A post is a `.md` or `.mdx` file in `src/content/blog/`. Its id is its
path under that directory without the extension. It is served at
`/blog/<id>/` and listed in `/rss.xml`. `src/layouts/BlogPost.astro`
renders it with a 3D-text title, neumorphic shadows on code blocks and
images, and prose styles applied through Astro's `:global()`.

- **No spell check or Markdown lint reads a post.**
  `.markdownlintignore` skips `src/content/`, because doc-oriented rules
  such as a single top-level heading conflict with frontmatter.
  `.codespellrc` skips it too.
- **Code blocks use Shiki's `github-dark` under every theme.** The
  highlighting does not follow the picker.
- **Nothing renders diagrams.** A `mermaid` fence is shown as
  highlighted source.
- **`site` in `astro.config.mjs` is the canonical origin.** Every page's
  canonical link and every feed entry is built from it.

## The picker — CSS holds every theme, and the script only flips an attribute

The gear in the site header opens
`src/components/PreferencesPicker.astro`. A choice sets `data-theme` or
`data-font` on `<html>` and stores the id in `localStorage`.
`src/scripts/preferences.ts` does both writes. It is vanilla TypeScript,
never a Vue or React island. Hydrating a framework for a few attribute
writes would cost the site Astro's zero-JavaScript default.

```css
[data-theme='blue'] { --base-hue: 260; }                  /* a color theme */
[data-theme='kanagawa'] { --clr-primary: #16161d; ... }   /* a named theme */
[data-font='fira-code'] { --ff-base: 'Fira Code', monospace; }
```

- **Color themes rotate `--base-hue` and nothing else.** The palette is
  derived from it in OKLCH. Turquoise is the `:root` default and has no
  rule.
- **Named themes override the whole palette with fixed colors.**
- **A swatch is a solid color written by hand in the `themes` list.** A
  preview derived from the CSS variables looks the same for every color
  theme. They share one lightness and chroma. A hue difference at that
  chroma is invisible at chip size.
- **There is no random theme.** The first-paint script applies the
  stored id as written. A random choice would have to resolve to a
  concrete theme before being stored.

Ubuntu Mono is the default font. Every page loads it from Google
Fonts. Another Google font loads when a visitor picks it, and on each
page after that. A self-hosted font is a `.woff2` in `public/fonts/`,
declared by an `@font-face` in `src/styles/global.css`.

Adding a theme takes an entry in `themes` and a rule in `global.css`.
Adding a font takes an entry in `fonts`, a `[data-font]` rule, and
either a URL in `googleFontUrls` or an `@font-face` with its `.woff2`.
A returning visitor's browser holds the id they chose. Renaming a theme
or font sends them back to the default.

`src/components/BaseHead.astro` opens with an `is:inline` script. It
reads the stored theme and font and sets the attributes before the page
paints. It must stay `is:inline`. Astro bundles an ordinary `<script>`
as a deferred module, which runs after first paint and flashes the
default theme. An inline script cannot import. It spells the storage
keys a second time. The `STORAGE_KEY_*` constants in `preferences.ts`
change together with the strings in that script.

## The tokens — every color and shadow comes from `global.css`

`src/styles/global.css` defines colors, spacing, the type scale and
shadows as custom properties on `:root`. The theme rules, the
`@font-face` declarations and the base element styles sit beside
them. A component uses a token, never an inline color or shadow. The
OKLCH-derived tokens follow the active theme. A value copied into one
component stops following it. Where a token looks wrong, change the
token or choose another.

The shadows are neumorphic. `--floating-box` and `--bubble-box` shape
cards and containers. Each has a `-pressed` variant.

**A shadow transition needs both lists to agree on `inset`, position by
position.** Where they differ, the browser swaps the shadow at once
instead of animating it. `--floating-box` and `--bubble-box` do not
align. So the post-row hover on the blog index fades in a `::before`
holding `--bubble-box` rather than transitioning `box-shadow`.

## Checks — the build is the one gate on the code

```bash
pre-commit install --hook-type pre-commit --hook-type commit-msg  # file checks, and a conventional-commit message
```

`.pre-commit-config.yaml` lists the hooks. They are generic file checks.
`validate.yml` runs the same hooks on every pull request and every push
to `main`. None of them formats, lints or type-checks the Astro,
TypeScript or CSS.

`npm run build` is the one gate on the code. `astro build` does not
type-check. `astro check` would, but `@astrojs/check` is not a
dependency. The strict `tsconfig.json` is enforced by nothing but an
editor.

## Deployment — the workflow ends at an artifact

A push to `main` runs `.github/workflows/deploy.yml`. Its first job
calls `validate.yml`. The build job `needs:` that job. A push that
fails a hook builds nothing. The build job runs `npm ci` and
`npm run build`, then uploads `dist/` as an artifact named `dist`.

Nothing in this repository copies `dist/` onto a server. `dist/` is
plain static files. Any web server can serve it.
