#!/usr/bin/env node
// Builds the versioned docs site into ./out.
//
// The repository holds one version of the docs: the current one, on main.
// Older versions are never copied into the repository. This script assembles
// them in a build copy (.versioned/) from the release tags, so the site shows
// the docs of every app minor release behind a version dropdown:
//
//   /docs/…        the newest version
//   /docs/v0.9/…   an older version (the content of the newest v0.9.* tag)
//
// Content and site shell come from different places:
//   - Content (content/docs, content/_shared, public/screenshots) of every
//     version comes from a release tag with --release, so unreleased docs on
//     main never go live. Without --release the newest version is the working
//     tree's content, for local previews.
//   - The site shell (layout, components, search, tracking, SEO) always comes
//     from the working tree, i.e. main. A shell change deploys without a
//     release, and every version gets the same header, consent banner and
//     analytics.
//
// Steps, all inside .versioned/:
//   1. Copy the site (shell, content, public) from the working tree; with
//      --release, replace the content by the newest release tag's.
//   2. Move content/docs/* into the group folder content/docs/(latest)/. The
//      parentheses keep it out of the URL, so it stays at /docs/….
//   3. For each older minor, extract content/docs, content/_shared and
//      public/screenshots from its ref with `git archive`, rewrite absolute
//      links, screenshot paths and _shared includes to the version's prefix.
//   4. Mark every version folder `"root": "version"` (Fumadocs' version
//      dropdown) and write lib/versions.json for search tags and SEO.
//   5. Run fumadocs-mdx and next build, and copy .versioned/out to ./out.
//
// Usage:
//   node scripts/build-versioned.mjs [--release] [--latest-label <label>] [--refs <file>]
//
//   --release       The newest version's content comes from the newest release
//                   tag v<major>.<minor>.<patch>, not from the working tree.
//                   The deploy always passes it.
//   --latest-label  Dropdown label of the newest version. Default: its minor
//                   ("v0.10") when it comes from a tag, else "Latest".
//   --refs <file>   JSON list [{ "slug": "v0.9", "ref": "<commit or tag>",
//                   "label": "v0.9" }] instead of the release tags. For local
//                   previews of cuts that are not tagged yet.
//
// Environment: NEXT_PUBLIC_BASE_PATH and the other build variables are passed
// through to next build unchanged.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const stage = path.join(root, '.versioned');
const args = parseArgs(process.argv.slice(2));

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--release') out.release = true;
    else if (a === '--latest-label') out.latestLabel = argv[++i];
    else if (a === '--refs') out.refs = argv[++i];
    else throw new Error(`unknown argument: ${a}`);
  }
  return out;
}

