// ── Google tag (GA4 + Google Ads), loaded only after cookie consent ────────
// The same tags and consent flow as www.askui.com (askui/askui-website,
// src/lib/tracking.ts), so docs visits land in the same GA4 property and
// Google Ads can attribute conversions that pass through the docs.
// The Consent Mode v2 default ("denied") is declared inline in app/layout.tsx
// before anything else runs.

import { analyticsConsentDenied, analyticsConsentGranted } from '@/lib/analytics';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export const GA_ID = 'G-4G6ZH8SK4Q';
const GOOGLE_ADS_ID = 'AW-10843353502';

export const CONSENT_KEY = 'askui-cookie-consent';
export type ConsentType = 'all' | 'necessary' | null;

let trackingLoaded = false;

/** The stored cookie choice, or null when the visitor has not chosen yet. */
export const storedConsent = (): ConsentType => {
  try {
    return localStorage.getItem(CONSENT_KEY) as ConsentType;
  } catch {
    return null;
  }
};

export const hasTrackingConsent = (): boolean => storedConsent() === 'all';

/** Load the consent-gated tags. Safe to call more than once. */
export const loadTrackingScripts = (): void => {
  if (trackingLoaded) return;
  trackingLoaded = true;

  loadGoogleTag();

  // PostHog: from memory-only to cookie persistence (lib/analytics.ts)
  analyticsConsentGranted();
};

const loadGoogleTag = (): void => {
  window.dataLayer = window.dataLayer || [];

  // gtag.js expects the Arguments object pushed directly, not a spread array,
  // so this has to be a function expression, not an arrow.
  window.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };

  // Consent Mode v2: the visitor accepted, override the "denied" default.
  window.gtag('consent', 'update', {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted',
  });

  window.gtag('js', new Date());
  // Page views are sent by <Analytics /> on every route change, including the
  // first one, so the config itself sends none.
  window.gtag('config', GA_ID, { send_page_view: false });
  // Google Ads tag, required for gclid-based attribution of GA4-imported
  // conversions.
  window.gtag('config', GOOGLE_ADS_ID);

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.onerror = () => console.error('[Tracking] Failed to load the Google tag');
  document.head.appendChild(script);
};

/** Send a GA4 page view. A no-op until the visitor consented. */
export const sendGooglePageview = (): void => {
  if (!trackingLoaded || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: window.location.pathname,
    page_title: document.title,
    page_location: window.location.href,
  });
};

/** Consent Mode v2: record that the visitor declined. */
export const denyTrackingConsent = (): void => {
  analyticsConsentDenied();
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('consent', 'update', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  });
};
