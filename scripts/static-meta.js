import fs from 'fs'
import path from 'path'

// Landing pages that get their own static HTML shell.
//
// The app is a client-rendered SPA, so the <meta> tags Svelte writes at runtime
// never reach a link-preview crawler (Gmail, LinkedIn, Facebook, Slack) — those
// read the served HTML and stop. For pages we send people to directly (cold
// email, ads), that means the preview would show the generic F925 card.
//
// This copies the built index.html to dist/<route>/index.html with the page's
// own title, description and OG image baked in. The SPA still boots normally
// and routes on window.location.pathname; the redirect rule in _redirects only
// applies to paths that do not resolve to a real file, so these win.
const pages = [
    {
        route: '/unify',
        title: 'UNIFY — the website platform for STIHL Shop dealers',
        description:
            'A managed website, dealer portal and marketing programme built for STIHL Shop dealers in New Zealand. Live in a week, $2,000 setup, $600/month, everything included — including Gary, your 24/7 AI sales assistant.',
        image: '/og-unify-1200x630.png',
        imageAlt: 'UNIFY — your store, online, done properly.',
    },
    {
        route: '/social-automated-posting',
        title: 'Socials sorted — F925',
        description:
            'Done-for-you social media. F925 designs and publishes on-brand posts to your Facebook and Instagram on a consistent schedule, so your business always looks active. From $59/month, nothing to do.',
        image: '/og-1200x630.png',
        imageAlt: 'F925 — social media, handled.',
    },
]

const SITE = 'https://f925.works'
const dist = path.resolve('dist')

function replaceTag(html, pattern, replacement) {
    return pattern.test(html) ? html.replace(pattern, replacement) : html
}

function build() {
    const source = path.join(dist, 'index.html')
    if (!fs.existsSync(source)) {
        console.error('static-meta: dist/index.html not found — run the build first.')
        process.exit(1)
    }
    const base = fs.readFileSync(source, 'utf8')

    pages.forEach((page) => {
        const url = `${SITE}${page.route}`
        let html = base

        html = replaceTag(
            html,
            /<meta property="og:url" content="[^"]*" \/>/,
            `<meta property="og:url" content="${url}" />`,
        )
        html = replaceTag(
            html,
            /<meta property="og:title" content="[^"]*" \/>/,
            `<meta property="og:title" content="${page.title}" />`,
        )
        html = replaceTag(
            html,
            /<meta\s+property="og:description"\s+content="[\s\S]*?" \/>/,
            `<meta property="og:description" content="${page.description}" />`,
        )
        html = replaceTag(
            html,
            /<meta property="og:image" content="[^"]*" \/>/,
            `<meta property="og:image" content="${SITE}${page.image}" />`,
        )
        html = replaceTag(
            html,
            /<meta property="og:image:alt" content="[^"]*" \/>/,
            `<meta property="og:image:alt" content="${page.imageAlt}" />`,
        )

        // The shell has no <title>/description/canonical of its own (Svelte adds
        // them at runtime), so insert them ahead of </head> for the crawlers.
        html = html.replace(
            '</head>',
            `    <title>${page.title}</title>\n` +
                `        <meta name="description" content="${page.description}" />\n` +
                `        <link rel="canonical" href="${url}" />\n` +
                `        <meta name="twitter:card" content="summary_large_image" />\n` +
                `        <meta name="twitter:title" content="${page.title}" />\n` +
                `        <meta name="twitter:description" content="${page.description}" />\n` +
                `        <meta name="twitter:image" content="${SITE}${page.image}" />\n` +
                `    </head>`,
        )

        const dir = path.join(dist, page.route.replace(/^\//, ''))
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.join(dir, 'index.html'), html)
        console.log(`static-meta: wrote dist${page.route}/index.html`)
    })
}

build()
