#!/usr/bin/env python3
"""Turn Martin's hand-built dealer directory (directory-raw.tsv) into dealers.json.

Normalises phones/emails/URLs, splits owner names, derives slug / preview host,
flags trade names, fixes the region for rows the sheet had wrong, and merges live
verification results (verify.json, produced by verify_sites.py) when present.
"""
import csv, json, re, unicodedata, os
from pathlib import Path

HERE = Path(__file__).parent
raw = list(csv.DictReader(open(HERE / 'directory-raw.tsv', encoding='utf-8'), delimiter='\t'))

# Region corrections — the sheet's region column was inconsistent for these (Ellerslie is
# Auckland, not Southern; Howick/Onehunga/Kaitaia are upper North Island, not Central).
REGION_FIX = {
    'Ellerslie': 'Northern', 'Howick': 'Northern', 'Onehunga': 'Northern', 'Kaitaia': 'Northern',
    'Huntly': 'Northern', 'Putaruru': 'Northern', 'Tokoroa': 'Northern', 'Te Awamutu': 'Northern',
    'Rangiora': 'Southern',
}
# Sheet says "Greg McLarnon" for Tauranga; the owner we work with is Mike (Michael).
OWNER_FIX = {'Tauranga': 'Greg & Mike McLarnon'}
OUR_DEALERS = {'Tauranga', 'Waihi', 'Rotorua'}

