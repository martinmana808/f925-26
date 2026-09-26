#!/usr/bin/env python3
"""Fold the fetched Google reviews into dealers.json.

Every review we hold is kept on the record — a 2-star review is a fact worth knowing
before we ring a dealer — but `preview.reviews` carries only the ones the site should
show: 4 stars and above, with something actually written in them.

  python3 link_reviews.py [--min-rating 4]
"""
import json, sys
from pathlib import Path

HERE = Path(__file__).parent
MIN = int(sys.argv[sys.argv.index('--min-rating') + 1]) if '--min-rating' in sys.argv else 4
dealers = json.load(open(HERE / 'dealers.json'))

kept = shown = withany = 0
for d in dealers:
    cache = HERE / 'reviews' / f"{d['slug']}.json"
    if not cache.exists():
        continue
    rec = json.load(open(cache))
    all_reviews = rec.get('reviews') or []
    if not all_reviews:
        continue
    withany += 1
    kept += len(all_reviews)
    good = [r for r in all_reviews if (r.get('rating') or 0) >= MIN and (r.get('text') or '').strip()]
    shown += len(good)
    pv = d.setdefault('preview', {})
    pv['reviews'] = [
        {'name': r['name'], 'rating': r['rating'], 'copy': r['text'], 'when': r.get('when', '')}
        for r in good
    ]
    d['googleReviews'] = {
        'source': rec.get('source'),
        'placeId': rec.get('placeId'),
        'fetchedAt': rec.get('at'),
        'matchedName': rec.get('matchedName'),
        'nameMismatch': rec.get('nameMismatch', False),
        'all': all_reviews,
    }

json.dump(dealers, open(HERE / 'dealers.json', 'w'), indent=2, ensure_ascii=False)
print(f"{withany} dealers have reviews · {kept} held · {shown} at {MIN}★+ with text (what the sites show)")
mismatch = [d['shortName'] for d in dealers if (d.get('googleReviews') or {}).get('nameMismatch')]
if mismatch:
    print('check by hand, the matched business name looks wrong:', ', '.join(mismatch))
