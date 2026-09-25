#!/usr/bin/env python3
"""Build the war room's dealer directory front end from dealers.json.

Emits:
  warroom/public/directory-data.json  — one trimmed record per dealer, everything the UI shows
  warroom/public/dir/<slug>.jpg       — card image: the site screenshot, or the store photo
  warroom/public/dir/<slug>-site.jpg  — full desktop screenshot (detail panel)
  warroom/public/dir/<slug>-m.jpg     — mobile screenshot (detail panel)
  warroom/public/dir/<slug>-photo.jpg — the locator store photo (detail panel)

Images are resized with `sips` (macOS, no dependencies). Re-runnable: only re-encodes
what changed.
"""
import json, shutil, subprocess
from pathlib import Path

HERE = Path(__file__).parent
PUB = HERE.parent / 'warroom' / 'public'
OUT = PUB / 'dir'; OUT.mkdir(parents=True, exist_ok=True)
dealers = json.load(open(HERE / 'dealers.json'))
try:
    DOMAINS = {r['slug']: r for r in json.load(open(HERE / 'convention_domains.json'))['results']}
except FileNotFoundError:
    DOMAINS = {}
    print('no convention_domains.json — run check_domains.py to populate the domain column')
try:
    PREVIEWS = json.load(open(HERE / 'preview-status.json'))['results']
except FileNotFoundError:
    PREVIEWS = {}
    print('no preview-status.json — run check_previews.py so the directory knows which previews are live')

def jpg(src: Path, dst: Path, width: int, quality: str = '62'):
    if not src.exists(): return False
    if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime: return True
    r = subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', quality,
                        '-Z', str(width), str(src), '--out', str(dst)], capture_output=True)
    return r.returncode == 0

DAYS = [('mon', 'Mon'), ('tue', 'Tue'), ('wed', 'Wed'), ('thu', 'Thu'), ('fri', 'Fri'), ('sat', 'Sat'), ('sun', 'Sun')]
def hours_lines(d):
    """Compact opening hours: the locator's own labels when we have them, else the parsed shape."""
    loc = ((d.get('stihlshop') or {}).get('hours')) or {}
    if isinstance(loc, dict) and loc:
        return [f"{v.get('label')}: {v.get('hours')}" for v in loc.values() if v.get('label')]
    h = ((d.get('preview') or {}).get('hours')) or {}
    out = []
    for k, label in DAYS:
        v = h.get(k)
        if not isinstance(v, dict): continue
        out.append(f"{label}: {'Closed' if v.get('closed') else v.get('open', '') + ' - ' + v.get('close', '')}")
    return out

