#!/usr/bin/env python3
"""Render the directory section of the war room's Plan B page from dealers.json.
Replaces everything between <!-- directory:start --> and <!-- directory:end --> in
rfp/warroom/public/planb.html, and copies the desktop screenshots to
public/planb-audit/<slug>.jpg (downscaled) so the table can link to them.
"""
import json, html, subprocess
from collections import Counter
from pathlib import Path

HERE = Path(__file__).parent
PUB = HERE.parent / 'warroom' / 'public'
PAGE = PUB / 'planb.html'
SHOTS = PUB / 'planb-audit'; SHOTS.mkdir(exist_ok=True)
dealers = json.load(open(HERE / 'dealers.json'))
LABELS = {0: 'Closed', 1: 'No website', 2: 'Weak website', 3: 'Decent website', 4: 'Multi-brand / shared site', 5: 'On UNIFY'}
WHAT = {
    1: 'Nothing of their own online. A preview is magic to them. <b>Plan B market.</b>',
    2: 'Has a site, audit under 55/100: stale, thin, off-brand, slow, no HTTPS, or a template builder. Preview built from <i>their own</i> text. Second wave.',
    3: 'Has a decent site. No draft; the later compliance-angled note ("STIHL SHOP standards, here is the easy way").',
    4: 'The STIHL SHOP is one page on a Honda / Turf Force / Ellmers site, or a branch on a sibling\'s site. Wrong product for the template. Skip.',
    5: 'Tauranga, Waihi, Rotorua.',
    0: 'Whitianga, locator says CURRENTLY CLOSED.',
}
e = html.escape

# screenshots -> jpg 800px wide
for d in dealers:
    src = HERE / 'audit' / f"{d['slug']}.png"
    dst = SHOTS / f"{d['slug']}.jpg"
    if src.exists() and (not dst.exists() or src.stat().st_mtime > dst.stat().st_mtime):
        subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '70', '-Z', '800', str(src), '--out', str(dst)], capture_output=True)

cnt = Counter(d['category'] for d in dealers)
reg = {c: Counter(d['region'] for d in dealers if d['category'] == c) for c in cnt}
rows = []
for c in (1, 2, 3, 4, 5, 0):
    r = reg[c]
    rows.append(f"<tr><td><b>{c}</b></td><td><b>{LABELS[c]}</b></td><td><b>{cnt[c]}</b></td><td>{WHAT[c]}</td><td class=\"muted\">N {r.get('Northern', 0)} · C {r.get('Central', 0)} · S {r.get('Southern', 0)}</td></tr>")
summary = f"""<div class="tablewrap"><table>
<thead><tr><th>#</th><th>Category</th><th>Count</th><th>What it means</th><th>Regions</th></tr></thead>
<tbody>{''.join(rows)}</tbody></table></div>"""

g_rated = [d for d in dealers if (d.get('google') or {}).get('rating')]
g_reviews = sum((d.get('google') or {}).get('reviewCount') or 0 for d in g_rated)
g_avg = sum(d['google']['rating'] for d in g_rated) / max(len(g_rated), 1)
fb = sum(1 for d in dealers if (d.get('social') or {}).get('facebook'))
fbf = sum((d.get('facebook') or {}).get('followers') or 0 for d in dealers)
ig = sum(1 for d in dealers if (d.get('social') or {}).get('instagram'))
audited = [d for d in dealers if (d.get('siteAudit') or {}).get('score') is not None]
tech = Counter((d['siteAudit'].get('tech') or '').split(' (')[0] for d in audited)
geo = sum(1 for d in audited if d['siteAudit'].get('geoBlocked'))
stale = sum(1 for d in audited if any('stale' in x for x in d['siteAudit'].get('reasons', [])))
cart = sum(1 for d in audited if any('catalogue' in x for x in d['siteAudit'].get('reasons', [])))
nohttps = sum(1 for d in audited if any('no HTTPS' in x for x in d['siteAudit'].get('reasons', [])))
noviewport = sum(1 for d in audited if any('viewport' in x or 'overflow' in x for x in d['siteAudit'].get('reasons', [])))
slow = sum(1 for d in audited if any('slow load' in x for x in d['siteAudit'].get('reasons', [])))

facts = f"""<ul>
<li><b>{len(dealers)} STIHL SHOP franchisees</b> = union of three sources: Martin's sheet (90), the stihlshop.co.nz locator (92, incl. Whitianga closed) and STIHL's corporate dealer API on stihl.co.nz (91 STIHL SHOP entries + 12 approved non-franchise dealers). The corporate list added <b>Balclutha</b> (Ewan Allan Honda, new). Anything counted above 93 in the past was a duplicate (Mt Albert ×2, Greytown ×2), an approved dealer, or a closed store.</li>
<li><b>Google:</b> {len(g_rated)} of {len(dealers)} have a rated listing, avg <b>{g_avg:.2f}★</b> over <b>{g_reviews:,}</b> reviews. <b>Facebook:</b> {fb} pages, {fbf:,} followers combined. <b>Instagram:</b> {ig}.</li>
<li><b>Sites audited:</b> {len(audited)} (every dealer with a site, incl. multi-brand). Stack: {', '.join(f'{k} {v}' for k, v in tech.most_common())}. {geo} geo-block visitors outside NZ (read through the Wayback Machine + a US reader). {stale} are stale (newest year on the page ≤ 2024), {slow} load in over 6 s, {noviewport} break on a phone, {nohttps} have no HTTPS, {cart} run their own cart against §6 of the RFP.</li>
<li>Score = 50 ± pages, content, contact form, hours, map, STIHL branding, franchise link, own cart, freshness, speed, builder, HTTPS, mobile. It is a sorting aid, not a verdict; the cut between 2 and 3 is 55 and any dealer can be pinned by hand in <code>categorize.py</code>.</li>
</ul>"""

