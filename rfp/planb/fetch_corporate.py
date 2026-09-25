#!/usr/bin/env python3
"""Pull every NZ dealer from STIHL's corporate dealer locator (stihl.co.nz/en/dealers).

It is a different list from the franchise locator on stihlshop.co.nz: it has the STIHL SHOP
franchisees *and* the ~12 approved (non-franchise) dealers, and it is where a brand new
franchisee shows up first (Balclutha was only here, 21 Sep 2026). The endpoint is the public
Adobe I/O runtime the page itself calls; one 2000 km radius query returns the whole country.

Writes stihl-corporate-dealers.json (raw) and prints the STIHL SHOPs not in dealers.json.
"""
import json, re, urllib.request
from pathlib import Path

HERE = Path(__file__).parent
URL = ('https://252092-stihl-b2c.adobeioruntime.net/apis/nz-b2c/dealerdatahub/search'
       '?text=&latitude=-41.0&longitude=174.0&distance=2000&size=500&units=metric')
req = urllib.request.Request(URL, headers={'Origin': 'https://www.stihl.co.nz', 'Referer': 'https://www.stihl.co.nz/', 'User-Agent': 'Mozilla/5.0'})
data = json.load(urllib.request.urlopen(req, timeout=60))
dealers = data['dealers']
for d in dealers: d.pop('attributes', None)  # product-range icons, noise
json.dump(dealers, open(HERE / 'stihl-corporate-dealers.json', 'w'), indent=2, ensure_ascii=False)

def norm(s): return re.sub(r'[^a-z]', '', (s or '').lower())
ours = json.load(open(HERE / 'dealers.json')) if (HERE / 'dealers.json').exists() else []
keys = set()
for d in ours:
    keys |= {norm(d['store'].replace('STIHL SHOP', '')), norm(d['town']), norm(d.get('tradesAs'))}
shops = [d for d in dealers if 'STIHL SHOP' in d['name'].upper()]
print(f"{len(dealers)} dealers on stihl.co.nz, {len(shops)} STIHL SHOP entries, {len(dealers) - len(shops)} approved dealers")
for d in shops:
    n = norm(d['name'].replace('ZZZ', '').replace('STIHL SHOP', ''))
    if n not in keys and norm(d['city']) not in keys:
        print('  NOT IN dealers.json:', d['name'], '|', d['street'].strip(), d['city'], d['zip'], '|', d['businessPhone'], '|', d.get('email'))
