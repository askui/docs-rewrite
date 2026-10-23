// ── Product analytics (PostHog, EU cloud) ───────────────────────────────────
// The same setup as www.askui.com (askui/askui-website, src/lib/analytics.ts),
// sending to the same PostHog project. Filter on `$host` (docs.askui.com) to
// see the docs alone.
//
// Consent model, cookieless until consent:
//  - Before consent, and after "Necessary only", PostHog keeps its anonymous
//    ID in memory only. Nothing is written to cookies or storage, and every
//    full page load is a new anonymous visitor. Client-side navigation between
//    docs pages stays one visit.
//  - After "Accept all", PostHog switches to cookie + localStorage, so a
//    returning visitor keeps one ID across visits.
//  - No session recording and no person profiles for anonymous visitors.
//    The client sends no IP (`ip: false`).
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

/**
 * Start PostHog. Call once, as early as possible. `consented` is the stored
 * cookie choice ("all" → cookies, anything else → memory only).
 */
export const initAnalytics = (consented: boolean): void => {
  if (started || !KEY || typeof window === 'undefined' || isAutomated()) return;
  started = true;
  posthog.init(KEY, {
    api_host: HOST,
    ui_host: 'https://eu.posthog.com',
    persistence: consented ? 'localStorage+cookie' : 'memory',
    person_profiles: 'identified_only',
    // Page views come from <Analytics /> on every route change, so the first
    // view and client-side navigations are counted the same way.
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
    disable_session_recording: true,
    ip: false,
  });
};

/** Visitor accepted all cookies: keep the anonymous ID across visits. */
export const analyticsConsentGranted = (): void => {
  if (!started) return;
  posthog.set_config({ persistence: 'localStorage+cookie' });
};

/** Visitor chose "Necessary only": stay in memory, store nothing. */
export const analyticsConsentDenied = (): void => {
  if (!started) return;
  posthog.set_config({ persistence: 'memory' });
};

/** Count a page view. Called on every route change. */
export const capturePageview = (): void => {
  if (!started) return;
  posthog.capture('$pageview');
};
