#!/usr/bin/env node
/**
 * extract.mjs — pull the ```mermaid blocks out of an MDX file so they can be
 * rendered and iterated on individually.
 *
 *   node .claude/skills/render-mermaid/extract.mjs <file.mdx> [outdir]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const [file, outdir = '.'] = process.argv.slice(2);
if (!file) {
  console.error('usage: extract.mjs <file.mdx> [outdir]');
  process.exit(1);
}

const src = readFileSync(resolve(file), 'utf8');
const blocks = [...src.matchAll(/```mermaid\n([\s\S]*?)```/g)].map((m) => m[1]);
mkdirSync(resolve(outdir), { recursive: true });
blocks.forEach((b, i) => {
  const out = resolve(outdir, `d${i + 1}.mmd`);
  writeFileSync(out, b);
  console.log(out);
});
console.log(`${blocks.length} diagram(s) from ${file}`);
