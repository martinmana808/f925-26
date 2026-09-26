#!/usr/bin/env python3
"""Fetch each dealer's Google reviews through the official Places API.

Why not scraping: Google's place panel only hands a headless browser about three reviews,
the full list behind the "N reviews" control needs a fight with their UI that breaks every
time they touch it, and they throttle you partway through 93 dealers anyway. The API
returns the five most relevant reviews per place, reliably, for about $4 across the whole
network.

Five is the API's hard cap — no tier returns more.

  GOOGLE_MAPS_API_KEY=... python3 fetch_reviews_places.py [--only slug] [--force] [--dry]

Needs Places API (New) enabled and billing on for the project the key belongs to.
Writes reviews/<slug>.json; run link_reviews.py afterwards to fold them into dealers.json.
"""
import json, os, sys, time, urllib.error, urllib.request
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE / 'reviews'; OUT.mkdir(exist_ok=True)
KEY = os.environ.get('GOOGLE_MAPS_API_KEY', '').strip()
args = sys.argv[1:]
only = args[args.index('--only') + 1] if '--only' in args else None
force = '--force' in args
dry = '--dry' in args

if not KEY and not dry:
    sys.exit('GOOGLE_MAPS_API_KEY is not set. Export it, or pass --dry to list what would be fetched.')

dealers = json.load(open(HERE / 'dealers.json'))
targets = [d for d in dealers if (d['slug'] == only if only else not d.get('closed'))]

URL = 'https://places.googleapis.com/v1/places:searchText'
FIELDS = ','.join([
    'places.id', 'places.displayName', 'places.formattedAddress',
    'places.rating', 'places.userRatingCount',
    'places.reviews.rating', 'places.reviews.text',
    'places.reviews.authorAttribution.displayName',
    'places.reviews.authorAttribution.photoUri',
    'places.reviews.relativePublishTimeDescription', 'places.reviews.publishTime',
])

def fetch(d):
    st = d.get('stihlshop') or {}
    body = {
        'textQuery': f"{d['store']} {st.get('address') or d.get('address') or ''}".strip(),
        'maxResultCount': 1,
        'languageCode': 'en',
        'regionCode': 'NZ',
    }
    # Coordinates we already hold from STIHL's own locator, so the match is the right shop
    # and not a similarly named one in another town.
    if st.get('lat') and st.get('lng'):
        body['locationBias'] = {'circle': {'center': {'latitude': st['lat'], 'longitude': st['lng']}, 'radius': 2000.0}}
    req = urllib.request.Request(
        URL, data=json.dumps(body).encode(),
        headers={'Content-Type': 'application/json', 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': FIELDS},
    )
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.load(r)

def normalise(place, d):
    revs = []
    for r in (place.get('reviews') or []):
        text = ((r.get('text') or {}).get('text') or '').strip()
        author = ((r.get('authorAttribution') or {}).get('displayName') or '').strip()
        revs.append({
            'name': author,
            'rating': r.get('rating'),
            'when': r.get('relativePublishTimeDescription') or '',
            'publishedAt': r.get('publishTime') or '',
            'text': text,
            'avatar': ((r.get('authorAttribution') or {}).get('photoUri') or ''),
        })
    return {
        'slug': d['slug'],
        'at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'source': 'places-api',
        'placeId': place.get('id'),
        'matchedName': (place.get('displayName') or {}).get('text'),
        'matchedAddress': place.get('formattedAddress'),
        'rating': place.get('rating'),
        'reviewCount': place.get('userRatingCount'),
        'reviews': revs,
    }

done = skipped = failed = 0
for d in targets:
    cache = OUT / f"{d['slug']}.json"
    if cache.exists() and not force:
        skipped += 1
        continue
    if dry:
        print(f"  would fetch {d['shortName']}")
        continue
    try:
        res = fetch(d)
        places = res.get('places') or []
        if not places:
            print(f"· {d['shortName']}: no place matched")
            failed += 1
            continue
        rec = normalise(places[0], d)
        # A name that looks nothing like the shop means we matched the wrong business.
        want = d['shortName'].split(' (')[0].lower()
        if want not in (rec['matchedName'] or '').lower() and 'stihl' not in (rec['matchedName'] or '').lower():
            rec['nameMismatch'] = True
        json.dump(rec, open(cache, 'w'), indent=1, ensure_ascii=False)
        good = [r for r in rec['reviews'] if (r['rating'] or 0) >= 4 and r['text']]
        done += 1
        print(f"✓ {d['shortName']}: {len(rec['reviews'])} review(s), {len(good)} at 4★+ with text"
              + (f"  [matched '{rec['matchedName']}' — CHECK]" if rec.get('nameMismatch') else ''))
    except urllib.error.HTTPError as e:
        detail = e.read().decode('utf-8', 'ignore')[:200]
        print(f"! {d['shortName']}: HTTP {e.code} {detail}")
        failed += 1
        if e.code in (401, 403):
            sys.exit('Stopping: the key is refused. Enable Places API (New) and billing on that project.')
    except Exception as e:
        print(f"! {d['shortName']}: {e}")
        failed += 1
    time.sleep(0.2)

print(f"\n{done} fetched, {skipped} cached, {failed} failed")
