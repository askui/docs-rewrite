import * as PageTree from 'fumadocs-core/page-tree';
import versionsFile from './versions.json';

// The docs are versioned per app minor release. The newest version lives at
// /docs/…; every older one at /docs/vX.Y/… . `scripts/build-versioned.mjs`
// assembles those folders from the release tags and rewrites versions.json in
// its build copy; the committed versions.json (no older versions) is what a
// plain `pnpm dev` or `pnpm build` of main sees.

export interface DocsVersion {
  /** URL segment and search tag, e.g. "v0.9". */
  slug: string;
  /** Label in the version dropdown, e.g. "v0.9" or "v0.9 – v0.10". */
  label: string;
  /** Git ref the version's content came from, e.g. "v0.9.0". */
  ref: string;
}

export const versions: DocsVersion[] = versionsFile.versions;

/** Search tag of the newest version. */
export const latestTag = 'latest';

const versionSegment = /^v\d+\.\d+$/;

/** The older version a page belongs to, or undefined for the newest version. */
export function versionOf(slugs: readonly string[]): DocsVersion | undefined {
  const first = slugs[0];
  if (!first || !versionSegment.test(first)) return undefined;
  return versions.find((v) => v.slug === first);
}

/** Search tag for a page: its version slug, or "latest". */
export function searchTagOf(slugs: readonly string[]): string {
  return versionOf(slugs)?.slug ?? latestTag;
}

/** Search tag for a URL path such as "/docs/v0.9/quickstart". */
export function searchTagOfPath(pathname: string): string {
  const match = /^\/docs\/(v\d+\.\d+)(?:\/|$)/.exec(pathname);
  return match ? match[1] : latestTag;
}

/** Folder name of the newest version in a versioned build. */
export const latestFolder = '(latest)';

/**
 * The docs version a top-level page-tree folder holds: "(latest)" or a slug
 * such as "v0.9". Undefined for any other node, and in a plain build of main,
 * which has no version folders.
 */
export function versionFolderOf(node: PageTree.Node): string | undefined {
  if (node.type !== 'folder' || node.root !== 'version') return undefined;
  return node.$ref?.folder.split('/').pop();
}

/**
 * The page tree one page needs. Every page embeds its sidebar tree, so passing
 * the trees of all versions to every page grows the site with the square of
 * the version count. A page gets its own version's tree in full; every other
 * version folder keeps only a flat list of its pages, which the version
 * dropdown needs to land on the same page in that version
 * (PageTree.findProjection matches pages by their file path, `$ref`).
 */
export function treeForPage(tree: PageTree.Root, slugs: readonly string[]): PageTree.Root {
  const current = versionOf(slugs)?.slug ?? latestFolder;
  if (!tree.children.some((node) => versionFolderOf(node))) return tree;

  const slim = (item: PageTree.Item): PageTree.Item => ({
    type: 'page',
    $id: item.$id,
    $ref: item.$ref,
    name: item.name,
    url: item.url,
  });

  return {
    ...tree,
    children: tree.children.map((node) => {
      const folder = versionFolderOf(node);
      if (!folder || folder === current || node.type !== 'folder') return node;
      const pages: PageTree.Item[] = [];
      PageTree.visit(node, (child) => {
        if (child.type === 'page' && child !== node.index) pages.push(slim(child));
      });
      return { ...node, icon: undefined, index: node.index && slim(node.index), children: pages };
    }),
  };
}
