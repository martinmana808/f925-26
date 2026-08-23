<script>
    import { onMount, onDestroy } from 'svelte'
    import GaryChat from '../components/GaryChat.svelte'
    import { openGary } from '../stores/gary.js'
    // Imported so Vite hands back the hashed URLs, which lets the two faces the
    // page actually opens with be preloaded instead of discovered inside CSS.
    import interRegular from '../assets/fonts/Inter-Regular.woff2'
    import interSemiBold from '../assets/fonts/Inter-SemiBold.woff2'

    // Standalone landing page: it deliberately does NOT use <Layout>, so none
    // of the main site's global stylesheet loads here. Everything this page
    // needs lives in the <style> block below.

    const TAURANGA = 'https://stihlshoptauranga.co.nz'
    const SETUP = '$2,000'
    const MONTHLY = '$600'

    let currentPath = typeof window !== 'undefined' ? window.location.pathname : '/unify'
    let dealerName = ''
    let formMessage = ''
    let scrolled = false
    let menuOpen = false

    function handleScroll() {
        scrolled = window.scrollY > 40
    }

    function closeMenu() {
        menuOpen = false
    }

    onMount(() => {
        document.body.classList.add('unify-body')
        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true })

        // Reveal-on-scroll. Elements are only *hidden* once we know we can show
        // them again (is-armed is added here, not in the markup), so if the
        // observer never fires — old browser, JS error, bot — the page is
        // simply visible rather than blank.
        const els = Array.from(document.querySelectorAll('.reveal'))
        let io
        let unbindSweep = () => {}
        if ('IntersectionObserver' in window) {
            els.forEach((el) => el.classList.add('is-armed'))
            io = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.remove('is-armed')
                            io.unobserve(entry.target)
                        }
                    })
                },
                { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
            )
            els.forEach((el) => io.observe(el))
            // Safety net. If the observer never fires — a browser quirk, a
            // headless renderer, anything — a scroll-driven check still
            // un-hides everything that has reached the viewport, so the page
            // can never end up blank.
            let ticking = false
            const sweep = () => {
                ticking = false
                let remaining = 0
                els.forEach((el) => {
                    if (!el.classList.contains('is-armed')) return
                    const r = el.getBoundingClientRect()
                    if (r.top < window.innerHeight * 0.95) el.classList.remove('is-armed')
                    else remaining++
                })
                if (!remaining) window.removeEventListener('scroll', onScroll)
            }
            const onScroll = () => {
                if (ticking) return
                ticking = true
                requestAnimationFrame(sweep)
            }
            window.addEventListener('scroll', onScroll, { passive: true })
            unbindSweep = () => window.removeEventListener('scroll', onScroll)
            setTimeout(sweep, 1200)
        }

        return () => {
            window.removeEventListener('scroll', handleScroll)
            unbindSweep()
            io?.disconnect()
        }
    })

    onDestroy(() => {
        if (typeof document !== 'undefined') document.body.classList.remove('unify-body')
    })

    function handleSubmit(event) {
        event.preventDefault()
        const form = event.target
        const formData = new FormData(form)

        // Honeypot — a real visitor never sees this field.
        if (formData.get('Website')) {
            formMessage = 'Success'
            return
        }

        fetch(form.action, { method: 'POST', body: formData })
            .then((response) => {
                if (response.ok) {
                    formMessage = 'Success'
                    if (typeof window.gtag === 'function') {
                        window.gtag('event', 'generate_lead', {
                            event_category: 'unify-landing',
                            event_label: formData.get('Dealership') || '',
                        })
                    }
                } else {
                    return response.json().then((data) => {
                        formMessage = `Error: ${data.error}`
                    })
                }
            })
            .catch((error) => {
                formMessage = `Error: ${error.message}`
            })
    }

    // Section numbering is derived from this list, so hiding a section (comment
    // out its entry AND its markup below) renumbers everything after it.
    const sectionOrder = [
        'why',
        // 'platform',  — hidden for now
        'included',
        'maths',
        'gary',
        'proof',
        'how',
        'pricing',
        'faq',
        'start',
    ]
    const no = (key) => String(sectionOrder.indexOf(key) + 1).padStart(2, '0')

    const navLinks = [
        { href: '#why', label: 'Why' },
        // { href: '#platform', label: 'The platform' },  — hidden with the section
        { href: '#included', label: "What's included" },
        { href: '#maths', label: 'The maths' },
        { href: '#proof', label: 'Proof' },
        { href: '#pricing', label: 'Pricing' },
        { href: '#faq', label: 'FAQ' },
    ]

    const heroStats = [
        { value: '88', label: 'STIHL Shop dealers in New Zealand' },
        { value: '96', suffix: '/100', label: 'Lighthouse mobile score, live site' },
        { value: '#1', label: 'Organic in Tauranga, inside a week' },
        { value: '7', suffix: ' days', label: 'From go-live to first workshop booking' },
    ]

    const behaviour = [
        {
            value: '91%',
            title: 'already buy online',
            body: 'of New Zealand consumers bought something online in the last six months. The journey starts online even when the sale finishes at your counter.',
            source: 'MBIE / Commerce Commission NZ Consumer Survey 2024',
        },
        {
            value: '76%',
            title: 'search, then visit',
            body: 'of mobile “near me” searches end in a store visit within a day — and 28% of those end in a purchase. That is exactly the demand a dealer site is built to catch.',
            source: 'Think with Google — Mobile Search Connects Consumers to Stores',
        },
        {
            value: '47%',
            title: 'of NZ businesses have no site',
            body: 'and customers still rank a website as the most important way to engage with a business — ahead of social, ahead of email.',
            source: 'InternetNZ 2025 .nz Consumers and Businesses Research',
        },
    ]

    const trend = [
        { year: '2020', value: 58 },
        { year: '2022', value: 62 },
        { year: '2024', value: 65 },
    ]

    const scenarios = [
        {
            tag: 'Scenario A',
            title: 'No website at all',
            body: 'A Google Maps pin and a Facebook page. Anyone who does not already know you cannot find you, cannot check your hours, and cannot book the workshop. Over half the network is here.',
        },
        {
            tag: 'Scenario B',
            title: 'A DIY or agency site',
            body: 'A template built once and never touched. Last spring’s promo still on the homepage, slow on a phone, off-brand colours, a contact form nobody has tested since 2022. It is working against you.',
        },
        {
            tag: 'Scenario C',
            title: 'You manage it yourself',
            body: 'Saturday morning, coffee in hand, trying to remember a hosting password. The promo never goes up. The hours are still last summer’s. It is another job — and the easiest one to push to next week, forever.',
        },
    ]

    const architecture = [
        {
            step: '01',
            title: 'Request lands',
            body: 'A customer opens yourstore.co.nz — your own domain, your own brand.',
        },
        {
            step: '02',
            title: 'Tenant resolved',
            body: 'The platform reads the domain, finds your dealer record, and attaches your data to the request.',
        },
        {
            step: '03',
            title: 'Page renders',
            body: 'The same battle-tested components render against your content — your team, your hours, your services, your specials.',
        },
        {
            step: '04',
            title: 'Customer converts',
            body: 'They see a site indistinguishable from a bespoke build — and book, call, or walk in.',
        },
    ]

    const stack = [
        { k: 'SvelteKit', v: 'Hand-built app, no page builder' },
        { k: 'PostgreSQL', v: 'One multi-tenant database' },
        { k: 'Cloudflare', v: 'Edge-cached worldwide' },
        { k: '99.9%', v: 'Uptime, monitored 24/7' },
        { k: '< 1s', v: 'Time-to-interactive on 4G' },
        { k: 'Daily', v: 'Backups, SSL, security patching' },
    ]

    const pillars = [
        {
            n: '01',
            title: 'The website',
            lead: 'Fast, modern, and as premium as your shop floor.',
            icon: 'monitor',
            items: [
                'Custom-branded site on your own domain — not a template',
                'Lighthouse 90+ mobile performance, sub-second loads',
                'Mobile-first: tappable buttons, click-to-call, thumb-friendly forms',
                'Your team, your story, your services, your workshop',
                'Connected to the full STIHL catalogue — always current',
                'Workshop bookings and parts enquiries straight to your inbox',
                'SSL, daily backups, monitoring, 99.9% uptime',
            ],
        },
        {
            n: '02',
            title: 'The platform',
            lead: 'One login. Request a change. It is live within 48 hours.',
            icon: 'panel',
            items: [
                'A dealer portal built for a busy shop owner, not a developer',
                'Change anything: hours, team, photos, prices, promos, copy',
                '48-hour completion guarantee on every request',
                'Unlimited change requests — never a per-edit fee',
                'Timestamped history of every change, nothing lost',
                'Two-factor secured, works on your phone',
                'One inbox, one number, real humans — no agency layers',
            ],
        },
        {
            n: '03',
            title: 'The marketing',
            lead: 'Your site stays on the frontline without you touching it.',
            icon: 'signal',
            items: [
                'Local SEO built to rank you in your own catchment',
                '4 network blog posts a week, written and published for you',
                '1 local SEO post a month, tuned to your town and season',
                'STIHL national promos rolled out to your site automatically',
                'New product launches and news synced network-wide',
                'Google Business Profile, schema markup, local citations',
                'Gary, your 24/7 AI sales assistant — included',
            ],
        },
    ]

    const alacarte = [
        { item: 'Custom website design & build', market: '$8,000 – $25,000 one-off', ours: 'Included' },
        { item: 'Local SEO programme', market: '$800 – $2,000 / month', ours: 'Included' },
        { item: 'Content marketing — 4+ posts a month', market: '$600 – $1,500 / month', ours: 'Included' },
        { item: 'Managed hosting, SSL, backups, monitoring', market: '$50 – $250 / month', ours: 'Included' },
        { item: 'AI chat assistant (Intercom/Drift class)', market: '$150 – $600 / month', ours: 'Included' },
        { item: 'Unlimited content updates & change requests', market: '$120 – $200 / hour', ours: 'Included' },
    ]

    const workload = [
        {
            value: '8 hrs',
            unit: 'a week',
            label: 'Average time an NZ small-business owner spends on marketing and website admin.',
            tone: 'bad',
            source: 'HubSpot SMB time-use benchmark',
        },
        {
            value: '~5 min',
            unit: 'a week',
            label: 'Typical UNIFY dealer time: skim what we published, tick off a change request.',
            tone: 'good',
        },
        {
            value: '395 hrs',
            unit: 'back, per year',
            label: 'Nearly ten working weeks returned to the floor, the workshop and the counter.',
            tone: 'good',
        },
    ]

    const projections = [
        {
            metric: 'Findability',
            change: '+30%',
            body: 'in-store visits following a local mobile search, once you actually rank in your catchment.',
            source: 'Google “near me” store-visit data',
        },
        {
            metric: 'Mobile conversion',
            change: '+27%',
            body: 'higher conversion on a mobile-first build versus a non-responsive or slow one.',
            source: 'Google / SOASTA mobile performance research',
        },
        {
            metric: 'Speed loss avoided',
            change: '−32%',
            body: 'is what a 1s → 3s load time does to conversion. Your site loads in under a second.',
            source: 'Google / SOASTA',
        },
        {
            metric: 'After-hours capture',
            change: '~60%',
            body: 'of digital intent lands outside trading hours. Gary answers it instead of a dead contact form.',
            source: 'Retail conversational-commerce benchmarks',
        },
        {
            metric: 'Campaign sync',
            change: '100%',
            body: 'aligned with STIHL national campaigns — new promos live on your site the day they launch.',
            source: 'Platform-wide rollout',
        },
        {
            metric: 'Admin time',
            change: '−99%',
            body: 'of the hours you currently lose to website admin, content and troubleshooting.',
            source: 'HubSpot SMB benchmark vs UNIFY dealer average',
        },
    ]

    const garyChat = [
        { from: 'them', text: 'Hi, my chainsaw won’t start. Can you guys fix it?' },
        {
            from: 'gary',
            text: 'Yeah mate, we can have a look. Quick one — what model is it, and is it not turning over at all, or it turns but won’t catch?',
        },
        { from: 'them', text: 'It’s an MS 250. Pulls fine but won’t catch.' },
        {
            from: 'gary',
            text: 'Sounds like a fuel or spark issue — common on the 250. We can take a look first thing Monday. Want me to grab your details so the workshop can ring you when they open?',
        },
        { from: 'them', text: 'Yes please. James Mackie, 027 555 8821.' },
        {
            from: 'gary',
            text: 'Sweet as. Booked in for Monday morning — we’ll ring you around 8:30. Anything else you want us to check while it’s here?',
        },
    ]

    const garyPoints = [
        {
            title: 'Answers product questions in plain English',
            body: '“What’s the difference between the MS 211 and the MS 251?” — explained like a mechanic, not a brochure.',
        },
        {
            title: 'Recommends the right tool for the job',
            body: 'The customer describes their block, their job and their budget. Gary suggests the right saw — not the highest-margin one.',
        },
        {
            title: 'Qualifies before you ever see the lead',
            body: 'What they need, what they have used before, what they want. Half the discovery is done before it hits your inbox.',
        },
        {
            title: 'Books workshop jobs and parts enquiries',
            body: 'Contact details, problem description, urgency — captured overnight, in your email by morning.',
        },
        {
            title: 'Knows local conditions',
            body: 'Lifestyle blocks, gorse country, wet Bay of Plenty autumns. Trained on the STIHL range and on New Zealand jobs.',
        },
        {
            title: 'Will not make things up',
            body: 'No unverified prices, no invented specs. If Gary does not know, he takes a message for your team.',
        },
    ]

    const steps = [
        {
            n: '01',
            title: 'One 30-minute call',
            body: 'We collect your local content — team, services, hours, photos, the specials you run. No technical knowledge needed, no forms to wrestle with.',
        },
        {
            n: '02',
            title: 'We build your store',
            body: 'Your site is assembled on the shared core, so performance, security, brand alignment and SEO are already in it. Photography compressed, domain configured, Gary trained.',
        },
        {
            n: '03',
            title: 'You review it',
            body: 'You look at your site and tell us what to change. We make the changes. You never touch code, templates or a CMS.',
        },
        {
            n: '04',
            title: 'Live in about a week',
            body: 'Domain points at the platform, the site goes live, and workshop bookings start landing in your inbox.',
        },
        {
            n: '05',
            title: 'We run it forever',
            body: 'Content, SEO, promos, updates, security, hosting, Gary. You request a change when you want one, and get on with the shop.',
        },
    ]

    const includedAll = [
        'Custom-branded website on your own domain',
        'Dealer portal with unlimited change requests',
        '48-hour completion guarantee',
        'Local SEO programme for your catchment',
        '4 blog posts a week + 1 local post a month',
        'STIHL national promos rolled out automatically',
        'Gary, the AI sales assistant — unlimited conversations',
        'Hosting, SSL, CDN, daily backups, monitoring',
        'Workshop bookings and enquiries to your inbox',
        'Google Business Profile and schema setup',
        'Performance monitoring and ongoing improvements',
        'Every platform feature we ship, forever',
    ]

    const notIncluded = [
        'No “Pro” tier to upgrade to',
        'No per-message AI fees',
        'No per-blog-post charges',
        'No pay-per-change fees',
        'No separate hosting or SSL bill',
        'No lock-in contract — 60 days notice',
    ]

    const faqs = [
        {
            q: 'There’s a guy doing websites for a fraction of this. Why are you more?',
            a: 'Because it is a different category. The cheap option is an off-the-shelf template, copied between shops, with no SEO, no content programme and no support beyond “is it broken?”. UNIFY is a custom build on a purpose-made platform, ranked locally, brand-aligned with STIHL, with every change, every blog post and every promo handled for you. If you just want a cheap website, buy the cheap website. If you want a storefront that compounds, this is it.',
        },
        {
            q: 'I don’t know tech. I’m 55. Will I actually be able to use it?',
            a: 'You do not need to be technical at all. You log in with one password, click the thing you want changed — Saturday hours, a new team photo, a winter promo — type it, and hit submit. That is the whole job. We make the change and it is live within 48 hours. It was designed for a shop owner with a coffee in one hand, not for someone who knows what WordPress means.',
        },
        {
            q: 'My mate’s son could build me a Wix site for free.',
            a: 'He could. And in six months, when it breaks, he is at uni. The build is the easy 10%. The other 90% is keeping it fast, secure, indexed, current with STIHL promos, back online when it falls over on a Sunday, and full of content that actually ranks. That is a job. We do it every day.',
        },
        {
            q: 'I already have a Facebook page. Isn’t that enough?',
            a: 'Facebook keeps the customers you already have. Google finds the ones you have not met. When someone in your catchment types “STIHL chainsaw [your town]”, your Facebook page will not be the first result — a properly built local site will. We do not replace your Facebook; we win the searches it cannot.',
        },
        {
            q: 'What if I want to leave? Who owns the site?',
            a: 'You do. Your domain is yours, your content is yours, your customer relationships are yours. Walk any time with 60 days notice and we will export your content and blog posts for you. No lock-in, no hostage domain. If we are worth it you stay; if we are not, you go.',
        },
        {
            q: 'What if my STIHL dealer agreement changes?',
            a: 'The site stays yours. Your domain, your content and your customers do not depend on your STIHL agreement. If something changes on the STIHL side we adapt the site with you — the branding shifts, your local positioning shifts, the site keeps running. We are aligned with STIHL, but we work for you.',
        },
        {
            q: 'The setup fee feels like a lot up front.',
            a: 'It covers everything that happens before your site goes live — discovery, design, the build, content, image work, SEO setup, domain configuration and brand alignment. It can be split across your first three months so most dealers barely feel it. Set against a short run of radio, it is a fraction of the spend — except this is still working and still earning a year later.',
        },
        {
            q: 'I tried a website once and it did nothing.',
            a: 'Most dealer sites in New Zealand never had a chance: a slow template dropped onto Google with no plan to rank and nobody adding content. UNIFY was designed from the ground up for one job — ranking dealers in their local catchment. STIHL Shop Tauranga hit the #1 organic spot for local STIHL searches inside a week of going live, with zero paid spend.',
        },
    ]

    const sitePages = [
        { src: '/assets/images/unify/site-home.webp', label: 'Home' },
        { src: '/assets/images/unify/site-products.webp', label: 'Products' },
        { src: '/assets/images/unify/site-services.webp', label: 'Services & workshop' },
        { src: '/assets/images/unify/site-about.webp', label: 'About the shop' },
        { src: '/assets/images/unify/site-blog.webp', label: 'Tips & guides' },
        { src: '/assets/images/unify/site-contact.webp', label: 'Contact' },
    ]

    // 24×24 stroke icons, drawn inline so the page has no icon-font dependency.
    const icons = {
        monitor: 'M3 4h18v12H3zM8 20h8M12 16v4',
        panel: 'M3 4h18v16H3zM3 9h18M8 9v11',
        signal: 'M4 20V10M10 20V4M16 20v-7M22 20V7',
        bolt: 'M13 2 4 14h7l-1 8 9-12h-7z',
        clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
        shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
        search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
        chat: 'M21 15a4 4 0 0 1-4 4H8l-5 3V6a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z',
        check: 'M4 12.5 9 17.5 20 6.5',
        cross: 'M6 6l12 12M18 6 6 18',
        arrow: 'M5 12h14M13 6l6 6-6 6',
    }
