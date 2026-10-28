// ── Product analytics (PostHog, EU cloud) ───────────────────────────────────
// The same PostHog project as www.askui.com (askui/askui-website,
// src/lib/analytics.ts). Filter on `$host` (docs.askui.com) to see the docs
// alone.
//
// Consent model, nothing before consent:
//  - PostHog starts only once the visitor allows "Analytics" in the cookie
//    banner (lib/tracking.ts). Before that, and without that consent, the
//    script does not run, so nothing is read from or written to the device
//    and nothing is sent (§25 TDDDG, ePrivacy Art. 5(3)).
//  - With consent it keeps its anonymous ID in a cookie and localStorage, so
//    a returning visitor counts as one.
//  - No session recording and no person profiles for anonymous visitors.
//    Also turn on "Discard client IP data" in the PostHog project settings.
//
// Events go through ingest.askui.com, PostHog's managed reverse proxy for the
// askui.com domain, so ad blockers that block posthog.com do not drop them.
//
// Off unless NEXT_PUBLIC_POSTHOG_KEY is set at build time (the deploy workflow
// sets it from the POSTHOG_KEY repo variable), and never in an automated
// browser, so local builds and the screenshot runs send nothing.

import posthog from 'posthog-js';

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://ingest.askui.com';

let started = false;

const isAutomated = (): boolean =>
  typeof navigator !== 'undefined' &&
  (navigator.webdriver || /HeadlessChrome/.test(navigator.userAgent));

/** True once PostHog runs in this page. */
export const analyticsInPage = (): boolean => started;

/**
 * Start PostHog and count the current page. Call only with analytics
 * consent; safe to call more than once.
 */
export const startAnalytics = (): void => {
  if (started || !KEY || typeof window === 'undefined' || isAutomated()) return;
  started = true;
  posthog.init(KEY, {
    api_host: HOST,
    ui_host: 'https://eu.posthog.com',
    persistence: 'localStorage+cookie',
    person_profiles: 'identified_only',
    // Page views are sent by hand: this one for the page consent was given
    // on, <Analytics /> for every later route change.
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
    disable_session_recording: true,
    ip: false,
  });
  posthog.capture('$pageview');
};

/**
 * Analytics consent withdrawn: stop writing and sending before the caller
 * clears storage and reloads (the reload starts without PostHog).
 */
export const stopAnalytics = (): void => {
  if (!started) return;
  posthog.set_config({ persistence: 'memory', capture_pageleave: false, autocapture: false });
};

/** Count a page view. Called on every route change. */
export const capturePageview = (): void => {
  if (!started) return;
  posthog.capture('$pageview');
};
