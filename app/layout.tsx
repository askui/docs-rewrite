import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Provider } from '@/components/provider';
import { appName, basePath, siteUrl } from '@/lib/shared';
import './global.css';

// Metadata icon URLs are not basePath-prefixed automatically — prefix the
// active base path explicitly or the favicon 404s (empty on the custom-domain
// root build, "/docs-rewrite" on the project-page build).
//
// Every page title gets the "| AskUI Docs" suffix. Without it the <title> was
// the bare page name, identical to the H1 and often a single word ("Projects",
// "Dreaming"), which search engines read as a duplicate of the heading and as
// too short to describe the page.
//
// `metadataBase` makes relative metadata URLs absolute: og:image/twitter:image
// and the per-page canonical (set in each page's metadata, not here, so the 404
// page doesn't inherit one) resolve against the production origin instead of
// Next's http://localhost:3000 fallback.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: `%s | ${appName}`,
    default: appName,
  },
  icons: { icon: `${basePath}/favicon.svg` },
};

const inter = Inter({
  subsets: ['latin'],
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
