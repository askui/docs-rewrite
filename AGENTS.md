# AskUI Docs — agent instructions

> This file is the single source of the repository's agent instructions.
> `CLAUDE.md` is one line, `@AGENTS.md`, which Claude Code resolves as an
> import. Edit this file; never copy it.

The user documentation of AskUI Desktop, the AskUI CLI and AgentOS, published at
docs.askui.com. Human-facing overview: `README.md`.

## The product lives elsewhere

Every factual claim in the docs must be traceable to the code of:

- **askui/integrated-task-platform**: AskUI Desktop, the CLI, the run engine.
  Its local checkout is a sibling folder of this repository.
- **askui/csharp-sdk**: agent runtime, device layers, model providers.

Never write from memory or from how a feature "probably" works. The
`docs-writing` skill (`.claude/skills/docs-writing/SKILL.md`) is the procedure for
turning an app change into docs: what belongs in the docs at all, which persona
and page own it, house style, verification. Use it for every content change.

## Stack and layout

Fumadocs (fumadocs-core, fumadocs-ui, fumadocs-mdx) on Next.js, exported as
static HTML (`output: 'export'`) and served by GitHub Pages. pnpm.

| Path | Holds |
| --- | --- |
| `content/docs/` | The pages (MDX) and their order (`meta.json` per folder). Always the newest docs. |
| `content/_shared/` | MDX fragments pulled into pages with `<include>../../_shared/x.mdx</include>`. |
| `public/screenshots/` | App screenshots, captured by `screenshots-capture/`. |
| `public/runs/` | Exported AskUI runs shown with `<RunEmbed>`. |
| `app/docs/[[...slug]]/` | Page and layout. SEO metadata, the GitHub link, the sidebar tree. |
| `app/api/search/[tag]/` | One static search index per docs version. |
| `app/sitemap.ts`, `app/robots.ts`, `app/llms*.txt/`, `app/llms.mdx/`, `app/og/` | Sitemap, robots, llms.txt, per-page Markdown, link-preview images. |
| `components/` | MDX components (`mdx.tsx`), search dialog, cookie consent, analytics, `DownloadLink`. |
| `lib/source.ts` | The Fumadocs content source and icon resolution. |
| `lib/shared.ts` | Base path, site URL, GitHub repo. |
| `lib/versions.ts`, `lib/versions.json` | Docs versions: which page belongs to which version. |
| `scripts/build-versioned.mjs` | Builds the versioned site (see below). |
| `screenshots-capture/` | AskUI operator project that captures the app screenshots. |
| `demo-project/` | Sample AskUI project the docs refer to. |

## Commands

```bash
pnpm install
pnpm dev                 # http://localhost:3000/docs-rewrite/docs (main only)
pnpm types:check         # MDX schema, routes, TypeScript
pnpm build               # static export of main into out/
NEXT_PUBLIC_BASE_PATH=ROOT node scripts/build-versioned.mjs   # every version into out/
pnpm start               # serve out/
python .claude/skills/docs-writing/linkcheck.py               # needs pnpm dev running
```

**Gate before every push: `pnpm types:check` AND `pnpm build`.** `types:check`
misses MDX parse errors (e.g. a bare `<mail@example.com>` autolink) that only the
build finds. Run `build-versioned.mjs` too when you touch `app/`, `components/`,
`lib/`, `scripts/` or anything that reads the page tree.

## Writing pages

- **Frontmatter:** `title`, `description`, optional `icon` (a lucide name or a
  brand icon from `lib/brand-icons.tsx`) and `metaTitle` (overrides only the
  `<title>` when two pages share a title).
- **Order and sections** come from `meta.json`: `pages` lists the files, and
  `"---Name---"` entries are sidebar separators.
- **Links** between pages are root-absolute: `[First run](/docs/get-started/first-run)`.
  Never write a versioned link (`/docs/v0.9/…`) in content. The versioned build
  rewrites links per version.
- **Screenshots:** `![Alt](/screenshots/name.png)` or
  `<img src="/screenshots/name.png" …>`. Both work under every base path.
