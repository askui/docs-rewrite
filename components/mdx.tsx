import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Callout } from 'fumadocs-ui/components/callout';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { File, Folder, Files } from 'fumadocs-ui/components/files';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { RunEmbed } from '@/components/run-embed';
import { Mermaid } from '@/components/mermaid';
import { Lucide } from '@/components/lucide';
import { DownloadLink } from '@/components/download-link';
import { basePath } from '@/lib/shared';
import type { MDXComponents } from 'mdx/types';
import type { ComponentProps, ElementType } from 'react';

// Raw <img> in MDX is NOT auto-prefixed by Next's basePath (only next/link and
// next/image are). Content references screenshots root-absolute, and some still
// carry the historical "/docs-rewrite" prefix literally. Normalize both to the
// active base path so images resolve whether the site is served under
// /docs-rewrite (project page) or at the root of docs.askui.com.
function withBasePath(src: string): string {
  if (!src.startsWith('/')) return src; // external or relative — leave untouched
  const rootRelative = src.startsWith('/docs-rewrite/')
    ? src.slice('/docs-rewrite'.length)
    : src;
  return `${basePath}${rootRelative}`;
}

function Img(props: ComponentProps<'img'>) {
  const Base = (defaultMdxComponents.img ?? 'img') as ElementType;
  const src = typeof props.src === 'string' ? withBasePath(props.src) : props.src;
  return <Base {...props} src={src} />;
}

// Register the components used across the docs globally, so MDX pages can use
// <Callout>, <Tabs>, <Steps>, <Cards>, <Files>, <RunEmbed>, <Mermaid> etc.
// without imports. remarkMermaid rewrites ```mermaid fences to <Mermaid>.
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Tab,
    Tabs,
    Step,
    Steps,
    Callout,
    Card,
    Cards,
    File,
    Folder,
    Files,
    Accordion,
    Accordions,
    RunEmbed,
    Mermaid,
    Lucide,
    DownloadLink,
    img: Img,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
