# AskUI Docs

The user docs at [docs.askui.com](https://docs.askui.com), built with
[Fumadocs](https://fumadocs.dev) as a static Next.js export.

## Versions and releases

The site shows the docs of every AskUI Desktop minor release behind a version
dropdown. The newest version lives at `/docs/…`, every older one at
`/docs/vX.Y/…`.

- **Write on `main` only.** `content/docs/` always holds the newest docs. Merge a
  docs PR as soon as its app PR is merged. A merge publishes nothing.
- **Release with a tag.** When an app version is released (`v0.11.0`), tag the
  same version on `main` here and push the tag:

  ```bash
  git tag -a v0.11.0 -m "Docs for AskUI Desktop v0.11.0" origin/main
  git push origin v0.11.0
  ```

  `.github/workflows/deploy.yml` then builds and deploys the whole site.
  Release candidates (`v0.11.0-rc1`) get no tag and no docs version.
- **Older versions come from their tags.** `scripts/build-versioned.mjs` takes the
  newest tag of each older minor (`v0.9.0`, `v0.8.2`, …) and builds it under
  `/docs/vX.Y/`. Nothing is copied into the repository. A minor whose docs did
  not change merges into the next one (`v0.9 – v0.10`).
- **Fix an older version** on its branch (`release/v0.9`), tag the fix
  (`v0.9.1`), push the tag, and run the deploy workflow by hand
  (Actions → Deploy to GitHub Pages → Run workflow). The workflow always builds
  from the newest release tag, so the fix never replaces the newest version.
- **Preview locally**: `node scripts/build-versioned.mjs`, then `pnpm start`.
  `pnpm dev` and `pnpm build` keep building `main` alone, without older versions.

## Fumadocs starter notes

This is a Next.js application generated with
[Create Fumadocs](https://github.com/fuma-nama/fumadocs).

It is a Next.js app with [Static Export](https://nextjs.org/docs/app/guides/static-exports) configured.

Run development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open http://localhost:3000 with your browser to see the result.

## Explore

In the project, you can see:

- `lib/source.ts`: Code for content source adapter, [`loader()`](https://fumadocs.dev/docs/headless/source-api) provides the interface to access your content.
- `lib/layout.shared.tsx`: Shared options for layouts, optional but preferred to keep.

| Route                     | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `app/(home)`              | The route group for your landing page and other pages. |
| `app/docs`                | The documentation layout and pages.                    |
| `app/api/search/route.ts` | The Route Handler for search.                          |

### Fumadocs MDX

A `source.config.ts` config file has been included, you can customise different options like frontmatter schema.

Read the [Introduction](https://fumadocs.dev/docs/mdx) for further details.

## Learn More

To learn more about Next.js and Fumadocs, take a look at the following
resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js
  features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Fumadocs](https://fumadocs.dev) - learn about Fumadocs
