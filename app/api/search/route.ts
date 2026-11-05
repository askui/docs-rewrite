import { source } from '@/lib/source';
import { searchTagOf } from '@/lib/versions';
import { createFromSource } from 'fumadocs-core/search/server';

export const revalidate = false;

// One static index for every docs version. Each entry is tagged with its
// version ("latest", "v0.9", …) so the search dialog only finds pages of the
// version being read (components/search.tsx).
export const { staticGET: GET } = createFromSource(source, {
  buildIndex: (page) => ({
    id: page.url,
    title: page.data.title,
    description: page.data.description,
    url: page.url,
    structuredData: page.data.structuredData,
    tag: searchTagOf(page.slugs),
  }),
});
