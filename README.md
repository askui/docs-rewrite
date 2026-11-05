# AskUI Docs

The user documentation of AskUI Desktop, the AskUI CLI and AgentOS, published at
[docs.askui.com](https://docs.askui.com).

The site is a [Fumadocs](https://fumadocs.dev) app on Next.js, exported as static
HTML and served by GitHub Pages. The pages are MDX files in `content/docs/`.

## Versions

The site shows the docs of every AskUI Desktop minor release behind a version
dropdown in the sidebar:

| URL | Content |
| --- | --- |
| `/docs/…` | the newest released version |
| `/docs/v0.10/…`, `/docs/v0.9/…`, … | each older minor release |

Each version describes exactly what that app release shipped. A minor release
whose docs did not change shares a version with the next one (`v0.9 – v0.10`).

## Write the docs

1. Branch from `main` and edit `content/docs/`. `main` always holds the docs of
   the next release.
2. Run the site locally and check your pages:

   ```bash
   pnpm install
   pnpm dev            # http://localhost:3000/docs-rewrite/docs
   ```

3. Before you open the PR, run both checks. `types:check` misses MDX parse
   errors that only the build finds:

   ```bash
   pnpm types:check
   pnpm build
   ```

4. Merge the docs PR when its app PR is merged. A merge publishes nothing.

## Release the docs

When an AskUI Desktop version is released, tag the same version here and push
the tag. That builds and deploys the whole site with every version:

```bash
git fetch origin
git tag -a v0.11.0 -m "Docs for AskUI Desktop v0.11.0" origin/main
git push origin v0.11.0
```

- Release candidates (`v0.11.0-rc1`) get no tag and no docs version.
- The deploy always builds from the newest release tag.
  [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) has the details.

### Fix an older version

Older versions live on branches: `release/v0.9`, `release/v0.10`, …

1. Commit the fix on the version's branch, e.g. `release/v0.9`.
2. Tag it with the next patch number and push the tag:
   `git tag -a v0.9.1 -m "…" release/v0.9`, then `git push origin v0.9.1`.
3. Run the deploy by hand: Actions → **Deploy to GitHub Pages** → **Run workflow**.
   The old branch does not carry the current workflow, so the tag alone starts
   nothing.

A fix to the newest version goes on `main` and ships with the next release tag.
For an urgent one, tag a patch on `main` (`v0.11.1`).

## Preview the versioned site

```bash
NEXT_PUBLIC_BASE_PATH=ROOT node scripts/build-versioned.mjs   # every version into out/
pnpm start                                                    # http://localhost:3000/docs
```

`pnpm dev` and `pnpm build` build `main` alone, without the older versions.

## Screenshots

Screenshots of AskUI Desktop are captured by an AskUI agent, not by hand. See
[`screenshots-capture/README.md`](screenshots-capture/README.md).
