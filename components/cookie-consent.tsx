'use client';
import { useEffect, useState } from 'react';
import {
  CONSENT_KEY,
  denyTrackingConsent,
  googleTagInPage,
  loadTrackingScripts,
  OPEN_COOKIE_SETTINGS,
  storedConsent,
} from '@/lib/tracking';

// The cookie banner of www.askui.com (askui/askui-website,
// src/components/CookieConsent.tsx): same card, same copy, same choices.
// The choice is stored per origin, so docs.askui.com asks once on its own,
// even when the visitor already answered on www.askui.com. The values are set
// literally (not from the docs theme) so the banner looks the same on both
// sites, in light and dark mode. "Cookie settings" in the sidebar shows it
// again, so a choice can be changed or withdrawn as easily as it was given.
export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const saved = storedConsent();
    if (saved === 'all') {
      loadTrackingScripts();
    } else if (saved === null) {
      setShowBanner(true);
    }
    // "necessary": load nothing, show nothing.

    const reopen = () => setShowBanner(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS, reopen);
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(CONSENT_KEY, 'all');
    } catch {
      // Storage blocked: consent holds for this page view only.
    }
    loadTrackingScripts();
    setShowBanner(false);
  };

  const handleNecessaryOnly = () => {
    try {
      localStorage.setItem(CONSENT_KEY, 'necessary');
    } catch {
      // Storage blocked: the banner asks again on the next visit.
    }
    const withdrawn = googleTagInPage();
    denyTrackingConsent();
    setShowBanner(false);
    // A withdrawn "Accept all": reload so the Google tag is gone for good.
    if (withdrawn) window.location.reload();
  };

  if (!showBanner) return null;

  return (
    // Non-blocking banner: no backdrop, so first-time visitors can read the
    // page while the consent choice is pending.
    <div className="ck" role="dialog" aria-label="Cookie consent">
      <span className="ck-eyebrow">Privacy</span>
      <p className="ck-text">
        We use cookies for analytics and marketing. Necessary cookies keep the
        site working. <a href="https://www.askui.com/privacy-policy">Privacy policy</a>
      </p>

      {showDetails && (
        <div className="ck-details">
          <div className="ck-row">
            <span className="ck-k">Necessary</span>
            <span className="ck-v">Required for the site to function. Always on.</span>
          </div>
          <div className="ck-row">
            <span className="ck-k">Analytics &amp; marketing</span>
            <span className="ck-v">
              Google Analytics and Google Ads, loaded only after consent. PostHog (EU)
              counts visits without cookies and uses a cookie only after consent.
            </span>
          </div>
        </div>
      )}

      <div className="ck-actions">
        <button type="button" className="ck-primary" onClick={handleAcceptAll}>
          Accept all
        </button>
        <button type="button" className="ck-ghost" onClick={handleNecessaryOnly}>
          Necessary only
        </button>
        <button
          type="button"
          className="ck-more"
          aria-expanded={showDetails}
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide details' : 'Details'}
        </button>
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
          gap: 10px;
          margin: 0 0 16px;
          padding-top: 14px;
        }

        .ck-row { display: grid; gap: 2px; }

        .ck-k {
          color: #69727d;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .ck-v { color: #4a525c; font-size: 12.5px; line-height: 1.5; }

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
