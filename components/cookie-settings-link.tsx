'use client';
import { Cookie } from 'lucide-react';
import { openCookieSettings } from '@/lib/tracking';

/** Shows the cookie banner again, to change or withdraw the choice. */
export function CookieSettingsLink() {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className="inline-flex items-center gap-1.5 text-xs text-fd-muted-foreground transition-colors hover:text-fd-accent-foreground"
    >
      <Cookie className="size-3.5" />
      Cookie settings
    </button>
  );
}