def gstars(d):
    g = d.get('google') or {}
    return f"{g['rating']}★ <span class=\"muted\">({g.get('reviewCount', 0)})</span>" if g.get('rating') else '<span class="muted">—</span>'
def site(d):
    a = d.get('siteAudit') or {}
    if not d.get('website'): return '<span class="muted">none</span>'
    host = d['website'].replace('https://', '').replace('http://', '').rstrip('/')
    parts = [f"<a href=\"{e(d['website'])}\" target=\"_blank\" rel=\"noopener\">{e(host[:34])}</a>"]
    if a.get('score') is not None:
        parts.append(f"<b>{a['score']}</b>/100 · {e((a.get('tech') or '').split(' (')[0])}")
    if (SHOTS / f"{d['slug']}.jpg").exists():
        parts.append(f"<a href=\"/planb-audit/{d['slug']}.jpg\" target=\"_blank\">screenshot</a>")
    return '<br>'.join(parts)
def reasons(d):
    return e(' · '.join(d.get('categoryReasons') or [])[:260])

trs = []
for d in sorted(dealers, key=lambda x: (x['category'] if x['category'] else 9, x['region'] or '', x['shortName'])):
    prev = f"<a href=\"https://{d['previewHost']}\" target=\"_blank\" rel=\"noopener\">preview</a>" if d['category'] in (1, 2) else ''
    trs.append(f"<tr class=\"cat{d['category']}\" data-cat=\"{d['category']}\"><td>{d['category']}</td><td><b>{e(d['shortName'])}</b><br><span class=\"muted\">{e(d['region'] or '')}{' · ' + e(d['tradesAs']) if d.get('tradesAs') else ''}</span></td>"
               f"<td>{site(d)}</td><td>{gstars(d)}</td><td>{(d.get('facebook') or {}).get('followers') or ('yes' if (d.get('social') or {}).get('facebook') else '<span class=\"muted\">—</span>')}</td>"
               f"<td class=\"small\">{reasons(d)}</td><td>{prev}</td></tr>")
table = f"""<div class="tablewrap"><table class="dir">
<thead><tr><th>#</th><th>Dealer</th><th>Website · audit</th><th>Google</th><th>FB followers</th><th>Why this category</th><th></th></tr></thead>
<tbody>{''.join(trs)}</tbody></table></div>"""

block = f"""<!-- directory:start -->
<h2 class="gh" id="directory">The whole dealership, categorised<span class="gdesc">{len(dealers)} franchisees, three sources reconciled, every website audited, every Google listing read. 21 Sep.</span></h2>
<div class="card open" data-key="pb-dir-summary">
  {summary}
  {facts}
  <p><a href="/directory.html"><b>Open the dealer directory →</b></a> — all {len(dealers)} with screenshots, filters, map, per-dealer notes. Source of truth: <code>rfp/planb/dealers.json</code> (+ <code>dealers.csv</code> for mail merge). Per dealer: address, phone, email, owners, hours, store photo, brands, Google rating / review count / Maps link, Facebook + Instagram, the site audit (stack, pages, words, speed, mobile, HTTPS, branding, freshness, screenshot) and the generated preview copy. README in the same folder.</p>
</div>
<div class="card" data-key="pb-dir-table">
  <h3>All {len(dealers)}, by category</h3>
  <p class="muted">Filter: <a href="#" data-f="all">all</a> · <a href="#" data-f="1">1 no website</a> · <a href="#" data-f="2">2 weak</a> · <a href="#" data-f="3">3 decent</a> · <a href="#" data-f="4">4 multi-brand</a> · <a href="#" data-f="5">5 ours</a></p>
  {table}
</div>
<script>
document.querySelectorAll('[data-f]').forEach(a=>a.addEventListener('click',ev=>{{ev.preventDefault();const f=a.dataset.f;document.querySelectorAll('table.dir tbody tr').forEach(tr=>{{tr.style.display=(f==='all'||tr.dataset.cat===f)?'':'none';}});}}));
</script>
<!-- directory:end -->"""

src = PAGE.read_text()
if '<!-- directory:start -->' in src:
    a = src.index('<!-- directory:start -->'); b = src.index('<!-- directory:end -->') + len('<!-- directory:end -->')
    src = src[:a] + block + src[b:]
else:
    anchor = '<h2 class="gh" id="plan">'
    src = src.replace(anchor, block + '\n\n' + anchor, 1)
PAGE.write_text(src)
print(f"planb.html: directory section rendered ({len(dealers)} rows, {len(list(SHOTS.glob('*.jpg')))} screenshots)")
