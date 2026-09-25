#!/usr/bin/env python3
"""Live-check the directory: does each dealer have a website today?

For every dealer: fetch the sheet's URL if any; also probe the obvious candidates
(stihlshop<slug>.co.nz / .nz, www. variants) for dealers marked ❌ — the sheet is six
months old. Records what answered, where it redirected, the <title>, and whether the
final page is the franchise site (stihlshop.co.nz) rather than a dealer site.
Writes verify.json; build_dealers.py merges it.
"""
import json, re, ssl, socket, concurrent.futures as cf, urllib.request, urllib.error
from pathlib import Path

HERE = Path(__file__).parent
dealers = json.load(open(HERE / 'dealers.json'))
ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
UA = 'Mozilla/5.0 (compatible; F925-directory-check/1.0)'

def fetch(url, timeout=12):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
            body = r.read(60000).decode('utf-8', 'ignore')
            return {'ok': True, 'status': r.status, 'final': r.geturl(), 'title': (re.search(r'<title[^>]*>(.*?)</title>', body, re.S | re.I) or [None, ''])[1].strip()[:120], 'len': len(body)}
    except urllib.error.HTTPError as e:
        return {'ok': False, 'status': e.code, 'final': url}
    except Exception as e:
        return {'ok': False, 'error': type(e).__name__, 'final': url}

def is_franchise(final):
    return bool(re.search(r'(^|\.)stihlshop\.co\.nz', (final or '').split('/')[2] if '://' in (final or '') else ''))

def candidates(d):
    s = d['slug'].replace('-', '')
    urls = []
    if d.get('website'): urls.append(d['website'])
    for host in (f'stihlshop{s}.co.nz', f'www.stihlshop{s}.co.nz', f'stihlshop{s}.nz', f'stihlshop-{d["slug"]}.co.nz'):
        urls.append('https://' + host)
    seen, out = set(), []
    for u in urls:
        k = u.lower().rstrip('/')
        if k not in seen: seen.add(k); out.append(u)
    return out

def check(d):
    res = {'slug': d['slug'], 'checked': [], 'liveSite': None, 'franchiseRedirect': False, 'sheetSiteDead': False}
    for u in candidates(d):
        r = fetch(u)
        r['url'] = u
        res['checked'].append(r)
        if r.get('ok'):
            if is_franchise(r['final']):
                res['franchiseRedirect'] = True
                continue
            # a real dealer site: title or reasonable body, not the franchise
            res['liveSite'] = r['final'].rstrip('/')
            res['title'] = r.get('title')
            break
        # 403 = the host exists and is bot-blocking (Wix/Squarespace); treat as a live site,
        # unverified. Only DNS failures / timeouts count as gone.
        if r.get('status') == 403:
            res['liveSite'] = u.rstrip('/')
            res['unverified403'] = True
            break
    if d.get('website') and not res['liveSite']:
        res['sheetSiteDead'] = True
    return res

with cf.ThreadPoolExecutor(max_workers=12) as ex:
    results = list(ex.map(check, dealers))
json.dump(results, open(HERE / 'verify.json', 'w'), indent=2)

flips = []
for d, r in zip(dealers, results):
    if bool(r['liveSite']) != bool(d.get('website')):
        flips.append((d['shortName'], 'sheet:' + ('site' if d.get('website') else 'none'), 'live:' + (r['liveSite'] or 'none')))
print(f'{len(results)} checked; live sites: {sum(1 for r in results if r["liveSite"])}; franchise redirects: {sum(1 for r in results if r["franchiseRedirect"])}')
print('FLIPS vs sheet:')
for f in flips: print('  ', *f)
