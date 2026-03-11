# Personal Brand — v0: The Builder's Dashboard

**Date:** 2026-03-11
**Status:** Approved
**Philosophy:** A living, self-updating witness of what I'm building. Powered by GitHub. Designed for humans.

## Tech Stack

- **Framework:** Astro (SSG with on-demand rebuilds)
- **Styling:** Tailwind CSS
- **Content:** Markdown frontmatter (curation) + GitHub API (heartbeat)
- **Hosting:** Vercel (with cron rebuilds)
- **Interactive bits:** Svelte islands (activity calendar, project filters)

## Core Concept

Not a portfolio. A **real-time dashboard of a builder's work**, fed by actual GitHub activity.

Two layers:
1. **Curation layer** — `.md` files you control (descriptions, status, tags, demo links)
2. **Heartbeat layer** — GitHub API feeds in live data (last commit, commit count, activity heatmap)

You push code → your website reflects it. Zero manual updates for the activity data. The site is alive because YOU are alive.

## Site Structure (Single Page)

### 1. Hero (above the fold)

```
Martin Mana

I build AI products.
You bring the problem. I build the solution.

[Let's talk]
```

Immediately below: **the activity calendar** — a GitHub-style contribution heatmap spanning the last 12 months across ALL your repos. Dense green squares. Visual proof before they even scroll.

### 2. Activity Pulse (right below hero)

A compact stats bar:

```
52 projects · 1,847 commits this year · 23 repos active · last push: 2 hours ago
```

These numbers pull from GitHub at build time. They update daily (Vercel cron) or on-demand (webhook on push).

### 3. Latest Activity (optional ticker/feed)

A small scrolling or static feed of most recent commits across all repos:

```
3h ago   braintube        feat: add quiz generation from timestamps
5h ago   ragify           fix: chunk overlap calculation
1d ago   808-music-tools  refactor: audio engine latency
2d ago   martinmana-v0    style: project card hover states
```

Short, raw, real. Shows what you're actually doing right now. Limited to last ~5-10 commits.

### 4. Projects (the dashboard — main section)

Each project is a card with:
- **Name**
- **One-line description** (curated, from .md)
- **Status badge** — `live` / `building` / `exploring` / `paused` (curated, from .md)
- **Last commit** — "2 hours ago" (from GitHub API)
- **Commit activity sparkline** — tiny inline chart showing commit frequency over last 3 months (from GitHub API)
- **Links** — [try it] [repo] — whatever applies
- **Tags** (subtle) — ai, music, productivity, etc. — for filtering

**Sorted by last GitHub commit by default.** Most active projects float to the top automatically. No manual reordering needed.

Example:

```
Braintube                              live · last commit 3h ago  ▂▃▅▇▅▃▆▇
AI-powered video learning — extract,                     [try it] [repo]
organize, and quiz on any YouTube content
#ai #education #productivity

RAGify                              building · last commit 5h ago  ▁▂▅▇▇▆▇▅
Build RAG pipelines visually                                       [repo]
#ai #developer-tools

808 Music Tools                        live · last commit 1d ago  ▃▅▂▁▃▅▇▅
Browser-based drum machine                              [try it] [repo]
and music production
#music #creative-tools
```

Filter row at top: `all` `ai` `tools` `music` `apps` `client`

### 5. Contact / CTA

```
Want to build something together?

hello@martinmana.com · github.com/martinmana808 · linkedin
```

### 6. Footer

```
This site updates itself. Powered by what I push.
Built with Astro. Always building.
```

## Data Architecture

### Curation Layer: `/src/content/projects/*.md`

```markdown
---
name: Braintube
description: "AI-powered video learning — extract, organize, and quiz yourself on any YouTube content"
status: live
tags: [ai, education, productivity]
repo: martinmana808/braintube
links:
  demo: https://braintube.app
featured: true
---
```

- `repo` links to GitHub for automatic activity data
- `status` is manually set (you decide when something is "live" vs "building")
- `description` is your words, not auto-generated
- `featured: true` pins a project to the top regardless of activity
- No body content needed for v0

### Heartbeat Layer: GitHub API (fetched at build time)

For each project with a `repo` field, Astro fetches at build:
- Last commit date + message
- Commit count (last 90 days)
- Weekly commit activity (for sparklines)

Global data (fetched once):
- Contribution calendar (last 12 months) — for the heatmap
- Total commit count across all repos
- Active repo count
- Last push timestamp

### Build Triggers

1. **Daily cron** — Vercel scheduled rebuild (e.g., 6am UTC) keeps data fresh
2. **Webhook on push** (optional, phase 2) — any push to your repos triggers a rebuild via Vercel Deploy Hook
3. **Manual** — push to the site repo itself triggers standard Vercel build

### Caching Strategy

- GitHub API responses cached in Astro's build output
- Rate limit friendly: ~20-25 repos × 2-3 API calls each = ~60 calls per build (well within GitHub's 5000/hour limit)
- Personal access token for authenticated requests (higher rate limits, access to private repos if wanted)

## Design Direction

- **Dark background** — `#0a0a0a` base, `#111` cards
- **Activity calendar** — GitHub-style green squares but with your brand accent color
- **Status colors** — green=live, amber=building, blue=exploring, gray=paused
- **Sparklines** — thin, single-color, showing commit rhythm
- **Typography** — Monospace for project names, status, timestamps. Sans-serif (Inter) for descriptions
- **Minimal color** — the activity data provides the visual interest, not decoration
- **Dense** — developer dashboard density. Information-rich, not whitespace-heavy
- **The green squares and sparklines ARE the design** — they prove everything

## Brand Voice (v0)

- Terse. The data speaks.
- No selling. "Here's what I'm building right now."
- The commit frequency IS the pitch
- Confidence through output, not words

## What v0 Deliberately Leaves Out

- No "How I Work" process section (v1)
- No design archive / 200+ works gallery (v1)
- No blog / thought leadership (v1)
- No about page / career story (v1)
- No service descriptions
- No testimonials
- No animations beyond functional transitions

## Path from v0 to v1

v0 ships fast as the living dashboard. Then:
- Add case study pages (expand .md body content for flagship projects)
- Add the design archive section
- Add blog / thought leadership
- Add the career story
- Evolve from dashboard to full brand site

Same URL. Same content model. v0's project .md files become v1's case study pages — just add body content.

## Why This Works

A potential client lands on the site. In 5 seconds they see:
1. "I build AI products" — clear positioning
2. A dense green activity calendar — this person ships constantly
3. 20+ projects with live status and real commit data — this is not a dead portfolio
4. Half of them have "try it" links — they can touch the work
5. One CTA — "Let's talk"

That's it. No convincing needed. The evidence is automated and self-updating.
