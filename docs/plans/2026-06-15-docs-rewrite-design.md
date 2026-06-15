# AskUI Docs Rewrite — Design

**Date:** 2026-06-15
**Status:** Scaffold built and building green.

## Goal

Replace the Mintlify docs (`askui/docs-mintlify`) with a new, non-Mintlify
documentation site that reflects the product change: AskUI now sells a **CLI**
and the **AskUI Desktop** app — not the Python SDK. The new site:

1. Ports the **AgentOS** docs, dropping the SDK (Python Vision Agent) content.
2. Makes **AskUI Desktop** and the **CLI** first-class top sections.
3. Folds in **onboarding + billing** from the AskUI Hub (`askui/askui-hub`).
4. **Embeds the desktop app's exported standalone HTML** (QA Pilot / run
   exports) directly in the docs.
5. Teaches **prompting best practices** built from the real Project prompt
   architecture in `askui/integrated-task-platform`.

## Decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Framework | **Astro + Starlight** | Purpose-built docs; search, sidebar, MDX, dark mode out of the box; easy HTML embedding. Not Mintlify. |
| HTML run exports | **Iframe embed, click-to-load facade** | Exports are whole ~2 MB React apps. Iframe isolates their CSS/JS; click-to-load keeps Core Web Vitals green. Iframe content isn't indexed, so size is a perf concern, not SEO. |
| First deliverable | **Working scaffold + IA + sample pages** | Runnable foundation to fill in page-by-page. |
| Versions | astro ^6.4.5 / @astrojs/starlight ^0.40.0 | Aligned pair — a version mismatch broke sidebar slug resolution. |

## Information Architecture

- **Get Started** — install Desktop, install CLI, onboarding, first run.
- **Using AskUI Desktop** — project structure, agents & prompts, **prompting
  best practices**, reading a run report, running from the CLI.
- **AgentOS** (ported from `06-agent-os`, SDK stripped) — understanding,
  installation, how-to guides, reference, release notes.
- **Account & Billing** (from Hub) — workspaces, plans & billing.
- **Reference** — Workspace API, Inference API.

## The prompt architecture taught

Grounded in `integrated-task-platform/.../Domain/ProjectScaffold.cs` (not the
prototype). A **Project** is a folder: `tests/ · prompts/ · procedures/ ·
plans/ · secrets/ · utils/`.

Prompting best practices:
1. Split `prompts/` into four parts — `system_capabilities`,
   `device_information`, `ui_information`, `report_format` — each with a
   different lifecycle.
2. Tune behaviour per folder in `rules.md` / `setup.md` / `teardown.md`, never
   in the system prompt.
3. Never put credentials in tests — reference `secrets/credentials.txt`.
4. Strict error handling — max 2 attempts, `FAILED` vs `BROKEN`.
5. Reuse sequences via `procedures/`.

## Key files

- `astro.config.mjs` — Starlight config + sidebar (the IA).
- `src/content.config.ts` — docs content collection (required on Astro 6).
- `src/components/RunEmbed.astro` — sandboxed iframe with click-to-load facade
  (`lazy` prop for native lazy mode).
- `src/content/docs/**` — 29 MDX pages mirroring the IA.
- `public/runs/first-test.html` — the AskUI Desktop run export, embedded.

## Build

`pnpm install && pnpm build` → 29 pages + 404, Pagefind search index, sitemap.
`pnpm dev` for local preview.

## Follow-ups (not in scaffold)

- Full content migration of remaining AgentOS pages (currently stubs).
- Real download links / CLI install commands once release pipeline exists.
- Pull live onboarding + billing copy from the Hub.
- Mermaid diagram rendering (original docs used Mermaid; not yet wired).
- Brand polish: fonts, favicon, custom 404.
