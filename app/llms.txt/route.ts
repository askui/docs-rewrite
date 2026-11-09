import { source } from '@/lib/source';
import { appName, siteUrl } from '@/lib/shared';
import { llms } from 'fumadocs-core/source';
import { latestFolder, versionFolderOf } from '@/lib/versions';

export const revalidate = false;

// llms.txt convention (https://llmstxt.org): an H1 with the site name, a
// one-line blockquote summary, then the page list. Links are absolute so an
// AI crawler can follow them without knowing which host served the file.
export function GET() {
  const tree = source.getPageTree();
  // A versioned build has one top-level folder per docs version; list the
  // newest version's pages only.
  const latest = tree.children.find((node) => versionFolderOf(node) === latestFolder);
  const nodes = latest?.type === 'folder' ? latest.children : tree.children;
  const summary = source.getPage([])?.data.description;
  const { indexNode } = llms(source);

  const body = nodes
    .map((node) => indexNode(node))
    .join('\n')
    // Page links are rendered as "](/docs/...)"; prefix the site origin.
    .replace(/\]\(\//g, `](${siteUrl}/`);

  const out = [`# ${appName}`, ''];
  if (summary) out.push(`> ${summary}`, '');
  out.push(body);

  return new Response(out.join('\n'));
}
