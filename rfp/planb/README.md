# Plan B — the STIHL SHOP dealer directory

Source of truth for the "straight to the dealers" plan (war room: /planb.html#directory). **93 franchisees**, every one enriched, every website audited, every dealer in one of five categories.

## Where the 93 come from

| Source | Count | What it gives |
|---|---|---|
| `directory-raw.tsv` — Martin's sheet, ~6 months old | 90 | owners, deal stage, notes, region |
| `stihlshop-stores.json` — the locator JSON embedded in stihlshop.co.nz (`fetch_stihlshop.py`) | 92 | canonical store URL, address, phone, email, lat/lng, **opening hours**, **store photo**, blurb, brands |
| `stihl-corporate-dealers.json` — STIHL NZ's own dealer API behind stihl.co.nz/en/dealers (`fetch_corporate.py`) | 91 STIHL SHOP entries (+12 approved non-franchise dealers) | the first place a brand-new franchisee appears |

Union = **93**: the 92 on the franchise locator (incl. Whitianga, closed) + **Balclutha** (only on the corporate list; Ewan Allan Honda, opened recently). The corporate list has two duplicates (Mt Albert, Greytown) and Motueka/Sydenham are only on the franchise locator. Anything ever counted above 93 was a duplicate, an approved (non-franchise) dealer, or a closed store.

## Categories (`category` field, from `categorize.py`)

| # | Category | Count | Rule | What we do |
|---|---|---|---|---|
| 1 | **No website** | **35** | `hasSite` false | Preview + $100/mo offer. The market. |
| 2 | **Weak website** | **20** | has a site, audit score < 55 | Preview built from *their own* site text. Second wave. |
| 3 | Decent website | 20 | has a site, score ≥ 55 | No draft; later compliance-angled note. |
| 4 | Multi-brand / shared | 14 | STIHL SHOP is a page on a Honda / Turf Force / Ellmers / Downs site, or a branch on a sibling's site | Skip (wrong product). |
| 5 | Ours | 3 | Tauranga, Waihi, Rotorua | — |
| 0 | Closed | 1 | Whitianga | — |

**Preview targets = 1 + 2 = 55.** Pin a dealer to a category by hand in `PIN` in `categorize.py` when the score gets it wrong (it is a sorting aid, not a verdict — look at the screenshot in `audit/`).

## Files

| File | What |
|---|---|
| `dealers.json` | **The merged result.** 93 records. |
| `dealers.csv` | Flat, sorted by category → region → name; for humans / mail merge. |
| `images/` | Store photos from the locator (hero image per preview). |
| `content/<slug>.json` | Haiku-written copy per dealer (92). |
| `free/<slug>.json` | Google / Facebook / Instagram enrichment cache (92). |
| `audit/<slug>.json` + `.png` + `-m.png` | Site audit + desktop + mobile screenshot (54 sites). |
| `sitetext/<slug>.md` | Text of each dealer's own site, via r.jina.ai (37). |
| `verify.json` | Live domain check (`verify_sites.py`). |
| `build_directory.py` | Builds the front end's data + images into `warroom/public/`. |
| `fetch_images.mjs` | Harvests up to 5 photos per dealer from their Google listing → `images-extra/`. |
| `link_images.py` | Writes `preview.heroImage` + `preview.heroImages` onto each dealer. |
| `check_previews.py` | Asks every `<slug>.preview.f925.works` whether it is live → `preview-status.json`. |
| `fetch_reviews_places.py` | Google reviews per dealer through the official Places API → `reviews/`. |
| `link_reviews.py` | Folds them into `dealers.json`; only 4★+ with text reach the sites. |

## Pipeline

```
python3 fetch_stihlshop.py            # locator → stihlshop-stores.json + images/
python3 fetch_corporate.py            # stihl.co.nz API → stihl-corporate-dealers.json; prints STIHL SHOPs we don't have
python3 build_dealers.py              # sheet + locator + CORPORATE_EXTRA + OVERRIDES → dealers.json (carries enrichment)
python3 verify_sites.py && python3 build_dealers.py
env -u NODE_OPTIONS node enrich_free.mjs --all   # Google rating/reviews/Maps, FB/IG (headless Chromium, no keys)
env -u NODE_OPTIONS node audit_sites.mjs         # every site: stack, pages, words, form, hours, map, branding, cart, freshness, speed, HTTPS, mobile, screenshots → score
python3 fetch_sitetext.py             # their own site text for the copy
python3 enrich.py --all               # hours in platform shape, partners, services, Haiku copy (uses sitetext when present)
python3 categorize.py                 # category + reasons; dealers.csv
python3 render_planb.py               # war room /planb.html#directory + /planb-audit/*.jpg
```

Every step caches per dealer and is idempotent; `--force`, `--only slug` on each. `enrich.py --cache-only` lets several run in parallel (writes `content/` only; a plain run merges). Run node with `env -u NODE_OPTIONS` (broken cmux preload).

**Geo-blocking:** many NZ small-business hosts return 403 "Disallowed geographic region" / Cloudflare "Just a moment" to anything outside NZ/AU. The audit falls back to the Wayback Machine's latest snapshot for structure + screenshot (`via: wayback`, `snapshot` date) and to r.jina.ai (fetches from the US, gets through) for the *live* text; if there is no snapshot it is text-only (`via: jina`, no screenshot, speed/layout unknown). `verify_sites.py` treats 403 as "exists".

## Per-record fields
`slug` (= preview subdomain) · `store` · `shortName` · `town` · `address` · `region` (Northern/Central/Southern) · `phone` · `email` · `emailIsFranchise` · `owners[{first,last}]` · `ownersRaw` · `website` · `hasSite` · `sharedSiteWith` · `tradesAs` · `multiBrand` · `ourDealer` · `stage` · `contacted` · `notes` · `previewHost` · `stihlshopUrl` · `stihlshop{code, storeUrl, address, phone, email, lat, lng, hours, image, description, brands, locatorRegion}` · `verified{…}` · `segment` (the older label; category supersedes it) · `newSinceSheet` · `closed` · **`category`, `categoryLabel`, `categoryReasons[]`** · `google{mapsUrl, reviewsUrl, rating, reviewCount, category, website, status, nameMatches}` · `social{facebook, instagram}` · `facebook{followers, intro, image, email, phone}` · `instagram{followers}` · **`siteAudit{score, reasons[], tech, pagesLinked, navItems, wordCount, images, hasForm, hasHours, hasMap, hasPhone, stihlLogo, stihlShopWordmark, linksToStihlshop, localCatalogue, copyrightYear, newestYear, loadMs, https, viewport, mobile{horizontalOverflow}, title, description, h1, social, via, snapshot, geoBlocked}`** · `preview{hours, hoursSource, partners, services, heroImage, googleMapsQuery, copy{tagline, heroHeading, heroSubheading, aboutHtml, whatMakesUsSpecial[], servicesIntro, metaTitle, metaDescription}, defaults}`.

## Coverage (21 Sep 2026)
- Google listing rated: 90 of 92 open stores (avg 4.59★ over 6,551 reviews). Facebook: 88. Instagram: 49. Two Google matches are on address only (`nameMatches` false): Morrinsville, Sydenham — check by hand before quoting.
- Sites audited: 54 (all categories 2–4). Stack: WordPress 28, Wix 6, Webflow 5, Shopify 4, Magento 3 (the Honda dealers' catalogue), Squarespace 2, Joomla 1, custom/unknown 5. 9 geo-block. What cost points: 27 load in over 6 s, 14 are stale (newest year on the page ≤ 2024), 2 break on a phone, 2 run their own cart (RFP §6); all 54 have HTTPS.
- Copy generated for 92; the 20 category-2 dealers' copy is written from their own site text (owners, history, brands they actually service) — see `content/pukekohe.json` for what that looks like.
- Deliberately NOT collected: Google review text (terms + you'd get the rants), Facebook post photos.

## Photos (`fetch_images.mjs`, `link_images.py`)

Each dealer's Google listing carries photos of their shopfront, interior and yard — mostly posted by the business. `fetch_images.mjs` opens the place URL we already store in `google.mapsUrl` (headless Chromium, no API key, no billing), harvests the place-photo URLs, pulls each at 1600px and saves them to `images-extra/<slug>/NN.jpg`. `link_images.py` then writes `preview.heroImage` (the STIHL locator shopfront, always first) and `preview.heroImages` (the extras) onto each dealer, and the seed turns them into the hero slider.

Coverage (23 Sep): **499 images across 93 dealers — 88 have 2 or more, 80 have 5.** Five have only the locator photo because their Google listing has no photos at all: Gore, Hawera, Mt Maunganui, Pahiatua and Whitianga (closed). Their hero stays a single image, which is the old behaviour.

Filtering: `gps-cs-s` and `grass-cs` are the place-photo paths; reviewer avatars (`/a-/ALV-…` at 36px), Street View and map tiles are excluded, as is anything under 25 KB.

## Reviews (`fetch_reviews_places.py`, `link_reviews.py`)

Their own customers, on their own preview site.

Scraping was the first attempt (`fetch_reviews.mjs`, kept as a fallback) and it is not
good enough: Google hands a headless browser about three reviews, the full list behind
the "N reviews" control needs a fight with their UI that breaks whenever they touch it,
and they start throttling partway through 93 dealers. So the reviews come from the
official **Places API (New)** instead: one Text Search per dealer, biased to the
coordinates STIHL's own locator publishes so it cannot match a same-named shop in
another town, and it flags any result whose business name looks wrong.

    GOOGLE_MAPS_API_KEY=... python3 fetch_reviews_places.py     # → reviews/<slug>.json
    python3 link_reviews.py                                     # → dealers.json

**Five per place is the API's hard cap** — no tier returns more, so after filtering
expect three to five usable ones per dealer. About $0.04 a call, so roughly $4 for the
network, one-off; results are cached per dealer and only re-fetched with `--force`.

`link_reviews.py` keeps **every** review on the record under `googleReviews.all` (a
2-star review is a fact worth knowing before ringing a dealer) and puts only the ones
worth showing — **4 stars and up, with text** — in `preview.reviews`. The seed writes
those into the preview site's reviews block, capped at six.

Needs Places API (New) enabled and billing on for the key's project. The same key does
address autocomplete in dealer onboarding, so while billing is off that is failing too.

## The front end — war room `/directory.html`

The directory has a real UI now (it replaced reading `dealers.csv` in a spreadsheet):
**https://f925-warroom-eef980.netlify.app/directory.html**

- **Cards** — one per dealer, image = the screenshot of their current website, or their STIHL SHOP store photo when they have none. Category badge, audit score, Google rating, followers, owners, quick links.
- **Table** — dense, sortable by any column.
- **Map** — all 93 on a real NZ coastline, coloured by category, dot size = review count.
- **Preview built** — a green ✓ pill on every dealer we have already built a site for, with a direct link, a table column, filter chips and a headline count. Checked against production by `check_previews.py`, not inferred from the category.
- **Filters** — category, region, free-text search across name/town/owner/email/brand/stack, plus preview built / not built, shortlist, Instagram, stale site, slow site, geo-blocked, warm, has-notes. The URL carries the filters, so a filtered view is a shareable link (`🔗 View`).
- **Detail drawer** — everything we hold: desktop + phone screenshots, the full audit with every scoring reason, contact, owners, hours, brands, Google/Facebook/Instagram, the generated preview copy. `←`/`→` walk the filtered list, `/` focuses search, Esc closes, `#<slug>` deep-links.
- **Shared with the team** — ⚑ shortlist and per-dealer notes save to the war room state store (page id `directory`, same API as every other page), so Martin, Leo and Mike see each other's.
- **Out** — `↓ CSV` exports exactly what is filtered; `✉ Emails` copies the filtered dealers' addresses for a mail merge.

Build it with `python3 build_directory.py` (writes `warroom/public/directory-data.json` + `warroom/public/dir/*.jpg`, ~26 MB of images), then deploy the war room. `make_nz_outline.py` regenerates the coastline baked into the map (Natural Earth 1:50m, public domain) — only needed if the projection changes.

## Seeding the previews
Platform PR #22: `npx tsx scripts/seedPreviewDealers.ts /path/to/dealers.json [--dry|--only slug]` — targets **categories 1 and 2 (55)** when `category` is present (falls back to segment `no-site`/`warm`). Creates `preview` tenants on `<slug>.preview.f925.works` (hero to Spaces, every page header = the dealer's photo, Google rating in the hero when ≥ 5 reviews, reviews block linked to the real reviews, socials). Template PR #30 adds the offer banner. Needs the `*.preview.f925.works` wildcard (Leo). Emails not before 31 Oct except Kumeu / Albany / Te Awamutu.

## Known gaps
- Owner names come from the sheet; Sydenham and Whitianga have none; Balclutha's is inferred (Ewan Allan Honda, same owner as Mosgiel).
- Balclutha has no locator photo (not on stihlshop.co.nz yet) — if it ever needs a preview, take one from the Facebook page.
- The audit score cannot see design quality; two sites can both score 52 and look ten years apart. The screenshots are there for exactly that.
