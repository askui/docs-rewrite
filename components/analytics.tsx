'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { capturePageview } from '@/lib/analytics';

/**
 * Counts a PostHog page view on every client-side route change. PostHog starts
 * only after "Accept all" (lib/tracking.ts) and counts the page it starts on
 * itself, so the first render counts nothing. GA4 counts its own.
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

  return null;
}
