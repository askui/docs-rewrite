import type { ReactNode } from 'react';
import { Card } from 'fumadocs-ui/components/card';

interface DownloadLinkProps {
  href: string;
  /**
   * `source`, `label` and `os` describe the download for readers of the MDX.
   * Counting no longer reads them: components/analytics.tsx counts every
   * installer link from its URL (lib/downloads.ts), so older docs versions with
   * plain links are counted the same way.
   */
  source?: string;
  label?: string;
  os?: string;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}

/**
 * A link or card to an installer download. Equivalent to `<Card href=… />` or a
 * plain Markdown link; kept so existing pages need no change.
 */
export function DownloadLink({ href, title, description, children }: DownloadLinkProps) {
  if (title) return <Card href={href} title={title} description={description} />;
  return <a href={href}>{children}</a>;
}
