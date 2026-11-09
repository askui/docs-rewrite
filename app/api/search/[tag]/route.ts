import { source } from '@/lib/source';
import { latestTag, searchTagOf, versions } from '@/lib/versions';
import { createFromSource } from 'fumadocs-core/search/server';

export const revalidate = false;
export const dynamic = 'force-static';

// One static search index per docs version: /api/search/latest,
// /api/search/v0.9, … . The search dialog loads only the index of the version
// being read (components/search.tsx), so a reader never downloads the other
// versions' indexes, and the download does not grow with the version count.
export function generateStaticParams() {
  return [{ tag: latestTag }, ...versions.map((v) => ({ tag: v.slug }))];
}

const apis = new Map<string, ReturnType<typeof createFromSource>>();

function apiFor(tag: string) {
  let api = apis.get(tag);
  if (!api) {
    // The source with only this version's pages; breadcrumbs and page tree
    // come from the full source.
    const pages = source.getPages().filter((page) => searchTagOf(page.slugs) === tag);
    api = createFromSource({ ...source, getPages: () => pages });
    apis.set(tag, api);
  }
  return api;
}

export async function GET(_request: Request, { params }: RouteContext<'/api/search/[tag]'>) {
  const { tag } = await params;
  return apiFor(tag).staticGET();
}
