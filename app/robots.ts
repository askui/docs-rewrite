import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/shared';

// Emitted as out/robots.txt by the static export. Everything is crawlable
// (search engines and AI crawlers alike); the sitemap tells them where every
// docs page lives.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
