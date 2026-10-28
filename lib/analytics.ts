// ── Product analytics (PostHog, EU cloud) ───────────────────────────────────
// The same setup as www.askui.com (askui/askui-website, src/lib/analytics.ts),
// sending to the same PostHog project. Filter on `$host` (docs.askui.com) to
// see the docs alone.
//
// Consent model, nothing before consent:
//  - Before a choice, and after "Necessary only", PostHog is not started. The
//    page sends no request to PostHog and stores nothing.
//  - After "Accept all" (now, or stored from an earlier visit), PostHog starts
//    with cookie + localStorage, so a returning visitor keeps one ID.
//  - Withdrawing "Accept all" opts PostHog out; the banner then reloads the
//    page, which starts without it (lib/tracking.ts).
//  - No session recording and no person profiles for anonymous visitors.
//    The client sends no IP (`ip: false`).
//
// Events go through ingest.askui.com, PostHog's managed reverse proxy for the
// askui.com domain, so ad blockers that block posthog.com do not drop them.
//
// Off unless NEXT_PUBLIC_POSTHOG_KEY is set at build time (the deploy workflow
// reads it from 1Password, op://plat-tracking/posthog). lib/tracking.ts also
// keeps it off on localhost and in automated browsers.

import posthog from 'posthog-js';

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://ingest.askui.com';

let started = false;

/**
 * Start PostHog after "Accept all" and count the current page. Safe to call
 * more than once. Later page views come from <Analytics /> on route changes.
 */
export const startAnalytics = (): void => {
  if (started || !KEY || typeof window === 'undefined') return;
  started = true;
  posthog.init(KEY, {
    api_host: HOST,
    ui_host: 'https://eu.posthog.com',
    persistence: 'localStorage+cookie',
    person_profiles: 'identified_only',
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
    disable_session_recording: true,
    ip: false,
  });
  posthog.capture('$pageview');
};

/**
 * Visitor withdrew "Accept all": stop sending at once, and stop writing to
 * cookies and storage, so the cleanup in lib/tracking.ts is not undone before
 * the reload.
 */
export const stopAnalytics = (): void => {
  if (!started) return;
  posthog.opt_out_capturing();
  posthog.set_config({ disable_persistence: true });
};

/** Count a page view. Called on every route change; no-op before consent. */
export const capturePageview = (): void => {
  if (!started) return;
  posthog.capture('$pageview');
};
