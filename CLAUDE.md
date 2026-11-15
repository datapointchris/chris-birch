# chris-birch

The source of chris-birch.com, a personal blog titled "Rants". It is a
static Astro site. Posts are Markdown and MDX files in git, styled by a
design system of tokens with a theme and font each visitor picks.

## README.md holds how the site works

Each topic below has one home, a section of `README.md`. Read that
section before changing what it covers, and edit the fact there rather
than restating it here.

- **Posts**: where a post lives, its frontmatter schema, what lint and
  spell check skip, the code-block theme and diagrams. README § "Posts —
  Markdown and MDX in git, read by nothing but the schema".
- **The theme and font picker**: why it is vanilla TypeScript, how a
  theme or font is a CSS rule, the hand-written swatches, adding a theme
  or font, and the `is:inline` first-paint script in `BaseHead.astro`.
  README § "The picker — CSS holds every theme, and the script only
  flips an attribute".
- **The design tokens**: every color and shadow comes from `global.css`,
  and the `inset` rule for shadow transitions. README § "The tokens —
  every color and shadow comes from `global.css`".
- **Checks**: the build is the one gate on the code, and nothing
  type-checks it. README § "Checks — the build is the one gate on the
  code".
- **Deployment**: `deploy.yml` validates, builds and uploads `dist/`.
  README § "Deployment — the workflow ends at an artifact".

## What README leaves out

- **`site` in `astro.config.mjs` is also the address syndicated copies
  name.** Copies of a post on other sites carry a `canonical_url`
  pointing here. `BaseHead.astro` builds `<link rel="canonical">` from
  `site`, so changing it points every page away from the address those
  copies name.
- **The deploy artifact's name is read outside this repo.** A receiver
  is notified of a successful `deploy.yml` run, downloads the artifact
  named `dist`, and copies it onto the server. Renaming the artifact
  stops deploys while every check stays green.
- **The source is indented with tabs**, as Astro's starter wrote it.
  The generated `.editorconfig` asks for two spaces in every file. No
  formatter settles it, so match the file being edited.

## The hook and CI config are generated

The pre-commit config, `validate.yml` and several tool configs carry a
marker comment saying they are generated from a shared template.
`git grep -l -E '^# [a-z]+-(managed|toolchain)'` lists them. A
regeneration overwrites a hand edit to any of them. A hook only this
repo needs goes in a `.pre-commit-config.yaml` section opened by a
`# > custom:after:all - <reason>` comment. Regeneration keeps that
section, and CI does not run it. `.codespellrc` and
`.markdownlintignore` carry no marker and belong to this repo.
