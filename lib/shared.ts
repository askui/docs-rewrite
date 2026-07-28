// The site is served either as a GitHub Pages project page under /docs-rewrite
// (askui.github.io/docs-rewrite) or at the root of the custom domain
// docs.askui.com. NEXT_PUBLIC_BASE_PATH selects which:
//   - unset / "/docs-rewrite" → "/docs-rewrite" (project page, the default)
//   - "ROOT"                  → ""              (custom-domain root)
// "ROOT" is a sentinel because GitHub Actions expressions can't pass an empty
// string cleanly. Keep this resolver in sync with the copy in next.config.mjs.
// Used to prefix root-absolute asset URLs (logo, favicon, RunEmbed, MDX images)
// that Next does not auto-prefix.
function resolveBasePath(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_PATH;
  if (raw === 'ROOT') return '';
  if (!raw) return '/docs-rewrite';
  return raw;
}

export const basePath = resolveBasePath();

export const appName = 'AskUI Docs';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export const gitConfig = {
  user: 'askui',
  repo: 'docs-rewrite',
  branch: 'main',
};
