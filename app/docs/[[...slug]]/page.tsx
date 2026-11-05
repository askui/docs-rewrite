import { getPageImage, getPageMarkdownUrl, resolveIcon, source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { gitConfig } from '@/lib/shared';
import { versionOf } from '@/lib/versions';

// Where a page's source lives on GitHub. Pages of an older docs version link
// to the release tag they were cut from; the build puts the newest version in
// the group folder "(latest)", which is not a folder in the repository.
function githubUrlOf(slugs: string[], path: string) {
  const version = versionOf(slugs);
  const ref = version?.ref ?? gitConfig.branch;
  const file = version ? path.slice(version.slug.length + 1) : path.replace(/^\(latest\)\//, '');
  return `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${ref}/content/docs/${file}`;
}

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const icon = resolveIcon(page.data.icon);

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle className="flex items-center gap-3">
        {icon && (
          <span className="inline-flex shrink-0 items-center justify-center rounded-md border bg-fd-muted p-1.5 text-fd-muted-foreground [&_svg]:size-5">
            {icon}
          </span>
        )}
        {page.data.title}
      </DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={githubUrlOf(page.slugs, page.path)}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  // An older docs version must not compete with the newest one in search
  // engines: noindex, and a canonical to the same page in the newest version
  // when it still exists there.
  const version = versionOf(page.slugs);
  const latestTwin = version ? source.getPage(page.slugs.slice(1)) : undefined;
  const canonical = version ? (latestTwin?.url ?? page.url) : page.url;

  return {
    // Rendered through the root layout's title template ("<title> | AskUI Docs").
    title: version
      ? `${page.data.metaTitle ?? page.data.title} (${version.label})`
      : (page.data.metaTitle ?? page.data.title),
    description: page.data.description,
    // Self-referencing canonical. page.url is "/docs/..." with no trailing
    // slash, which is how GitHub Pages serves these pages ("/docs/faq/" 404s);
    // metadataBase in app/layout.tsx makes it absolute.
    alternates: {
      canonical,
    },
    ...(version ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      url: page.url,
      images: getPageImage(page).url,
    },
  };
}
