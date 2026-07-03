import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

// Served from GitHub Pages under askui.github.io/docs-rewrite. Keep basePath in
// sync with lib/shared.ts. images.unoptimized is required for static export.
/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  basePath: '/docs-rewrite',
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default withMDX(config);
