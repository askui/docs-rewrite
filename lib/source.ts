import { docs } from 'collections/server';
import { loader } from 'fumadocs-core/source';
import { icons } from 'lucide-react';
import { createElement } from 'react';
import { brandIcons } from './brand-icons';
import { docsContentRoute, docsImageRoute, docsRoute } from './shared';

/** `icon` values in meta.json / page frontmatter are lucide names, plus our
 * brand icons (Android, Chrome) lucide no longer ships. Used for the sidebar
 * (via the loader) and the page title. */
export function resolveIcon(icon: string | undefined) {
  if (!icon) return;
  if (icon in brandIcons) return createElement(brandIcons[icon as keyof typeof brandIcons]);
  if (icon in icons) return createElement(icons[icon as keyof typeof icons]);
}

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [],
  icon: resolveIcon,
});

export function getPageImage(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `${docsImageRoute}/${segments.join('/')}`,
  };
}

export function getPageMarkdownUrl(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'content.md'];

  return {
    segments,
    url: `${docsContentRoute}/${segments.join('/')}`,
  };
}

export async function getLLMText(page: (typeof source)['$inferPage']) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title} (${page.url})

${processed}`;
}
