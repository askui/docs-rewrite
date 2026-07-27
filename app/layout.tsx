import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
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

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
