import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Analytics } from '@/components/analytics';
import { CookieConsent } from '@/components/cookie-consent';
import { Provider } from '@/components/provider';
import { basePath } from '@/lib/shared';
import './global.css';

// Metadata icon URLs are not basePath-prefixed automatically — prefix the
// active base path explicitly or the favicon 404s (empty on the custom-domain
// root build, "/docs-rewrite" on the project-page build).
export const metadata: Metadata = {
  icons: { icon: `${basePath}/favicon.svg` },
};

const inter = Inter({
  subsets: ['latin'],
});

// Google Consent Mode v2: the default state, declared before anything else
// runs. The Google tag itself loads only after cookie consent (lib/tracking.ts).
const consentDefault = `
window.dataLayer = window.dataLayer || [];
function gtag(){ window.dataLayer.push(arguments); }
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied'
});`;

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: consentDefault }} />
      </head>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
        {/* Analytics before CookieConsent: PostHog must be started before a
            stored "Accept all" switches it to cookie persistence. */}
        <Analytics />
        <CookieConsent />
      </body>
    </html>
  );
}
