import { captureEvent } from '@/lib/analytics';
import { trackGoogleDownload } from '@/lib/tracking';

// Installer downloads are counted from the link's URL, not from the page that
// links to it. Every docs version links to the installers, and older versions
// come from release tags that predate any tracking markup, so the site shell
// (components/analytics.tsx) recognises a download link wherever it appears.

export interface Download {
  /** "docs_desktop_download" or "docs_agentos_download". */
  source: string;
  /** Platform, e.g. "windows-amd64" or "mac-arm64". */
  label: string;
  /** "Windows" or "macOS". */
  os: string;
}

// https://files.askui.com/releases/AskUIDesktop/<version|latest>/AskUI-Desktop-…-Installer-Win-AMD64.exe
// https://files.askui.com/releases/Installer/Latest/AskUI-Agent-OS-Latest-Service-Installer-Win-ARM64.exe
const installerUrl =
  /^https:\/\/files\.askui\.com\/releases\/(AskUIDesktop|Installer)\/[^/]+\/[^/?#]*-(Win|Mac)-(AMD64|ARM64)\.(exe|dmg)(?:[?#].*)?$/;

/** The installer a link downloads, or undefined for any other link. */
export function downloadOf(href: string): Download | undefined {
  const match = installerUrl.exec(href);
  if (!match) return undefined;
  const [, product, platform, arch] = match;
  const os = platform === 'Win' ? 'Windows' : 'macOS';
  return {
    source: product === 'AskUIDesktop' ? 'docs_desktop_download' : 'docs_agentos_download',
    label: `${platform === 'Win' ? 'windows' : 'mac'}-${arch.toLowerCase()}`,
    os,
  };
}

/**
 * Count one installer download: PostHog's `download_click` (cookieless without
 * consent, the same event www.askui.com's /start sends) and, with consent, a
 * Google Analytics download event.
 */
export function trackDownload({ source, label, os }: Download): void {
  captureEvent('download_click', { label: `${source}_${label}`, kind: 'installer', os, channel: 'release' });
  trackGoogleDownload(source === 'docs_agentos_download' ? 'agentos_download' : 'desktop_download', label);
}
