---
name: render-mermaid
description: Render a mermaid diagram to PNG and look at it, so diagrams in the docs can be iterated on visually instead of guessed. Use whenever a mermaid diagram in content/**/*.mdx is written or changed, or when a diagram's layout looks wrong (crossing edges, cut-off boxes, containers in the wrong order).
---

# Rendering mermaid diagrams to look at them

Dagre's layout cannot be predicted from the source: declaration order, edge
direction and cluster-crossing edges all move boxes around. Render the
diagram, **look at the PNG**, then change the source — never ship a layout
you have not seen.

## Prerequisites

The dev server must be running (it serves the preview page):

```bash
npm run dev            # http://localhost:3000, basePath /docs-rewrite
```

## Render one diagram

```bash
node .claude/skills/render-mermaid/render.mjs <diagram.mmd> [out.png]
```

The config matches `components/mermaid.tsx` exactly (neutral theme, 16px
labels, `curve: step`, node/rank spacing), so what you see is what the docs
page renders. Options: `--curve=linear|basis|step`, `--width`, `--height`,
`--port`, `--base`, `--chrome=<path>`.

Then **Read the PNG** to inspect it.

## Extract the diagrams of a page first

```bash
node .claude/skills/render-mermaid/extract.mjs content/docs/concepts/enterprise-fit.mdx <outdir>
```

Writes `d1.mmd`, `d2.mmd`, … one per ```mermaid block, so you can render,
iterate on a copy, and paste the winner back into the MDX.

## Layout rules learned the hard way

- **Edges from a container, not from a node inside it** (`pc --> M`, not
  `D --> M`) when the target is outside: the label then sits between the
  boxes instead of floating across the container, and the arrow leaves the
  container edge.
- **Group the sources.** One container holding "Tester PC" and "CI pipeline",
  with edges from that group, turns eight crossing edges into four straight
  ones.
- **`direction TB` inside a subgraph is ignored** when an edge crosses that
  subgraph's boundary. To control the shape of a group's contents, split it
  into two smaller groups instead (e.g. "On-premise lab" + "Device farm"
  rather than one four-wide row that gets cut off).
- **Order within a rank follows declaration order**, so declare the container
  you want first (top/left) first — `pc ~~~ ci` also pins the order.
- **Nodes in the same rank stack vertically in `LR`**, which is how several
  target groups end up as a clean column on the right.
- **`flowchart BT` puts the target above the source** — the way to get a box
  (e.g. the model provider) on top while the arrow still points at it.
  `M ~~~ pc` does *not* reliably pin rank order; BT does.
- Keep labels short: a long second line makes the box wider than the render
  window and it gets clipped.

## Cleanup

The preview page lives in `public/_preview/` (gitignored). It is harmless to
leave, but do not commit it.
