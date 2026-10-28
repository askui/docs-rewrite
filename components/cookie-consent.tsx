'use client';
import { useEffect, useState } from 'react';
import {
  applyConsent,
  type ConsentChoice,
  OPEN_COOKIE_SETTINGS,
  saveConsent,
  storedConsent,
} from '@/lib/tracking';

const NONE: ConsentChoice = { analytics: false, marketing: false };
const ALL: ConsentChoice = { analytics: true, marketing: true };

// The cookie banner, in the card of www.askui.com (askui/askui-website,
// src/components/CookieConsent.tsx). What it asks follows the regulators'
// cookie-banner guidance (EDPB Cookie Banner Taskforce, DSK Orientierungshilfe
// Digitale Dienste):
//  - "Accept all", "Reject all" and "Customize" on the first layer, so
//    declining takes one click, like accepting. "Accept all" is the primary
//    button, as on www.askui.com.
//  - Analytics and marketing are separate choices, both off by default.
//  - The first layer names the providers.
// The choice is stored per origin, so docs.askui.com asks once on its own,
// even when the visitor already answered on www.askui.com. The values are set
// literally (not from the docs theme) so the banner looks the same on both
// sites, in light and dark mode. "Cookie settings" in the sidebar shows it
// again, so a choice can be changed or withdrawn as easily as it was given.
export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [choice, setChoice] = useState<ConsentChoice>(NONE);

  useEffect(() => {
    const saved = storedConsent();
    if (saved) {
      applyConsent(saved);
      setChoice({ analytics: saved.analytics, marketing: saved.marketing });
    } else {
      setShowBanner(true);
    }

    const reopen = () => {
      const current = storedConsent();
      setChoice(current ? { analytics: current.analytics, marketing: current.marketing } : NONE);
      setCustomize(true);
      setShowBanner(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS, reopen);
  }, []);

  const decide = (c: ConsentChoice) => {
    saveConsent(c);
    setChoice(c);
    setShowBanner(false);
    setCustomize(false);
    applyConsent(c);
  };

  if (!showBanner) return null;

  return (
    // Non-blocking banner: no backdrop, so first-time visitors can read the
    // page while the consent choice is pending.
    <div className="ck" role="dialog" aria-label="Cookie consent">
      <span className="ck-eyebrow">Privacy</span>
      <p className="ck-text">
        With your consent we use Google Analytics and PostHog to see how the docs
        are used, and Google Ads to measure our campaigns. They set cookies and
        run only if you allow them. You can change your choice any time under
        Cookie settings. <a href="https://www.askui.com/privacy-policy">Privacy policy</a>
      </p>

      {customize && (
        <div className="ck-details">
          <label className="ck-row">
            <input type="checkbox" checked disabled />
            <span>
              <span className="ck-k">Necessary</span>
              <span className="ck-v">
                Keeps the site working and remembers this choice for 12 months, in
                your browser&apos;s local storage. Always on.
              </span>
            </span>
          </label>
          <label className="ck-row">
            <input
              type="checkbox"
              checked={choice.analytics}
              onChange={(e) => setChoice({ ...choice, analytics: e.target.checked })}
            />
            <span>
              <span className="ck-k">Analytics</span>
              <span className="ck-v">
                Google Analytics (Google, may process data in the USA) and PostHog
                (data hosted in the EU) record the pages you open, the page you came
                from and the links and buttons you click, under a random ID, to show
                us how the docs are used. Cookies: Google Analytics up to 2 years,
                PostHog up to 1 year.
              </span>
            </span>
          </label>
          <label className="ck-row">
            <input
              type="checkbox"
              checked={choice.marketing}
              onChange={(e) => setChoice({ ...choice, marketing: e.target.checked })}
            />
            <span>
              <span className="ck-k">Marketing</span>
              <span className="ck-v">
                Google Ads (Google, may process data in the USA) measures which ad
                campaigns bring visitors to us, and Google may use your visit to show
                you AskUI ads on other websites. Cookies: up to 90 days.
              </span>
            </span>
          </label>
        </div>
      )}

      <div className="ck-actions">
        <button type="button" className="ck-primary" onClick={() => decide(ALL)}>
          Accept all
        </button>
        <button type="button" className="ck-ghost" onClick={() => decide(NONE)}>
          Reject all
        </button>
        {customize ? (
          <button type="button" className="ck-more" onClick={() => decide(choice)}>
            Save choices
          </button>
        ) : (
          <button type="button" className="ck-more" onClick={() => setCustomize(true)}>
            Customize
          </button>
        )}
      </div>

      <style>{`
        .ck {
          background: #fff;
          border: 1px solid rgba(16, 24, 32, 0.12);
          border-radius: 10px;
          bottom: 20px;
          box-shadow: 0 24px 60px rgba(16, 24, 32, 0.16);
          color: #14181d;
          font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
          left: 50%;
          max-width: 460px;
          padding: 20px 22px;
          position: fixed;
          transform: translateX(-50%);
          width: calc(100% - 32px);
          z-index: 9999;
        }

        .ck * { box-sizing: border-box; }

        .ck-eyebrow {
          color: #69727d;
          display: block;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.14em;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .ck-text {
          color: #4a525c;
          font-size: 13.5px;
          line-height: 1.6;
          margin: 0 0 16px;
        }

        .ck-text a {
          color: #14181d;
          font-weight: 500;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .ck-details {
          border-top: 1px solid rgba(16, 24, 32, 0.06);
          display: grid;
          gap: 12px;
          margin: 0 0 16px;
          padding-top: 14px;
        }

        .ck-row {
          align-items: start;
          cursor: pointer;
          display: grid;
          gap: 10px;
          grid-template-columns: auto 1fr;
        }

        .ck-row input {
          accent-color: #14181d;
          height: 16px;
          margin: 1px 0 0;
          width: 16px;
        }

        .ck-row input:disabled { cursor: default; }

        .ck-k {
          color: #69727d;
          display: block;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          margin-bottom: 2px;
          text-transform: uppercase;
        }

        .ck-v { color: #4a525c; display: block; font-size: 12.5px; line-height: 1.5; }

        .ck-actions { align-items: center; display: flex; flex-wrap: wrap; gap: 10px; }

        .ck-primary {
          background: #14181d;
          border: 1px solid #14181d;
          border-radius: 6px;
          color: #fff;
          cursor: pointer;
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          padding: 9px 18px;
          transition: background 0.15s ease;
        }

        .ck-primary:hover { background: #000; }

        .ck-ghost {
          background: #f2f4f6;
          border: 1px solid transparent;
          border-radius: 6px;
          color: #14181d;
          cursor: pointer;
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          padding: 9px 18px;
          transition: background 0.15s ease;
        }

        .ck-ghost:hover { background: #e8ebef; }

        .ck-more {
          background: none;
          border: none;
          color: #69727d;
          cursor: pointer;
          font-family: inherit;
          font-size: 12.5px;
          margin-left: auto;
          padding: 4px 0;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .ck-more:hover { color: #14181d; }
      `}</style>
    </div>
  );
}
