# v0 Builder's Dashboard — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a self-updating developer dashboard site that pulls live activity data from GitHub, showcasing Martin's projects with real commit data, activity heatmap, and sparklines.

**Architecture:** Astro SSG site with Svelte islands for interactivity. Content is split: curated project info in MDX frontmatter, live activity from GitHub GraphQL API fetched at build time. Vercel hosts with daily cron rebuilds. Single-page layout.

**Tech Stack:** Astro 5, Svelte 5, Tailwind CSS 4, Vercel, GitHub GraphQL API

---

### Task 1: Scaffold the Astro project

**Files:**
- Create: `martinmana-v0/` (new project directory)
- Create: `martinmana-v0/package.json`
- Create: `martinmana-v0/astro.config.mjs`
- Create: `martinmana-v0/tailwind.config.mjs`
- Create: `martinmana-v0/tsconfig.json`
- Create: `martinmana-v0/.gitignore`
- Create: `martinmana-v0/.env.example`

**Step 1: Create project with Astro CLI**

```bash
cd /Users/martinmana/Documents/Projects
npm create astro@latest martinmana-v0 -- --template minimal --no-install
cd martinmana-v0
```

**Step 2: Install dependencies**

```bash
npm install
npx astro add svelte tailwind
npm install -D @tailwindcss/typography
```

**Step 3: Configure environment**

Create `.env.example`:
```
GITHUB_TOKEN=ghp_your_personal_access_token
GITHUB_USERNAME=martinmana808
```

Create `.env` with actual token (never committed).

**Step 4: Verify it runs**

```bash
npm run dev
```

Expected: Astro dev server starts on localhost:4321

**Step 5: Initialize git and commit**

```bash
git init
git add .
git commit -m "feat: scaffold Astro project with Svelte + Tailwind"
```

---

### Task 2: Set up the content collection for projects

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/projects/braintube.md`
- Create: `src/content/projects/ragify.md`
- Create: `src/content/projects/808-music-tools.md`
- Create: `src/content/projects/hands-free.md`
- Create: `src/content/projects/budget-app.md`
- Create: `src/content/projects/f925.md`
- Create: `src/content/projects/ai-chat-component.md`
- Create: `src/content/projects/gary-scout.md`
- Create: `src/content/projects/stihl-nz.md`
- Create: `src/content/projects/d4-preview.md`
- Create: `src/content/projects/markdown-beautifier.md`
- Create: `src/content/projects/hands-orchestra.md`
- Create: `src/content/projects/frello.md`
- Create: `src/content/projects/phlook.md`
- Create: `src/content/projects/fit-peanuts.md`
- Create: `src/content/projects/qr-code-generator.md`
- Create: `src/content/projects/winamp-clone.md`
- Create: `src/content/projects/social-system.md`
- Create: `src/content/projects/localhost-overview.md`
- Create: `src/content/projects/benchmarking-lighthouse.md`
- Create: `src/content/projects/ai-dev-tasks.md`
- Create: `src/content/projects/b2b-taiwan.md`
- Create: `src/content/projects/pz-character-builder.md`
- Create: `src/content/projects/seek-it-up.md`

**Step 1: Define the content collection schema**

`src/content.config.ts`:
```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    status: z.enum(['live', 'building', 'exploring', 'paused']),
    tags: z.array(z.string()),
    repo: z.string().optional(),           // GitHub "owner/repo" format
    links: z.object({
      demo: z.string().url().optional(),
      repo: z.string().url().optional(),
      visit: z.string().url().optional(),
    }).optional(),
    featured: z.boolean().default(false),
    hidden: z.boolean().default(false),    // hide from dashboard without deleting
  }),
});

export const collections = { projects };
```

**Step 2: Create all project .md files**

Each file follows this format. Example `src/content/projects/braintube.md`:

```markdown
---
name: Braintube
description: "AI-powered video learning — extract, organize, and quiz yourself on any YouTube content"
status: live
tags: [ai, education, productivity]
repo: martinmana808/BrainTube
links:
  demo: https://braintube.app
  repo: https://github.com/martinmana808/BrainTube
