#!/usr/bin/env python3
"""Grab the *text* of every dealer's own website (home + about/contact if linked) through
r.jina.ai — it renders from the US, so NZ geo-blocks don't stop it. Saved to sitetext/<slug>.md;
enrich.py folds it into the facts so a preview for a dealer that already has a site keeps
their own story (history, people, services) instead of the locator blurb.

  python3 fetch_sitetext.py [--force] [--only slug]
"""
import json, re, sys, time, urllib.request
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE / 'sitetext'; OUT.mkdir(exist_ok=True)
dealers = json.load(open(HERE / 'dealers.json'))
force = '--force' in sys.argv
only = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else None

def jina(url):
    req = urllib.request.Request('https://r.jina.ai/' + url, headers={'User-Agent': 'Mozilla/5.0', 'X-Return-Format': 'markdown'})
    try:
        return urllib.request.urlopen(req, timeout=60).read().decode('utf-8', 'ignore')
    except Exception as e:
        return f'ERROR {e}'

def clean(md):
    body = md.split('Markdown Content:', 1)[-1]
    body = re.sub(r'!\[[^\]]*\]\([^)]*\)', '', body)          # images
    body = re.sub(r'\]\([^)]*\)', ']', body)                   # link targets
    body = re.sub(r'\n{3,}', '\n\n', body)
    return body.strip()

n = 0
for d in dealers:
    if only and d['slug'] != only: continue
    if not only and (not d.get('website') or d.get('ourDealer') or d.get('closed') or d['segment'] in ('multi-brand', 'shared-site')): continue
    path = OUT / f"{d['slug']}.md"
    if path.exists() and not force: continue
    home = jina(d['website'])
    parts = [f"# {d['website']}\n\n{clean(home)[:6000]}"]
    # follow the obvious about/contact/services links, same host only
    host = re.sub(r'^https?://(www\.)?', '', d['website']).split('/')[0]
    links = re.findall(r'\((https?://[^)\s]+)\)', home)
    seen = set()
    for l in links:
        if host not in l or l in seen: continue
        if re.search(r'/(about|our-story|history|contact|services?|workshop|team)[^/]*/?$', l, re.I):
            seen.add(l)
            if len(seen) > 3: break
            time.sleep(1)
            parts.append(f"\n\n# {l}\n\n{clean(jina(l))[:4000]}")
    path.write_text('\n'.join(parts))
    n += 1
    print(f"✓ {d['shortName']}: {sum(len(p) for p in parts):,} chars, {len(seen)} subpages")
    time.sleep(1.5)
print(f"{n} fetched")
