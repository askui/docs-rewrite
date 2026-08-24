'use client';

import { useEffect } from 'react';
import { captureUtmParams } from '@/lib/tracking';

/**
 * Mounted once in the root layout. Persists any UTM query params from the
 * current page load to sessionStorage so notifyDownload (lib/tracking.ts)
 * can still attribute a download after the visitor navigates to a different
 * docs page in between.
 */
export function UtmCapture() {
  useEffect(() => {
    captureUtmParams();
  }, []);

  return null;
}
