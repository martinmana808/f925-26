#!/usr/bin/env python3
"""Ask every dealer's preview host whether it is actually serving a site.

The directory shouldn't infer "this dealer has a preview" from its category — a preview is
live or it isn't, and that is a fact about production. This checks each
`<slug>.preview.f925.works` and records the answer in preview-status.json, which
build_directory.py folds into the front end.

  python3 check_previews.py [--only slug]
"""
import json, sys, urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).parent
dealers = json.load(open(HERE / 'dealers.json'))
only = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else None
targets = [d for d in dealers if not only or d['slug'] == only]

UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

def check(d):
    host = d.get('previewHost')
    out = {'slug': d['slug'], 'host': host, 'live': False, 'status': None, 'hasOffer': False}
    if not host: return out
    req = urllib.request.Request(f'https://{host}/', headers={'User-Agent': UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            body = r.read(200_000).decode('utf-8', 'ignore')
            out['status'] = r.status
            out['live'] = r.status == 200
            out['hasOffer'] = 'Make it mine' in body
    except urllib.error.HTTPError as e:
        out['status'] = e.code
    except Exception as e:
        out['status'] = type(e).__name__
    return out

with ThreadPoolExecutor(max_workers=10) as pool:
    results = list(pool.map(check, targets))

live = [r for r in results if r['live']]
json.dump({'checkedAt': datetime.now(timezone.utc).isoformat(timespec='seconds'),
           'results': {r['slug']: r for r in results}},
          open(HERE / 'preview-status.json', 'w'), indent=1)
print(f"{len(live)} of {len(results)} preview hosts live; {sum(1 for r in live if r['hasOffer'])} showing the offer")
for r in results:
    if not r['live']: print(f"  · {r['slug']}: {r['status']}")
