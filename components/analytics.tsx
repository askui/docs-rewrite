'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { capturePageview, initAnalytics } from '@/lib/analytics';
import { hasTrackingConsent } from '@/lib/tracking';

/**
 * Starts PostHog once and counts a PostHog page view on every route change
 * (cookieless before consent). GA4 counts its own (lib/tracking.ts).
 * Renders nothing.
 */
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    initAnalytics(hasTrackingConsent());
  }, []);

  useEffect(() => {
    // Let the new page's <title> land before the page view reads it.
    const t = window.setTimeout(capturePageview, 0);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return null;
}
