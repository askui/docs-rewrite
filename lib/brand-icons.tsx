import type { ReactElement, SVGProps } from 'react';

// Brand-ish icons lucide no longer ships (brand icons were removed upstream),
// drawn in lucide's stroke style so they blend with the rest of the sidebar.
// Referenced by name from meta.json / frontmatter `icon:` via lib/source.ts.

function base(props: SVGProps<SVGSVGElement>) {
  return {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...props,
  } as const;
}

/** Android robot head: dome, two antennae, two eyes. */
export function Android(props: SVGProps<SVGSVGElement>): ReactElement {
  return (
    <svg {...base(props)}>
      <path d="M4 16a8 8 0 0 1 16 0" />
      <line x1="4" y1="16" x2="20" y2="16" />
      <line x1="7.5" y1="8.5" x2="6" y2="6" />
      <line x1="16.5" y1="8.5" x2="18" y2="6" />
      <line x1="9" y1="13" x2="9" y2="13.01" />
      <line x1="15" y1="13" x2="15" y2="13.01" />
    </svg>
  );
}

/** The pre-removal lucide "chrome" glyph — reads as "browser". */
export function Chrome(props: SVGProps<SVGSVGElement>): ReactElement {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="21.17" y1="8" x2="12" y2="8" />
      <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
      <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
    </svg>
  );
}

export const brandIcons = { Android, Chrome } as const;