featured: true
---
```

Create all ~25 project files with accurate data pulled from the repo analysis. Use the actual GitHub repo names from the remote URLs discovered earlier:

| Project | Repo | Status |
|---------|------|--------|
| Braintube | martinmana808/BrainTube | live |
| RAGify | (no remote) | building |
| 808 Music Tools | martinmana808/MusicTools | live |
| Hands Free | martinmana808/hands-free | building |
| Budget App | martinmana808/budget-app | building |
| F925 | martinmana808/f925 | live |
| AI Chat Component | martinmana808/ai-chat-component | building |
| Gary Scout | martinmana808/gary-benchmarking | building |
| STIHL NZ | f925-limited/stihl-tauranga | live |
| D4 Preview | martinmana808/d4-preview2 | exploring |
| Markdown Beautifier | martinmana808/markdown-beautifier | live |
| Hands Orchestra | (no remote) | exploring |
| Frello | (no remote) | paused |
| Phlook | (no remote) | paused |
| Fit Peanuts | martinmana808/FitPeanuts | building |
| QR Code Generator | martinmana808/qr-code-generator | live |
| Winamp Clone | martinmana808/winamp-ish | paused |
| Social System | martinmana808/social-system | exploring |
| Localhost Overview | martinmana808/localhost-overview | live |
| Benchmarking Lighthouse | martinmana808/benchmarking-with-lighthouse | live |
| AI Dev Tasks | snarktank/ai-dev-tasks | building |
| B2B Taiwan | martinmana808/b2b-taiwan-scraper | paused |
| PZ Character Builder | martinmana808/pz-character-builder | paused |
| Seek It Up | (no remote) | building |
| AI in Arc | martinmana808/ai-in-arc | exploring |

**Step 3: Verify collection loads**

```bash
npm run dev
```

Check Astro dev console for content collection errors.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add project content collection with 25 projects"
```

---

### Task 3: Build the GitHub data fetching layer

**Files:**
- Create: `src/lib/github.ts`

**Step 1: Write the GitHub API module**

`src/lib/github.ts`:
```typescript
const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
const GITHUB_USERNAME = import.meta.env.GITHUB_USERNAME || 'martinmana808';

interface ContributionDay {
  contributionCount: number;
  date: string;
}

interface Week {
  contributionDays: ContributionDay[];
}

interface RepoActivity {
  lastCommitDate: string;
  lastCommitMessage: string;
  totalCommits: number;
  weeklyActivity: number[]; // last 12 weeks of commit counts
}

interface GlobalActivity {
  totalContributions: number;
  calendar: Week[];
  lastPushDate: string;
  activeRepoCount: number;
}

async function graphql(query: string): Promise<any> {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

export async function getGlobalActivity(): Promise<GlobalActivity> {
  const { data } = await graphql(`{
    user(login: "${GITHUB_USERNAME}") {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
      repositories(first: 100, orderBy: {field: PUSHED_AT, direction: DESC}) {
        nodes {
          pushedAt
        }
      }
    }
  }`);

  const calendar = data.user.contributionsCollection.contributionCalendar;
  const repos = data.user.repositories.nodes;
  const activeRepos = repos.filter((r: any) => {
    const pushed = new Date(r.pushedAt);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return pushed > threeMonthsAgo;
  });

  return {
    totalContributions: calendar.totalContributions,
    calendar: calendar.weeks,
    lastPushDate: repos[0]?.pushedAt || '',
    activeRepoCount: activeRepos.length,
  };
}

export async function getRepoActivity(repoFullName: string): Promise<RepoActivity | null> {
  const [owner, name] = repoFullName.split('/');
  if (!owner || !name) return null;

  try {
    const { data } = await graphql(`{
      repository(owner: "${owner}", name: "${name}") {
        defaultBranchRef {
          target {
            ... on Commit {
              history(first: 1) {
                nodes {
                  message
                  committedDate
                }
                totalCount
              }
            }
          }
        }
      }
    }`);

    const history = data.repository?.defaultBranchRef?.target?.history;
    if (!history) return null;

    const lastCommit = history.nodes[0];

    // Fetch weekly participation for sparkline
    const participationRes = await fetch(
      `https://api.github.com/repos/${repoFullName}/stats/participation`,
      { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } }
    );
    let weeklyActivity: number[] = [];
    if (participationRes.ok) {
      const participation = await participationRes.json();
      weeklyActivity = (participation.owner || []).slice(-12);
    }

    return {
      lastCommitDate: lastCommit?.committedDate || '',
      lastCommitMessage: lastCommit?.message?.split('\n')[0] || '',
      totalCommits: history.totalCount,
      weeklyActivity,
    };
  } catch {
    return null;
  }
}

