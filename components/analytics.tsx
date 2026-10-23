'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { capturePageview, initAnalytics } from '@/lib/analytics';
import { hasTrackingConsent, sendGooglePageview } from '@/lib/tracking';

/**
 * Starts PostHog once and counts a page view on every route change: PostHog
 * always (cookieless before consent), GA4 only after consent. Renders nothing.
 */
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    initAnalytics(hasTrackingConsent());
  }, []);

  useEffect(() => {
    // Let the new page's <title> land before the page view reads it.
    const t = window.setTimeout(() => {
      capturePageview();
      sendGooglePageview();
    }, 0);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return null;
}
