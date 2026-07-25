'use client';

import { useEffect, useId, useState } from 'react';
import { useTheme } from 'next-themes';

/**
 * Mermaid — renders a mermaid diagram client-side. Authors keep writing
 * ```mermaid fences; the remarkMermaid plugin in source.config.ts swaps them
 * for this component at build time. The mermaid bundle is heavy, so it is
 * imported dynamically on first render only on pages that need it.
 */
export function Mermaid({ chart }: { chart: string }) {
  const id = useId();
  const [svg, setSvg] = useState('');
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const { default: mermaid } = await import('mermaid');
      mermaid.initialize({
        startOnLoad: false,
        // 'loose' keeps inline HTML (e.g. lucide SVG icons) in node labels.
        // Safe here: every diagram is authored in this repo — no user content.
        securityLevel: 'loose',
        fontFamily: 'inherit',
        theme: resolvedTheme === 'dark' ? 'dark' : 'neutral',
      });
      try {
        const { svg } = await mermaid.render(
          id.replaceAll(':', ''),
          chart.replaceAll('\\n', '\n'),
        );
        if (!cancelled) setSvg(svg);
      } catch {
        // Invalid diagram source — leave the container empty rather than
        // crashing the page; the source is still reviewable in the MDX.
      }
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [chart, id, resolvedTheme]);

  return (
    <div
      // The [&_.nodeLabel_svg] rules style inline icons inside node labels:
      // centered above the text and in full foreground color (theme-aware).
      className="my-6 flex justify-center [&_svg]:max-w-full [&_.nodeLabel_svg]:mx-auto [&_.nodeLabel_svg]:block [&_.nodeLabel_svg]:mb-1 [&_.nodeLabel_svg]:text-fd-foreground"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