function git(...a) {
  // stderr stays quiet: several calls probe for refs that may not exist.
  return execFileSync('git', a, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

function run(cmd, a, cwd) {
  execFileSync(cmd, a, { cwd, stdio: 'inherit', env: process.env });
}

// ── which versions ────────────────────────────────────────────────────────────

const minorOf = (tag) => /^v(\d+)\.(\d+)\.\d+$/.exec(tag)?.slice(1, 3).join('.');

/** Final release tags v<major>.<minor>.<patch>, newest first. */
const releaseTags = git('tag', '-l', 'v*')
  .split('\n')
  .filter((t) => /^v\d+\.\d+\.\d+$/.test(t))
  .sort((a, b) => {
    const pa = a.slice(1).split('.').map(Number);
    const pb = b.slice(1).split('.').map(Number);
    return pb[0] - pa[0] || pb[1] - pa[1] || pb[2] - pa[2];
  });

// Where the newest version's content comes from: the newest release tag with
// --release, else the working tree (undefined).
const latestRef = args.release ? releaseTags[0] : undefined;
if (args.release && !latestRef) throw new Error('--release: no release tag v<major>.<minor>.<patch> found');

function headMinor() {
  try {
    return minorOf(git('describe', '--tags', '--exact-match', 'HEAD'));
  } catch {
    return undefined;
  }
}
const latestMinor = latestRef ? minorOf(latestRef) : headMinor();

/** Newest final tag per minor, newest minor first, without the newest version's minor. */
function versionsFromTags() {
  const tags = releaseTags;
  const seen = new Set([latestMinor]);
  const out = [];
  for (const tag of tags) {
    const minor = minorOf(tag);
    if (seen.has(minor)) continue;
    seen.add(minor);
    out.push({ slug: `v${minor}`, ref: tag, label: `v${minor}` });
  }
  return out;
}

const listed = args.refs
  ? JSON.parse(fs.readFileSync(path.resolve(args.refs), 'utf8'))
  : versionsFromTags();
const latestLabel = args.latestLabel ?? (latestMinor ? `v${latestMinor}` : 'Latest');

// A minor whose docs did not change merges into the next newer one, labelled
// with both releases ("v0.9 – v0.10"). The newest version compares against
// its tag, or against the working tree's content.
const treeOf = (ref) => git('rev-parse', `${ref}:content/docs`) + git('rev-parse', `${ref}:public/screenshots`);
const workingTree = (() => {
  try {
    return treeOf('HEAD');
  } catch {
    return '';
  }
})();
const dirty = git('status', '--porcelain', '--', 'content', 'public/screenshots') !== '';
const latestTree = latestRef ? treeOf(latestRef) : dirty ? '' : workingTree;

let latest = { label: latestLabel, lowest: undefined };
const versions = [];
for (const v of listed) {
  const newer = versions.at(-1);
  const same = newer ? treeOf(newer.ref) === treeOf(v.ref) : latestTree === treeOf(v.ref);
  if (same) {
    const target = newer ?? latest;
    target.lowest = v.label;
    continue;
  }
  versions.push({ ...v });
}
const withRange = (o) => (o.lowest ? `${o.lowest} – ${o.label}` : o.label);
latest = { label: withRange(latest) };
for (const v of versions) v.label = withRange(v);

console.log(`newest version: ${latest.label} (${latestRef ?? 'working tree'})`);
console.log('site shell:     working tree');
for (const v of versions) console.log(`older version:  ${v.label} at /docs/${v.slug} (${v.ref})`);

// ── 1. copy the site ─────────────────────────────────────────────────────────

const skip = new Set(['node_modules', '.next', 'out', '.git', '.versioned', '.source', '.preview']);
fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(stage);
for (const entry of fs.readdirSync(root)) {
  if (skip.has(entry)) continue;
  fs.cpSync(path.join(root, entry), path.join(stage, entry), { recursive: true });
}
fs.symlinkSync(path.join(root, 'node_modules'), path.join(stage, 'node_modules'));

const docsDir = path.join(stage, 'content/docs');
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, o) => fs.writeFileSync(p, JSON.stringify(o, null, 2) + '\n');

function walk(dir, fn) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, fn);
    else fn(p);
  }
}

// Moving a folder one level deeper breaks the relative <include> paths to
// content/_shared; add one "../" and, for an older version, its own copy.
const fixIncludes = (text, sharedSub) =>
  text.replace(/(<include>)((?:\.\.\/)+)_shared\//g, (_, tag, ups) => `${tag}../${ups}_shared/${sharedSub}`);

function markRoot(dir, title) {
  const metaPath = path.join(dir, 'meta.json');
  const meta = fs.existsSync(metaPath) ? readJson(metaPath) : {};
  writeJson(metaPath, { ...meta, title, root: 'version' });
}

/** Extract content/docs, content/_shared and public/screenshots of a ref into a temp dir. */
function extractContent(ref) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-version-'));
  const present = ['content/docs', 'content/_shared', 'public/screenshots'].filter((p) => {
    try {
      git('rev-parse', '--verify', '--quiet', `${ref}:${p}`);
      return true;
    } catch {
      return false;
    }
  });
  const tar = execFileSync('git', ['archive', ref, ...present], { cwd: root, maxBuffer: 1 << 30 });
  execFileSync('tar', ['-x', '-C', tmp], { input: tar });
  return tmp;
}

