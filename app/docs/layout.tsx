import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { CookieSettingsLink } from '@/components/cookie-settings-link';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...baseOptions()}
      sidebar={{ footer: <CookieSettingsLink key="cookie-settings" /> }}
    >
      {children}
    </DocsLayout>
  );
}
