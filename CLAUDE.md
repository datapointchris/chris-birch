# chris-birch

The source of chris-birch.com, a personal blog titled "Rants". It is a
static Astro site. Posts are Markdown and MDX files in git, styled by a
design system of tokens with a theme and font each visitor picks.

## The site is static, and the picker is its only client code

There is no adapter, so every page and endpoint renders at build time.
`src/pages/rss.xml.js` is a build-time endpoint. Anything that needs a
server at request time has nowhere to run.

The theme and font picker is vanilla TypeScript in
`src/scripts/preferences.ts`, never a Vue or React island. Hydrating a
framework for a few attribute writes would cost the site Astro's
zero-JavaScript default.

## CSS holds the themes, and JavaScript only flips an attribute

A theme is a `[data-theme='<id>']` rule in `src/styles/global.css`. A
font is a `[data-font='<id>']` rule setting `--ff-base`. The script sets
those attributes on `<html>` and stores the choice in `localStorage`.

- **Color themes rotate `--base-hue` and nothing else.** The palette is
  derived from it in OKLCH. Turquoise is the `:root` default and has no
  rule. Named themes override the whole palette with fixed colors.
- **A swatch is a solid color written by hand in the `themes` list.**
  A preview derived from the CSS variables looks the same for every
  color theme. They share one lightness and chroma, and a hue difference
  at that chroma is invisible at chip size.
- **There is no random theme.** It would have to resolve to a concrete
  theme before being stored, or the first-paint script could not apply
  it.

Adding a theme takes an entry in `themes` and a rule in `global.css`.
Adding a font takes an entry in `fonts`, a `[data-font]` rule, and
either a URL in `googleFontUrls` or an `@font-face` in `global.css` with
its `.woff2` in `public/fonts/`. Astro's `fonts` config is not used,
because it registers a fixed set at build time. A theme or font id is
stored in returning visitors' browsers, so renaming one sends them back
to the default.

## The first paint is set by an inline script

`src/components/BaseHead.astro` opens with an `is:inline` script. It
reads the stored theme and font and sets the attributes before the page
paints. It must stay `is:inline`. Astro bundles an ordinary `<script>`
as a deferred module, which runs after first paint and flashes the
default theme.

An inline script is not bundled and cannot import. So it spells the
storage keys a second time, and the `STORAGE_KEY_*` constants in
`preferences.ts` change together with the strings in that script.

## Color and shadow come only from the tokens

`global.css` defines colors, spacing, the type scale and shadows as
custom properties on `:root`. A component uses a token, never an inline
color or shadow. Where a token looks wrong, change the token or choose
another. The OKLCH-derived tokens follow the active theme, and a copy
inlined in one component stops following it.

**A shadow transition needs both lists to agree on `inset`, position by
position.** Where they differ, the CSS Backgrounds and Borders spec
swaps the shadow at once instead of animating it. The `--neu-*` tokens
carry transparent placeholder layers to keep their positions aligned.
`--floating-box` and `--bubble-box` do not align. So the post-row hover
on the blog index fades in a `::before` holding `--bubble-box` rather
than transitioning `box-shadow`.

## Posts are Markdown in git

A post is a `.md` or `.mdx` file in `src/content/blog/`. Markdown in git
is the point: the content outlives any generator, and the blog never
moves to a CMS. The frontmatter schema is in `src/content.config.ts`,
and a post that fails it fails the build. A post is served at
`/blog/<id>/`, where the id is its path under that directory without the
extension.

- **No spell check or Markdown lint reads a post.**
  `.markdownlintignore` skips `src/content/` because the doc-oriented
  rules conflict with frontmatter. `.codespellrc` skips it too.
- **Code blocks use Shiki's `github-dark` under every theme.** It reads
  well across all of them, where `nord` clashes with the warm ones.
- **Nothing renders diagrams.** A `mermaid` fence is shown as
  highlighted source.
- **`site` in `astro.config.mjs` is the canonical origin.** Copies of a
  post syndicated to other sites carry a `canonical_url` pointing here,
  so the canonical link `BaseHead.astro` emits is load-bearing.

## Only the build checks the code

The hooks and CI run generic file checks. No hook or workflow formats,
lints or type-checks the Astro, TypeScript or CSS. `npm run build` in
`deploy.yml` is the one gate on the code, and `astro build` does not
type-check. `astro check` would, but neither `@astrojs/check` nor
`typescript` is a dependency. The strict `tsconfig.json` is enforced by
nothing but an editor.

The source is indented with tabs, as Astro's starter wrote it. The
generated `.editorconfig` asks for two spaces in every file. No
formatter settles it, so match the file being edited.

## Deployment happens outside the repo

`deploy.yml` builds the site and uploads `dist/` as an artifact named
`dist`. A receiver outside this repo is notified of a successful run,
downloads that artifact by name, and copies it onto the server.
Renaming the artifact stops deploys while every check stays green.

`deploy.yml` calls `validate.yml` as its first job, and the build
`needs:` it. So a push that fails a hook builds nothing and deploys
nothing.

## The hook and CI config are generated

The pre-commit config, `validate.yml` and several tool configs carry a
marker comment saying they are generated from a shared template.
`git grep -l -E '^# [a-z]+-(managed|toolchain)'` lists them. A
regeneration overwrites a hand edit to any of them. A hook only this
repo needs goes in a `.pre-commit-config.yaml` section opened by a
`# > custom:after:all - <reason>` comment. Regeneration keeps that
section, and CI does not run it. `.codespellrc` and
`.markdownlintignore` carry no marker and belong to this repo.