export async function getRecentCommits(limit = 8): Promise<Array<{
  repo: string;
  message: string;
  date: string;
}>> {
  const { data } = await graphql(`{
    user(login: "${GITHUB_USERNAME}") {
      repositories(first: 15, orderBy: {field: PUSHED_AT, direction: DESC}) {
        nodes {
          name
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 2) {
                  nodes {
                    message
                    committedDate
                  }
                }
              }
            }
          }
        }
      }
    }
  }`);

  const commits: Array<{ repo: string; message: string; date: string }> = [];
  for (const repo of data.user.repositories.nodes) {
    const nodes = repo.defaultBranchRef?.target?.history?.nodes || [];
    for (const commit of nodes) {
      commits.push({
        repo: repo.name,
        message: commit.message.split('\n')[0],
        date: commit.committedDate,
      });
    }
  }

  return commits
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
```

**Step 2: Verify it compiles**

```bash
npm run build
```

Expected: Build succeeds (data won't be fetched until used in pages).

**Step 3: Commit**

```bash
git add src/lib/github.ts
git commit -m "feat: add GitHub API data layer for activity and repo stats"
```

---

### Task 4: Build the base layout and global styles

**Files:**
- Create: `src/layouts/Base.astro`
- Modify: `src/pages/index.astro`
- Create: `src/styles/global.css`

**Step 1: Create global styles**

`src/styles/global.css`:
```css
@import "tailwindcss";

@theme {
  --color-bg: #0a0a0a;
  --color-surface: #111111;
  --color-surface-hover: #1a1a1a;
  --color-text: #e5e5e5;
  --color-text-muted: #737373;
  --color-accent: #89ffc0;
  --color-status-live: #22c55e;
  --color-status-building: #eab308;
  --color-status-exploring: #3b82f6;
  --color-status-paused: #525252;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', ui-monospace, monospace;
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
}
```

**Step 2: Create base layout**

`src/layouts/Base.astro`:
```astro
---
interface Props {
  title?: string;
  description?: string;
}

const {
  title = 'Martin Mana — I build AI products',
  description = 'AI product strategist and builder. You bring the problem, I build the solution.',
} = Astro.props;
---

<!doctype html>
<html lang="en" class="bg-bg text-text">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" />
  </head>
  <body class="min-h-screen font-sans antialiased">
    <slot />
  </body>
</html>
```

**Step 3: Stub the index page**

`src/pages/index.astro`:
```astro
---
import Base from '../layouts/Base.astro';
---

<Base>
  <main class="max-w-3xl mx-auto px-6 py-20">
    <h1 class="text-4xl font-mono font-medium text-white">Martin Mana</h1>
    <p class="mt-4 text-xl text-text-muted">I build AI products.</p>
  </main>
</Base>
```

**Step 4: Verify**

```bash
npm run dev
```

Expected: Dark page with "Martin Mana" in monospace and "I build AI products." beneath it.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add base layout with dark theme and typography"
```

---

### Task 5: Build the Activity Calendar component (Svelte island)

**Files:**
- Create: `src/components/ActivityCalendar.svelte`

**Step 1: Build the contribution heatmap**

`src/components/ActivityCalendar.svelte`:
```svelte
<script lang="ts">
  interface ContributionDay {
    contributionCount: number;
    date: string;
  }

  interface Week {
    contributionDays: ContributionDay[];
  }

  export let weeks: Week[] = [];

  function getColor(count: number): string {
    if (count === 0) return '#161b22';
    if (count <= 2) return '#0e4429';
    if (count <= 4) return '#006d32';
    if (count <= 6) return '#26a641';
    return '#39d353';
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
</script>

<div class="overflow-x-auto pb-2">
  <div class="inline-flex gap-[3px]">
    {#each weeks as week}
      <div class="flex flex-col gap-[3px]">
        {#each week.contributionDays as day}
          <div
            class="w-[11px] h-[11px] rounded-[2px] transition-colors"
            style="background-color: {getColor(day.contributionCount)}"
            title="{day.contributionCount} contributions on {formatDate(day.date)}"
          />
        {/each}
      </div>
    {/each}
  </div>
</div>
```

**Step 2: Verify component renders**

Import into index.astro temporarily to verify:

```astro
---
import ActivityCalendar from '../components/ActivityCalendar.svelte';
// pass mock data to test
---
<ActivityCalendar client:load weeks={[]} />
```

**Step 3: Commit**

```bash
git add src/components/ActivityCalendar.svelte
git commit -m "feat: add GitHub activity calendar heatmap component"
```

---

### Task 6: Build the Activity Pulse stats bar

**Files:**
- Create: `src/components/ActivityPulse.astro`

**Step 1: Build the stats bar**

`src/components/ActivityPulse.astro`:
```astro
---
interface Props {
  totalContributions: number;
  activeRepoCount: number;
  lastPushDate: string;
  projectCount: number;
}

const { totalContributions, activeRepoCount, lastPushDate, projectCount } = Astro.props;

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}
---

<div class="flex flex-wrap gap-x-6 gap-y-2 text-sm font-mono text-text-muted">
  <span><span class="text-white">{projectCount}</span> projects</span>
  <span><span class="text-white">{totalContributions}</span> contributions this year</span>
  <span><span class="text-white">{activeRepoCount}</span> repos active</span>
  <span>last push: <span class="text-white">{timeAgo(lastPushDate)}</span></span>
</div>
```

**Step 2: Commit**

```bash
git add src/components/ActivityPulse.astro
git commit -m "feat: add activity pulse stats bar"
```

---

### Task 7: Build the Recent Commits feed

**Files:**
- Create: `src/components/RecentCommits.astro`

**Step 1: Build the commit ticker**

`src/components/RecentCommits.astro`:
```astro
---
interface Commit {
  repo: string;
  message: string;
  date: string;
}

interface Props {
  commits: Commit[];
}

const { commits } = Astro.props;

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'now';
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return `${Math.floor(diffDays / 7)}w`;
}
---

<div class="space-y-1 font-mono text-xs">
  {commits.map((commit) => (
    <div class="flex gap-4 text-text-muted">
      <span class="w-8 text-right shrink-0">{timeAgo(commit.date)}</span>
      <span class="text-accent w-40 shrink-0 truncate">{commit.repo}</span>
      <span class="text-text truncate">{commit.message}</span>
    </div>
  ))}
</div>
```

**Step 2: Commit**

```bash
git add src/components/RecentCommits.astro
git commit -m "feat: add recent commits feed component"
```

---

### Task 8: Build the Sparkline component (Svelte island)

**Files:**
- Create: `src/components/Sparkline.svelte`

**Step 1: Build the SVG sparkline**

`src/components/Sparkline.svelte`:
```svelte
<script lang="ts">
  export let data: number[] = [];
  export let color: string = '#89ffc0';
  export let width: number = 80;
  export let height: number = 20;

  $: maxVal = Math.max(...data, 1);
  $: points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (v / maxVal) * height;
    return `${x},${y}`;
  }).join(' ');
</script>

{#if data.length > 1}
  <svg {width} {height} class="inline-block align-middle">
    <polyline
      {points}
      fill="none"
      stroke={color}
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
{/if}
```

**Step 2: Commit**

```bash
git add src/components/Sparkline.svelte
git commit -m "feat: add sparkline SVG component for commit activity"
```

---

### Task 9: Build the Project Card component

**Files:**
- Create: `src/components/ProjectCard.astro`

**Step 1: Build the project card**

`src/components/ProjectCard.astro`:
```astro
---
import Sparkline from './Sparkline.svelte';

interface Props {
  name: string;
  description: string;
  status: 'live' | 'building' | 'exploring' | 'paused';
  tags: string[];
  lastCommitDate?: string;
  lastCommitMessage?: string;
  weeklyActivity?: number[];
  links?: {
    demo?: string;
    repo?: string;
    visit?: string;
  };
}

const { name, description, status, tags, lastCommitDate, lastCommitMessage, weeklyActivity, links } = Astro.props;

const statusColors: Record<string, string> = {
  live: 'text-status-live',
  building: 'text-status-building',
  exploring: 'text-status-exploring',
  paused: 'text-status-paused',
};

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}
---

<div class="group p-4 rounded-lg bg-surface hover:bg-surface-hover transition-colors">
  <div class="flex items-start justify-between gap-4">
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-3">
        <h3 class="font-mono font-medium text-white text-sm">{name}</h3>
        <span class={`text-xs font-mono ${statusColors[status]}`}>{status}</span>
        {lastCommitDate && (
          <span class="text-xs text-text-muted font-mono hidden sm:inline">
            · {timeAgo(lastCommitDate)}
          </span>
        )}
      </div>
      <p class="mt-1 text-sm text-text-muted leading-relaxed">{description}</p>
      <div class="mt-2 flex items-center gap-4">
        <div class="flex gap-2">
          {tags.map((tag) => (
            <span class="text-xs text-text-muted font-mono">#{tag}</span>
          ))}
        </div>
      </div>
    </div>
    <div class="flex flex-col items-end gap-2 shrink-0">
      {weeklyActivity && weeklyActivity.length > 1 && (
        <Sparkline client:visible data={weeklyActivity} width={80} height={20} />
      )}
      <div class="flex gap-3">
        {links?.demo && (
          <a href={links.demo} target="_blank" rel="noopener" class="text-xs font-mono text-accent hover:underline">
            try it
          </a>
        )}
        {links?.repo && (
          <a href={links.repo} target="_blank" rel="noopener" class="text-xs font-mono text-text-muted hover:text-white">
            repo
          </a>
        )}
        {links?.visit && (
          <a href={links.visit} target="_blank" rel="noopener" class="text-xs font-mono text-accent hover:underline">
            visit
          </a>
        )}
      </div>
    </div>
  </div>
</div>
```

**Step 2: Commit**

```bash
git add src/components/ProjectCard.astro
git commit -m "feat: add project card with status, sparkline, and links"
```

---

### Task 10: Build the Project Filter (Svelte island)

**Files:**
- Create: `src/components/ProjectFilter.svelte`

**Step 1: Build the tag filter**

`src/components/ProjectFilter.svelte`:
```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let tags: string[] = [];
  export let activeTag: string = 'all';

  const dispatch = createEventDispatcher();

  function select(tag: string) {
    activeTag = tag;
    dispatch('filter', tag);
  }
</script>

<div class="flex flex-wrap gap-2 font-mono text-xs">
  <button
    class="px-3 py-1 rounded-full transition-colors {activeTag === 'all' ? 'bg-accent text-bg' : 'text-text-muted hover:text-white'}"
    on:click={() => select('all')}
  >
    all
  </button>
  {#each tags as tag}
    <button
      class="px-3 py-1 rounded-full transition-colors {activeTag === tag ? 'bg-accent text-bg' : 'text-text-muted hover:text-white'}"
      on:click={() => select(tag)}
    >
      {tag}
    </button>
  {/each}
</div>
```

**Step 2: Commit**

```bash
git add src/components/ProjectFilter.svelte
git commit -m "feat: add project tag filter component"
```

---

### Task 11: Build the ProjectDashboard (Svelte island — orchestrates filter + cards)

**Files:**
- Create: `src/components/ProjectDashboard.svelte`

This is needed because filtering is client-side interactivity — Astro can't do this without JS. The Svelte island receives all project data as props and handles filtering.

**Step 1: Build the dashboard island**

`src/components/ProjectDashboard.svelte`:
```svelte
<script lang="ts">
  import ProjectFilter from './ProjectFilter.svelte';
  import Sparkline from './Sparkline.svelte';

  interface Project {
    name: string;
    description: string;
    status: 'live' | 'building' | 'exploring' | 'paused';
    tags: string[];
    lastCommitDate?: string;
    weeklyActivity?: number[];
    links?: {
      demo?: string;
      repo?: string;
      visit?: string;
    };
  }

  export let projects: Project[] = [];

  let activeTag = 'all';

  $: allTags = [...new Set(projects.flatMap((p) => p.tags))].sort();

  $: filtered = activeTag === 'all'
    ? projects
    : projects.filter((p) => p.tags.includes(activeTag));

  const statusColors: Record<string, string> = {
    live: 'text-green-500',
    building: 'text-yellow-500',
    exploring: 'text-blue-500',
    paused: 'text-neutral-500',
  };

  function timeAgo(dateStr?: string): string {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  }
</script>

<div>
  <div class="mb-6">
    <ProjectFilter tags={allTags} {activeTag} on:filter={(e) => (activeTag = e.detail)} />
  </div>

  <div class="space-y-2">
    {#each filtered as project (project.name)}
      <div class="group p-4 rounded-lg bg-[#111] hover:bg-[#1a1a1a] transition-colors">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-3 flex-wrap">
              <h3 class="font-mono font-medium text-white text-sm">{project.name}</h3>
              <span class="text-xs font-mono {statusColors[project.status]}">{project.status}</span>
              {#if project.lastCommitDate}
                <span class="text-xs text-neutral-500 font-mono hidden sm:inline">
                  · {timeAgo(project.lastCommitDate)}
                </span>
              {/if}
            </div>
            <p class="mt-1 text-sm text-neutral-400 leading-relaxed">{project.description}</p>
            <div class="mt-2 flex gap-2">
              {#each project.tags as tag}
                <span class="text-xs text-neutral-500 font-mono">#{tag}</span>
              {/each}
            </div>
          </div>
          <div class="flex flex-col items-end gap-2 shrink-0">
            {#if project.weeklyActivity && project.weeklyActivity.length > 1}
              <Sparkline data={project.weeklyActivity} width={80} height={20} />
            {/if}
            <div class="flex gap-3">
              {#if project.links?.demo}
                <a href={project.links.demo} target="_blank" rel="noopener"
                   class="text-xs font-mono text-[#89ffc0] hover:underline">try it</a>
              {/if}
              {#if project.links?.repo}
                <a href={project.links.repo} target="_blank" rel="noopener"
                   class="text-xs font-mono text-neutral-500 hover:text-white">repo</a>
              {/if}
              {#if project.links?.visit}
                <a href={project.links.visit} target="_blank" rel="noopener"
                   class="text-xs font-mono text-[#89ffc0] hover:underline">visit</a>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
```

**Step 2: Commit**

```bash
git add src/components/ProjectDashboard.svelte
git commit -m "feat: add project dashboard island with filtering"
```

---

### Task 12: Assemble the full index page

**Files:**
- Modify: `src/pages/index.astro`

**Step 1: Wire everything together**

`src/pages/index.astro`:
```astro
---
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';
import ActivityCalendar from '../components/ActivityCalendar.svelte';
import ActivityPulse from '../components/ActivityPulse.astro';
import RecentCommits from '../components/RecentCommits.astro';
import ProjectDashboard from '../components/ProjectDashboard.svelte';
import { getGlobalActivity, getRepoActivity, getRecentCommits } from '../lib/github';

// Fetch curated project data
const projectEntries = await getCollection('projects');
const visibleProjects = projectEntries.filter((p) => !p.data.hidden);

// Fetch GitHub activity
const globalActivity = await getGlobalActivity();
const recentCommits = await getRecentCommits(8);

// Enrich projects with GitHub data
const projects = await Promise.all(
  visibleProjects.map(async (entry) => {
    const repoActivity = entry.data.repo
      ? await getRepoActivity(entry.data.repo)
      : null;

    return {
      name: entry.data.name,
      description: entry.data.description,
      status: entry.data.status,
      tags: entry.data.tags,
      featured: entry.data.featured,
      lastCommitDate: repoActivity?.lastCommitDate || '',
      weeklyActivity: repoActivity?.weeklyActivity || [],
      links: {
        demo: entry.data.links?.demo,
        repo: entry.data.links?.repo || (entry.data.repo ? `https://github.com/${entry.data.repo}` : undefined),
        visit: entry.data.links?.visit,
      },
    };
  })
);