// ── 2. newest version → (latest) ─────────────────────────────────────────────

if (latestRef) {
  // Released content only: replace the working tree's content by the tag's.
  const tmp = extractContent(latestRef);
  for (const p of ['content/docs', 'content/_shared', 'public/screenshots']) {
    fs.rmSync(path.join(stage, p), { recursive: true, force: true });
    if (fs.existsSync(path.join(tmp, p))) fs.renameSync(path.join(tmp, p), path.join(stage, p));
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}

const latestDir = path.join(docsDir, '(latest)');
const entries = fs.readdirSync(docsDir);
fs.mkdirSync(latestDir);
for (const e of entries) fs.renameSync(path.join(docsDir, e), path.join(latestDir, e));
walk(latestDir, (p) => {
  if (!p.endsWith('.mdx')) return;
  fs.writeFileSync(p, fixIncludes(fs.readFileSync(p, 'utf8'), ''));
});
markRoot(latestDir, latest.label);

// ── 3. older versions ────────────────────────────────────────────────────────

function rewriteForVersion(text, slug) {
  return (
    text
      // Absolute docs links: markdown, JSX href and meta.json link entries.
      .replace(/(\]\(|href=["'{`]+)\/docs(?=[/)#"'`]|$)/g, `$1/docs/${slug}`)
      // Screenshots: literal <img src="/docs-rewrite/screenshots/…"> and
      // markdown images "](/screenshots/…)".
      .replace(/\/docs-rewrite\/screenshots\//g, `/docs-rewrite/screenshots/${slug}/`)
      .replace(/(\]\(|src=["'{`]+)\/screenshots\//g, `$1/screenshots/${slug}/`)
  );
}

for (const v of versions) {
  const tmp = extractContent(v.ref);
  const dest = path.join(docsDir, v.slug);
  fs.renameSync(path.join(tmp, 'content/docs'), dest);
  for (const p of ['content/_shared', 'public/screenshots']) {
    if (!fs.existsSync(path.join(tmp, p))) continue;
    fs.mkdirSync(path.join(stage, p), { recursive: true });
    fs.renameSync(path.join(tmp, p), path.join(stage, p, v.slug));
  }
  fs.rmSync(tmp, { recursive: true, force: true });

  walk(dest, (p) => {
    if (!p.endsWith('.mdx') && !p.endsWith('.json')) return;
    let text = rewriteForVersion(fs.readFileSync(p, 'utf8'), v.slug);
    if (p.endsWith('.mdx')) text = fixIncludes(text, `${v.slug}/`);
    fs.writeFileSync(p, text);
  });
  const shared = path.join(stage, 'content/_shared', v.slug);
  if (fs.existsSync(shared))
    walk(shared, (p) => fs.writeFileSync(p, rewriteForVersion(fs.readFileSync(p, 'utf8'), v.slug)));
  markRoot(dest, v.label);
}

// ── 4. top-level order and lib/versions.json ─────────────────────────────────

writeJson(path.join(docsDir, 'meta.json'), { pages: ['(latest)', ...versions.map((v) => v.slug)] });
writeJson(path.join(stage, 'lib/versions.json'), { latest, versions });

// ── 5. build ─────────────────────────────────────────────────────────────────

run('pnpm', ['exec', 'fumadocs-mdx'], stage);
run('pnpm', ['exec', 'next', 'build'], stage);
fs.rmSync(path.join(root, 'out'), { recursive: true, force: true });
fs.cpSync(path.join(stage, 'out'), path.join(root, 'out'), { recursive: true });
console.log(`built ${versions.length + 1} docs version(s) into out/`);
