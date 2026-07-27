---
name: docs-writing
description: Extend or correct the AskUI docs after a source-code change. Decides what belongs in the docs at all (versus sales or internal), which persona and section owns it, and how to write and verify it. Use when a feature lands in integrated-task-plattform or the C# SDK, when a behaviour changes, when something is removed, or when a page's claims need checking against the code.
---

# Writing AskUI docs from a source change

The docs live in `docs-rewrite`; the product lives in
`../integrated-task-plattform` (Desktop app, CLI, run engine) and
`../csharp-sdk` (agent runtime, device layers, model providers). **Every
factual claim in the docs must be traceable to one of those two
repositories** — never to memory, never to how a feature "probably" works.

## 1. Decide whether it belongs in the docs at all

Three destinations. Getting this wrong is worse than writing nothing.

**Docs (public)** — what a user needs to *use, operate or evaluate* the
product:
- Behaviour they will observe: statuses, error defaults, what happens on
  failure, limits like "two attempts per step".
- UI labels, fields, defaults, file locations, config keys.
- Requirements and remedies: OS support, ports, domains, proxy, permissions.
- Security posture that is verifiable from the code: what is sent where,
  what is stored where, what is off by default.
- Anything a support ticket would otherwise ask.

**Sales / solution engineering (docs may point, never state)** — commercial
or contractual matters:
- Prices, plan limits, negotiated quotas, SLAs.
- DPA, sub-processor lists, retention terms, hosting regions.
- On-premise hardware offers, custom authentication implementations,
  professional-services work.
- Roadmap and dates.
- **Pattern to use**: state the technical fact, then hand over —
  "AWS Bedrock … needs that scheme implemented, so if your models sit behind
  one, [talk to us](/docs/support/get-help)". Never invent terms, never
  promise a timeline.

**Internal only — do not document**:
- Anything not merged to `main` yet (see §6).
- Employee-gated or internal features (e.g. the IDP "Remote VM" provisioning
  path is gated by `IdpAccess.IsAskUiEmployee`).
- Internal endpoints, test tenants, credentials, CI secrets.
- Known bugs without a user-facing workaround — those go to the tracker, not
  the docs. A bug *with* a workaround becomes a Troubleshooting entry.