// Sort: featured first, then by last commit date
projects.sort((a, b) => {
  if (a.featured && !b.featured) return -1;
  if (!a.featured && b.featured) return 1;
  const dateA = a.lastCommitDate ? new Date(a.lastCommitDate).getTime() : 0;
  const dateB = b.lastCommitDate ? new Date(b.lastCommitDate).getTime() : 0;
  return dateB - dateA;
});
---

<Base>
  <main class="max-w-3xl mx-auto px-6">
    <!-- Hero -->
    <section class="pt-20 pb-12">
      <h1 class="text-4xl font-mono font-medium text-white">Martin Mana</h1>
      <p class="mt-4 text-xl text-text-muted">I build AI products.</p>
      <p class="mt-1 text-sm text-text-muted">You bring the problem. I build the solution.</p>
      <a
        href="mailto:hello@martinmana.com"
        class="inline-block mt-6 px-5 py-2 bg-accent text-bg font-mono text-sm font-medium rounded hover:opacity-90 transition-opacity"
      >
        Let's talk
      </a>
    </section>

    <!-- Activity Calendar -->
    <section class="pb-8">
      <ActivityCalendar client:load weeks={globalActivity.calendar} />
    </section>

    <!-- Activity Pulse -->
    <section class="pb-8">
      <ActivityPulse
        totalContributions={globalActivity.totalContributions}
        activeRepoCount={globalActivity.activeRepoCount}
        lastPushDate={globalActivity.lastPushDate}
        projectCount={projects.length}
      />
    </section>

    <!-- Recent Commits -->
    <section class="pb-12">
      <h2 class="text-xs font-mono text-text-muted uppercase tracking-wider mb-3">Latest activity</h2>
      <RecentCommits commits={recentCommits} />
    </section>

    <!-- Projects -->
    <section class="pb-20">
      <h2 class="text-xs font-mono text-text-muted uppercase tracking-wider mb-4">Projects</h2>
      <ProjectDashboard client:load projects={projects} />
    </section>

    <!-- Contact -->
    <footer class="border-t border-neutral-800 py-12">
      <p class="font-mono text-sm text-white">Want to build something together?</p>
      <div class="mt-4 flex gap-6 font-mono text-sm">
        <a href="mailto:hello@martinmana.com" class="text-accent hover:underline">email</a>
        <a href="https://github.com/martinmana808" target="_blank" rel="noopener" class="text-text-muted hover:text-white">github</a>
        <a href="https://linkedin.com/in/martinmana" target="_blank" rel="noopener" class="text-text-muted hover:text-white">linkedin</a>
      </div>
      <p class="mt-8 text-xs text-text-muted font-mono">
        This site updates itself. Powered by what I push.
      </p>
    </footer>
  </main>
