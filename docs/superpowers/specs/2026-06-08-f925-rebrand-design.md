# F925 Website Rebrand — Design Spec

**Date:** 2026-06-08
**Status:** Approved, in implementation

## Goal

Transform this repo (Martin's personal Svelte portfolio, currently branded "Another Studio" / martinmana.com) into **F925's company website**. F925 builds **website products, solutions, and platforms** — not brochure sites — with AI woven through everything (chatbots, apps, automation). Out-design NZ competitor littlerocket.co.nz.

Stack stays: **Svelte 4 + Vite + Less**, deployed on Netlify.

## Key decisions

- **Scope:** Full rebrand of every page now, plus the chatbot.
- **Offering:** Outcome-led, few AI-first categories (collapse the 5 personal service pages into 3).
- **Portfolio:** Rename Work → Portfolio. Keep the CSV-driven masonry gallery + zoom modal and all of Martin's work AS-IS. Only rewrite intro copy. (Martin builds everything in F925; his work is F925's body of work until real case studies exist.)
- **Identity:** Fresh F925 brand. Dark base (`#191c1f`) + **electric blue** accent (`#2dffb3`, replacing current mint `#89ffc0`). Keep Inter. New clean **F925 wordmark** (SVG).
- **About/Team:** F925 as a studio with a small core team (Martin, Leo, Mike). Drop the large personal team grid.
- **Gary chatbot:** Port to native Svelte; floating widget site-wide + homepage hero "Talk to Gary" CTA.

## Gary integration (the one architectural fork)

Gary lives in the separate React repo (`/Users/martinmana/Documents/Projects/f925`): `components/GaryChat.tsx` (React + framer-motion + lucide + Tailwind) and `netlify/functions/chat.ts` (Groq llama-3.3-70b, JSON mode, returns `{reply, suggestions[]}`, long F925 system prompt).

**Chosen approach: native Svelte port.** Reuse `chat.ts` UNCHANGED (it's just an HTTP endpoint — Groq logic + system prompt + JSON contract all carry over). Rebuild only the chat UI as `GaryChat.svelte` (~200 lines) using Svelte transitions and the dark+blue Less styling. Rejected: embedding React island (ships two frameworks + Tailwind clash) and iframing (clunky, double deploy).

Needs `GROQ_API_KEY` in Netlify env.

## Pages

1. **Home** — F925 voice ("AI that works in the real world" direction). Add "Talk to Gary" hero CTA. Repoint services teaser to 3 categories, portfolio teaser to gallery.
2. **Portfolio** (was Work) — route `/work` → `/portfolio` with redirect; nav label "Portfolio." Keep masonry + zoom modal + all work. Rewrite personal intro copy to F925 framing.
3. **Services** — collapse 5 → 3 outcome-led categories:
   - **Website Products & Platforms** — sites, web apps, platforms built to work, not brochures.
   - **AI Agents & Chatbots** — custom assistants like Gary (RAG + actions, lead-gen, support).
   - **Automation & Systems** — process automation + integrations (CRM/ERP/POS), pipelines.
   Old sub-routes redirect to nearest new category.
4. **About** — F925 studio + small core team (Martin, Leo, Mike). AI-first philosophy.
5. **Contact** — F925 details: `f925.limited@gmail.com` + Martin's NZ phone/WhatsApp (confirm). Keep NZ time/Tauranga grounding.
6. **`/stuff` (+ /llms)** — personal blog; park (remove from nav, redirect to home).

## Global rebrand touchpoints

- `src/components/Logo.svelte` / `LogoMobile.svelte` → F925 wordmark.
- `src/components/layout/Header.svelte` — nav labels, "Talk to Gary", WhatsApp links.
- `src/components/layout/Footer.svelte` — email, phone, socials, copyright, "martinmana.com".
- `src/stores/headContent.js` — all SEO titles/descriptions/canonicals + routes.
- `src/styles/styles.less` — accent color variable swap (mint → electric blue).
- `index.html`, `site.webmanifest`, OG images, `_redirects`, sitemap script.
- `src/components/StructuredData.svelte` — org/brand info.

## Build phasing (each independently shippable)

1. Brand system + global rebrand (logo, colors, header/footer/SEO/index.html).
2. Portfolio rename + redirects + copy.
3. Services collapse to 3 categories (+ sub-route redirects).
4. About + Contact rebrand.
5. Gary port (`GaryChat.svelte` + Netlify function) + floating widget + hero CTA.
6. Park /stuff, final SEO/sitemap/redirects sweep.

## Open items to confirm with Martin

- Contact email/phone (assumed `f925.limited@gmail.com` + current NZ number).
- Production domain (canonicals kept generic until provided).
- Park `/stuff` (assumed yes).
