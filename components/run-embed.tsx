'use client';

import { useState } from 'react';
import { basePath } from '@/lib/shared';

/**
 * RunEmbed — embeds a self-contained AskUI Desktop run export (.html) inside a
 * docs page. The exports are whole run views (Conversation Log markup + inlined
 * CSS), so we render them in a sandboxed iframe (their own document → no CSS/JS
 * collision) behind a click-to-load facade (loads only on demand → keeps Core
 * Web Vitals green; iframe content isn't indexed, so this is purely perf).
 *
 * React port of the original Astro component.
 */
export function RunEmbed({
  src,
  title = 'AskUI Desktop run',
  height = 640,
  lazy = false,
}: {
  src: string;
  title?: string;
  height?: number;
  lazy?: boolean;
}) {
  // Root-absolute src must respect the Pages base path (Next only auto-prefixes
  // next/link + next/image, not raw iframe src).
  const resolved = src.startsWith('/') ? basePath + src : src;
  const [loaded, setLoaded] = useState(lazy);

  return (
    <div className="my-6 overflow-hidden rounded-lg border bg-fd-card">
      {loaded ? (
        <iframe
          className="block w-full border-0"
          src={resolved}
          title={title}
          height={height}
          loading="lazy"
          sandbox="allow-scripts allow-popups"
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="flex w-full items-center gap-4 p-6 text-left transition-colors hover:bg-fd-accent"
          style={{ minHeight: Math.min(height, 220) }}
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-fd-primary/10 text-fd-primary">
            ▶
          </span>
          <span className="flex flex-col gap-1">
            <strong>Open interactive run</strong>
            <span className="text-sm text-fd-muted-foreground">
              {title} — loads the live, interactive run export in your browser
            </span>
          </span>
        </button>
      )}
      <div className="flex items-center justify-between border-t px-4 py-2 text-sm text-fd-muted-foreground">
        <span>{title}</span>
        <a href={resolved} target="_blank" rel="noopener noreferrer" className="hover:text-fd-foreground">
          Open fullscreen ↗
        </a>
      </div>
    </div>
  );
}