- Design rationale that only exposes weaknesses ("the lease registry is
  planned but unimplemented").
- Capabilities that exist in the SDK but are not reachable from the product
  (e.g. the trajectory cache: the CLI flag exists, the engine ignores it).

## 2. Know who is reading

| Persona | Reads | Wants |
|---|---|---|
| **Test author** (ISTQB tester, no CUA background) — the primary reader | Writing Tests, Best Practices, Results | Exact steps, real UI labels, examples that copy-paste, what a status means |
| **Evaluator** | Quickstart, Get Started, Concepts | A green run fast, then "is this real" |
| **Test manager** | Results, Best Practices, Sharing the project | Trust in results, who owns what, where the time goes |
| **Developer** | Extending, Running Tests (CLI/CI), Projects | Contracts, code examples, how to wire it into a pipeline |
| **Software architect** | Concepts, Enterprise fit | Components, protocols, scaling, upgrade safety |
| **IT security** | Enterprise fit, Best Practices → security, Reference → network | What leaves, what listens, what the agent may do, how to restrict it |
| **Compliance** | Enterprise fit → data protection, storage | Where evidence lives, what travels, who to ask for documents |
| **Lab / IT ops** | AgentOS, Devices, Enterprise fit → running the lab | Provisioning, sessions, ports, health |

Write for the persona of the *section*, not for yourself. A tester page that
explains architecture, or a security page that explains how to write a step,
is misplaced content.

## 3. Find the owning section

| Question the reader has | Section |
|---|---|
| What is this, how does it work | `concepts/` |
| Walk me through a whole journey | `guides/` |
| How do I do this one task in the app | the feature section (`projects`, `devices`, `writing-tests`, `running-tests`, `results`, `extending`) |
| How do I do it *well* | `best-practices/` |
| What are the exact values | `reference/` |
| It is broken | `troubleshooting/` |
| Quick answer | `faq/` |
| Machine-level runtime | `agentos/` |
| Seats, tokens, billing | `account-billing/` |

Rules that keep the split honest:
- A feature page says **what it is and how to use it**; the best-practice
  page says **how to use it well**. Never duplicate: link.
- A concept page explains **why it behaves that way**; it never lists UI
  fields.
- Troubleshooting entries are **symptom → cause → fix**, titled by symptom.
- If content fits two sections, put it where the reader will *look for it
  first* and link from the other.

## 4. Map the change to pages

| Source change | Docs to touch |
|---|---|
| New `[StoreTool]` class | Tool Store catalog entry (icon, blurb, parameters — read the attribute), plus a "use it when" example |
| New/changed tool config field | The tool's catalog entry; if it scopes reach, the security best-practice table |
| Change in `ProjectScaffold.cs` prompts | `best-practices/agent-behavior`, and error defaults in `concepts/test-automation-harness` |
| New device profile kind | `devices/` page + the kinds table, `concepts/enterprise-fit` diagram, cross-platform rules |
| New app setting / Settings card | The page owning that task; `reference/environment-variables` only if it is really an env var |
| New endpoint or domain | `reference/network-requirements` (+ Enterprise fit if it changes what leaves the network) |
| Auth / token / licence change | `concepts/enterprise-fit`, `get-started/licensing`, `troubleshooting/licensing` |
| Removed feature | Grep the whole content tree for it and remove every mention — this is the most-missed case |
| Changed status semantics | `results/run-report`, `best-practices/analyzing-failures`, harness error defaults |
| New CLI flag | `running-tests/cli` — and check whether the engine actually consumes it |

## 5. Verify against the code, always

Read the source before writing the sentence. The usual places:

- **UI labels**: the `.razor` component that renders them
  (`UtilsTabs.razor`, `ModelProviderForm.razor`, `ProxySettingsForm.razor`, …).
- **Tool catalog**: `[StoreTool(...)]` attributes in
  `src/AskUI.Operations.Run.Engine/Tools/Store/`.
- **Agent behaviour and error defaults**:
  `src/AskUI.TestCenter/Domain/ProjectScaffold.cs`.
- **Run lifecycle**: `src/AskUI.Operations.Run.Engine/RunEngine.cs`.
- **Chip icons and verbs**: `src/AskUI.Operations.Run/Services/ToolMetadata.cs`.
- **Endpoints and defaults**: `appsettings*.json` of the host projects.
- **Model defaults and providers**: `../csharp-sdk/src/AskUI/Models/`.

Anti-patterns seen in this repo's history: documenting an env var that never
existed, describing a "Restart" button that was never built, telling users to
set `HTTP_PROXY` for an app that reads its proxy from Settings. All three
came from writing without reading.

## 6. Unreleased work

If the change is on a branch, the docs describing it must not go live before
it merges. Say so in the PR description and keep the doc change on the same
branch or a clearly-marked docs branch. Two failure modes to avoid:
- Documenting a feature users cannot use yet.
- Leaving docs describing a feature that was removed (sweep on removal).

Experimental-but-shipped is different: document it *with* the limitation
stated plainly (`OpenAI-compatible providers are experimental … we do not
test against them`).

## 7. House style (non-negotiable)

- **Sharp and terse.** Short declarative sentences, one idea each. No
  scene-setting, no "think of it as".
- **Show the app.** Prefer a real screenshot (see
  `screenshots-capture/`) over describing UI.
- **Click paths are numbered lists**, always, even one-liners.
- **Element walkthroughs are bold-label bullet lists** (`- **Label**: text`),
  with nested sub-points. Tables only for genuine catalogs.
- **Headings are concepts, never file names.**
- **Sentence case** for page titles; Title Case for section titles.
- **No em dashes, no interpunct separators** in prose.
- **Never the word "verdict"** — status, result, conclusion.
- Every page: `title`, `description`, and an `icon` where the section uses
  them.
- Examples must be realistic: real file names, real labels, values that could
  exist.

## 8. Ship it

1. `npm run types:check` — catches MDX and route problems.
2. Check the affected pages render: the dev server runs at
   `http://localhost:3000/docs-rewrite/docs/...` (note the base path).
3. **Link and anchor check** — renamed headings silently break anchors:
   ```bash
   # every internal /docs link + #anchor in content/, resolved against the dev server
   python .claude/skills/docs-writing/linkcheck.py
   ```
4. Diagrams: iterate with the `render-mermaid` skill, never ship a layout you
   have not looked at.
5. `npm run build` before anything that touches routes, nav or components.
6. Commit with a message that says *what changed for the reader*, not which
   files moved.

## 9. Review checklist

- [ ] Every claim traceable to source, or removed.
- [ ] Nothing internal, unreleased, or commercial stated as fact.
- [ ] Lands in the section its persona reads first; duplicates replaced by links.
- [ ] UI labels match the running app exactly.
- [ ] Numbered click paths, bold-label walkthroughs, sentence-case title.
- [ ] Links and anchors resolve; build passes.
- [ ] If a feature was removed: no mention survives anywhere.
