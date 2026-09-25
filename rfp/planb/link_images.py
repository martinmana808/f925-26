#!/usr/bin/env python3
"""Point each dealer at every photo we hold of them, best first.

`preview.heroImage` stays the STIHL SHOP locator photo (a clean shopfront, always on brand);
`preview.heroImages` lists the extras fetch_images.mjs pulled from their Google listing. The
seed uploads them in this order and builds the hero slider from them.

  python3 link_images.py
"""
import json
from pathlib import Path

HERE = Path(__file__).parent
dealers = json.load(open(HERE / 'dealers.json'))
EXTRA = HERE / 'images-extra'

counts = {}
for d in dealers:
    slug = d['slug']
    pv = d.setdefault('preview', {})
    main = f'images/{slug}.jpg'
    pv['heroImage'] = main if (HERE / main).exists() else pv.get('heroImage') or ''
    folder = EXTRA / slug
    extras = sorted(f'images-extra/{slug}/{f.name}' for f in folder.glob('*.jpg')) if folder.exists() else []
    pv['heroImages'] = extras
    counts[slug] = (1 if pv['heroImage'] else 0) + len(extras)

json.dump(dealers, open(HERE / 'dealers.json', 'w'), indent=2, ensure_ascii=False)
total = sum(counts.values())
have2 = sum(1 for v in counts.values() if v >= 2)
have5 = sum(1 for v in counts.values() if v >= 5)
print(f"{total} images across {len(dealers)} dealers · {have2} have 2+ (a slider) · {have5} have 5+")
thin = [s for s, v in counts.items() if v < 2]
if thin: print('only one image:', ', '.join(thin))
