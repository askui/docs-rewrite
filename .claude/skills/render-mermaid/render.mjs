#!/usr/bin/env node
/**
 * render.mjs — render a mermaid diagram to PNG so it can be looked at.
 *
 *   node .claude/skills/render-mermaid/render.mjs <diagram.mmd> [out.png] [--curve=step]
 *
 * Renders with the docs site's exact mermaid config (see components/mermaid.tsx)
 * by writing a throwaway page into public/_preview/ and screenshotting it with
 * headless Chrome. The dev server must be running (npm run dev).
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter((a) => a.startsWith('--')).map((a) => a.replace(/^--/, '').split('=')),
);
const [src, outArg] = args.filter((a) => !a.startsWith('--'));
if (!src) {
  console.error('usage: render.mjs <diagram.mmd> [out.png] [--curve=step] [--width=1500] [--height=1100]');
  process.exit(1);
}

const repo = resolve(dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../../..');
const out = resolve(outArg ?? src.replace(/\.mmd$/, '') + '.png');
const previewDir = resolve(repo, 'public/_preview');
const port = flags.port ?? '3000';
const base = flags.base ?? '/docs-rewrite';

mkdirSync(previewDir, { recursive: true });
const bundle = resolve(repo, 'node_modules/mermaid/dist/mermaid.min.js');
if (!existsSync(resolve(previewDir, 'mermaid.min.js'))) copyFileSync(bundle, resolve(previewDir, 'mermaid.min.js'));

const diagram = readFileSync(resolve(src), 'utf8');
// Keep this config in sync with components/mermaid.tsx.
const config = {
  startOnLoad: false,
  securityLevel: 'loose',
  fontFamily: 'system-ui',
  theme: 'neutral',
  themeVariables: { fontSize: '16px' },
  flowchart: {
    useMaxWidth: true,
    nodeSpacing: 40,
    rankSpacing: 36,
    padding: 10,
    curve: flags.curve ?? 'step',
  },
};
writeFileSync(
  resolve(previewDir, 'index.html'),
  `<!doctype html><html><head><meta charset="utf-8">
<script src="${base}/_preview/mermaid.min.js"></script>
<style>body{margin:0;padding:16px;background:#fff;font-family:system-ui}</style>
</head><body><div id="d"></div><script>
mermaid.initialize(${JSON.stringify(config)});
mermaid.render('g', ${JSON.stringify(diagram)}).then(({svg}) => {
  document.getElementById('d').innerHTML = svg; document.title = 'ready';
});
</script></body></html>`,
);

const chrome =
  flags.chrome ??
  [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].find((p) => existsSync(p));
if (!chrome) {
  console.error('No Chrome found. Pass --chrome=<path to chrome>.');
  process.exit(1);
}

execFileSync(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--virtual-time-budget=6000',
  `--window-size=${flags.width ?? 1500},${flags.height ?? 1100}`,
  `--screenshot=${out}`,
  `http://localhost:${port}${base}/_preview/index.html`,
], { stdio: 'ignore' });

console.log(`rendered ${src} -> ${out}`);
