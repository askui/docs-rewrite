// ── Google tag (GA4 + Google Ads), loaded only after cookie consent ────────
// The same tags and consent flow as www.askui.com (askui/askui-website,
// src/lib/tracking.ts), so docs visits land in the same GA4 property and
// Google Ads can attribute conversions that pass through the docs.
// The Consent Mode v2 default ("denied") is declared inline in app/layout.tsx
// before anything else runs.
//
// Page views: the config call sends the first one, and GA4's enhanced
// measurement sends one on every client-side route change (history events),
// so the docs send none by hand; doing both counts every page twice.

import { startAnalytics, stopAnalytics } from '@/lib/analytics';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GA_ID = 'G-4G6ZH8SK4Q';
const GOOGLE_ADS_ID = 'AW-10843353502';

export const CONSENT_KEY = 'askui-cookie-consent';
export type ConsentType = 'all' | 'necessary' | null;

let trackingLoaded = false;

// Local dev servers and automated browsers (screenshot runs, tests) send
// nothing, so they never land in the production GA4, Ads or PostHog data.
const isLocalOrAutomated = (): boolean =>
  /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname) ||
  navigator.webdriver ||
  /HeadlessChrome/.test(navigator.userAgent);

/** Fired by "Cookie settings" to show the banner again. */
export const OPEN_COOKIE_SETTINGS = 'askui:open-cookie-settings';

export const openCookieSettings = (): void => {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS));
};

/** The stored cookie choice, or null when the visitor has not chosen yet. */
export const storedConsent = (): ConsentType => {
  try {
    return localStorage.getItem(CONSENT_KEY) as ConsentType;
  } catch {
    return null;
  }
};

/** True once the consent-gated tags were loaded in this page. */
export const trackingInPage = (): boolean => trackingLoaded;

/** Load the consent-gated tags. Safe to call more than once. */
export const loadTrackingScripts = (): void => {
  if (trackingLoaded) return;
  trackingLoaded = true;
  if (isLocalOrAutomated()) return;

  loadGoogleTag();

  // PostHog starts only now, never before consent (lib/analytics.ts)
  startAnalytics();
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
  window.gtag('config', GA_ID);
  // Google Ads tag, required for gclid-based attribution of GA4-imported
  // conversions.
  window.gtag('config', GOOGLE_ADS_ID);

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.onerror = () => console.error('[Tracking] Failed to load the Google tag');
  document.head.appendChild(script);
};

/**
 * The visitor declined, or withdrew an earlier "Accept all": Consent Mode v2
 * denied, PostHog opted out, and every cookie and storage entry the tags wrote
 * removed. A Google tag already running in the page cannot be unloaded (it
 * keeps sending cookieless pings, also to destinations set up in the Google
 * tag UI), so the caller reloads the page when trackingInPage() was true; the
 * reload then starts without the tags.
 */
export const denyTrackingConsent = (): void => {
  stopAnalytics();
  if (window.gtag) {
    window.gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
  }
  clearTrackingStorage();
};

// Google Analytics (_ga, _ga_<id>, _gid), Google Ads (_gcl_*) and PostHog
// (ph_*, and the __ph_opt_in_out_* marker opt-out writes).
const TRACKING_NAME = /^(_ga|_gid|_gcl|ph_|__ph_)/;

const clearTrackingStorage = (): void => {
  // Google sets its cookies on the registrable domain (.askui.com), PostHog on
  // the host; expire each name on every level it may live on.
  const parts = window.location.hostname.split('.');
  const domains = [''];
  for (let i = 0; i < parts.length - 1; i++) domains.push(`; domain=.${parts.slice(i).join('.')}`);
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim();
    if (!TRACKING_NAME.test(name)) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    }
  }
  try {
    for (const key of Object.keys(localStorage)) {
      if (TRACKING_NAME.test(key)) localStorage.removeItem(key);
    }
  } catch {
    // Storage blocked: nothing was written there either.
  }
};
