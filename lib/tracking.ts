// Headcount ping for AskUI Desktop / AgentOS installer downloads. Feeds the
// same Zapier catch-hook (→ Slack channel / Google Sheet) as the marketing
// site's notifyDownload (src/lib/tracking.ts in askui-website). This is not
// analytics — it fires unconditionally, with no cookie-consent gate.
const DOWNLOAD_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/26336845/4ta4esp/';

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
type UtmParam = (typeof UTM_PARAMS)[number];

// sessionStorage, not localStorage/cookies: only needs to survive in-repo
// navigation until the tab closes, and must stay isolated from the marketing
// site (docs.askui.com and www.askui.com are treated as fully separate here).
const UTM_STORAGE_KEY = 'askui_docs_utm';

/**
 * Reads UTM params off the current URL and persists any that are present to
 * sessionStorage, so a visitor who lands on one docs page via a campaign
 * link and then navigates to a download page still gets attributed.
 */
export function captureUtmParams(): void {
  const params = new URLSearchParams(window.location.search);
  const found: Partial<Record<UtmParam, string>> = {};
  for (const key of UTM_PARAMS) {
    const value = params.get(key);
    if (value) found[key] = value;
  }
  if (Object.keys(found).length > 0) {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(found));
  }
}

function getStoredUtm(): Partial<Record<UtmParam, string>> {
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Berlin local time (not UTC), DST-aware.
function berlinTimestamp(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
}

export function notifyDownload(source: string, label: string, os: string): void {
  const data = new FormData();
  data.append('source', source);
  data.append('label', label);
  data.append('os', os);
  data.append('timestamp', berlinTimestamp());

  const utm = getStoredUtm();
  Object.entries(utm).forEach(([key, value]) => {
    if (value) data.append(key, value);
  });

  // Keep FormData, not JSON — a JSON content type triggers a CORS preflight
  // this Zapier catch-hook won't answer.
  fetch(DOWNLOAD_WEBHOOK_URL, { method: 'POST', body: data, keepalive: true }).catch(() => {});
}
