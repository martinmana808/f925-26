#!/usr/bin/env python3
"""Pull the authoritative store list from stihlshop.co.nz's locator (embedded JSON):
name, code, canonical store URL, lat/lng, full address, phone, opening hours, image,
and whatever else the blob carries. Writes stihlshop-stores.json.
"""
import json, re, urllib.request, ssl
from pathlib import Path

HERE = Path(__file__).parent
ctx = ssl.create_default_context()
req = urllib.request.Request('https://www.stihlshop.co.nz/stihl_storelocator/shops/', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, timeout=60, context=ctx).read().decode('utf-8', 'ignore')

i = html.find('"shopsData":')
assert i > 0, 'shopsData not found'
# Walk braces from the first '{' after the key to extract the JSON object.
j = html.index('{', i)
depth = 0
for k in range(j, len(html)):
    c = html[k]
    if c == '{': depth += 1
    elif c == '}':
        depth -= 1
        if depth == 0: end = k + 1; break
blob = html[j:end]
data = json.loads(blob)

stores = []
for region, arr in data.items():
    for s in arr:
        s = dict(s)
        s['locatorRegion'] = region
        stores.append(s)
json.dump(stores, open(HERE / 'stihlshop-stores.json', 'w'), indent=2, ensure_ascii=False)
print(len(stores), 'stores in', len(data), 'locator regions:', {k: len(v) for k, v in data.items()})
print('fields:', sorted(stores[0].keys()))
