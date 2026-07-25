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
        themeVariables: { fontSize: '14px' },
        // Render at natural size — wide diagrams scroll horizontally in the
        // container below instead of shrinking to unreadable text. Tight
        // spacing keeps tall/wide charts compact at natural scale.
        flowchart: { useMaxWidth: false, nodeSpacing: 30, rankSpacing: 26, padding: 8 },
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
      // Natural-size rendering: narrow diagrams center, wide ones scroll
      // horizontally (no flex here — centering would clip the left edge of
      // scrolled content). The [&_.nodeLabel_svg] rules style inline icons
      // inside node labels: centered above the text, foreground color.
      className="my-6 overflow-x-auto [&>svg]:mx-auto [&>svg]:block [&_.nodeLabel_svg]:mx-auto [&_.nodeLabel_svg]:block [&_.nodeLabel_svg]:mb-1 [&_.nodeLabel_svg]:text-fd-foreground"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
