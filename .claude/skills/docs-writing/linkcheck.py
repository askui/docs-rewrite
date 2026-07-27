#!/usr/bin/env python
"""Resolve every internal /docs link and #anchor in content/ against the dev server.

    npm run dev          # http://localhost:3000, basePath /docs-rewrite
    python .claude/skills/docs-writing/linkcheck.py

Renamed headings silently break anchors, so run this after any heading or
page rename. Exits non-zero when something does not resolve.
"""
import glob
import io
import re
import sys
import urllib.request

BASE = 'http://localhost:3000/docs-rewrite'

links = []
for path in sorted(glob.glob('content/**/*.mdx', recursive=True)):
    text = io.open(path, encoding='utf-8').read()
    src = path.replace('\\', '/')
    for match in re.finditer(r'\]\((/docs[^)\s"]*)\)', text):
        target, _, anchor = match.group(1).partition('#')
        links.append((src, target.rstrip('/') or '/docs', anchor))

pages = {}


def fetch(target):
    if target not in pages:
        try:
            pages[target] = urllib.request.urlopen(BASE + target, timeout=90).read().decode('utf-8', 'ignore')
        except Exception:
            pages[target] = None
    return pages[target]


dead_pages, dead_anchors = set(), set()
for src, target, anchor in links:
    html = fetch(target)
    if html is None:
        dead_pages.add((target, src))
    elif anchor and ('id="%s"' % anchor) not in html:
        dead_anchors.add((target, anchor, src))

print('%d internal links, %d unique targets' % (len(links), len(pages)))
for target, src in sorted(dead_pages):
    print('DEAD PAGE   %s  <- %s' % (target, src))
for target, anchor, src in sorted(dead_anchors):
    print('DEAD ANCHOR %s#%s  <- %s' % (target, anchor, src))

if dead_pages or dead_anchors:
    print('\nRe-run once if the dev server was compiling: a cold route can time out.')
    sys.exit(1)
print('all links resolve')
