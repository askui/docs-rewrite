import { icons } from 'lucide-react';
import { brandIcons } from '@/lib/brand-icons';
import { createElement } from 'react';

/** Inline lucide icon for MDX content — <Lucide name="database" />. Accepts
 * lucide PascalCase or kebab-case names, plus our brand icons. Renders
 * inline with the text so it works in table cells and list items. */
export function Lucide({ name, size = 15 }: { name: string; size?: number }) {
  const pascal = name.includes('-')
    ? name.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase())
    : name;
  const icon =
    (brandIcons as Record<string, React.ComponentType<{ size?: number }>>)[pascal] ??
    (icons as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[pascal];
  if (!icon) return null;
  return (
    <span className="inline-flex translate-y-[2px] text-fd-muted-foreground">
      {createElement(icon, { size })}
    </span>
  );
}
