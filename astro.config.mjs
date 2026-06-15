// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  site: 'https://docs.askui.com',
  integrations: [
    starlight({
      title: 'AskUI Docs',
      description:
        'Documentation for AskUI Desktop and the AskUI CLI — author and run AI-driven UI tests.',
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
        replacesTitle: false,
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/askui' },
      ],
      editLink: {
        baseUrl: 'https://github.com/askui/docs-rewrite/edit/main/',
      },
      customCss: ['./src/styles/custom.css'],
      // ── Information Architecture ──────────────────────────────────
      // Reframed around the two products we sell (Desktop + CLI),
      // with AgentOS ported in and Hub supplying onboarding + billing.
      sidebar: [
        {
          label: 'Get Started',
          items: [
            { label: 'Install AskUI Desktop', slug: 'get-started/install-desktop' },
            { label: 'Install the CLI', slug: 'get-started/install-cli' },
            { label: 'Sign in & onboarding', slug: 'get-started/onboarding' },
            { label: 'Your first test run', slug: 'get-started/first-run' },
          ],
        },
        {
          label: 'Using AskUI Desktop',
          items: [
            { label: 'How a Project is organized', slug: 'using-askui-desktop/project-structure' },
            { label: 'Agents & prompts', slug: 'using-askui-desktop/agents-and-prompts' },
            { label: 'Prompting best practices', slug: 'using-askui-desktop/prompting-best-practices' },
            { label: 'Reading a run report', slug: 'using-askui-desktop/run-report' },
            { label: 'Running from the CLI', slug: 'using-askui-desktop/cli' },
          ],
        },
        {
          label: 'AgentOS',
          items: [
            { label: 'Overview', slug: 'agentos' },
            {
              label: 'Understanding',
              items: [
                { label: 'Concepts', slug: 'agentos/understanding/concepts' },
                { label: 'Capabilities', slug: 'agentos/understanding/capabilities' },
                { label: 'Control modes', slug: 'agentos/understanding/control-modes' },
                { label: 'Runtime modes', slug: 'agentos/understanding/runtime-modes' },
              ],
            },
            {
              label: 'Installation',
              items: [
                { label: 'Standalone', slug: 'agentos/installation/standalone' },
                { label: 'Service', slug: 'agentos/installation/service' },
                { label: 'Silent', slug: 'agentos/installation/silent' },
              ],
            },
            {
              label: 'How-to guides',
              items: [
                { label: 'Local deployment', slug: 'agentos/how-to-guides/deployment-local' },
                { label: 'CI deployment', slug: 'agentos/how-to-guides/deployment-ci' },
                { label: 'Multi-device deployment', slug: 'agentos/how-to-guides/deployment-multi-device' },
                { label: 'Troubleshooting', slug: 'agentos/how-to-guides/troubleshooting' },
              ],
            },
            {
              label: 'Reference',
              items: [
                { label: 'System requirements', slug: 'agentos/reference/system-requirements' },
                { label: 'Enterprise', slug: 'agentos/reference/enterprise' },
              ],
            },
            { label: 'Release notes', slug: 'agentos/release-notes' },
          ],
        },
        {
          label: 'Account & Billing',
          items: [
            { label: 'Workspaces', slug: 'account-billing/workspaces' },
            { label: 'Plans & billing', slug: 'account-billing/billing' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Workspace API', slug: 'reference/workspace-api' },
            { label: 'Inference API', slug: 'reference/inference-api' },
          ],
        },
      ],
    }),
  ],
});
