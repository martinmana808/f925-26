#!/usr/bin/env python3
"""Regenerate the NZ coastline baked into the directory page's map view.

Natural Earth 1:50m (public domain) → the two main islands, Stewart Island and Great
Barrier → projected into the map's 560×760 viewBox → simplified → SVG path strings.
Only needed if the map projection changes; the paths are already embedded in
warroom/public/directory.html (search for `var NZ=`).

  python3 make_nz_outline.py            # prints the JSON array to paste
"""
import json, urllib.request

SRC = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson'
W, H, PAD = 560, 760, 26
MIN_LO, MAX_LO, MIN_LA, MAX_LA = 166.0, 178.8, -47.4, -34.0
# The viewBox ratio is chosen so a degree of longitude at 41°S and a degree of latitude
# come out the same size on screen (~0.475 px/km each), i.e. the shape is not stretched.

X = lambda lo: PAD + (lo - MIN_LO) / (MAX_LO - MIN_LO) * (W - 2 * PAD)
Y = lambda la: PAD + (MAX_LA - la) / (MAX_LA - MIN_LA) * (H - 2 * PAD)

def simplify(pts, tol=0.6):
    """Drop points within tol px of the last kept one — plenty at this size."""
    out = [pts[0]]
    for p in pts[1:]:
        if abs(p[0] - out[-1][0]) + abs(p[1] - out[-1][1]) >= tol: out.append(p)
    if out[-1] != out[0]: out.append(out[0])
    return out

nz = next(f for f in json.load(urllib.request.urlopen(SRC, timeout=120))['features']
          if f['properties'].get('NAME') == 'New Zealand')
paths = []
for poly in nz['geometry']['coordinates']:
    ring = poly[0]
    xs = [c[0] for c in ring]; ys = [c[1] for c in ring]
    if min(xs) < 160 or max(xs) > 180: continue          # Chathams (wrapped longitude)
    if min(ys) < -48 or max(ys) > -33: continue          # subantarctic islands, Kermadecs
    if (max(xs) - min(xs)) * (max(ys) - min(ys)) < 0.05: continue   # islets
    pts = simplify([(round(X(lo), 1), round(Y(la), 1)) for lo, la in ring])
    paths.append('M' + ' L'.join(f'{x} {y}' for x, y in pts) + ' Z')

print(json.dumps(paths))
