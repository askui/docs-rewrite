'use client';

import type { ReactNode } from 'react';
import { Card } from 'fumadocs-ui/components/card';
import { captureEvent } from '@/lib/analytics';
import { trackGoogleDownload } from '@/lib/tracking';

interface DownloadLinkProps {
  href: string;
  source: string;
  label: string;
  os: string;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}

/**
 * Drop-in replacement for `<Card href=... />` / a plain Markdown link on an
 * installer download. A click sends PostHog's `download_click`, the same event
 * www.askui.com's /start sends (cookieless without consent, lib/analytics.ts),
 * and with consent a Google Analytics download event (lib/tracking.ts), then
 * behaves exactly like a normal link: it never calls preventDefault, so the
 * download is never blocked.
 */
export function DownloadLink({ href, source, label, os, title, description, children }: DownloadLinkProps) {
  const handleClick = () => {
    captureEvent('download_click', { label: `${source}_${label}`, kind: 'installer', os, channel: 'release' });
    trackGoogleDownload(source === 'docs_agentos_download' ? 'agentos_download' : 'desktop_download', label);
  };

  if (title) {
    return <Card href={href} title={title} description={description} onClick={handleClick} />;
  }

  return (
    <a href={href} onClick={handleClick}>
      {children}
    </a>
  );
}