records, missing = [], []
for d in dealers:
    slug = d['slug']
    shot = HERE / 'audit' / f'{slug}.png'
    photo = HERE / 'images' / f'{slug}.jpg'
    has_shot = jpg(shot, OUT / f'{slug}.jpg', 640) if shot.exists() else False
    if has_shot:
        jpg(shot, OUT / f'{slug}-site.jpg', 1200, '70')
        jpg(HERE / 'audit' / f'{slug}-m.png', OUT / f'{slug}-m.jpg', 420)
    has_photo = jpg(photo, OUT / f'{slug}-photo.jpg', 900) if photo.exists() else False
    if not has_shot and has_photo:                      # no site: the store photo is the card
        shutil.copyfile(OUT / f'{slug}-photo.jpg', OUT / f'{slug}.jpg')
    if not has_shot and not has_photo: missing.append(slug)

    a = d.get('siteAudit') or {}
    g = d.get('google') or {}
    cp = ((d.get('preview') or {}).get('copy')) or {}
    pv = d.get('preview') or {}
    records.append({
        'slug': slug, 'name': d['shortName'], 'store': d['store'], 'town': d['town'], 'region': d['region'],
        'address': (d.get('stihlshop') or {}).get('address') or d.get('address'),
        'phone': d.get('phone'), 'email': d.get('email'), 'emailIsFranchise': d.get('emailIsFranchise'),
        'owners': d.get('ownersRaw') or None, 'stage': d.get('stage'), 'notes': d.get('notes'),
        'website': d.get('website'), 'tradesAs': d.get('tradesAs'), 'sharedSiteWith': d.get('sharedSiteWith'),
        'previewHost': d['previewHost'], 'stihlshopUrl': d.get('stihlshopUrl'),
        'lat': (d.get('stihlshop') or {}).get('lat'), 'lng': (d.get('stihlshop') or {}).get('lng'),
        'category': d['category'], 'categoryLabel': d['categoryLabel'], 'reasons': d.get('categoryReasons') or [],
        'card': f'/dir/{slug}.jpg' if (has_shot or has_photo) else None,
        'cardIs': 'screenshot' if has_shot else ('photo' if has_photo else None),
        'shot': f'/dir/{slug}-site.jpg' if has_shot else None,
        'shotM': f'/dir/{slug}-m.jpg' if (OUT / f'{slug}-m.jpg').exists() else None,
        'photo': f'/dir/{slug}-photo.jpg' if has_photo else None,
        'google': {'rating': g.get('rating'), 'reviews': g.get('reviewCount'), 'maps': g.get('mapsUrl'),
                   'reviewsUrl': g.get('reviewsUrl'), 'listedAs': g.get('category'), 'nameMatches': g.get('nameMatches')} if g else {},
        'facebook': (d.get('social') or {}).get('facebook') or None,
        'fbFollowers': (d.get('facebook') or {}).get('followers'),
        'instagram': (d.get('social') or {}).get('instagram') or None,
        'igFollowers': (d.get('instagram') or {}).get('followers'),
        'audit': {'score': a.get('score'), 'tech': a.get('tech'), 'pages': a.get('pagesLinked'), 'words': a.get('wordCount'),
                  'loadMs': a.get('loadMs'), 'https': a.get('https'), 'form': a.get('hasForm'), 'hours': a.get('hasHours'),
                  'map': a.get('hasMap'), 'branding': bool(a.get('stihlShopWordmark') or a.get('stihlLogo')),
                  'cart': a.get('localCatalogue'), 'year': a.get('copyrightYear') or a.get('newestYear'),
                  'mobileOverflow': (a.get('mobile') or {}).get('horizontalOverflow'), 'via': a.get('via'),
                  'snapshot': a.get('snapshot'), 'title': a.get('title'), 'reasons': a.get('reasons') or [],
                  'error': a.get('error')} if a else {},
        'domain': (lambda r: {} if not r else {
            'name': r['domain'], 'status': r['status'], 'mine': r.get('isDealersOwn'),
            'dnsHost': r.get('dnsHost'), 'created': r.get('created'),
            'registrar': r.get('registrar'),
        })(DOMAINS.get(slug)),
        # Whether we have actually built this dealer a site, checked against production
        # rather than inferred from their category — see check_previews.py.
        'preview': (lambda r: {'host': d['previewHost'], 'live': False, 'offer': False} if not r else {
            'host': r.get('host') or d['previewHost'], 'live': bool(r.get('live')),
            'offer': bool(r.get('hasOffer')), 'status': r.get('status'),
        })(PREVIEWS.get(slug)),
        'hours': hours_lines(d),
        'brands': (pv.get('partners') or {}).get('selectedPremadeNames', []) + (pv.get('partners') or {}).get('custom', []),
        'copy': {'tagline': cp.get('tagline'), 'about': cp.get('aboutHtml'), 'special': cp.get('whatMakesUsSpecial') or []},
    })

records.sort(key=lambda r: (r['category'] or 9, r['name']))
(PUB / 'directory-data.json').write_text(json.dumps({
    'generated': __import__('datetime').date.today().isoformat(),
    'previewsCheckedAt': (json.load(open(HERE / 'preview-status.json'))['checkedAt'] if PREVIEWS else None),
    'count': len(records), 'dealers': records,
}, ensure_ascii=False, separators=(',', ':')))
size = (PUB / 'directory-data.json').stat().st_size
imgs = sum(f.stat().st_size for f in OUT.glob('*.jpg'))
print(f"directory-data.json {size/1024:.0f} KB · {len(records)} dealers · dir/ {len(list(OUT.glob('*.jpg')))} images {imgs/1024/1024:.1f} MB")
if missing: print('no card image:', ', '.join(missing))
