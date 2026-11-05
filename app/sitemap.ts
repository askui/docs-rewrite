import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { siteUrl } from '@/lib/shared';

// Emitted as out/sitemap.xml by the static export. One entry per docs page,
// using the same absolute URL as the page's canonical tag (siteUrl + page.url,
// no trailing slash). "/" is left out: it is a noindex redirect to /docs.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return source.getPages().map((page) => ({
    url: `${siteUrl}${page.url}`,
  }));
}