- **Components** are global in MDX, no imports needed: `Callout`, `Tabs`/`Tab`,
  `Steps`/`Step`, `Cards`/`Card`, `Files`/`Folder`/`File`,
  `Accordions`/`Accordion`, `RunEmbed`, `Lucide`, `DownloadLink`. A ```` ```mermaid ````
  fence renders as a diagram; check its layout with the `render-mermaid` skill.
- **Download links** to the installers use `<DownloadLink>`, so clicks are counted.

## Versions and releases

The site shows one docs version per AskUI Desktop minor release:
`/docs/…` is the newest, `/docs/vX.Y/…` each older one.

**How the build works** (`scripts/build-versioned.mjs`, all inside the ignored
build copy `.versioned/`):

1. Copy the site from the working tree.
2. Move `content/docs/*` into the group folder `content/docs/(latest)/`. The
   parentheses keep it out of the URL.
3. For every older minor, take its newest release tag (`v0.9.0`, `v0.8.2`, …) and
   extract `content/docs`, `content/_shared` and `public/screenshots` from it with
   `git archive` into `content/docs/vX.Y/` etc. Rewrite absolute links,
   screenshot paths and `_shared` includes to the version's prefix.
4. Mark each version folder `"root": "version"`. That gives Fumadocs' version
   dropdown. Write `lib/versions.json`.
5. A minor whose `content/docs` and `public/screenshots` equal the next newer one
   merges into it, labelled `v0.9 – v0.10`.
6. Run `fumadocs-mdx` and `next build`; copy `.versioned/out` to `out/`.

The site shell (layout, search, analytics, SEO) always comes from the checked-out
commit, so every version gets the same header, consent banner and tracking.

**Invariants:**

- **The repository holds one version: the newest, on `main`.** Never copy an old
  version into `content/`. Old versions exist only as release tags.
- **Everything that lists pages decides per version.** Use `versionOf(page.slugs)`
  from `lib/versions.ts`. Older versions are `noindex` with a canonical to the
  newest version's page, and stay out of `sitemap.xml`, `llms.txt` and
  `llms-full.txt`.
- **Each page gets only its own version's sidebar tree** (`treeForPage`). The
  other versions keep a flat page list for the dropdown. Passing the full tree
  to every page made the site grow with the square of the version count.
- **Search is per version.** `app/api/search/[tag]` writes one index per version.
  The dialog loads only the index of the version being read.
- `pnpm dev` and `pnpm build` must keep working on plain `main`, without versions.
  `lib/versions.json` as committed has no older versions.

**Merge and release rules:**

- Docs PRs target `main`. Merge a docs PR when its app PR is merged, never
  before. Documenting what is not merged is a bug (see the `docs-writing` skill).
- A merge publishes nothing. `.github/workflows/deploy.yml` deploys only on a
  release tag `v<major>.<minor>.<patch>`. A human sets it when the app version is
  released. Do not push release tags unless asked to.
- The deploy always builds from the **newest** release tag. A fix to an older
  version is a commit on its `release/vX.Y` branch plus a patch tag (`v0.9.1`),
  followed by a manual run of the deploy workflow.
- Release candidates get no tag and no docs version.

## Base path and environment

| Variable | Effect |
| --- | --- |
| `NEXT_PUBLIC_BASE_PATH` | Unset: `/docs-rewrite` (GitHub project page, local dev). `ROOT`: no base path (docs.askui.com). The deploy sets `ROOT` from the repo variable `DOCS_SERVE_AT_ROOT=true`. |
| `NEXT_PUBLIC_SITE_URL` | Overrides the public origin for canonical and og URLs. |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | PostHog (EU). |
| `NEXT_PUBLIC_DOWNLOAD_WEBHOOK_URL` | Zapier hook that counts installer downloads. |

The deploy reads the keys from 1Password through the repo's service account
(`sa-docs-rewrite`). Google tag and PostHog load only after cookie consent
(`components/cookie-consent.tsx`). Never put a key or a hook URL in a file or a
commit.

## Never

- Edit `out/` or `.versioned/`; both are generated.
- Document unreleased, internal, employee-only or commercial matters as fact
  (the `docs-writing` skill lists them).
- Ship a screenshot by hand when `screenshots-capture/` can capture it.
