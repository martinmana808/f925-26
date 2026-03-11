# Personal Brand — v0: The Builder's Dashboard

**Date:** 2026-03-11
**Status:** Approved
**Philosophy:** A living witness of what I'm building. Like a public GitHub profile, but designed and human.

## Tech Stack

- **Framework:** Astro
- **Styling:** Tailwind CSS
- **Content:** Markdown/MDX (one .md file per project — easy to update)
- **Hosting:** Vercel
- **Interactive bits:** Svelte islands where needed

## Core Concept

Not a portfolio. Not a resume. A **real-time dashboard of a builder's work**.

- What am I building right now?
- What stage is each project at?
- What shipped recently?
- Want to try it? Here's the link.
- Want to hire the person who builds all this? Here's how.

It's the developer equivalent of an artist's open studio — walk in, see what's on every easel, talk to the person making it.

## v0 Principles

- **Living document** — updates as projects evolve, not a static snapshot
- **Projects ARE the content** — no descriptions of skills, the projects prove them
- **Status-driven** — each project shows where it's at (shipping, building, exploring, live)
- **Try it** — links to live demos, repos, or deployments wherever possible
- **One CTA** — hire me / let's talk
- **Fast** — loads instantly, no fluff
- **Developer energy** — dark, typographic, dense, confident

## Site Structure (Single Page)

One page. Scroll down. That's it.

### 1. Hero (above the fold)

```
Martin Mana

I build AI products.

[Let's talk]
```

No subtitle. No buzzwords. One sentence.

### 2. Projects (the dashboard)

Each project is a card/row with:
- **Name**
- **One-line description** (what it does, not what tech it uses)
- **Status** — `live` / `building` / `exploring` / `paused`
- **Last updated** — "2 days ago", "this week", "Mar 2026" — shows it's alive
- **Links** — [try it] [repo] [demo] — whatever applies
- **Tags** (subtle) — AI, music, productivity, macOS, etc. — for filtering, not decoration

Not grouped by category. Sorted by activity — most recently touched first. This is a feed of what's happening, not a static list.

**All projects (~20-25), not just the "best" ones.** The volume IS the message. This person never stops building.

Example entries:

```
Braintube                                          live · updated 3 days ago
AI-powered video learning — extract, organize,     [try it] [repo]
and quiz yourself on any YouTube content

RAGify                                             building · updated today
Build RAG pipelines visually                       [repo]

808 Music Tools                                    live · updated last week
Browser-based drum machine and music production    [try it]

Hands Orchestra                                    exploring · updated 2 weeks ago
Control instruments with hand gestures             [demo]

STIHL NZ                                           live · 2024
Performance audit & rebuild for STIHL Shop NZ      [visit]

Phlook                                             paused · updated Jan 2026
macOS native image browser                         [repo]
```

Optional: a subtle filter row at top — `all` `ai` `tools` `music` `client` — to narrow down.

### 3. Contact / CTA

```
Want to build something together?

martin@email.com · github · linkedin
```

### 4. Minimal Footer

Maybe one line: "Built with Astro. Always building."

## What v0 Deliberately Leaves Out

- No "How I Work" process section (that's v1)
- No design archive / 200+ works gallery (that's v1)
- No thought leadership / blog section (that's v1)
- No about page / career story (that's v1)
- No service descriptions
- No testimonials
- No animations beyond functional ones

## Content Model (MDX per project)

Each project is a `.md` file in `src/content/projects/`:

```markdown
---
name: Braintube
description: AI-powered video learning — extract, organize, and quiz yourself on any YouTube content
status: live          # live | building | exploring | paused
updated: 2026-03-09
tags: [ai, education, productivity]
links:
  demo: https://braintube.app
  repo: https://github.com/martinmana808/braintube
order: 1              # optional manual override, otherwise sorted by `updated`
---
```

No body content needed for v0. Just frontmatter. Adding a project = adding a file. Updating status = changing one line. This is meant to be maintainable by one person in 30 seconds.

## Brand Voice (v0)

- Terse. Almost curt.
- The project list does the talking
- No selling, no convincing — "here's what I build, here's how to reach me"
- Confidence through restraint
- The frequency of updates IS the flex

## Design Direction

- **Dark background** (#0a0a0a or similar near-black)
- **Monospace for project names/status**, clean sans-serif for descriptions
- **Minimal color** — one accent per status (green=live, yellow=building, blue=exploring, gray=paused)
- **Dense but readable** — developer dashboard information density
- **No hero images, no illustrations, no gradients**
- **Responsive** — looks great on mobile
- **The "updated X ago" timestamps are the heartbeat** — they prove this isn't a dead portfolio

## Path from v0 to v1

v0 ships fast. It's the living dashboard. Once it's live and projects are flowing:
- Add case studies for flagship projects (v1 section 3) — expand the .md body content
- Add the design archive (v1 section 4)
- Add thought leadership / blog (v1 section 5)
- Add the career story (v1 section 7)
- Evolve from dashboard to full brand site

v0 is the foundation. v1 is the evolution. Same URL. Same content model — just richer.
