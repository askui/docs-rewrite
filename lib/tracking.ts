// ── Cookie consent and the consent-gated tags ──────────────────────────────
// Two purposes, each with its own choice in the cookie banner, both off until
// the visitor turns them on (GDPR Art. 4(11), 6(1)(a); §25 TDDDG):
//  - analytics: Google Analytics 4 and PostHog (lib/analytics.ts)
//  - marketing: the Google Ads tag (gclid-based attribution of GA4-imported
//    conversions)
// Nothing of either runs, reads or writes before consent. The Consent Mode v2
// default ("denied") is declared inline in app/layout.tsx before anything
// else runs; this file only ever updates it.
//
// Page views: the GA4 config call sends the first one, and GA4's enhanced
// measurement sends one on every client-side route change (history events),
// so the docs send none by hand; doing both counts every page twice.

import { analyticsInPage, startAnalytics, stopAnalytics } from '@/lib/analytics';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GA_ID = 'G-4G6ZH8SK4Q';
const GOOGLE_ADS_ID = 'AW-10843353502';

export const CONSENT_KEY = 'askui-cookie-consent';

// Bump when the purposes or providers in the banner change: every visitor is
// asked again, since an earlier consent did not cover the new text.
const CONSENT_VERSION = 2;

// Ask again after a year.
const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export interface ConsentChoice {
  analytics: boolean;
  marketing: boolean;
}

/** The stored record: the choice, plus when and on which banner it was made. */
export interface Consent extends ConsentChoice {
  v: number;
  ts: number;
}

/** Fired by "Cookie settings" to show the banner again. */
export const OPEN_COOKIE_SETTINGS = 'askui:open-cookie-settings';

export const openCookieSettings = (): void => {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS));
};

/**
 * The stored choice, or null when the visitor has to be asked (again): no
 * choice yet, an older banner version, older than a year, or the v1 values
 * "all" / "necessary", which are not JSON.
 */
export const storedConsent = (): Consent | null => {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Consent;
    if (c?.v !== CONSENT_VERSION || !(Date.now() - c.ts < CONSENT_MAX_AGE_MS)) return null;
    return c;
  } catch {
    return null;
  }
};

/** Store a choice made in the banner, with its time and banner version. */
export const saveConsent = (choice: ConsentChoice): void => {
  const record: Consent = { v: CONSENT_VERSION, ts: Date.now(), ...choice };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
  } catch {
    // Storage blocked: the choice holds for this page view only.
  }
};

// What runs in this page right now.
let googleTagLoaded = false;
const configured = { analytics: false, marketing: false };

/**
 * Start what the choice allows. When it withdraws something already running
 * in this page, deny it, remove what it stored, and reload: a loaded Google
 * tag or PostHog cannot be unloaded, so the reload starts without them.
 */
export const applyConsent = (choice: ConsentChoice): void => {
  const withdrawn =
    (!choice.analytics && (configured.analytics || analyticsInPage())) ||
    (!choice.marketing && configured.marketing);

  if (withdrawn) {
    if (!choice.analytics) stopAnalytics();
    if (googleTagLoaded) updateGoogleConsent(choice);
    clearTrackingStorage(choice);
    window.location.reload();
    return;
  }

  if (choice.analytics) startAnalytics();
  if (choice.analytics || choice.marketing) loadGoogleTag(choice);
};

const updateGoogleConsent = (choice: ConsentChoice): void => {
  const state = (granted: boolean) => (granted ? 'granted' : 'denied');
  window.gtag('consent', 'update', {
    analytics_storage: state(choice.analytics),
    ad_storage: state(choice.marketing),
    ad_user_data: state(choice.marketing),
    ad_personalization: state(choice.marketing),
  });
};

/** Load the Google tag once, and configure each product its purpose allows. */
const loadGoogleTag = (choice: ConsentChoice): void => {
  if (!googleTagLoaded) {
    window.dataLayer = window.dataLayer || [];
    // gtag.js expects the Arguments object pushed directly, not a spread
    // array, so this has to be a function expression, not an arrow.
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
  }

  // Consent Mode v2: override the "denied" default for what was allowed.
  updateGoogleConsent(choice);

  if (!googleTagLoaded) {
    googleTagLoaded = true;
    window.gtag('js', new Date());
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.onerror = () => console.error('[Tracking] Failed to load the Google tag');
    document.head.appendChild(script);
  }

  if (choice.analytics && !configured.analytics) {
    configured.analytics = true;
    window.gtag('config', GA_ID);
  }
  if (choice.marketing && !configured.marketing) {
    configured.marketing = true;
    window.gtag('config', GOOGLE_ADS_ID);
  }
};

// Google Analytics (_ga, _ga_<id>, _gid) and PostHog (ph_*) are analytics;
// Google Ads (_gcl_*) is marketing.
const ANALYTICS_NAME = /^(_ga|_gid|ph_)/;
const MARKETING_NAME = /^_gcl/;

/** Remove every cookie and storage entry of the purposes the choice denies. */
const clearTrackingStorage = (choice: ConsentChoice): void => {
  const denied = (name: string) =>
    (!choice.analytics && ANALYTICS_NAME.test(name)) ||
    (!choice.marketing && MARKETING_NAME.test(name));

  // Google sets its cookies on the registrable domain (.askui.com), PostHog on
  // the host; expire each name on every level it may live on.
  const parts = window.location.hostname.split('.');
  const domains = [''];
  for (let i = 0; i < parts.length - 1; i++) domains.push(`; domain=.${parts.slice(i).join('.')}`);
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim();
    if (!denied(name)) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    }
  }
  try {
    for (const key of Object.keys(localStorage)) {
      if (denied(key)) localStorage.removeItem(key);
    }
  } catch {
    // Storage blocked: nothing was written there either.
  }
};
