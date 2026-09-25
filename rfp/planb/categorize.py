#!/usr/bin/env python3
"""Put every dealer in one of five categories, with the reasons, from what the other scripts found.

  1  No website             — nothing of their own online (maybe a Facebook page). Preview + offer.
  2  Weak website           — has a site, audit score < 55 (stale, thin, off-brand, no HTTPS, slow,
                              builder template, own shop cart). Preview with copy from their own site.
  3  Decent website         — has a site, score >= 55. Compliance conversation later, not a draft.
  4  Multi-brand / shared   — the STIHL SHOP is a page on a bigger business (Honda dealer, Turf Force…)
                              or a branch sharing a sibling's site. Wrong product for the template.
  5  Ours                   — already on UNIFY.
  0  Closed

Writes `category`, `categoryLabel`, `categoryReasons[]` onto dealers.json and regenerates dealers.csv.
Manual pins go in PIN below (slug -> category) when the numbers get it wrong.
"""
import csv, json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).parent
dealers = json.load(open(HERE / 'dealers.json'))
WEAK_BELOW = 55
LABELS = {0: 'Closed', 1: 'No website', 2: 'Weak website', 3: 'Decent website', 4: 'Multi-brand / shared site', 5: 'On UNIFY'}
PIN = {}  # e.g. 'glenfield': 2

for d in dealers:
    r = []
    a = d.get('siteAudit') or {}
    if d.get('closed') or d['segment'] == 'closed':
        c = 0; r.append('locator says CURRENTLY CLOSED')
    elif d.get('ourDealer') or d['segment'] == 'ours':
        c = 5; r.append('live on UNIFY')
    elif d['segment'] in ('multi-brand', 'shared-site') or d.get('multiBrand') or d.get('sharedSiteWith'):
        c = 4
        if d.get('sharedSiteWith'): r.append(f"branch page on STIHL SHOP {d['sharedSiteWith']}'s site")
        if d.get('tradesAs'): r.append(f"trades as {d['tradesAs']}")
        if d.get('multiBrand') and not d.get('tradesAs'): r.append('multi-brand business, STIHL is one line')
        if a.get('score') is not None: r.append(f"their site scores {a['score']}/100")
    elif not d.get('hasSite') or not d.get('website'):
        c = 1; r.append('no website of their own')
        g = d.get('google') or {}
        if g.get('rating'): r.append(f"Google {g['rating']}★ ({g.get('reviewCount', 0)} reviews) with nowhere to send people")
        fb = (d.get('facebook') or {}).get('followers')
        if fb: r.append(f"Facebook page with {fb:,} followers is their only web presence")
        elif (d.get('social') or {}).get('facebook'): r.append('Facebook page is their only web presence')
        else: r.append('not even a Facebook page found')
    elif a.get('error'):
        c = 2; r.append(f"site could not be audited ({a['error'][:60]}); treated as weak until seen")
    else:
        s = a.get('score', 0)
        c = 2 if s < WEAK_BELOW else 3
        r.append(f"audit {s}/100 on {a.get('tech', 'unknown stack')}")
        # the reasons that cost points, most damaging first
        neg = sorted((x for x in a.get('reasons', []) if x.startswith('-')), key=lambda x: int(x.split()[0]))
        r += [x.split(' ', 1)[1] for x in neg[:4]]
        if c == 3:
            pos = [x.split(' ', 1)[1] for x in a.get('reasons', []) if x.startswith('+')]
            r += pos[:3]
        if a.get('via') == 'wayback': r.append(f"seen via Wayback {a.get('snapshot')} + live text (site geo-blocks non-NZ visitors)")
    if d['slug'] in PIN: c = PIN[d['slug']]; r.insert(0, 'pinned by hand')
    d['category'] = c; d['categoryLabel'] = LABELS[c]; d['categoryReasons'] = r

json.dump(dealers, open(HERE / 'dealers.json', 'w'), indent=2, ensure_ascii=False)

cols = ['category', 'categoryLabel', 'slug', 'store', 'town', 'region', 'phone', 'email', 'ownersRaw', 'website', 'tradesAs', 'sharedSiteWith',
        'siteScore', 'siteTech', 'siteSnapshot', 'googleRating', 'googleReviews', 'facebook', 'fbFollowers', 'instagram', 'previewHost', 'stage', 'categoryReasons', 'notes']
with open(HERE / 'dealers.csv', 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=cols); w.writeheader()
    for d in sorted(dealers, key=lambda x: (x['category'] or 9, x['region'] or '', x['shortName'])):
        a = d.get('siteAudit') or {}; g = d.get('google') or {}
        w.writerow({
            'category': d['category'], 'categoryLabel': d['categoryLabel'], 'slug': d['slug'], 'store': d['store'], 'town': d['town'], 'region': d['region'],
            'phone': d.get('phone'), 'email': d.get('email'), 'ownersRaw': d.get('ownersRaw'), 'website': d.get('website'), 'tradesAs': d.get('tradesAs'),
            'sharedSiteWith': d.get('sharedSiteWith'), 'siteScore': a.get('score'), 'siteTech': a.get('tech'), 'siteSnapshot': a.get('snapshot'),
            'googleRating': g.get('rating'), 'googleReviews': g.get('reviewCount'), 'facebook': (d.get('social') or {}).get('facebook'),
            'fbFollowers': (d.get('facebook') or {}).get('followers'), 'instagram': (d.get('social') or {}).get('instagram'),
            'previewHost': d.get('previewHost'), 'stage': d.get('stage'), 'categoryReasons': ' · '.join(d['categoryReasons']), 'notes': d.get('notes'),
        })

cnt = Counter(d['category'] for d in dealers)
print(f"{len(dealers)} dealers -> dealers.json, dealers.csv")
for c in sorted(cnt): print(f"  {c} {LABELS[c]:<28} {cnt[c]}")
for c in (2, 3):
    rows = sorted((d for d in dealers if d['category'] == c), key=lambda x: (x.get('siteAudit') or {}).get('score', 0))
    print(f"\n-- {LABELS[c]}:"); [print(f"  {(d.get('siteAudit') or {}).get('score', '?'):>3}  {d['shortName']:<16} {(d.get('siteAudit') or {}).get('tech', '')}") for d in rows]
