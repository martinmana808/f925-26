<script lang="ts">
    import Layout from '../../components/layout/Layout.svelte'
    import Icon from '../../components/Icon.svelte'
    import ServicesCard from '../../components/ServiceCard.svelte'

    let flickityOptions = { cellAlign: 'left' }

    import { onMount, onDestroy } from 'svelte'

    let syncCardHeights: () => void
    let cleanupHeightSync: () => void = () => {}

    onMount(() => {
        // Load external script after the component is mounted
        const script = document.createElement('script')
        if (import.meta.env.MODE === 'development') {
            script.src = '/src/js/flickity.js'
        } else {
            script.src = '../js/flickity.js'
        }
        script.async = true
        document.body.appendChild(script)

        // Every cell has to be the same height: on desktop they all take the
        // column area's height, on mobile the tallest card's height. The
        // cards are measured with their heights reset first, so re-running
        // this (resize, reflow) always lands on the same number instead of
        // feeding last run's height back into the measurement.
        let syncing = false
        syncCardHeights = () => {
            if (syncing) return

            const carousel = document.querySelector('.main-carousel') as HTMLElement
            const mainInner = document.querySelector('.site-main__inner') as HTMLElement
            const flickityViewport = document.querySelector('.flickity-viewport') as HTMLElement
            const serviceCards = document.querySelectorAll('.service-card') as NodeListOf<HTMLElement>

            if (!mainInner || !flickityViewport || !serviceCards.length) return

            syncing = true

            let naturalMax = 0
            serviceCards.forEach(card => {
                card.style.height = 'auto'
                naturalMax = Math.max(naturalMax, card.offsetHeight)
            })

            // Let Flickity collapse the viewport back onto the natural cards
            // before reading the column height off the layout.
            const Flickity = (window as any).Flickity
            const flkty = Flickity && carousel ? Flickity.data(carousel) : null
            if (flkty) {
                flkty.resize()
            } else {
                flickityViewport.style.height = `${naturalMax}px`
            }

            const height =
                window.innerWidth >= 1000 ? `${mainInner.offsetHeight + 44}px` : `${naturalMax}px`

            flickityViewport.style.height = height
            serviceCards.forEach(card => {
                card.style.height = height
            })

            syncing = false
        }

        // Flickity is loaded async, so the viewport it creates may not exist
        // for a while. Keep trying each frame until it does, then keep the
        // heights in sync with the left column and the window.
        let frame = 0
        const waitForFlickity = () => {
            if (document.querySelector('.flickity-viewport')) {
                syncCardHeights()
                return
            }
            frame = requestAnimationFrame(waitForFlickity)
        }
        frame = requestAnimationFrame(waitForFlickity)

        window.addEventListener('resize', syncCardHeights)
        window.addEventListener('load', syncCardHeights)

        // The left column drives the desktop height, so re-sync whenever it
        // reflows (webfonts landing, text rewrapping).
        const mainInner = document.querySelector('.site-main__inner')
        const observer = mainInner ? new ResizeObserver(() => syncCardHeights()) : null
        if (mainInner && observer) observer.observe(mainInner)

        cleanupHeightSync = () => {
            cancelAnimationFrame(frame)
            window.removeEventListener('resize', syncCardHeights)
            window.removeEventListener('load', syncCardHeights)
            observer?.disconnect()
        }
    })

    onMount(() => {
        document.body.classList.add('template--services')
    })
    onDestroy(() => {
        document.body.classList.remove('template--services')
        cleanupHeightSync()
    })

    
</script>

<svelte:head>
    <!-- Flickity Stylesheet -->
    <link rel="stylesheet" href="../../styles/flickity.css" />
</svelte:head>

<Layout>
    <div class="grid gutter-x h-100">
        <div class="col-l">
            <h1 class="text--section">Services</h1>
            <h2 class="text--subheadingSm">We build website products that actually work</h2>
            <p>
                F925 designs and builds website products, platforms, and AI systems — end to end. We don't do throwaway brochure sites. We build complex solutions that have to work properly, with AI woven through everything we ship.
            </p>
            <p>
                <span class="text--small">Learn more <a href="/about" class="link">about F925</a> on the about page.</span>
            </p>
        </div>
        <div class="col-r">
            <div
                class="service-cards list-reset gutter-x main-carousel"
                data-flickity={JSON.stringify(flickityOptions)}>
                <ServicesCard
                    title="Website Products & Platforms"
                    description="We design and build websites, web apps, and platforms that actually work — fast, intelligent, and woven through with AI. Not brochures. Real products people use, with the performance, accessibility, and detail to match."
                    tags={[
                        { title: 'Bespoke websites' },
                        { title: 'Web apps & platforms' },
                        { title: 'E-commerce' },
                        { title: 'AI built in' },
                        { title: 'Performance & SEO' },
                        { title: 'Accessibility' },
                    ]}
                    url="/services/website-products" />
                <ServicesCard
                    title="AI Agents & Chatbots"
                    description="Custom AI assistants like Gary — trained on your business. RAG plus actions, lead-generation chat, and support agents that don't just talk, they do things. A site without a chatbot today is already falling behind."
                    tags={[
                        { title: 'Custom chatbots' },
                        { title: 'RAG + actions' },
                        { title: 'Lead generation' },
                        { title: 'Support agents' },
                        { title: 'Agentic workflows' },
                        { title: 'Bespoke AI' },
                    ]}
                    url="/services/ai-agents" />
                <ServicesCard
                    title="Automation & Systems"
                    description="Processes without automation are just work. We automate the repetitive and connect your systems — CRM, ERP, POS, pipelines — so the computer does what a computer should, and your team does what only people can."
                    tags={[
                        { title: 'Process automation' },
                        { title: 'CRM / ERP / POS' },
                        { title: 'Integrations' },
                        { title: 'Data pipelines' },
                        { title: 'Dashboards' },
                        { title: 'Workflow design' },
                    ]}
                    url="/services/automation" />

                <div class="service-card --link">
                    <a class="flex justify-between items-center no-outline" href="/portfolio">
                    <div class="overlay"></div>
                        <video autoplay loop muted playsinline src="/assets/images/view-all-work.mp4">
                            <track kind="metadata" />
                        </video>
                        <h2 class="text--subheadingLg mb-0">
                            View
                            <br />
                            our work
                        </h2>
                        <div class="icon-effect flex items-end">
                            <Icon name="arrowBig" extraClass="icon-effect--1" />
                            <Icon name="arrowBig" extraClass="icon-effect--2" />
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </div>
</Layout>
