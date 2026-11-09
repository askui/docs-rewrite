'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { capturePageview } from '@/lib/analytics';
import { downloadOf, trackDownload } from '@/lib/downloads';

/**
 * Counts a PostHog page view on every client-side route change, cookieless
 * before consent. PostHog counts the page it starts on itself
 * (lib/analytics.ts), so the first render counts nothing. GA4 counts its own.
 *
 * Also counts every click on an installer download link, on every page of
 * every docs version, recognised by its URL (lib/downloads.ts). The click
 * still downloads as usual: nothing calls preventDefault.
 *
 * Renders nothing.
 */
export function Analytics() {
  const pathname = usePathname();
  const lastPath = useRef(pathname);

  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    // Let the new page's <title> land before the page view reads it.
    const t = window.setTimeout(capturePageview, 0);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href]');
      const download = link && downloadOf((link as HTMLAnchorElement).href);
      if (download) trackDownload(download);
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
