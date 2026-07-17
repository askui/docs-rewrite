import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Callout } from 'fumadocs-ui/components/callout';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { File, Folder, Files } from 'fumadocs-ui/components/files';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { RunEmbed } from '@/components/run-embed';
import { Mermaid } from '@/components/mermaid';
import type { MDXComponents } from 'mdx/types';

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
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
