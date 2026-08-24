'use client';

import type { ReactNode } from 'react';
import { Card } from 'fumadocs-ui/components/card';
import { notifyDownload } from '@/lib/tracking';

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
  const handleClick = () => notifyDownload(source, label, os);

  if (title) {
    return <Card href={href} title={title} description={description} onClick={handleClick} />;
  }

  return (
    <a href={href} onClick={handleClick}>
      {children}
    </a>
  );
}
