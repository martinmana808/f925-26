#!/usr/bin/env python3
"""Contact sheet of every hero image we are putting on a dealer's preview site.

Harvested photos are mostly the dealer's own shopfront and yard, but a Google listing can
carry a customer's photo of the wrong thing — the shop next door, a machine in a paddock.
Nothing catches that but a human glance, so put all of them on one page, grouped by dealer,
with the slide number and a one-click way to drop one.

Writes warroom/public/heroes.html + warroom/public/heroes/<slug>-N.jpg (thumbnails).
Dropping a photo = move it to images-extra/<slug>/rejected/ and re-run link_images.py
and the seed.
"""
import json, subprocess
from pathlib import Path

HERE = Path(__file__).parent
PUB = HERE.parent / 'warroom' / 'public'
OUT = PUB / 'heroes'; OUT.mkdir(parents=True, exist_ok=True)
dealers = json.load(open(HERE / 'dealers.json'))

def thumb(src: Path, dst: Path, width=420):
    if not src.exists(): return False
    if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime: return True
    r = subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '55',
                        '-Z', str(width), str(src), '--out', str(dst)], capture_output=True)
    return r.returncode == 0

rows, total = [], 0
for d in sorted(dealers, key=lambda x: (x['category'] or 9, x['name'] if 'name' in x else x['shortName'])):
    pv = d.get('preview') or {}
    rels = [pv.get('heroImage')] + list(pv.get('heroImages') or [])
    rels = [r for r in rels if r]
    if not rels: continue
    shots = []
    for i, rel in enumerate(rels[:5]):
        dst = OUT / f"{d['slug']}-{i + 1}.jpg"
        if thumb(HERE / rel, dst):
            shots.append((i + 1, f"/heroes/{d['slug']}-{i + 1}.jpg", rel))
            total += 1
    if not shots: continue
    live = d['category'] in (1, 2)
    rows.append(f"""<section class="d{'' if live else ' off'}">
      <h3>{d['shortName']} <span class="m">cat {d['category']} · {len(shots)} slide{'s' if len(shots) != 1 else ''}{'' if live else ' · no preview site'}</span>
        {'<a href="https://' + d['previewHost'] + '" target="_blank" rel="noopener">open their site ↗</a>' if live else ''}</h3>
      <div class="shots">{''.join(
        f'<figure><img loading="lazy" src="{u}" alt=""><figcaption>{n}{" · locator" if n == 1 else ""}<code>{rel}</code></figcaption></figure>'
        for n, u, rel in shots)}</div>
    </section>""")

html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Hero photos</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Mono&display=swap">
<style>
:root{{--paper:#F7F4EE;--surface:#fff;--ink:#221D15;--muted:#6E6557;--line:#E3DCCC;--accent:#C05F0A}}
@media (prefers-color-scheme:dark){{:root{{--paper:#16130D;--surface:#1F1B13;--ink:#EDE7DA;--muted:#A89E8B;--line:#3A3427;--accent:#F0913C}}}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--paper);color:var(--ink);font-family:"IBM Plex Sans",system-ui,sans-serif;font-size:15px}}
.wrap{{max-width:1500px;margin:0 auto;padding:22px}}
h1{{font-family:"Barlow Condensed",sans-serif;font-size:40px;text-transform:uppercase;margin:0 0 6px}}
p.sub{{color:var(--muted);max-width:80ch;margin:0 0 20px}}
a{{color:var(--accent)}}
section.d{{border-top:1px solid var(--line);padding:14px 0}}
section.d.off{{opacity:.55}}
h3{{font-family:"Barlow Condensed",sans-serif;font-size:22px;text-transform:uppercase;margin:0 0 8px;display:flex;gap:12px;align-items:baseline;flex-wrap:wrap}}
h3 .m{{font-family:"IBM Plex Sans",sans-serif;font-size:12.5px;font-weight:400;color:var(--muted);text-transform:none}}
h3 a{{font-size:12.5px;font-family:"IBM Plex Sans",sans-serif;text-transform:none}}
.shots{{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}}
figure{{margin:0}}
figure img{{width:100%;aspect-ratio:16/10;object-fit:cover;border:1px solid var(--line);border-radius:8px;display:block;background:var(--surface)}}
figcaption{{font-size:11px;color:var(--muted);margin-top:3px;display:flex;gap:6px;align-items:baseline}}
figcaption code{{font-family:"IBM Plex Mono",monospace;font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}}
</style></head><body><div class="wrap">
<h1>Hero photos, every dealer</h1>
<p class="sub">Slide 1 is always the STIHL SHOP locator shopfront. Slides 2–5 come from the dealer's own Google listing — nearly always their shop, occasionally a customer's photo of something else. {total} images across {len(rows)} dealers.
<br>To drop one: <code>mv rfp/planb/&lt;path below&gt; rfp/planb/images-extra/&lt;slug&gt;/rejected/</code>, then <code>python3 link_images.py</code> and re-run the seed.</p>
{''.join(rows)}
</div></body></html>"""
(PUB / 'heroes.html').write_text(html)
print(f"heroes.html — {total} images across {len(rows)} dealers")
