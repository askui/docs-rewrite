import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { CookieSettingsLink } from '@/components/cookie-settings-link';
import { baseOptions } from '@/lib/layout.shared';
import { treeForPage } from '@/lib/versions';

// The layout sits next to the page, not above it, so it knows the page's slug:
// each page gets the sidebar tree of its own docs version only (treeForPage).
export default async function Layout({ children, params }: LayoutProps<'/docs/[[...slug]]'>) {
  const { slug = [] } = await params;
  return (
    <DocsLayout
      tree={treeForPage(source.getPageTree(), slug)}
      {...baseOptions()}
      sidebar={{ footer: <CookieSettingsLink key="cookie-settings" /> }}
    >
      {children}
    </DocsLayout>
  );
}
