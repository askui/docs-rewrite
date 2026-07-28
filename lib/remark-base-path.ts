import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

// Resolve the active base path the same way next.config.mjs and lib/shared.ts
// do, but at MDX-compile time (this plugin runs inside fumadocs-mdx, before the
// React runtime). Keep the sentinel mapping in sync with those two copies.
//   - "ROOT"                  → ""              (custom-domain root, docs.askui.com)
//   - unset / "/docs-rewrite" → "/docs-rewrite" (project page, askui.github.io)
function resolveBasePath(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_PATH;
  if (raw === 'ROOT') return '';
  if (!raw) return '/docs-rewrite';
  return raw;
}

const basePath = resolveBasePath();

// Normalize a root-absolute asset URL to the active base path. Content authors
// screenshots as "/docs-rewrite/screenshots/...", which only resolves on the
// project-page build; strip that historical prefix and re-apply the active base
// path so images resolve under either deployment. External/relative URLs and
// already-correct paths pass through unchanged (idempotent).
function withBasePath(src: string): string {
  if (!src.startsWith('/')) return src; // external or relative — leave untouched
  const rootRelative = src.startsWith('/docs-rewrite/')
    ? src.slice('/docs-rewrite'.length)
    : src;
  return `${basePath}${rootRelative}`;
}

/**
 * Rewrites the `src` of literal <img> elements written in MDX so screenshots
 * resolve whether the site is served at the custom-domain root (docs.askui.com)
 * or as a GitHub Pages project page (askui.github.io/docs-rewrite).
 *
 * Scope is deliberately limited to literal <img>. Those compile to an intrinsic
 * element and do NOT pass through the `components.img` mapping, and their `src`
 * is emitted verbatim — so a root-absolute path like /docs-rewrite/screenshots/…
 * is exactly what ships, and it 404s at the root. This is the whole bug.
 *
 * Markdown images (![](…)) are intentionally left alone: fumadocs-mdx resolves
 * them into static file imports against `public/`, and Next then emits a hashed
 * asset URL already carrying the correct base path. Rewriting their URL here
 * would break that resolution (e.g. re-adding /docs-rewrite would make the
 * import point at a public/docs-rewrite/… file that does not exist).
 */
export function remarkBasePath() {
  return (tree: Root) => {
    // Literal <img src="..."> written in MDX (block or inline JSX element).
    visit(tree, ['mdxJsxFlowElement', 'mdxJsxTextElement'], (node: unknown) => {
      const el = node as {
        name?: string;
        attributes?: Array<{ type?: string; name?: string; value?: unknown }>;
      };
      if (el.name !== 'img' || !Array.isArray(el.attributes)) return;
      for (const attr of el.attributes) {
        if (attr.type === 'mdxJsxAttribute' && attr.name === 'src' && typeof attr.value === 'string') {
          attr.value = withBasePath(attr.value);
        }
      }
    });
  };
}
