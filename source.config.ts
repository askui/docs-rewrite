import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { remarkMermaid } from './lib/remark-mermaid';
import { remarkBasePath } from './lib/remark-base-path';

// You can customize Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    // `metaTitle` (optional) overrides the page title in <title> only; the
    // visible H1 and sidebar label keep `title`. Use it when two pages share a
    // title (e.g. several section pages called "Overview").
    schema: pageSchema.extend({
      metaTitle: pageSchema.shape.title.optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkMermaid, remarkBasePath],
  },
});
