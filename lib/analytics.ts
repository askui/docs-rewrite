// ── Product analytics (PostHog, EU cloud) ───────────────────────────────────
// The same setup as www.askui.com (askui/askui-website, src/lib/analytics.ts),
// sending to the same PostHog project. Filter on `$host` (docs.askui.com) to
// see the docs alone.
//
// Consent model (the same as www.askui.com):
//  - Before a choice, and after "Necessary only", PostHog runs cookieless: it
//    stores nothing on the device and counts unique visitors with a daily hash
//    formed on PostHog's servers. Only page views and download clicks are sent
//    (ANONYMOUS_EVENTS); everything else is dropped in before_send. Needs
//    "Cookieless server hash mode" on in the PostHog project settings, or
//    PostHog discards these events.
//  - After "Accept all" (now, or stored from an earlier visit), PostHog opts
//    in: cookie + localStorage, so a returning visitor keeps one ID, and every
//    event is sent.
//  - Withdrawing "Accept all" opts PostHog out, which is cookieless again; the
//    banner then reloads the page (lib/tracking.ts).
//  - No session recording and no person profiles for anonymous visitors.
//    The client sends no IP (`ip: false`).
//
// Events go through ingest.askui.com, PostHog's managed reverse proxy for the
// askui.com domain, so ad blockers that block posthog.com do not drop them.
//
// Off unless NEXT_PUBLIC_POSTHOG_KEY is set at build time (the deploy workflow
// reads it from 1Password, op://plat-tracking/Posthog Production). lib/tracking.ts also
// keeps it off on localhost and in automated browsers.

import posthog from 'posthog-js';

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://ingest.askui.com';

let started = false;
let consented = false;

// What PostHog receives without consent: page views and download clicks.
// Clicks (autocapture) and page leaves need "Accept all".
const ANONYMOUS_EVENTS = new Set(['$pageview', 'download_click']);

/**
 * Start PostHog on page load and count the current page: cookieless, or opted
 * in for a stored "Accept all". Safe to call more than once. Later page views
 * come from <Analytics /> on route changes.
 */
export const startAnalytics = (withConsent: boolean): void => {
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
    // No remote config and no feature-flag request: the docs use neither, and
    // both would reach PostHog before consent with more than a page view or a
    // download (the flags request carries the visit's referrer and landing
    // address). The same as www.askui.com. Web vitals were enabled by the
    // remote config, so they are switched on here.
    advanced_disable_flags: true,
    capture_performance: { web_vitals: true },
    // Cookieless until opt_in_capturing(): the visitor's choice lives in
    // askui-cookie-consent, so PostHog starts opted out on every page load.
    cookieless_mode: 'on_reject',
    opt_out_capturing_by_default: true,
    before_send: (event) => {
      if (!event) return null;
      if (!consented && !ANONYMOUS_EVENTS.has(event.event)) return null;
      return event;
    },
  });
  if (withConsent) grantAnalyticsConsent();
  // A stale PostHog opt-in from an earlier "Accept all" must not outlive it.
  else if (posthog.has_opted_in_capturing()) posthog.clear_opt_in_out_capturing();
  posthog.capture('$pageview');
};

/**
 * "Accept all", now or stored: switch from cookieless to cookies and send
 * every event. The page the visitor accepted on was counted already.
 */
export const grantAnalyticsConsent = (): void => {
  if (!started || consented) return;
  consented = true;
  posthog.opt_in_capturing({ captureEventName: false });
};

/**
 * Visitor withdrew "Accept all": back to cookieless at once, and stop writing
 * to cookies and storage, so the cleanup in lib/tracking.ts is not undone
 * before the reload.
 */
export const stopAnalytics = (): void => {
  if (!started || !consented) return;
  consented = false;
  posthog.opt_out_capturing();
  posthog.set_config({ disable_persistence: true });
};

/**
 * Send a named event, as the website's captureEvent. Without consent only
 * ANONYMOUS_EVENTS go out.
 */
export const captureEvent = (name: string, props?: Record<string, unknown>): void => {
  if (!started) return;
  posthog.capture(name, props);
};

/** Count a page view. Called on every route change; cookieless before consent. */
export const capturePageview = (): void => {
  if (!started) return;
  posthog.capture('$pageview');
};
