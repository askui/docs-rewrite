'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { capturePageview } from '@/lib/analytics';

/**
 * Counts a PostHog page view on every client-side route change. Does nothing
 * without analytics consent: PostHog is started by the cookie banner
 * (lib/tracking.ts), which also counts the page it starts on. GA4 counts its
 * own. Renders nothing.
 */
export function Analytics() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // Let the new page's <title> land before the page view reads it.
    const t = window.setTimeout(capturePageview, 0);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return null;
}
