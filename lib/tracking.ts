// Headcount ping for AskUI Desktop / AgentOS installer downloads. Feeds the
// same Zapier catch-hook (→ Slack channel / Google Sheet) as the marketing
// site's notifyDownload (src/lib/tracking.ts in askui-website). This is not
// analytics — it fires unconditionally, with no cookie-consent gate.
const DOWNLOAD_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/26336845/4ta4esp/';

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

// `utm` is whatever the caller read off the current page's URL at click
// time — no storage of any kind (session/local/cookie) is written here.
export function notifyDownload(source: string, label: string, os: string, utm: Record<string, string> = {}): void {
  const data = new FormData();
  data.append('source', source);
  data.append('label', label);
  data.append('os', os);
  data.append('timestamp', berlinTimestamp());

  Object.entries(utm).forEach(([key, value]) => {
    if (value) data.append(key, value);
  });

  // Keep FormData, not JSON — a JSON content type triggers a CORS preflight
  // this Zapier catch-hook won't answer.
  fetch(DOWNLOAD_WEBHOOK_URL, { method: 'POST', body: data, keepalive: true }).catch(() => {});
}