</script>

<svelte:head>
    <link rel="preconnect" href="https://usebasin.com" />
    <link rel="preload" href={interRegular} as="font" type="font/woff2" crossorigin="anonymous" />
    <link rel="preload" href={interSemiBold} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<div class="unify">
    <!-- ══════════════════════════════════════════ NAV -->
    <header class="nav" class:is-scrolled={scrolled}>
        <div class="nav__inner shell">
            <a class="brand" href="#top" on:click={closeMenu}>
                <svg class="brand__mark" viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M4 6h8M4 12h14M4 18h14M4 24h8" />
                    <path d="M18 12c6 0 6 8 0 8" />
                    <circle cx="26" cy="16" r="3" />
                </svg>
                <span class="brand__type">
                    UNIFY
                    <span class="brand__by">by F925</span>
                </span>
            </a>

            <nav class="nav__links" class:is-open={menuOpen}>
                {#each navLinks as link}
                    <a href={link.href} on:click={closeMenu}>{link.label}</a>
                {/each}
            </nav>

            <div class="nav__right">
                <a class="btn btn--primary btn--sm" href="#start">Get your store online</a>
                <button
                    class="nav__toggle"
                    type="button"
                    aria-label="Menu"
                    aria-expanded={menuOpen}
                    on:click={() => (menuOpen = !menuOpen)}>
                    <span></span><span></span><span></span>
                </button>
            </div>
        </div>
    </header>

    <!-- ══════════════════════════════════════════ HERO -->
    <section class="hero" id="top">
        <div class="hero__glow" aria-hidden="true"></div>
        <div class="hero__grid-bg" aria-hidden="true"></div>

        <div class="shell hero__inner">
            <div class="hero__copy">
                <div class="eyebrow">
                    <span class="dot"></span>
                    For STIHL Shop dealers · New Zealand
                </div>
                <h1 class="h1">
                    Your store. Online.
                    <span class="grad">Done properly.</span>
                </h1>
                <p class="lead">
                    UNIFY is the managed website platform built specifically for STIHL Shop dealers.
                    One flat monthly fee, and every digital job — the site, the hosting, the SEO, the
                    content, the promos, the AI assistant — comes off your desk permanently.
                </p>

                <div class="hero__cta">
                    <a class="btn btn--primary" href="#start">
                        Get your store online
                        <svg viewBox="0 0 24 24" class="ico" aria-hidden="true">
                            <path d={icons.arrow} />
                        </svg>
                    </a>
                    <a class="btn btn--ghost" href={TAURANGA} target="_blank" rel="noopener">
                        See a live dealer site
                    </a>
                </div>

                <div class="hero__price">
                    <strong>{SETUP}</strong> setup <span class="sep">·</span>
                    <strong>{MONTHLY}</strong> a month <span class="sep">·</span> everything included
                </div>
            </div>

            <div class="hero__visual">
                <div class="browser">
                    <div class="browser__bar">
                        <span class="browser__dot"></span>
                        <span class="browser__dot"></span>
                        <span class="browser__dot"></span>
                        <span class="browser__url">stihlshoptauranga.co.nz</span>
                    </div>
                    <img
                        src="/assets/images/unify/site-home.webp"
                        alt="STIHL Shop Tauranga homepage, built on the UNIFY platform"
                        width="1800"
                        height="988"
                        loading="eager" />
                </div>

                <div class="float float--score">
                    <div class="float__value">96<span>/100</span></div>
                    <div class="float__label">Lighthouse mobile</div>
                </div>

                <div class="float float--rank">
                    <svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d={icons.search} /></svg>
                    <div>
                        <div class="float__value float__value--sm">#1 organic</div>
                        <div class="float__label">“chainsaw Tauranga”, week one</div>
                    </div>
                </div>

                <div class="float float--gary">
                    <span class="pulse"></span>
                    Gary answered 3 enquiries last night
                </div>
            </div>
        </div>

        <div class="shell">
            <div class="statbar">
                {#each heroStats as s}
                    <div class="statbar__item">
                        <div class="statbar__value">{s.value}{#if s.suffix}<span>{s.suffix}</span>{/if}</div>
                        <div class="statbar__label">{s.label}</div>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <!-- ══════════════════════════════════════════ WHY -->
    <section class="section" id="why">
        <div class="shell">
            <div class="section__head reveal">
                <div class="kicker">{no('why')} — Why this exists</div>
                <h2 class="h2">By the time they walk in, they’ve already Googled you.</h2>
                <p class="section__lead">
                    A customer in your catchment is thinking about a chainsaw, a ride-on, or a service.
                    Before they call, before they drive, before they walk in — they search. What they find
                    decides whether you get the visit at all. You never hear about the ones you don’t get.
                </p>
            </div>

            <div class="cards-3">
                {#each behaviour as b, i}
                    <article class="card card--stat reveal" style="--d:{i * 80}ms">
                        <div class="card__value">{b.value}</div>
                        <h3 class="card__title">{b.title}</h3>
                        <p>{b.body}</p>
                        <div class="card__source">{b.source}</div>
                    </article>
                {/each}
            </div>

            <div class="trend reveal">
                <div class="trend__copy">
                    <h3 class="h3">And the curve only goes one way.</h3>
                    <p>
                        Frequent online shoppers in New Zealand, year on year. Another 19% shop online at
                        least weekly. This is not a phase that reverses — it is the new baseline your shop
                        is being measured against.
                    </p>
                    <div class="card__source">MBIE / Commerce Commission NZ Consumer Survey 2024</div>
                </div>
                <div class="trend__chart">
                    {#each trend as t}
                        <div class="trend__col">
                            <div class="trend__bar" style="--h:{t.value}%">
                                <span class="trend__val">{t.value}%</span>
                            </div>
                            <div class="trend__year">{t.year}</div>
                        </div>
                    {/each}
                </div>
            </div>

            <div class="section__head section__head--sub reveal">
                <h3 class="h3">Right now, most dealers are in one of three places. None of them work.</h3>
            </div>

            <div class="cards-3">
                {#each scenarios as s, i}
                    <article class="card card--bad reveal" style="--d:{i * 80}ms">
                        <div class="card__tag">{s.tag}</div>
                        <h3 class="card__title">{s.title}</h3>
                        <p>{s.body}</p>
                    </article>
                {/each}
            </div>

            <p class="pullquote reveal">
                All three cost you customers quietly, every week, by default. Your shop’s digital front
                door is open whether you set one up or not — the only question is whether
                <em>you</em> own it.
            </p>
        </div>
    </section>

    <!-- ══════════════════════════════════════════ PLATFORM — HIDDEN
         "What UNIFY actually is". Parked for now: re-enable by restoring
         the 'platform' entry in sectionOrder and navLinks above, then
         removing this comment wrapper.

    <section class="section section--alt" id="platform">
        <div class="shell">
            <div class="section__head reveal">
                <div class="kicker">{no('platform')} — What UNIFY actually is</div>
                <h2 class="h2">One platform. Every STIHL Shop. Your storefront on top of it.</h2>
                <p class="section__lead">
                    UNIFY is not a website builder and it is not an agency retainer. It is a single piece
                    of software — one codebase, one database, one operations team — that runs a premium
                    website for every dealer in the network. Your site is your own domain, your own photos,
                    your own team, your own hours. The engine underneath is shared, which is exactly why
                    it costs what a template costs and performs like an enterprise build.
                </p>
            </div>

            <div class="arch reveal">
                {#each architecture as a}
                    <div class="arch__step">
                        <div class="arch__num">{a.step}</div>
                        <h4>{a.title}</h4>
                        <p>{a.body}</p>
                    </div>
                {/each}
            </div>

            <div class="split reveal">
                <div class="split__copy">
                    <h3 class="h3">Shared engine. Local shop.</h3>
                    <p>
                        Everything that should be identical across the network — performance, security,
                        accessibility, SEO structure, brand standards, the STIHL catalogue — is built once
                        and maintained centrally. Everything that makes you <em>you</em> is yours: the team
                        photos, the workshop, the local services, the specials in the front window.
                    </p>
                    <ul class="ticks">
                        <li>One improvement ships to every dealer at once — you get upgrades you never asked for.</li>
                        <li>A STIHL national campaign lands on your site the day it launches. You do nothing.</li>
                        <li>No plugins to update, no themes to break, no hosting account to babysit.</li>
                        <li>Your domain, your content, your customer relationships — always yours.</li>
                    </ul>
                </div>
                <div class="split__panel">
                    <div class="panel-label">Under the hood</div>
                    <div class="stackgrid">
                        {#each stack as s}
                            <div class="stackgrid__item">
                                <div class="stackgrid__k">{s.k}</div>
                                <div class="stackgrid__v">{s.v}</div>
                            </div>
                        {/each}
                    </div>
                    <div class="panel-note">
                        Purpose-built software, not a Wix template or a WordPress plugin farm — the same
                        calibre of stack you would find at a fast-moving software company.
                    </div>
                </div>
            </div>
        </div>
    </section>
    -->

    <!-- ══════════════════════════════════════════ INCLUDED -->
    <section class="section" id="included">
        <div class="shell">
            <div class="section__head reveal">
                <div class="kicker">{no('included')} — What you get</div>
                <h2 class="h2">Your entire digital department, in one package.</h2>
                <p class="section__lead">
                    Website, platform and marketing. Assembled à la carte in New Zealand today, that is four
                    vendors, four logins, four invoices and four people to chase. Here it is one number,
                    one inbox, and everything below simply included — for everyone, at the same price.
                </p>
            </div>

            <div class="pillars">
                {#each pillars as p, i}
                    <article class="pillar reveal" style="--d:{i * 90}ms">
                        <div class="pillar__head">
                            <span class="pillar__icon">
                                <svg viewBox="0 0 24 24" class="ico" aria-hidden="true">
                                    <path d={icons[p.icon]} />
                                </svg>
                            </span>
                            <span class="pillar__n">{p.n}</span>
                        </div>
                        <h3 class="h3">{p.title}</h3>
                        <p class="pillar__lead">{p.lead}</p>
                        <ul class="ticks">
                            {#each p.items as item}
                                <li>{item}</li>
                            {/each}
                        </ul>
                    </article>
                {/each}
            </div>

            <div class="table-wrap reveal">
                <div class="table-head">
                    <h3 class="h3">What this replaces</h3>
                    <p>
                        Typical New Zealand market rates for each piece, bought separately. Indicative
                        ranges — but the shape of the number is the point.
                    </p>
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>The component</th>
                            <th>Bought separately</th>
                            <th>In your package</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each alacarte as row}
                            <tr>
                                <td data-label="Component">{row.item}</td>
                                <td class="table__market" data-label="Bought separately">{row.market}</td>
                                <td class="table__ours" data-label="With UNIFY">
                                    <svg viewBox="0 0 24 24" class="ico ico--check" aria-hidden="true">
                                        <path d={icons.check} />
                                    </svg>
                                    {row.ours}
                                </td>
                            </tr>
                        {/each}
                        <tr class="table__total">
                            <td data-label="Component">All of it, run for you, every month</td>
                            <td class="table__market" data-label="Bought separately">4 vendors · 4 invoices</td>
                            <td class="table__ours" data-label="With UNIFY">{MONTHLY} / month</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>

    <!-- ══════════════════════════════════════════ THE MATHS -->
    <section class="section section--alt" id="maths">
        <div class="shell">
            <div class="section__head reveal">
                <div class="kicker">{no('maths')} — The maths</div>
                <h2 class="h2">Ten working weeks a year, handed back to you.</h2>
                <p class="section__lead">
                    The cost of doing this yourself is not the hosting bill. It is the Saturday mornings,
                    the password resets, the promo that never went up, and the customer who searched at
                    9pm and found nothing. Here is what changes, in numbers.
                </p>
            </div>

            <div class="workload reveal">
                {#each workload as w}
                    <div class="workload__item" class:is-bad={w.tone === 'bad'}>
                        <div class="workload__value">{w.value}<span>{w.unit}</span></div>
                        <p>{w.label}</p>
                        {#if w.source}<div class="card__source">{w.source}</div>{/if}
                    </div>
                {/each}
            </div>

            <div class="hours reveal">
                <div class="hours__row">
                    <div class="hours__label">Your week today</div>
                    <div class="hours__track"><div class="hours__fill hours__fill--bad" style="width:100%">8 hours of digital admin</div></div>
                </div>
                <div class="hours__row">
                    <div class="hours__label">Your week on UNIFY</div>
                    <div class="hours__track"><div class="hours__fill hours__fill--good" style="width:2%"></div><span class="hours__tag">~5 minutes</span></div>
                </div>
                <div class="hours__note">
                    400 hours a year versus roughly 4. That difference is the product.
                </div>
            </div>

            <div class="section__head section__head--sub reveal">
                <h3 class="h3">What year one should look like</h3>
                <p class="section__lead">
                    Conservative, published figures applied to a dealer’s catchment — not promises, and
                    deliberately using the low end of every range we found.
                </p>
            </div>

            <div class="projgrid">
                {#each projections as p, i}
                    <div class="proj reveal" style="--d:{i * 60}ms">
                        <div class="proj__change">{p.change}</div>
                        <div class="proj__metric">{p.metric}</div>
                        <p>{p.body}</p>
                        <div class="card__source">{p.source}</div>
                    </div>
                {/each}
            </div>

            <div class="roi reveal">
                <div class="roi__big">
                    <div class="roi__value">$20</div>
                    <div class="roi__unit">a day</div>
                </div>
                <div class="roi__copy">
                    <h3 class="h3">That is the whole decision.</h3>
                    <p>
                        {MONTHLY} a month is about twenty dollars a day — less than most dealers put into a
                        single week of radio, and radio is gone the second it stops playing. A ranked page,
                        a blog post, a review, a booking form: those keep working in month 24. One extra
                        machine sold or a couple of workshop jobs a month and the whole thing has paid for
                        itself — everything after that is upside.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- ══════════════════════════════════════════ GARY -->
    <section class="section section--gary" id="gary">
        <div class="shell">
            <div class="section__head reveal">
                <div class="kicker">{no('gary')} — The part nobody else has</div>
                <h2 class="h2">Meet Gary. The team member who never goes home.</h2>
                <p class="section__lead">
                    An AI salesman built into your site, trained on the STIHL range and tuned to talk like a
                    Kiwi mechanic. Your shop is open 8 to 5. Your customers are awake 6 to 11. Gary covers
                    the gap — answering, recommending, qualifying and booking while the shop is dark.
                </p>
            </div>

            <div class="gary">
                <div class="gary__chat reveal">
                    <div class="chat">
                        <div class="chat__head">
                            <span class="chat__avatar">G</span>
                            <div>
                                <div class="chat__name">Gary</div>
                                <div class="chat__meta">STIHL Shop · Sunday 9:14pm</div>
                            </div>
                            <span class="chat__live"><span class="pulse"></span>Live</span>
                        </div>
                        <div class="chat__body">
                            {#each garyChat as m}
                                <div class="bubble bubble--{m.from}">{m.text}</div>
                            {/each}
                        </div>
                        <div class="chat__foot">
                            → Monday 6:42am: workshop booking in your inbox, with full notes.
                        </div>
                    </div>
                </div>

                <div class="gary__points">
                    {#each garyPoints as g, i}
                        <div class="gpoint reveal" style="--d:{i * 60}ms">
                            <svg viewBox="0 0 24 24" class="ico ico--check" aria-hidden="true">
                                <path d={icons.check} />
                            </svg>
                            <div>
                                <h4>{g.title}</h4>
                                <p>{g.body}</p>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            <div class="garytry reveal">
                <p>
                    He is on this page right now — the same assistant, pointed at UNIFY instead of at
                    chainsaws. Ask him anything you would ask us.
                </p>
                <button
                    class="btn btn--primary"
                    type="button"
                    on:click={() => openGary('What would my site actually include?')}>
                    Try Gary
                    <svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d={icons.chat} /></svg>
                </button>
            </div>

            <div class="garystats reveal">
                <div><strong>24/7</strong><span>On your shop floor every hour your customers are awake</span></div>
                <div><strong>~60%</strong><span>Of digital intent lands after you close — Gary catches it</span></div>
                <div><strong>$0</strong><span>Extra. Unlimited conversations, no per-message billing, ever</span></div>
            </div>
        </div>
    </section>

    <!-- ══════════════════════════════════════════ PROOF -->
    <section class="section" id="proof">
        <div class="shell">
            <div class="section__head reveal">
                <div class="kicker">{no('proof')} — Proof, not a pitch</div>
                <h2 class="h2">It is already live. Go and look at it.</h2>
                <p class="section__lead">
                    We did not pitch this until it was running in a real catchment. STIHL Shop Tauranga has
                    been live for months on exactly the platform you would be on. Open it on your phone in
                    the middle of this email, run a Lighthouse test, search “chainsaw Tauranga”, and judge
                    it yourself.
                </p>
            </div>

            <div class="proof reveal">
                <div class="proof__phone">
                    <div class="phone">
                        <div class="phone__notch"></div>
                        <img
                            src="/assets/images/unify/site-mobile.webp"
                            alt="STIHL Shop Tauranga on a phone"
                            width="780"
                            height="1388"
                            loading="lazy" />
                    </div>
                </div>
                <div class="proof__stats">
                    <div class="proofstat">
                        <div class="proofstat__v">96<span>/100</span></div>
                        <div class="proofstat__l">
                            Lighthouse mobile performance — faster than every other STIHL Shop dealer site in
                            the country.
                        </div>
                    </div>
                    <div class="proofstat">
                        <div class="proofstat__v">#1</div>
                        <div class="proofstat__l">
                            Top organic result for local STIHL searches in Tauranga, inside a week of going
                            live. Zero paid spend.
                        </div>
                    </div>
                    <div class="proofstat">
                        <div class="proofstat__v">7<span> days</span></div>
                        <div class="proofstat__l">
                            From go-live to the first workshop booking submitted through the site.
                        </div>
                    </div>
                    <div class="proofstat">
                        <div class="proofstat__v">&lt;1<span>s</span></div>
                        <div class="proofstat__l">
                            Time-to-interactive on a 4G phone connection, edge-cached nationwide.
                        </div>
                    </div>
                    <a class="btn btn--ghost" href={TAURANGA} target="_blank" rel="noopener">
                        Open stihlshoptauranga.co.nz
                    </a>
                </div>
            </div>

            <div class="gallery reveal">
                {#each sitePages as page}
                    <figure class="gallery__item">
                        <img src={page.src} alt="{page.label} page of a UNIFY dealer site" loading="lazy" />
                        <figcaption>{page.label}</figcaption>
                    </figure>
                {/each}
            </div>
            <p class="gallery__note reveal">
                Every page above is a real page on a real dealer site, generated from that dealer’s own
                content. Yours would look like your shop, not like Tauranga’s.
            </p>
        </div>
    </section>

    <!-- ══════════════════════════════════════════ HOW -->
    <section class="section section--alt" id="how">
        <div class="shell">
            <div class="section__head reveal">
                <div class="kicker">{no('how')} — How it works</div>
                <h2 class="h2">One call from you. Live in about a week.</h2>
                <p class="section__lead">
                    There is no discovery sprint, no six-week design phase, no homework. The infrastructure
                    already exists — onboarding is just collecting what makes your shop yours.
                </p>
            </div>

            <ol class="steps">
                {#each steps as s, i}
                    <li class="step reveal" style="--d:{i * 70}ms">
                        <div class="step__n">{s.n}</div>
                        <div>
                            <h3>{s.title}</h3>
                            <p>{s.body}</p>
                        </div>
                    </li>
                {/each}
            </ol>

            <div class="split reveal">
                <div class="split__copy">
                    <h3 class="h3">And after go-live: you ask, we do.</h3>
                    <p>
                        No phone tag, no “did you get my email?”, no agency project manager. You open the
                        portal, click the field you want changed, and type. Every request is timestamped,
                        tracked and confirmed back to you when it is live — inside 48 hours, as many times
                        a month as you like.
                    </p>
                    <ul class="ticks">
                        <li>Unlimited change requests, no per-edit charges</li>
                        <li>48-hour completion guarantee, notification when it is live</li>
                        <li>Full searchable history of every change ever made</li>
                        <li>Two-factor secured, works from your phone at the counter</li>
                    </ul>
                </div>
                <div class="split__panel">
                    <div class="portal">
                        <div class="portal__head">
                            <span>Your website content</span>
                            <span class="portal__user">Greg · STIHL Shop</span>
                        </div>
                        <div class="portal__row">
                            <span class="portal__k">Phone</span>
                            <span class="portal__v">07 577 0747</span>
                        </div>
                        <div class="portal__row is-changed">
                            <span class="portal__k">Saturday hours</span>
                            <span class="portal__v">9:00am — 1:00pm <em>(was 12:30pm)</em></span>
                        </div>
                        <div class="portal__row is-changed">
                            <span class="portal__k">Hero slide</span>
                            <span class="portal__v">“Autumn maintenance — chainsaws from $235”</span>
                        </div>
                        <div class="portal__row">
                            <span class="portal__k">Team</span>
                            <span class="portal__v">Greg, Michael, +2 others</span>
                        </div>
                        <div class="portal__foot">
                            <span class="portal__draft">Save draft</span>
                            <span class="portal__submit">Submit 2 change requests</span>
                        </div>
                    </div>
                    <div class="flowline">
                        <span class="flowline__pill is-1">Submitted</span>
                        <span class="flowline__arrow"></span>
                        <span class="flowline__pill is-2">In progress</span>
                        <span class="flowline__arrow"></span>
                        <span class="flowline__pill is-3">Live · under 48h</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- ══════════════════════════════════════════ PRICING -->
    <section class="section" id="pricing">
        <div class="shell">
            <div class="section__head reveal">
                <div class="kicker">{no('pricing')} — Pricing</div>
                <h2 class="h2">One setup. One monthly fee. No tiers, no surprises.</h2>
                <p class="section__lead">
                    The same price for every dealer in the network. Everything is in it — there is no
                    upgrade path, because there is nothing to upgrade to.
                </p>
            </div>

            <div class="pricing reveal">
                <div class="price-card">
                    <div class="price-card__glow" aria-hidden="true"></div>
                    <div class="price-card__top">
                        <div class="price-card__label">Setup — one time</div>
                        <div class="price-card__amount">{SETUP}<span>NZD</span></div>
                        <p class="price-card__note">
                            Discovery, design, build, content, image work, SEO setup, domain configuration,
                            Gary training and go-live. Can be split across your first three months.
                        </p>
                    </div>
                    <div class="price-card__divider"></div>
                    <div class="price-card__top">
                        <div class="price-card__label">Then, every month</div>
                        <div class="price-card__amount price-card__amount--main">
                            {MONTHLY}<span>/ month</span>
                        </div>
                        <p class="price-card__note">
                            Website, platform, marketing, Gary, hosting and every change you ask for.
                            Minimum term 3 months, then month-to-month — 60 days notice, walk any time.
                        </p>
                    </div>
                    <a class="btn btn--primary btn--full" href="#start">Get your store online</a>
                    <div class="price-card__fine">Prices in NZD, plus GST. Same price for every dealer.</div>
                </div>

                <div class="price-lists">
                    <div class="price-list">
                        <h4>Everything included</h4>
                        <ul class="ticks">
                            {#each includedAll as item}
                                <li>{item}</li>
                            {/each}
                        </ul>
                    </div>
                    <div class="price-list price-list--no">
                        <h4>And everything that isn’t a surprise later</h4>
                        <ul class="crosses">
                            {#each notIncluded as item}
                                <li>
                                    <svg viewBox="0 0 24 24" class="ico" aria-hidden="true">
                                        <path d={icons.cross} />
                                    </svg>
                                    {item}
                                </li>
                            {/each}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- ══════════════════════════════════════════ FAQ -->
    <section class="section section--alt" id="faq">
        <div class="shell shell--narrow">
            <div class="section__head reveal">
                <div class="kicker">{no('faq')} — Yes, but…</div>
                <h2 class="h2">The eight questions every dealer asks.</h2>
                <p class="section__lead">
                    None of them dodged. If something here does not ring true, push back — we would rather
                    answer it now than have it sit on your mind.
                </p>
            </div>

            <div class="faq">
                {#each faqs as f, i}
                    <details class="faq__item reveal" style="--d:{i * 40}ms">
                        <summary>
                            <span>{f.q}</span>
                            <span class="faq__plus" aria-hidden="true"></span>
                        </summary>
                        <p>{f.a}</p>
                    </details>
                {/each}
            </div>
        </div>
    </section>

    <!-- ══════════════════════════════════════════ CTA / FORM -->
    <section class="section section--cta" id="start">
        <div class="cta__bg" aria-hidden="true"></div>
        <div class="shell cta">
            <div class="cta__copy reveal">
                <div class="kicker">{no('start')} — Let’s get you online</div>
                <h2 class="h2">Say yes. We do the rest.</h2>
                <p class="section__lead">
                    Tell us your store and we will send you a live preview plan for your town — what you
                    would rank for, what your site would look like, and what happens in the first week.
                    No obligation, no sales dance.
                </p>
                <ul class="ticks ticks--lg">
                    <li>Live in about a week from the first call</li>
                    <li>{SETUP} setup, {MONTHLY} a month, everything included</li>
                    <li>Your domain and content stay yours — leave any time with 60 days notice</li>
                </ul>
                <div class="cta__contact">
                    <div>
                        <span class="cta__contact-k">Talk to a human</span>
                        <a href="tel:+64212459987">021 245 9987</a> · Mike McLarnon
                    </div>
                    <div>
                        <span class="cta__contact-k">Or email</span>
                        <a href="mailto:hello@f925.works">hello@f925.works</a>
                    </div>
                </div>
            </div>

            <div class="cta__form reveal">
                <form
                    class="form"
                    action="https://usebasin.com/f/ffd6ed74ada9"
                    method="POST"
                    on:submit={handleSubmit}>
                    {#if formMessage.includes('Error') || formMessage.length === 0}
                        <h3 class="h3">Get your store online</h3>
                        <input type="hidden" name="Location" value={currentPath} />
                        <input
                            type="hidden"
                            name="Subject"
                            value={`UNIFY enquiry — ${dealerName || 'STIHL Shop dealer'}`} />

                        <div class="visuallyhidden" aria-hidden="true">
                            <label for="unify-website">Leave this field empty</label>
                            <input id="unify-website" name="Website" type="text" tabindex="-1" autocomplete="off" />
                        </div>

                        <label class="field">
                            <span>Store / dealership *</span>
                            <input
                                name="Dealership"
                                type="text"
                                bind:value={dealerName}
                                placeholder="STIHL Shop —"
                                required />
                        </label>
                        <div class="field-row">
                            <label class="field">
                                <span>Your name *</span>
                                <input name="Name" type="text" placeholder="First and last" required />
                            </label>
                            <label class="field">
                                <span>Town *</span>
                                <input name="Town" type="text" placeholder="Where you trade" required />
                            </label>
                        </div>
                        <div class="field-row">
                            <label class="field">
                                <span>Email *</span>
                                <input name="Email" type="email" placeholder="you@yourstore.co.nz" required />
                            </label>
                            <label class="field">
                                <span>Phone</span>
                                <input name="Phone" type="tel" placeholder="Best number to reach you" />
                            </label>
                        </div>
                        <label class="field">
                            <span>Anything you want to know?</span>
                            <textarea name="Message" rows="3" placeholder="Optional"></textarea>
                        </label>

                        <button class="btn btn--primary btn--full" type="submit">
                            Send it
                            <svg viewBox="0 0 24 24" class="ico" aria-hidden="true">
                                <path d={icons.arrow} />
                            </svg>
                        </button>
                        <p class="form__fine">
                            We reply within one working day. No mailing list, no follow-up spam.
                        </p>

                        {#if formMessage.includes('Error')}
                            <div class="form__error">{formMessage}</div>
                        {/if}
                    {:else}
                        <div class="form__done">
                            <svg viewBox="0 0 24 24" class="ico ico--check" aria-hidden="true">
                                <path d={icons.check} />
                            </svg>
                            <h3 class="h3">Got it — thanks.</h3>
                            <p>
                                We will be in touch within one working day with a plan for your store. In the
                                meantime, have a look at
                                <a href={TAURANGA} target="_blank" rel="noopener">stihlshoptauranga.co.nz</a>.
                            </p>
                        </div>
                    {/if}
                </form>
            </div>
        </div>
    </section>

    <!-- ══════════════════════════════════════════ FOOTER -->
    <footer class="foot">
        <div class="shell foot__inner">
            <div class="foot__brand">
                <svg class="brand__mark" viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M4 6h8M4 12h14M4 18h14M4 24h8" />
                    <path d="M18 12c6 0 6 8 0 8" />
                    <circle cx="26" cy="16" r="3" />
                </svg>
                <div>
                    <strong>UNIFY</strong>
                    <span>The dealer website platform, built and run by F925.</span>
                </div>
            </div>
            <div class="foot__links">
                <a href="https://f925.works" target="_blank" rel="noopener">f925.works</a>
                <a href={TAURANGA} target="_blank" rel="noopener">Live dealer site</a>
                <a href="mailto:hello@f925.works">hello@f925.works</a>
            </div>
            <div class="foot__legal">
                © {new Date().getFullYear()} F925. UNIFY is an independent platform built for STIHL Shop
                dealers and is not affiliated with, endorsed by, or operated by STIHL. Figures cited are
                from the published sources named beside them.
            </div>
        </div>
    </footer>

    <!-- The product, demonstrated on the page that sells it: the same widget
         the dealer sites run, on the UNIFY persona, themed to this page. If
         every model provider is down it turns itself into a lead form rather
         than an error. -->
    <GaryChat
        persona="unify"
        theme="dark"
        launcher={true}
        launcherLabel="Ask Gary"
        title="Gary"
        subtitle="UNIFY · AI assistant"
        placeholder="Ask Gary about UNIFY…"
        greeting="Gidday — I'm Gary. I'm the same AI assistant that sits on a dealer's site answering customers at 9pm. Here I just answer questions about UNIFY. What do you want to know?"
        starters={[
            "What's it actually cost?",
            'How long until my site is live?',
            "I'm not technical — can I use it?",
        ]}
        contactLine="give Mike a call on 021 245 9987"
        leadEndpoint="https://usebasin.com/f/ffd6ed74ada9"
        leadSubject="UNIFY — Gary chat lead" />
</div>

<style>
    /* ─────────────────────────────────────────────────────────────
       Fonts — self-hosted Inter (the rest of the site ships these too)
       ───────────────────────────────────────────────────────────── */
    @font-face {
        font-family: 'UnifyInter';
        src: url('../assets/fonts/Inter-Regular.woff2') format('woff2');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
    }
    @font-face {
        font-family: 'UnifyInter';
        src: url('../assets/fonts/Inter-Medium.woff2') format('woff2');
        font-weight: 500;
        font-style: normal;
        font-display: swap;
    }
    @font-face {
        font-family: 'UnifyInter';
        src: url('../assets/fonts/Inter-SemiBold.woff2') format('woff2');
        font-weight: 600;
        font-style: normal;
        font-display: swap;
    }

    :global(body.unify-body) {
        margin: 0;
        background: #08090a;
        color: #f2f2f3;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
    :global(body.unify-body *) {
        box-sizing: border-box;
    }
    :global(html) {
        scroll-behavior: smooth;
    }

    .unify {
        --bg: #08090a;
        --bg-alt: #0d0f11;
        --surface: #121417;
        --surface-2: #16191d;
        --line: rgba(255, 255, 255, 0.09);
        --line-strong: rgba(255, 255, 255, 0.16);
        --text: #f2f2f3;
        --muted: #9ba0a6;
        --dim: #6f757c;
        --accent: #ff6d00;
        --accent-soft: rgba(255, 109, 0, 0.14);
        --good: #22c55e;
        --bad: #ef4444;
        --radius: 18px;

        font-family: 'UnifyInter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        font-size: 16px;
        line-height: 1.55;
        letter-spacing: -0.011em;
        background: var(--bg);
        color: var(--text);
        overflow-x: hidden;
    }

    .shell {
        width: 100%;
        max-width: 1240px;
        margin: 0 auto;
        padding: 0 24px;
    }
    .shell--narrow {
        max-width: 900px;
    }

    /* ── Type ─────────────────────────────────────────────────── */
    .h1 {
        font-size: clamp(2.6rem, 6vw, 4.6rem);
        line-height: 1.02;
        letter-spacing: -0.035em;
        font-weight: 600;
        margin: 0 0 22px;
    }
    .h2 {
        font-size: clamp(1.9rem, 3.6vw, 3rem);
        line-height: 1.08;
        letter-spacing: -0.03em;
        font-weight: 600;
        margin: 0 0 18px;
    }
    .h3 {
        font-size: clamp(1.25rem, 2vw, 1.6rem);
        line-height: 1.18;
        letter-spacing: -0.022em;
        font-weight: 600;
        margin: 0 0 12px;
    }
    p {
        margin: 0 0 16px;
        color: var(--muted);
    }
    .grad {
        display: block;
        background: linear-gradient(96deg, #ff8a2b 0%, #ff6d00 45%, #ffb072 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
    }
    .lead,
    .section__lead {
        font-size: clamp(1.02rem, 1.35vw, 1.18rem);
        color: var(--muted);
        max-width: 62ch;
    }
    .kicker {
        font-size: 0.78rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--accent);
        font-weight: 500;
        margin-bottom: 14px;
    }
    .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        font-size: 0.8rem;
        letter-spacing: 0.06em;
        color: var(--muted);
        border: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.03);
        padding: 7px 14px;
        border-radius: 999px;
        margin-bottom: 26px;
    }
    .dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--accent);
        box-shadow: 0 0 0 4px var(--accent-soft);
    }

    .ico {
        width: 20px;
        height: 20px;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.7;
        stroke-linecap: round;
        stroke-linejoin: round;
        flex: none;
    }
    .ico--check {
        stroke: var(--good);
        stroke-width: 2.2;
    }

    /* ── Buttons ──────────────────────────────────────────────── */
    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 15px 26px;
        border-radius: 999px;
        font-size: 0.97rem;
        font-weight: 500;
        text-decoration: none;
        border: 1px solid transparent;
        cursor: pointer;
        transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), background 0.25s, border-color 0.25s,
            box-shadow 0.25s;
        white-space: nowrap;
    }
    .btn--primary {
        background: var(--accent);
        color: #140800;
        font-weight: 600;
        box-shadow: 0 10px 30px -12px rgba(255, 109, 0, 0.8);
    }
    .btn--primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 16px 40px -14px rgba(255, 109, 0, 0.9);
    }
    .btn--ghost {
        border-color: var(--line-strong);
        color: var(--text);
        background: rgba(255, 255, 255, 0.02);
    }
    .btn--ghost:hover {
        border-color: rgba(255, 255, 255, 0.35);
        transform: translateY(-2px);
    }
    .btn--sm {
        padding: 11px 20px;
        font-size: 0.88rem;
    }
    .btn--full {
        width: 100%;
    }

    /* ── Nav ──────────────────────────────────────────────────── */
    .nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100;
        transition: background 0.3s, border-color 0.3s, backdrop-filter 0.3s;
        border-bottom: 1px solid transparent;
    }
    .nav.is-scrolled {
        background: rgba(8, 9, 10, 0.82);
        backdrop-filter: blur(14px);
        border-bottom-color: var(--line);
    }
    .nav__inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        height: 72px;
    }
    .brand {
        display: inline-flex;
        align-items: center;
        gap: 11px;
        text-decoration: none;
        color: var(--text);
    }
    .brand__mark {
        width: 30px;
        height: 30px;
        fill: none;
        stroke: var(--accent);
        stroke-width: 1.9;
        stroke-linecap: round;
    }
    .brand__type {
        display: flex;
        flex-direction: column;
        font-weight: 600;
        letter-spacing: 0.14em;
        font-size: 1.02rem;
        line-height: 1.05;
    }
    .brand__by {
        font-size: 0.6rem;
        letter-spacing: 0.18em;
        color: var(--dim);
        font-weight: 400;
    }
    .nav__links {
        display: flex;
        gap: 26px;
    }
    .nav__links a {
        color: var(--muted);
        text-decoration: none;
        font-size: 0.9rem;
        transition: color 0.2s;
    }
    .nav__links a:hover {
        color: var(--text);
    }
    .nav__right {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .nav__toggle {
        display: none;
        flex-direction: column;
        gap: 5px;
        background: none;
        border: 0;
        padding: 8px;
        cursor: pointer;
    }
    .nav__toggle span {
        display: block;
        width: 22px;
        height: 1.5px;
        background: var(--text);
    }

    /* ── Hero ─────────────────────────────────────────────────── */
    .hero {
        position: relative;
        padding: 150px 0 70px;
        overflow: hidden;
    }
    .hero__glow {
        position: absolute;
        top: -320px;
        left: 50%;
        width: 1100px;
        height: 720px;
        transform: translateX(-58%);
        background: radial-gradient(
            circle at 50% 50%,
            rgba(255, 109, 0, 0.22) 0%,
            rgba(255, 109, 0, 0.06) 42%,
            transparent 68%
        );
        pointer-events: none;
    }
    .hero__grid-bg {
        position: absolute;
        inset: 0;
        background-image: linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
        background-size: 64px 64px;
        mask-image: radial-gradient(ellipse 90% 60% at 50% 0%, #000 30%, transparent 75%);
        -webkit-mask-image: radial-gradient(ellipse 90% 60% at 50% 0%, #000 30%, transparent 75%);
        pointer-events: none;
    }
    .hero__inner {
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
        gap: 56px;
        align-items: center;
    }
    .hero__copy {
        max-width: 620px;
    }
    .hero__cta {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin: 30px 0 18px;
    }
    .hero__price {
        font-size: 0.92rem;
        color: var(--muted);
    }
    .hero__price strong {
        color: var(--text);
        font-weight: 600;
    }
    .sep {
        color: var(--dim);
        margin: 0 4px;
    }

    .hero__visual {
        position: relative;
    }
    .browser {
        border: 1px solid var(--line-strong);
        border-radius: 14px;
        overflow: hidden;
        background: var(--surface);
        box-shadow: 0 40px 90px -40px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.02);
        transform: perspective(1600px) rotateY(-5deg) rotateX(2deg);
    }
    .browser__bar {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 11px 14px;
        background: #1a1d21;
        border-bottom: 1px solid var(--line);
    }
    .browser__dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #3a3f45;
    }
    .browser__url {
        margin-left: 12px;
        font-size: 0.74rem;
        color: var(--dim);
        background: #0f1214;
        border-radius: 6px;
        padding: 4px 12px;
        flex: 1;
    }
    .browser img {
        display: block;
        width: 100%;
        height: auto;
    }

    .float {
        position: absolute;
        background: rgba(18, 20, 23, 0.92);
        backdrop-filter: blur(10px);
        border: 1px solid var(--line-strong);
        border-radius: 14px;
        padding: 14px 18px;
        box-shadow: 0 20px 50px -24px rgba(0, 0, 0, 1);
    }
    .float__value {
        font-size: 1.5rem;
        font-weight: 600;
        letter-spacing: -0.03em;
        line-height: 1;
    }
    .float__value span {
        font-size: 0.85rem;
        color: var(--dim);
    }
    .float__value--sm {
        font-size: 1rem;
    }
    .float__label {
        font-size: 0.72rem;
        color: var(--muted);
        margin-top: 4px;
    }
    .float--score {
        left: -34px;
        top: 96px;
    }
    .float--score .float__value {
        color: var(--good);
    }
    .float--rank {
        display: flex;
        align-items: center;
        gap: 11px;
        right: -18px;
        bottom: 84px;
        color: var(--accent);
    }
    .float--rank .float__label {
        color: var(--muted);
    }
    .float--gary {
        display: flex;
        align-items: center;
        gap: 9px;
        left: 8%;
        bottom: -22px;
        font-size: 0.78rem;
        color: var(--muted);
    }
    .pulse {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--good);
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6);
        animation: pulse 2.4s infinite;
        flex: none;
    }
    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.55);
        }
        70% {
            box-shadow: 0 0 0 9px rgba(34, 197, 94, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
        }
    }

    .statbar {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1px;
        margin-top: 90px;
        background: var(--line);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        overflow: hidden;
    }
    .statbar__item {
        background: var(--bg);
        padding: 26px 24px;
    }
    .statbar__value {
        font-size: clamp(1.8rem, 3vw, 2.4rem);
        font-weight: 600;
        letter-spacing: -0.035em;
        line-height: 1;
        margin-bottom: 8px;
    }
    .statbar__value span {
        font-size: 0.9rem;
        color: var(--dim);
        letter-spacing: 0;
    }
    .statbar__label {
        font-size: 0.83rem;
        color: var(--muted);
        line-height: 1.4;
    }

    /* ── Sections ─────────────────────────────────────────────── */
    .section {
        padding: 110px 0;
        position: relative;
    }
    .section--alt {
        background: var(--bg-alt);
        border-top: 1px solid var(--line);
        border-bottom: 1px solid var(--line);
    }
    .section__head {
        max-width: 780px;
        margin-bottom: 52px;
    }
    .section__head--sub {
        margin-top: 84px;
    }

    .reveal {
        transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        transition-delay: var(--d, 0ms);
    }
    :global(.reveal.is-armed) {
        opacity: 0;
        transform: translateY(22px);
    }
    @media (prefers-reduced-motion: reduce) {
        :global(.reveal.is-armed) {
            opacity: 1;
            transform: none;
        }
    }

    /* ── Cards ────────────────────────────────────────────────── */
    .cards-3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
    }
    .card {
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        padding: 30px;
        transition: border-color 0.3s, transform 0.3s, background 0.3s;
    }
    .card:hover {
        border-color: var(--line-strong);
        transform: translateY(-3px);
    }
    .card p {
        font-size: 0.94rem;
        margin-bottom: 12px;
    }
    .card__value {
        font-size: clamp(2.4rem, 4vw, 3.2rem);
        font-weight: 600;
        letter-spacing: -0.04em;
        line-height: 1;
        color: var(--accent);
        margin-bottom: 14px;
    }
    .card__title {
        font-size: 1.05rem;
        font-weight: 600;
        margin: 0 0 10px;
        letter-spacing: -0.015em;
    }
    .card__source {
        font-size: 0.72rem;
        color: var(--dim);
        line-height: 1.4;
        border-top: 1px solid var(--line);
        padding-top: 12px;
        margin-top: auto;
    }
    .card--bad {
        border-left: 2px solid rgba(239, 68, 68, 0.55);
    }
    .card__tag {
        font-size: 0.72rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--bad);
        margin-bottom: 12px;
    }

    .pullquote {
        margin: 46px auto 0;
        max-width: 820px;
        text-align: center;
        font-size: clamp(1.15rem, 2vw, 1.5rem);
        line-height: 1.4;
        letter-spacing: -0.02em;
        color: var(--text);
    }
    .pullquote em {
        color: var(--accent);
        font-style: normal;
    }

    /* ── Trend chart ──────────────────────────────────────────── */
    .trend {
        margin-top: 24px;
        display: grid;
        grid-template-columns: 1.15fr 1fr;
        gap: 40px;
        align-items: center;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        padding: 36px;
    }
    .trend__chart {
        display: flex;
        align-items: flex-end;
        gap: 18px;
        height: 200px;
    }
    .trend__col {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        height: 100%;
    }
    .trend__bar {
        height: var(--h);
        border-radius: 8px 8px 0 0;
        background: linear-gradient(180deg, rgba(255, 109, 0, 0.85), rgba(255, 109, 0, 0.25));
        position: relative;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 10px;
    }
    .trend__val {
        font-size: 0.9rem;
        font-weight: 600;
        color: #140800;
    }
    .trend__year {
        text-align: center;
        font-size: 0.8rem;
        color: var(--muted);
        padding-top: 10px;
        border-top: 1px solid var(--line);
        margin-top: 8px;
    }

    /* ── Architecture ─────────────────────────────────────────── */
    .arch {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1px;
        background: var(--line);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        overflow: hidden;
        margin-bottom: 28px;
    }
    .arch__step {
        background: var(--surface);
        padding: 28px 24px;
    }
    .arch__num {
        font-size: 0.72rem;
        letter-spacing: 0.16em;
        color: var(--accent);
        margin-bottom: 14px;
    }
    .arch__step h4 {
        margin: 0 0 8px;
        font-size: 1rem;
        font-weight: 600;
        letter-spacing: -0.015em;
    }
    .arch__step p {
        font-size: 0.88rem;
        margin: 0;
    }

    /* ── Split panels ─────────────────────────────────────────── */
    .split {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
        align-items: center;
        margin-top: 40px;
    }
    .split__panel {
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        padding: 28px;
    }
    .panel-label {
        font-size: 0.72rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--dim);
        margin-bottom: 18px;
    }
    .stackgrid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1px;
        background: var(--line);
        border: 1px solid var(--line);
        border-radius: 12px;
        overflow: hidden;
    }
    .stackgrid__item {
        background: var(--surface-2);
        padding: 16px 18px;
    }
    .stackgrid__k {
        font-weight: 600;
        font-size: 0.98rem;
        color: var(--accent);
        letter-spacing: -0.01em;
    }
    .stackgrid__v {
        font-size: 0.78rem;
        color: var(--muted);
        margin-top: 3px;
    }
    .panel-note {
        font-size: 0.82rem;
        color: var(--dim);
        margin-top: 18px;
        line-height: 1.5;
    }

    .ticks,
    .crosses {
        list-style: none;
        padding: 0;
        margin: 18px 0 0;
        display: grid;
        gap: 11px;
    }
    .ticks li,
    .crosses li {
        position: relative;
        padding-left: 28px;
        font-size: 0.94rem;
        color: var(--muted);
        line-height: 1.5;
    }
    .ticks li::before {
        content: '';
        position: absolute;
        left: 3px;
        top: 7px;
        width: 11px;
        height: 6px;
        border-left: 2px solid var(--good);
        border-bottom: 2px solid var(--good);
        transform: rotate(-45deg);
    }
    .ticks--lg li {
        font-size: 1rem;
        color: var(--text);
    }
    .crosses li {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding-left: 0;
    }
    .crosses .ico {
        width: 16px;
        height: 16px;
        stroke: var(--dim);
        margin-top: 3px;
    }

    /* ── Pillars ──────────────────────────────────────────────── */
    .pillars {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
    }
    .pillar {
        background: linear-gradient(180deg, var(--surface) 0%, rgba(18, 20, 23, 0.6) 100%);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        padding: 32px;
        transition: border-color 0.3s, transform 0.3s;
    }
    .pillar:hover {
        border-color: rgba(255, 109, 0, 0.35);
        transform: translateY(-3px);
    }
    .pillar__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
    }
    .pillar__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: var(--accent-soft);
        color: var(--accent);
        border: 1px solid rgba(255, 109, 0, 0.28);
    }
    .pillar__n {
        font-size: 0.78rem;
        letter-spacing: 0.16em;
        color: var(--dim);
    }
    .pillar__lead {
        color: var(--text);
        font-size: 0.96rem;
    }

    /* ── Table ────────────────────────────────────────────────── */
    .table-wrap {
        margin-top: 56px;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        padding: 32px;
        overflow-x: auto;
    }
    .table-head {
        margin-bottom: 22px;
    }
    .table-head p {
        font-size: 0.9rem;
        margin: 0;
        max-width: 60ch;
    }
    .table {
        width: 100%;
        border-collapse: collapse;
        min-width: 620px;
    }
    .table th {
        text-align: left;
        font-size: 0.74rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--dim);
        font-weight: 500;
        padding: 0 0 14px;
        border-bottom: 1px solid var(--line);
    }
    .table td {
        padding: 16px 16px 16px 0;
        border-bottom: 1px solid var(--line);
        font-size: 0.94rem;
        color: var(--text);
        vertical-align: middle;
    }
    .table__market {
        color: var(--muted);
        white-space: nowrap;
    }
    .table__ours {
        color: var(--good);
        white-space: nowrap;
    }
    .table__ours .ico {
        width: 15px;
        height: 15px;
        margin-right: 7px;
        vertical-align: -2px;
    }
    .table__total td {
        border-bottom: 0;
        font-weight: 600;
        padding-top: 20px;
    }
    .table__total .table__ours {
        color: var(--accent);
        font-size: 1.1rem;
    }

    /* ── Workload / maths ─────────────────────────────────────── */
    .workload {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
    }
    .workload__item {
        background: var(--surface);
        border: 1px solid var(--line);
        border-left: 2px solid var(--good);
        border-radius: var(--radius);
        padding: 28px;
    }
    .workload__item.is-bad {
        border-left-color: var(--bad);
    }
    .workload__value {
        font-size: clamp(2rem, 3.4vw, 2.7rem);
        font-weight: 600;
        letter-spacing: -0.04em;
        line-height: 1;
        margin-bottom: 12px;
    }
    .workload__value span {
        display: block;
        font-size: 0.8rem;
        letter-spacing: 0.04em;
        color: var(--dim);
        font-weight: 400;
        margin-top: 7px;
    }
    .workload__item p {
        font-size: 0.92rem;
        margin-bottom: 10px;
    }

    .hours {
        margin-top: 24px;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        padding: 32px;
    }
    .hours__row {
        display: grid;
        grid-template-columns: 190px 1fr;
        align-items: center;
        gap: 20px;
        margin-bottom: 16px;
    }
    .hours__label {
        font-size: 0.88rem;
        color: var(--muted);
    }
    .hours__track {
        position: relative;
        display: flex;
        align-items: center;
        gap: 12px;
        height: 44px;
        background: var(--surface-2);
        border-radius: 10px;
        overflow: hidden;
    }
    .hours__fill {
        height: 100%;
        display: flex;
        align-items: center;
        padding-left: 18px;
        font-size: 0.86rem;
        font-weight: 500;
        color: #140800;
        border-radius: 10px;
    }
    .hours__fill--bad {
        background: linear-gradient(90deg, rgba(239, 68, 68, 0.9), rgba(239, 68, 68, 0.45));
        color: #fff;
    }
    .hours__fill--good {
        background: var(--good);
        min-width: 10px;
    }
    .hours__tag {
        font-size: 0.86rem;
        color: var(--good);
        font-weight: 500;
    }
    .hours__note {
        font-size: 0.86rem;
        color: var(--dim);
        border-top: 1px solid var(--line);
        padding-top: 16px;
        margin-top: 8px;
    }

    .projgrid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
    }
    .proj {
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        padding: 26px;
    }
    .proj__change {
        font-size: 1.9rem;
        font-weight: 600;
        letter-spacing: -0.035em;
        color: var(--accent);
        line-height: 1;
    }
    .proj__metric {
        font-size: 0.78rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--dim);
        margin: 10px 0 12px;
    }
    .proj p {
        font-size: 0.9rem;
    }

    .roi {
        margin-top: 30px;
        display: grid;
        grid-template-columns: 220px 1fr;
        gap: 36px;
        align-items: center;
        background: linear-gradient(120deg, rgba(255, 109, 0, 0.1), rgba(255, 109, 0, 0.02));
        border: 1px solid rgba(255, 109, 0, 0.28);
        border-radius: var(--radius);
        padding: 36px;
    }
    .roi__big {
        text-align: center;
    }
    .roi__value {
        font-size: 4.2rem;
        font-weight: 600;
        letter-spacing: -0.05em;
        line-height: 1;
        color: var(--accent);
    }
    .roi__unit {
        font-size: 0.86rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--muted);
        margin-top: 6px;
    }
    .roi__copy p {
        margin-bottom: 0;
    }

    /* ── Gary ─────────────────────────────────────────────────── */
    .section--gary {
        background:
            linear-gradient(180deg, rgba(8, 9, 10, 0.9) 0%, rgba(8, 9, 10, 0.97) 72%),
            url('/assets/images/unify/photo-saw.webp') center / cover no-repeat;
        border-top: 1px solid var(--line);
        border-bottom: 1px solid var(--line);
    }
    .gary {
        display: grid;
        grid-template-columns: 1.05fr 1fr;
        gap: 40px;
        align-items: start;
    }
    .chat {
        background: var(--surface);
        border: 1px solid var(--line-strong);
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 40px 90px -50px rgba(0, 0, 0, 1);
    }
    .chat__head {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 18px;
        border-bottom: 1px solid var(--line);
        background: var(--surface-2);
    }
    .chat__avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--accent);
        color: #140800;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
    }
    .chat__name {
        font-weight: 600;
        font-size: 0.95rem;
    }
    .chat__meta {
        font-size: 0.75rem;
        color: var(--dim);
    }
    .chat__live {
        margin-left: auto;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        font-size: 0.74rem;
        color: var(--good);
    }
    .chat__body {
        padding: 20px 18px;
        display: grid;
        gap: 12px;
    }
    .bubble {
        max-width: 84%;
        padding: 12px 16px;
        border-radius: 16px;
        font-size: 0.92rem;
        line-height: 1.45;
    }
    .bubble--them {
        justify-self: end;
        background: var(--surface-2);
        border: 1px solid var(--line);
        border-bottom-right-radius: 5px;
        color: var(--text);
    }
    .bubble--gary {
        justify-self: start;
        background: rgba(255, 109, 0, 0.13);
        border: 1px solid rgba(255, 109, 0, 0.3);
        border-bottom-left-radius: 5px;
        color: #ffd9bb;
    }
    .chat__foot {
        border-top: 1px solid var(--line);
        padding: 14px 18px;
        font-size: 0.8rem;
        color: var(--good);
        background: var(--surface-2);
    }
    .gary__points {
        display: grid;
        gap: 18px;
    }
    .gpoint {
        display: flex;
        gap: 13px;
        align-items: flex-start;
    }
    .gpoint h4 {
        margin: 0 0 4px;
        font-size: 0.98rem;
        font-weight: 600;
        letter-spacing: -0.015em;
    }
    .gpoint p {
        margin: 0;
        font-size: 0.89rem;
    }
    .garytry {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        margin-top: 34px;
        padding: 24px 28px;
        border: 1px solid rgba(255, 109, 0, 0.3);
        border-radius: var(--radius);
        background: linear-gradient(120deg, rgba(255, 109, 0, 0.12), rgba(255, 109, 0, 0.02));
    }
    .garytry p {
        margin: 0;
        max-width: 56ch;
        color: var(--text);
    }

    .garystats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-top: 46px;
    }
    .garystats div {
        background: rgba(18, 20, 23, 0.8);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        padding: 24px;
    }
    .garystats strong {
        display: block;
        font-size: 2rem;
        font-weight: 600;
        letter-spacing: -0.04em;
        color: var(--accent);
        line-height: 1;
        margin-bottom: 10px;
    }
    .garystats span {
        font-size: 0.88rem;
        color: var(--muted);
    }

    /* ── Proof ────────────────────────────────────────────────── */
    .proof {
        display: grid;
        grid-template-columns: 320px 1fr;
        gap: 48px;
        align-items: center;
    }
    .phone {
        position: relative;
        border: 8px solid #1c1f23;
        border-radius: 36px;
        overflow: hidden;
        box-shadow: 0 40px 80px -40px rgba(0, 0, 0, 1);
        background: #000;
    }
    .phone__notch {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 108px;
        height: 20px;
        background: #1c1f23;
        border-radius: 0 0 12px 12px;
        z-index: 2;
    }
    .phone img {
        display: block;
        width: 100%;
        height: auto;
    }
    .proof__stats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 22px;
    }
    .proofstat__v {
        font-size: clamp(2.2rem, 3.6vw, 3rem);
        font-weight: 600;
        letter-spacing: -0.04em;
        line-height: 1;
        color: var(--accent);
        margin-bottom: 10px;
    }
    .proofstat__v span {
        font-size: 0.95rem;
        color: var(--dim);
        letter-spacing: 0;
    }
    .proofstat__l {
        font-size: 0.88rem;
        color: var(--muted);
        line-height: 1.5;
    }
    .proof__stats .btn {
        grid-column: 1 / -1;
        justify-self: start;
    }

    .gallery {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 18px;
        margin-top: 56px;
    }
    .gallery__item {
        margin: 0;
        border: 1px solid var(--line);
        border-radius: 14px;
        overflow: hidden;
        background: var(--surface);
        transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s;
    }
    .gallery__item:hover {
        transform: translateY(-4px);
        border-color: var(--line-strong);
    }
    .gallery__item img {
        display: block;
        width: 100%;
        height: auto;
    }
    .gallery__item figcaption {
        font-size: 0.8rem;
        color: var(--muted);
        padding: 12px 16px;
        border-top: 1px solid var(--line);
    }
    .gallery__note {
        text-align: center;
        margin-top: 22px;
        font-size: 0.9rem;
    }

    /* ── Steps ────────────────────────────────────────────────── */
    .steps {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 1px;
        background: var(--line);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        overflow: hidden;
    }
    .step {
        display: grid;
        grid-template-columns: 90px 1fr;
        gap: 20px;
        background: var(--surface);
        padding: 26px 30px;
    }
    .step__n {
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--accent);
        letter-spacing: -0.03em;
    }
    .step h3 {
        margin: 0 0 6px;
        font-size: 1.05rem;
        font-weight: 600;
        letter-spacing: -0.018em;
    }
    .step p {
        margin: 0;
        font-size: 0.93rem;
        max-width: 74ch;
    }

    /* ── Portal mock ──────────────────────────────────────────── */
    .portal {
        border: 1px solid var(--line);
        border-radius: 14px;
        overflow: hidden;
        background: var(--surface-2);
        font-size: 0.88rem;
    }
    .portal__head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 18px;
        background: #1a1d21;
        border-bottom: 1px solid var(--line);
        font-weight: 500;
    }
    .portal__user {
        font-size: 0.78rem;
        color: var(--dim);
        font-weight: 400;
    }
    .portal__row {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        padding: 14px 18px;
        border-bottom: 1px solid var(--line);
    }
    .portal__row.is-changed {
        background: rgba(255, 109, 0, 0.07);
        box-shadow: inset 2px 0 0 var(--accent);
    }
    .portal__k {
        color: var(--dim);
        flex: none;
    }
    .portal__v {
        text-align: right;
        color: var(--text);
    }
    .portal__v em {
        color: var(--dim);
        font-style: normal;
        font-size: 0.8rem;
    }
    .portal__foot {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 18px;
        gap: 12px;
    }
    .portal__draft {
        color: var(--dim);
        font-size: 0.82rem;
    }
    .portal__submit {
        background: var(--accent);
        color: #140800;
        font-weight: 600;
        font-size: 0.82rem;
        padding: 9px 16px;
        border-radius: 999px;
    }
    .flowline {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 18px;
        flex-wrap: wrap;
    }
    .flowline__pill {
        font-size: 0.76rem;
        padding: 7px 14px;
        border-radius: 999px;
        border: 1px solid var(--line-strong);
        color: var(--muted);
    }
    .flowline__pill.is-2 {
        color: #ffd9bb;
        border-color: rgba(255, 109, 0, 0.4);
        background: rgba(255, 109, 0, 0.1);
    }
    .flowline__pill.is-3 {
        color: var(--good);
        border-color: rgba(34, 197, 94, 0.4);
        background: rgba(34, 197, 94, 0.1);
    }
    .flowline__arrow {
        flex: 1;
        height: 1px;
        background: var(--line-strong);
        min-width: 14px;
    }

    /* ── Pricing ──────────────────────────────────────────────── */
    .pricing {
        display: grid;
        grid-template-columns: 400px 1fr;
        gap: 32px;
        align-items: start;
    }
    .price-card {
        position: relative;
        background: var(--surface);
        border: 1px solid rgba(255, 109, 0, 0.3);
        border-radius: 22px;
        padding: 34px;
        overflow: hidden;
    }
    .price-card__glow {
        position: absolute;
        top: -140px;
        right: -120px;
        width: 320px;
        height: 320px;
        background: radial-gradient(circle, rgba(255, 109, 0, 0.22), transparent 65%);
        pointer-events: none;
    }
    .price-card__label {
        font-size: 0.76rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--dim);
        margin-bottom: 10px;
    }
    .price-card__amount {
        font-size: 2.4rem;
        font-weight: 600;
        letter-spacing: -0.04em;
        line-height: 1;
    }
    .price-card__amount span {
        font-size: 0.9rem;
        color: var(--dim);
        letter-spacing: 0;
        margin-left: 8px;
        font-weight: 400;
    }
    .price-card__amount--main {
        font-size: 3.4rem;
        color: var(--accent);
    }
    .price-card__note {
        font-size: 0.86rem;
        margin: 12px 0 0;
    }
    .price-card__divider {
        height: 1px;
        background: var(--line);
        margin: 26px 0;
    }
    .price-card .btn {
        margin-top: 28px;
    }
    .price-card__fine {
        font-size: 0.75rem;
        color: var(--dim);
        text-align: center;
        margin-top: 14px;
    }
    .price-lists {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 28px;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 22px;
        padding: 34px;
    }
    .price-list h4 {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 600;
        letter-spacing: -0.015em;
    }
    .price-list--no li {
        color: var(--dim);
    }

    /* ── FAQ ──────────────────────────────────────────────────── */
    .faq {
        display: grid;
        gap: 12px;
    }
    .faq__item {
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 4px 24px;
        transition: border-color 0.3s;
    }
    .faq__item[open] {
        border-color: rgba(255, 109, 0, 0.3);
    }
    .faq__item summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 20px 0;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 500;
        letter-spacing: -0.015em;
        list-style: none;
    }
    .faq__item summary::-webkit-details-marker {
        display: none;
    }
    .faq__plus {
        position: relative;
        width: 15px;
        height: 15px;
        flex: none;
    }
    .faq__plus::before,
    .faq__plus::after {
        content: '';
        position: absolute;
        background: var(--accent);
        border-radius: 2px;
        transition: transform 0.3s;
    }
    .faq__plus::before {
        top: 7px;
        left: 0;
        width: 15px;
        height: 1.6px;
    }
    .faq__plus::after {
        left: 7px;
        top: 0;
        width: 1.6px;
        height: 15px;
    }
    .faq__item[open] .faq__plus::after {
        transform: scaleY(0);
    }
    .faq__item p {
        margin: 0 0 20px;
        font-size: 0.94rem;
        max-width: 76ch;
    }

    /* ── CTA + form ───────────────────────────────────────────── */
    .section--cta {
        position: relative;
        overflow: hidden;
        border-top: 1px solid var(--line);
    }
    .cta__bg {
        position: absolute;
        inset: 0;
        background:
            linear-gradient(180deg, rgba(8, 9, 10, 0.93), rgba(8, 9, 10, 0.97)),
            url('/assets/images/unify/photo-counter.webp') center / cover no-repeat;
        pointer-events: none;
    }
    .cta {
        position: relative;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 56px;
        align-items: start;
    }
    .cta__contact {
        display: grid;
        gap: 14px;
        margin-top: 32px;
        padding-top: 28px;
        border-top: 1px solid var(--line);
    }
    .cta__contact-k {
        display: block;
        font-size: 0.74rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--dim);
        margin-bottom: 5px;
    }
    .cta__contact a {
        color: var(--text);
        text-decoration: none;
        border-bottom: 1px solid rgba(255, 109, 0, 0.5);
        font-size: 1.05rem;
    }
    .cta__contact a:hover {
        color: var(--accent);
    }

    .form {
        background: rgba(18, 20, 23, 0.85);
        backdrop-filter: blur(10px);
        border: 1px solid var(--line-strong);
        border-radius: 22px;
        padding: 32px;
    }
    .form .h3 {
        margin-bottom: 22px;
    }
    .field {
        display: block;
        margin-bottom: 16px;
    }
    .field > span {
        display: block;
        font-size: 0.78rem;
        letter-spacing: 0.06em;
        color: var(--muted);
        margin-bottom: 7px;
    }
    .field input,
    .field textarea {
        width: 100%;
        background: #0d0f11;
        border: 1px solid var(--line-strong);
        border-radius: 10px;
        padding: 13px 15px;
        color: var(--text);
        font-family: inherit;
        font-size: 0.95rem;
        transition: border-color 0.25s, box-shadow 0.25s;
    }
    .field input::placeholder,
    .field textarea::placeholder {
        color: #575c62;
    }
    .field input:focus,
    .field textarea:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-soft);
    }
    .field-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
    }
    .form .btn {
        margin-top: 8px;
    }
    .form__fine {
        font-size: 0.76rem;
        color: var(--dim);
        text-align: center;
        margin: 14px 0 0;
    }
    .form__error {
        margin-top: 14px;
        font-size: 0.85rem;
        color: var(--bad);
    }
    .form__done {
        text-align: center;
        padding: 26px 0;
    }
    .form__done .ico {
        width: 42px;
        height: 42px;
        margin-bottom: 16px;
    }
    .form__done a {
        color: var(--accent);
    }
    .visuallyhidden {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
    }

    /* ── Footer ───────────────────────────────────────────────── */
    .foot {
        border-top: 1px solid var(--line);
        padding: 46px 0 60px;
        background: var(--bg);
    }
    .foot__inner {
        display: grid;
        gap: 26px;
    }
    .foot__brand {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .foot__brand strong {
        display: block;
        letter-spacing: 0.14em;
        font-weight: 600;
    }
    .foot__brand span {
        font-size: 0.85rem;
        color: var(--muted);
    }
    .foot__links {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
    }
    .foot__links a {
        color: var(--muted);
        text-decoration: none;
        font-size: 0.88rem;
        border-bottom: 1px solid transparent;
    }
    .foot__links a:hover {
        color: var(--text);
        border-bottom-color: var(--line-strong);
    }
    .foot__legal {
        font-size: 0.74rem;
        color: var(--dim);
        line-height: 1.6;
        max-width: 90ch;
        border-top: 1px solid var(--line);
        padding-top: 22px;
    }

    /* ── Responsive ───────────────────────────────────────────── */
    @media (max-width: 1080px) {
        .hero__inner {
            grid-template-columns: 1fr;
            gap: 54px;
        }
        .hero__copy {
            max-width: none;
        }
        .browser {
            transform: none;
        }
        .float--score {
            left: -10px;
        }
        .float--rank {
            right: -6px;
        }
        .cards-3,
        .pillars,
        .workload,
        .projgrid,
        .garystats,
        .arch {
            grid-template-columns: repeat(2, 1fr);
        }
        .gallery {
            grid-template-columns: repeat(2, 1fr);
        }
        .split,
        .trend,
        .gary,
        .proof,
        .cta,
        .pricing {
            grid-template-columns: 1fr;
        }
        .roi {
            grid-template-columns: 1fr;
            text-align: center;
        }
        .proof__phone {
            max-width: 300px;
        }
        .nav__links {
            display: none;
        }
        .nav__links.is-open {
            display: grid;
            position: absolute;
            top: 72px;
            left: 0;
            right: 0;
            background: rgba(8, 9, 10, 0.97);
            backdrop-filter: blur(14px);
            border-top: 1px solid var(--line);
            border-bottom: 1px solid var(--line);
            padding: 18px 24px 24px;
            gap: 16px;
        }
        .nav__toggle {
            display: flex;
        }
    }

    @media (max-width: 760px) {
        .shell {
            padding: 0 18px;
        }
        .section {
            padding: 76px 0;
        }
        .hero {
            padding: 116px 0 40px;
        }
        .statbar {
            grid-template-columns: repeat(2, 1fr);
            margin-top: 64px;
        }
        .cards-3,
        .pillars,
        .workload,
        .projgrid,
        .garystats,
        .arch,
        .gallery,
        .price-lists,
        .proof__stats,
        .field-row {
            grid-template-columns: 1fr;
        }
        .float--score,
        .float--rank,
        .float--gary {
            display: none;
        }
        .hours__row {
            grid-template-columns: 1fr;
            gap: 8px;
        }
        .step {
            grid-template-columns: 1fr;
            gap: 8px;
            padding: 24px;
        }
        .trend,
        .hours,
        .table-wrap,
        .price-lists,
        .price-card,
        .form,
        .split__panel {
            padding: 24px;
        }
        .btn {
            width: 100%;
        }
        .hero__cta {
            flex-direction: column;
        }
        .proof__stats .btn {
            justify-self: stretch;
        }
        .nav__right .btn {
            width: auto;
            padding: 10px 15px;
            font-size: 0.8rem;
        }

        /* The comparison table stops being a table and becomes cards — a
           horizontally scrolling table on a phone reads as broken. */
        .table-wrap {
            overflow-x: visible;
        }
        .table,
        .table tbody,
        .table tr,
        .table td {
            display: block;
            width: 100%;
            min-width: 0;
        }
        .table thead {
            display: none;
        }
        .table tr {
            border: 1px solid var(--line);
            border-radius: 12px;
            padding: 4px 16px 12px;
            margin-bottom: 12px;
            background: var(--surface-2);
        }
        .table td {
            border-bottom: 0;
            padding: 10px 0 0;
            white-space: normal;
        }
        .table td::before {
            content: attr(data-label);
            display: block;
            font-size: 0.68rem;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--dim);
            margin-bottom: 3px;
        }
        .table td:first-child {
            font-weight: 600;
            padding-top: 14px;
        }
        .table td:first-child::before {
            display: none;
        }
        .table__total td {
            padding-top: 10px;
        }
    }
</style>
