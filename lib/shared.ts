// GitHub Pages serves this project site under /docs-rewrite. Keep in sync with
// next.config's basePath — used by RunEmbed to resolve root-absolute asset URLs.
export const basePath = '/docs-rewrite';

export const appName = 'AskUI Docs';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export const gitConfig = {
  user: 'askui',
  repo: 'docs-rewrite',
  branch: 'main',
};
