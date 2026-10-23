'use client';

import type { ReactNode } from 'react';
import { Card } from 'fumadocs-ui/components/card';
import { notifyDownload } from '@/lib/tracking';

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

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
 * installer download: fires the download-notification webhook on click
 * (lib/tracking.ts) and then behaves exactly like a normal link — it never
 * calls preventDefault, so the download/navigation is never blocked.
 */
export function DownloadLink({ href, source, label, os, title, description, children }: DownloadLinkProps) {
  const handleClick = () => {
    // Read UTM params off this page's own URL at click time — no
    // session/local storage, no cookies, so nothing here needs consent.
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    for (const key of UTM_PARAMS) {
      const value = params.get(key);
      if (value) utm[key] = value;
    }
    notifyDownload(source, label, os, utm);
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
