import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Provider } from '@/components/provider';
import './global.css';

// Metadata icon URLs are not basePath-prefixed automatically — include the
// GitHub-Pages base explicitly or the favicon 404s.
export const metadata: Metadata = {
  icons: { icon: '/docs-rewrite/favicon.svg' },
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
