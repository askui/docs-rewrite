import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

// The site is deployed two ways and the base path selects which:
//   - Project page  → https://askui.github.io/docs-rewrite  (base path "/docs-rewrite")
//   - Custom domain → https://docs.askui.com                 (served at the root, no base path)
//
// NEXT_PUBLIC_BASE_PATH picks the mode. "ROOT" is a sentinel meaning "serve at
// the domain root" (empty base path) because GitHub Actions expressions can't
// pass an empty string cleanly. Anything else (or unset) keeps /docs-rewrite.
// Keep this resolver in sync with the copy in lib/shared.ts.
function resolveBasePath() {
  const raw = process.env.NEXT_PUBLIC_BASE_PATH;
  if (raw === 'ROOT') return '';
  if (!raw) return '/docs-rewrite';
  return raw;
}

const basePath = resolveBasePath();

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  // Omit basePath entirely when serving at the root — Next requires a leading
  // "/" and treats the absence of the key as "no base path".
  ...(basePath ? { basePath } : {}),
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default withMDX(config);
