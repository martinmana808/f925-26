/* War room library: the single index of every page, artifact and link that
   belongs to the STIHL RFP universe. Loaded before wr-shell.js on every page;
   the shell renders it as the "Library" menu, /library.html renders it in full.
   Team-added links live in Netlify Blobs (page "library") and are merged in. */
window.WR_LIBRARY = {
  groups: [
    { id: 'warroom',   label: 'War room pages' },
    { id: 'artifacts', label: 'Team artifacts (claude.ai)' },
    { id: 'hubs',      label: 'Proposal hubs (public)' },
    { id: 'live',      label: 'Live product' },
    { id: 'code',      label: 'Code, hosting & accounts' },
    { id: 'source',    label: 'Source documents' },
    { id: 'team',      label: 'Added by the team' }
  ],
  items: [
    /* ---- war room pages ---- */
    { g: 'warroom', title: 'Runbook (task board)', url: '/board.html', desc: '78 fixed + custom tasks, assignees, comments. V2 since 10 Sep.', by: 'martin', date: '2026-09-06', status: 'live' },
    { g: 'warroom', title: 'Runbook V1 (archived)', url: '/board-v1.html', desc: 'The 6 Sep board, kept for history.', by: 'martin', date: '2026-09-06', status: 'archived' },
    { g: 'warroom', title: 'RFP audit', url: '/audit.html', desc: '84 requirement verdicts (19 superior / 24 compliant / 25 partial / 16 gap), flag and comment per requirement.', by: 'martin', date: '2026-09-03', status: 'live' },
    { g: 'warroom', title: 'v.672 — After the Truth (the proposal)', url: '/v666.html', desc: 'The current proposal. Version number goes up by one on every change; the URL stays /v666.html so flags and comments survive, and the version log sits under the intro. Written 23 Sep after both of Mark’s answers and the rant. Two arguments: the price is the strategy (three tiers — $100 / $300 / $600 — same website and same governance at every one, the tier buys more of our time), and §5 — STIHL already pays to produce the BRANDKIT and almost no dealer posts it. Plus eight free things we ask STIHL for (§17). 17 sections + internal appendix, review layer throughout.', by: 'martin', date: '2026-09-23', status: 'live' },
    { g: 'warroom', title: 'PREFERRED — the proposal (draft 1, superseded)', url: '/preferred.html', desc: 'Start-from-scratch proposal written 18 Sep for the brief STIHL confirmed: dealer is the customer, STIHL is the channel, adoption is the strategy. Superseded by v.666 on 23 Sep, which kept the diagnosis and changed the price.', by: 'martin', date: '2026-09-18', status: 'superseded' },
    { g: 'warroom', title: 'Proposal V2 (superseded)', url: '/proposal.html', desc: 'The 10 Sep draft, written for a network rollout that STIHL confirmed on 17 Sep will not happen. Kept for the performance appendix and wording.', by: 'martin', date: '2026-09-10', status: 'superseded' },
    { g: 'warroom', title: 'Proposal V1 (archived)', url: '/proposal-v1.html', desc: 'The 6 Sep draft before Mike’s review.', by: 'martin', date: '2026-09-06', status: 'archived' },
    { g: 'warroom', title: 'Status report · 16 Sep', url: '/report-2026-09-16.html', desc: 'Questions sent to STIHL (Mike signed), 11 → 6 → 4; five PRs ready to merge (cookies, first-party forms, reCAPTCHA); Gary removed; I-01 day 13.', by: 'martin', date: '2026-09-16', status: 'live' },
    { g: 'warroom', title: 'Vendor questions as sent (PDF)', url: '/docs/vendor-questions-sent-2026-09-15.pdf', desc: 'The one-page letter to STIHL, 15 Sep 2026, signed by Mike. Four questions.', by: 'mike', date: '2026-09-15', status: 'live' },
    { g: 'warroom', title: 'Status report · 14 Sep', url: '/report-2026-09-14.html', desc: 'Three-day catch-up (12–14 Sep): helpdesk v1 live in prod + v2 in PR #14, STIHL posting live with Tauranga, vendor questions still unsent (due 18 Sep), I-01 day 11.', by: 'martin', date: '2026-09-14', status: 'superseded' },
    { g: 'warroom', title: 'Status report · 12 Sep', url: '/report-2026-09-12.html', desc: '34/101 tasks, 17 pts ahead of the clock; next steps ranked.', by: 'martin', date: '2026-09-12', status: 'superseded' },
    { g: 'warroom', title: 'Week 1 report', url: '/wk1-report.html', desc: 'Status at the end of week 1 (4–10 Sep): what closed, what is red, who owes what.', by: 'martin', date: '2026-09-10', status: 'live' },
    { g: 'warroom', title: 'The Process — dealer lifecycle', url: '/process.html', desc: 'Onboarding → changes → support through UNIFY, step by step, with every open question marked inline and collected. Editable in place by anyone; every save is logged with who/when and a diff.', by: 'martin', date: '2026-09-15', status: 'live' },
    { g: 'warroom', title: 'Plan B — straight to the dealers', url: '/planb.html', desc: '47 of 90 dealers have no website. Build each a real preview from the directory + Google Places on the existing platform, offer $100/mo intro with BRANDKIT, email 10 a day from 31 Oct — with or without the badge. What Leo needs to do (a wildcard) and not do (static sites).', by: 'martin', date: '2026-09-18', status: 'live' },
    { g: 'warroom', title: 'The rant, answered', url: '/rant.html', desc: 'Martin’s reaction to STIHL’s answers taken seriously: where it is right, where it would cost us, the value asymmetry (farmers buying STIHL’s billboard), the Little Rocket test, what the badge is worth, and what to say — in an email, in the room, and nowhere.', by: 'martin', date: '2026-09-18', status: 'live' },
    { g: 'warroom', title: 'WTF? — STIHL’s answers vs their own RFP', url: '/wtf.html', desc: 'Mark’s 17 Sep answers (optional, dealer pays, no certification, no security standard) side by side with the RFP’s contract / pilot / network rollout, verbatim. Three readings and the follow-up question to send.', by: 'martin', date: '2026-09-17', status: 'live' },
    { g: 'warroom', title: 'The RFP (PDF, as issued)', url: '/docs/stihl-rfp-2026.pdf', desc: 'STIHL SHOP Dealer Website Platform RFP v1.0, 4 Sep 2026, 9 pages.', by: 'mike', date: '2026-09-04', status: 'live' },
    { g: 'warroom', title: 'Proposal Ammo → now runbook §10', url: '/board.html#beyond', desc: 'Folded into the runbook on 16 Sep — every ammo item is now a task in section 10 (X-06…X-11) with its full write-up. One place, not two.', by: 'martin', date: '2026-09-16', status: 'superseded' },
    { g: 'warroom', title: 'Scenarios & the pricing idea', url: '/scenarios.html', desc: 'What are we bidding for? The decision tree (preferred supplier vs network provider × who pays) and one idea for pricing that works on every branch. For discussion — nothing decided.', by: 'martin', date: '2026-09-15', status: 'live' },
    { g: 'warroom', title: 'Vendor questions to STIHL', url: '/vendor-questions.html', desc: 'The 6 consolidated questions (15 Sep): what we don’t understand, why it matters, the question. Vote Send/Drop, the draft email assembles itself. Due 18 Sep.', by: 'martin', date: '2026-09-15', status: 'live' },
    { g: 'warroom', title: 'Vendor questions V1 (archived)', url: '/vendor-questions-v1.html', desc: 'The original 11 questions with the votes and comments that drove the consolidation.', by: 'martin', date: '2026-09-14', status: 'archived' },
    { g: 'warroom', title: 'Capacity at 100 dealers', url: '/capacity.html', desc: 'Stress test of the real infrastructure, every service we depend on, NZ$ cost model, changes needed first.', by: 'martin', date: '2026-09-10', status: 'live' },
    { g: 'warroom', title: 'Library (this index)', url: '/library.html', desc: 'Every page, artifact and link in one place. Add what is missing.', by: 'martin', date: '2026-09-11', status: 'live' },

    /* ---- team artifacts on claude.ai ---- */
    { g: 'artifacts', title: 'DR & hosting explainer', url: 'https://claude.ai/code/artifact/f1bec9a6-0ab2-44ef-b70a-1fb706601420', desc: 'What happens if a machine goes down on DigitalOcean; feeds proposal §6. Task A-05.', by: 'leonel', date: '2026-09-08', status: 'live' },
    { g: 'artifacts', title: 'Onboarding questions (9)', url: 'https://claude.ai/code/artifact/d6d947e3-0eed-4a3a-bf75-28e54c582066', desc: 'The dealer onboarding questionnaire; Mike says good for now, still needs an explicit close. Task A-xmtrztzc6.', by: 'leonel', date: '2026-09-08', status: 'live' },
    { g: 'artifacts', title: 'Mike’s technical questionnaire, answered', url: 'https://claude.ai/code/artifact/c1506eca-bfb8-40ec-8964-24affd6c78f2', desc: 'Answers to the 70 questions for proposal V2; feeds §6/§7. Task A-xmtrysvel.', by: 'leonel', date: '2026-09-10', status: 'live' },
    { g: 'artifacts', title: 'Unify at 100 Dealers (artifact copy)', url: 'https://claude.ai/code/artifact/750dc376-a475-45a4-aa63-5a8b8c7326bf', desc: 'Martin-only copy of the capacity report; the war room page is canonical.', by: 'martin', date: '2026-09-10', status: 'superseded' },
    { g: 'artifacts', title: 'Audit + review (db version)', url: 'https://claude.ai/code/artifact/84985b66-88a2-4d19-a029-059d2d53a824', desc: 'Superseded by /audit.html when the war room moved to Netlify.', by: 'martin', date: '2026-09-06', status: 'superseded' },
    { g: 'artifacts', title: 'Task board (db version)', url: 'https://claude.ai/code/artifact/0b3eaca0-ee02-4e5b-94f7-a2e81c727f8a', desc: 'Superseded by /board.html.', by: 'martin', date: '2026-09-06', status: 'superseded' },
    { g: 'artifacts', title: 'Proposal V1.0 + review (db version)', url: 'https://claude.ai/code/artifact/71736258-11ca-4e81-aea5-50b93f52b078', desc: 'Superseded by /proposal.html.', by: 'martin', date: '2026-09-06', status: 'superseded' },
    { g: 'artifacts', title: 'RFP audit (first public artifact)', url: 'https://claude.ai/code/artifact/275a1c11-6d69-4746-bfaf-19983e79092e', desc: 'The original 3 Sep audit; superseded by /audit.html.', by: 'martin', date: '2026-09-03', status: 'superseded' },
    { g: 'artifacts', title: 'Runbook (first public artifact)', url: 'https://claude.ai/code/artifact/e7d0e72f-ff08-49f6-853e-c1bf0815659f', desc: 'The original localStorage runbook; superseded by /board.html.', by: 'martin', date: '2026-09-03', status: 'superseded' },

    /* ---- proposal hubs ---- */
    { g: 'hubs', title: 'Digital framework proposal (STIHL NZ / board)', url: 'https://digital-framework-proposal.netlify.app', desc: 'The earlier board-facing proposal hub; source for figures and copy.', by: 'martin', date: '2026-06-01', status: 'live' },
    { g: 'hubs', title: 'Digital framework proposal (dealer-facing)', url: 'https://digital-framework-proposal-jun.netlify.app', desc: 'The dealer-facing version of the same hub.', by: 'martin', date: '2026-06-01', status: 'live' },
    { g: 'hubs', title: 'UNIFY landing page', url: 'https://f925.works/unify', desc: 'Public cold-email landing page; pricing surfaces still need the A-04 update (D-04).', by: 'martin', date: '2026-08-20', status: 'live' },

    /* ---- live product ---- */
    { g: 'live', title: 'STIHL SHOP Tauranga', url: 'https://stihlshoptauranga.co.nz', desc: 'The proof site. Lighthouse 96, #1 organic in a week.', by: 'leonel', date: '2026-05-01', status: 'live' },
    { g: 'live', title: 'STIHL SHOP Waihi', url: 'https://stihlshopwaihi.co.nz', desc: 'Second live dealer on the same app.', by: 'leonel', date: '2026-07-01', status: 'live' },
    { g: 'live', title: 'STIHL SHOP Rotorua', url: 'https://stihlshoprotorua.co.nz', desc: 'Third live dealer.', by: 'leonel', date: '2026-08-01', status: 'live' },
    { g: 'live', title: 'Unify platform · admin', url: 'https://stihlshop-platform.f925.works/admin', desc: 'Admin login (hello@f925.works + OTP). Dealer login is at the root.', by: 'leonel', date: '2026-05-11', status: 'live' },
    { g: 'live', title: 'Dealer preview (example: dealer #3)', url: 'https://3.preview.f925.works', desc: 'Any dealer renders at <id>.preview.f925.works without a domain, for reviews before go-live.', by: 'leonel', date: '2026-06-20', status: 'live' },

    /* ---- code, hosting, accounts ---- */
    { g: 'code', title: 'GitHub · multi-tenancy (platform)', url: 'https://github.com/f925-limited/multi-tenancy', desc: 'Express + React admin/dealer portal and public site API. Private, org f925-limited.', by: 'leonel', date: '2026-04-15', status: 'live' },
    { g: 'code', title: 'GitHub · stihl-dealers-website-template', url: 'https://github.com/f925-limited/stihl-dealers-website-template', desc: 'The SvelteKit dealer site serving every dealer domain.', by: 'leonel', date: '2026-04-15', status: 'live' },
    { g: 'code', title: 'DigitalOcean · unify-platform app', url: 'https://cloud.digitalocean.com/apps/643824cc-0a25-469d-b784-fc9b291ba215', desc: 'Insights, logs, env vars, alerts for the platform. Needs DO login.', by: 'leonel', date: '2026-05-11', status: 'live' },
    { g: 'code', title: 'DigitalOcean · unify-dealer-site app', url: 'https://cloud.digitalocean.com/apps/1e05ef8d-c1fd-4da0-8e61-c7467b4dfa41', desc: 'Insights, domains, scaling for the dealer sites. Needs DO login.', by: 'leonel', date: '2026-05-11', status: 'live' },
    { g: 'code', title: 'Resend dashboard', url: 'https://resend.com/emails', desc: 'OTP, invite and notification emails; watch the daily cap. Needs Resend login.', by: 'leonel', date: '2026-05-11', status: 'live' },
    { g: 'code', title: 'Netlify · this war room', url: 'https://app.netlify.com/projects/f925-warroom-eef980', desc: 'Deploys and function logs for the war room itself.', by: 'martin', date: '2026-09-06', status: 'live' },
    { g: 'code', title: 'Load-test kit (rfp/loadtest)', url: 'https://github.com/f925-limited', desc: 'Scripts + README used for the capacity test; lives in Martin’s f925-26 repo under rfp/loadtest/ (not yet pushed).', by: 'martin', date: '2026-09-10', status: 'live' },

    /* ---- source documents ---- */
    { g: 'source', title: 'STIHL SHOP Dealer Website RFP 2026 (PDF)', url: '', desc: 'Issued 4 Sep 2026, 9 pages. Questions due 18 Sep, proposal due 9 Oct, presentations 22–23 Oct. Ask Martin for the file; add a shared link here when it has one.', by: 'mike', date: '2026-09-04', status: 'live' }
  ]
};
