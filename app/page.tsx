import type { Metadata } from 'next';
import { basePath } from '@/lib/shared';

// There is no marketing landing page: the docs are the site. A static export
// can't emit an HTTP redirect, so "/" is a meta-refresh hop to /docs. The tag
// is rendered in the component (React hoists it into <head>) because Next's
// `other` metadata emits `name=`, and a refresh needs `http-equiv=`.
const target = `${basePath}/docs`;

export const metadata: Metadata = {
  title: 'AskUI Documentation',
  robots: { index: false, follow: true },
};

export default function RootPage() {
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${target}`} />
      <main style={{ padding: '4rem', fontFamily: 'system-ui' }}>
        <p>
          Redirecting to <a href={target}>the documentation</a>…
        </p>
      </main>
    </>
  );
}