def slugify(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    s = re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
    return s

def norm_phone(p):
    d = re.sub(r'\D', '', p or '')
    if not d: return None
    if d.startswith('64'): d = '0' + d[2:]
    # NZ landline 0X XXX XXXX, mobile 02X XXX XXXX
    if d.startswith('02') and len(d) in (9, 10, 11):
        return f'{d[:3]} {d[3:6]} {d[6:]}'
    if len(d) == 9:
        return f'{d[:2]} {d[2:5]} {d[5:]}'
    return p.strip()

def norm_url(u):
    u = (u or '').strip()
    if not u or u == '❌': return None
    u = u.rstrip('/')
    if not u.startswith('http'): u = 'https://' + u
    return u

def owners(contact):
    c = (contact or '').strip()
    if not c: return []
    # "Steve and Emma Marshall" -> Steve Marshall, Emma Marshall; "Bill and Shelley Caines" likewise.
    # "Rodney Weinberg & Jai Trench" -> two full names. Heuristic: split on and/&/comma, then
    # any part without a surname inherits the surname of the next part that has one.
    parts = [p.strip() for p in re.split(r'\s*(?:,|&|\band\b)\s*', c) if p.strip()]
    out = []
    for i, p in enumerate(parts):
        toks = p.split()
        if len(toks) == 1:
            # find a later part with a surname
            sur = None
            for q in parts[i+1:]:
                qt = q.split()
                if len(qt) > 1: sur = qt[-1]; break
            out.append({'first': toks[0], 'last': sur})
        else:
            out.append({'first': ' '.join(toks[:-1]), 'last': toks[-1]})
    return out

# stihlshop.co.nz locator data (fetch_stihlshop.py) — authoritative for hours, address, image, blurb.
locator = {}
lp = HERE / 'stihlshop-stores.json'
if lp.exists():
    for st in json.load(open(lp)):
        locator[st['website_code']] = st
CODE_MAP = {  # our slug -> locator website_code where they differ
    'drury': 'downs', 'te-aro': 'tearo', 'te-puke': 'tepuke', 'morrinsville': 'morrinsville', 'greymouth': 'west_coast',
}

# Manual reclassifications that the raw sources can't know (verified by hand, 21 Sep).
OVERRIDES = {
    'northwood': {'segment': 'shared-site', 'hasSite': True, 'website': 'https://stihlshopfosters.co.nz', 'sharedSiteWith': 'Fosters', 'note': 'Branch of STIHL SHOP Fosters (Christchurch) — shares stihlshopfosters.co.nz'},
    'rangiora':  {'segment': 'shared-site', 'hasSite': True, 'website': 'https://stihlshopfosters.co.nz', 'sharedSiteWith': 'Fosters', 'note': 'Branch of STIHL SHOP Fosters (Christchurch) — shares stihlshopfosters.co.nz'},
    'sydenham':  {'segment': 'shared-site', 'hasSite': True, 'website': 'https://www.stihlshopferrymead.com', 'sharedSiteWith': 'Ferrymead', 'note': 'Branch of STIHL SHOP Ferrymead — shares stihlshopferrymead.com'},
    'te-aro':    {'segment': 'multi-brand', 'hasSite': True, 'website': 'https://ellmers.co.nz', 'multiBrand': True, 'tradesAs': 'Ellmers', 'note': 'Trades as Ellmers — multi-brand'},
    'levin':     {'segment': 'multi-brand', 'hasSite': True, 'website': 'https://www.hondahoro.co.nz', 'multiBrand': True, 'note': 'City Honda Horowhenua site (geo-blocks non-NZ)'},
    'oamaru':    {'segment': 'multi-brand', 'hasSite': True, 'website': 'https://www.oamaruhonda.co.nz', 'multiBrand': True, 'tradesAs': 'Oamaru Honda', 'note': 'Trades as Oamaru Honda — multi-brand (site geo-blocks non-NZ)'},
    'stratford': {'segment': 'shared-site', 'hasSite': True, 'sharedSiteWith': 'New Plymouth'},
}
# Enrichment produced by enrich.py / enrich_free.mjs lives on the previous dealers.json — carry it over.
CARRY = ['preview', 'google', 'social', 'facebook', 'instagram', 'websiteFromGoogle', 'siteAudit', 'category', 'categoryLabel', 'categoryReasons']
prev = {}
op = HERE / 'dealers.json'
if op.exists():
    try: prev = {x['slug']: x for x in json.load(open(op))}
    except Exception: prev = {}

verify = {}
vp = HERE / 'verify.json'
if vp.exists():
    verify = {v['slug']: v for v in json.load(open(vp))}

dealers = []
for r in raw:
    store = r['Store'].strip()
    short = re.sub(r'^STIHL SHOP\s+', '', store).replace(' Limited', '').strip()
    if short.startswith('McLaren'): short = 'Morrinsville (McLarens Rural)'
    slug = slugify(short.split(' (')[0])
    website = norm_url(r['Website?'])
    notes = (r.get('Notes') or '').strip()
    trades_as = None
    m = re.search(r'Trades as ([^;]+)', notes)
    if m: trades_as = m.group(1).strip()
    if 'McLaren' in store: trades_as = 'McLarens Rural Services'
    shared_site = 'Shared site' in notes
    town = r['Town/City'].strip().title().replace('Mt ', 'Mt ').replace("'S", "'s")
    stage = (r.get('Deal Stage') or '').strip() or None
    d = {
        'slug': slug,
        'store': store,
        'shortName': short,
        'town': town,
        'address': r['Address'].strip(),
        'region': REGION_FIX.get(short, r['Region'].strip()),
        'phone': norm_phone(r['Phone']),
        'email': (r['Email'] or '').strip().lower() or None,
        'emailIsFranchise': ((r['Email'] or '').strip().lower().endswith('@stihlshop.co.nz')),
        'owners': owners(OWNER_FIX.get(short, r['Contact'])),
        'ownersRaw': OWNER_FIX.get(short, (r['Contact'] or '').strip()),
        'website': website,
        'hasSite': bool(website) and not shared_site,
        'sharedSiteWith': 'New Plymouth' if shared_site else None,
        'tradesAs': trades_as,
        'multiBrand': bool(trades_as) and not (trades_as or '').startswith('STIHL'),
        'ourDealer': short in OUR_DEALERS,
        'stage': stage,
        'contacted': (r.get('Contacted?') or '').strip().lower() == 'yes',
        'notes': notes or None,
        'previewHost': f'{slug}.preview.f925.works',
        'stihlshopUrl': f'https://www.stihlshop.co.nz/stores/{slug}',  # to verify
        'source': {'sheet': '15L1oQQ9J8Nn3G_tXR6SqVaIBUJ-hXvELZ24dn4DqxaU', 'sheetAgeMonths': 6},
    }
    code = CODE_MAP.get(slug, slug.replace('-', '_'))
    st = locator.get(code)
    if st:
        import html as _h
        desc = re.sub(r'<[^>]+>', ' ', _h.unescape(st.get('description') or ''))
        desc = re.sub(r'\s+', ' ', desc).strip()
        brands = None
        mb = re.search(r'stock the following brands:\s*(.+?)(?:\.|$)', desc, re.I)
        if mb: brands = [b.strip() for b in re.split(r',|\band\b', mb.group(1)) if b.strip()]
        d['stihlshop'] = {
            'code': code, 'storeUrl': st.get('store_url'), 'address': st.get('address'), 'phone': st.get('phone'),
            'email': (st.get('email') or '').lower() or None, 'lat': float(st['latitude']) if st.get('latitude') else None,
            'lng': float(st['longitude']) if st.get('longitude') else None, 'hours': st.get('hours'), 'image': st.get('image'),
            'description': desc or None, 'brands': brands, 'locatorRegion': st.get('locatorRegion'),
        }
        d['stihlshopUrl'] = st.get('store_url')
        if not d['email'] and d['stihlshop']['email']: d['email'] = d['stihlshop']['email']
    else:
        d['stihlshop'] = None
        d['stihlshopUrl'] = None
    v = verify.get(slug)
    if v:
        d['verified'] = {k: v[k] for k in v if k != 'slug'}
        # A site found live where the sheet said ❌ flips hasSite; a dead site where the sheet
        # had one flips it back. Keep the sheet's value as sheetHasSite for the record.
        d['sheetHasSite'] = d['hasSite']
        if v.get('liveSite') is not None:
            d['hasSite'] = bool(v['liveSite'])
            if v['liveSite'] and not d['website']: d['website'] = v['liveSite']
    # Segment for Plan B
    if d['ourDealer']: seg = 'ours'
    elif d['stage'] == 'Proposal Sent': seg = 'warm'
    elif not d['hasSite']: seg = 'no-site'
    elif d['multiBrand']: seg = 'multi-brand'
    else: seg = 'has-site'
    d['segment'] = seg
    dealers.append(d)

have_codes = {d['stihlshop']['code'] for d in dealers if d.get('stihlshop')}
for code, st in locator.items():
    if code in have_codes: continue
    short = re.sub(r'^STIHL SHOP\s+', '', st['store_name']).strip()
    closed = 'CLOSED' in short.upper()
    short = re.sub(r'\s*-\s*CURRENTLY CLOSED', '', short, flags=re.I).strip()
    slug = slugify(short)
    import html as _h
    desc = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', _h.unescape(st.get('description') or ''))).strip()
    dealers.append({
        'slug': slug, 'store': st['store_name'], 'shortName': short, 'town': short, 'address': st.get('address'),
        'region': None, 'phone': norm_phone(st.get('phone')), 'email': (st.get('email') or '').lower() or None,
        'emailIsFranchise': (st.get('email') or '').lower().endswith('@stihlshop.co.nz'), 'owners': [], 'ownersRaw': '',
        'website': None, 'hasSite': False, 'sharedSiteWith': None, 'tradesAs': None, 'multiBrand': False, 'ourDealer': False,
        'stage': None, 'contacted': False, 'notes': 'NEW — on stihlshop.co.nz locator, not in the 6-month-old sheet',
        'previewHost': f'{slug}.preview.f925.works', 'stihlshopUrl': st.get('store_url'),
        'stihlshop': {'code': code, 'storeUrl': st.get('store_url'), 'address': st.get('address'), 'phone': st.get('phone'),
            'email': (st.get('email') or '').lower() or None, 'lat': float(st['latitude']) if st.get('latitude') else None,
            'lng': float(st['longitude']) if st.get('longitude') else None, 'hours': st.get('hours'), 'image': st.get('image'),
            'description': desc or None, 'brands': None, 'locatorRegion': st.get('locatorRegion')},
        'source': {'sheet': None, 'locator': True}, 'segment': 'closed' if closed else 'no-site', 'newSinceSheet': True, 'closed': closed,
    })
# Dealers that exist only on STIHL's corporate locator (fetch_corporate.py) — not in the sheet, not on
# stihlshop.co.nz yet. Verified by hand 21 Sep 2026.
CORPORATE_EXTRA = [{
    'slug': 'balclutha', 'store': 'STIHL SHOP Balclutha', 'shortName': 'Balclutha', 'town': 'Balclutha',
    'address': '88 Clyde Street, Balclutha 9230', 'region': 'Southern', 'phone': '03 418 0626', 'email': None,
    'emailIsFranchise': False, 'owners': [{'first': 'Andrew', 'last': 'Allan'}], 'ownersRaw': 'Ewan Allan Honda (Andrew Allan, also STIHL SHOP Mosgiel)',
    'website': 'https://ewanallan.co.nz/pages/stihl-shop', 'hasSite': True, 'sharedSiteWith': None, 'tradesAs': 'Ewan Allan Honda',
    'multiBrand': True, 'ourDealer': False, 'stage': None, 'contacted': False,
    'notes': 'NEW — only on stihl.co.nz corporate locator (not on stihlshop.co.nz, not in the sheet). Run by Ewan Allan Honda (Gore/Balclutha/Mosgiel/Alexandra Honda dealer); STIHL SHOP is one page on their Shopify site. Hours Mon-Fri 7:30-5:30, Sat 8-12, closed Sun.',
    'previewHost': 'balclutha.preview.f925.works', 'stihlshopUrl': None,
    'stihlshop': {'code': None, 'storeUrl': None, 'address': '88 Clyde St, Balclutha 9230', 'phone': '+64 3 418 0626', 'email': None,
        'lat': -46.23906, 'lng': 169.73611, 'hours': {'monday': {'label': 'Monday - Friday', 'hours': '7:30am - 5:30pm'}, 'saturday': {'label': 'Saturday', 'hours': '8:00am - 12:00pm'}, 'sunday': {'label': 'Sunday', 'hours': 'Closed'}},
        'image': None, 'description': None, 'brands': None, 'locatorRegion': 'Otago'},
    'source': {'sheet': None, 'locator': False, 'corporate': True}, 'segment': 'multi-brand', 'newSinceSheet': True, 'closed': False,
}]
have_slugs = {d['slug'] for d in dealers}
for x in CORPORATE_EXTRA:
    if x['slug'] not in have_slugs: dealers.append(dict(x))
LOCATOR_REGION = {'Auckland': 'Northern', 'Northland': 'Northern', 'Waikato': 'Northern', 'Bay of Plenty': 'Northern',
    'Gisborne': 'Central', "Hawke's Bay": 'Central', 'Manawatu': 'Central', 'Taranaki': 'Central', 'Wellington': 'Central',
    'Nelson': 'Southern', 'Marlborough': 'Southern', 'West Coast': 'Southern', 'Canterbury': 'Southern', 'Otago': 'Southern', 'Southland': 'Southern'}
for d in dealers:
    if not d.get('region') and d.get('stihlshop'):
        d['region'] = LOCATOR_REGION.get(d['stihlshop']['locatorRegion'])
for d in dealers:
    o = OVERRIDES.get(d['slug'])
    if o:
        for k, v in o.items():
            if k == 'note': d['notes'] = ((d.get('notes') or '') + ' | ' + v).strip(' |')
            else: d[k] = v
    if d['slug'] in prev:
        for k in CARRY:
            if k in prev[d['slug']] and k not in d: d[k] = prev[d['slug']][k]
dealers.sort(key=lambda x: x['shortName'])
json.dump(dealers, open(HERE / 'dealers.json', 'w'), indent=2, ensure_ascii=False)

from collections import Counter
seg = Counter(d['segment'] for d in dealers)
reg = Counter(d['region'] for d in dealers)
print(f"{len(dealers)} dealers -> dealers.json")
print('segments:', dict(seg))
print('regions:', dict(reg))
print('franchise emails:', sum(d['emailIsFranchise'] for d in dealers), '| owners parsed:', sum(bool(d['owners']) for d in dealers))
