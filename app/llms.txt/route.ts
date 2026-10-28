import { source } from '@/lib/source';
import { appName, siteUrl } from '@/lib/shared';
import { llms } from 'fumadocs-core/source';

export const revalidate = false;

// llms.txt convention (https://llmstxt.org): an H1 with the site name, a
// one-line blockquote summary, then the page list. Links are absolute so an
// AI crawler can follow them without knowing which host served the file.
export function GET() {
  const tree = source.getPageTree();
  const summary = source.getPage([])?.data.description;
  const { indexNode } = llms(source);

  const body = tree.children
    .map((node) => indexNode(node))
    .join('\n')
    // Page links are rendered as "](/docs/...)"; prefix the site origin.
    .replace(/\]\(\//g, `](${siteUrl}/`);

  const out = [`# ${appName}`, ''];
  if (summary) out.push(`> ${summary}`, '');
  out.push(body);

  return new Response(out.join('\n'));
}
