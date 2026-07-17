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
        securityLevel: 'strict',
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
      className="my-6 flex justify-center [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