</Base>
```

**Step 2: Run dev server and verify full page**

```bash
npm run dev
```

Expected: Full single-page dashboard with hero, calendar, stats, commits, projects, and footer.

**Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: assemble full dashboard page with all components"
```

---

### Task 13: Deploy to Vercel with cron rebuild

**Files:**
- Create: `vercel.json`

**Step 1: Create Vercel config**

`vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/revalidate",
      "schedule": "0 6 * * *"
    }
  ]
}
```

**Step 2: Create the revalidate endpoint**

Create `src/pages/api/revalidate.ts`:
```typescript
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  // This endpoint is hit by Vercel cron.
  // For SSG, the cron triggers a rebuild via Vercel's deploy hook.
  // This is a placeholder — the actual rebuild is triggered by the cron hitting
  // a Vercel Deploy Hook URL configured in the Vercel dashboard.
  return new Response(JSON.stringify({ revalidated: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

Note: For SSG (which Astro uses by default), the daily rebuild is best done via a **Vercel Deploy Hook** triggered by a GitHub Action or external cron. The Vercel cron above works for SSR mode. We'll configure the deploy hook in the Vercel dashboard after first deploy.

**Step 3: Set up Vercel project**

```bash
npx vercel --yes
```

Then in Vercel dashboard:
1. Add environment variable: `GITHUB_TOKEN` = your personal access token
2. Add environment variable: `GITHUB_USERNAME` = martinmana808
3. Create a Deploy Hook (Settings → Git → Deploy Hooks)
4. Optionally set up a GitHub Action to hit the deploy hook daily

**Step 4: Deploy**

```bash
npx vercel --prod
```

**Step 5: Commit**

```bash
git add vercel.json src/pages/api/revalidate.ts
git commit -m "feat: add Vercel config with cron rebuild support"
```

---

### Task 14: Final polish and QA

**Step 1: Test responsive layout**

Open dev server and test at:
- Mobile (375px)
- Tablet (768px)
- Desktop (1280px)

Fix any overflow, truncation, or spacing issues.

**Step 2: Test with no GitHub token (graceful degradation)**

Remove `.env` temporarily and verify the site still builds — projects show without activity data.

**Step 3: Lighthouse audit**

```bash
npm run build && npx serve dist
```

Run Lighthouse. Target:
- Performance: 95+
- Accessibility: 100
- SEO: 100

**Step 4: Final commit**

```bash
git add .
git commit -m "polish: responsive fixes and QA pass"
```

---

## Summary

| Task | What | Est. |
|------|------|------|
| 1 | Scaffold Astro project | 5 min |
| 2 | Content collection + 25 project files | 15 min |
| 3 | GitHub API data layer | 10 min |
| 4 | Base layout + global styles | 5 min |
| 5 | Activity Calendar (Svelte) | 10 min |
| 6 | Activity Pulse stats bar | 5 min |
| 7 | Recent Commits feed | 5 min |
| 8 | Sparkline component (Svelte) | 5 min |
| 9 | Project Card component | 10 min |
| 10 | Project Filter (Svelte) | 5 min |
| 11 | Project Dashboard island | 10 min |
| 12 | Assemble index page | 10 min |
| 13 | Vercel deploy + cron | 10 min |
| 14 | Polish + QA | 15 min |
