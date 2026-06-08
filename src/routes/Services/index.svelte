<script lang="ts">
    import Layout from '../../components/layout/Layout.svelte'
    import Icon from '../../components/Icon.svelte'
    import ServicesCard from '../../components/ServiceCard.svelte'

    let flickityOptions = { cellAlign: 'left' }

    import { onMount, onDestroy } from 'svelte'

    let setFlickityHeight: () => void

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

        // Set flickity-viewport height based on site-main__inner height
        setFlickityHeight = () => {
            const mainInner = document.querySelector('.site-main__inner') as HTMLElement
            const flickityViewport = document.querySelector('.flickity-viewport') as HTMLElement
            const serviceCards = document.querySelectorAll('.service-card') as NodeListOf<HTMLElement>
            
            if (mainInner && flickityViewport) {
                if (window.innerWidth >= 1000) {
                    // For screens >= 1000px, use mainInner height + 44px
                    const height = `${mainInner.offsetHeight + 44}px`
                    flickityViewport.style.height = height
                    
                    // Set height for each service card
                    serviceCards.forEach(card => {
                        card.style.height = height
                    })
                } else {
                    // For screens < 1000px, find the tallest card
                    let maxHeight = 0
                    serviceCards.forEach(card => {
                        // Reset height to auto to get natural height
                        card.style.height = 'auto'
                        const cardHeight = card.offsetHeight
                        maxHeight = Math.max(maxHeight, cardHeight)
                    })
                    
                    // Set the tallest height to all cards and viewport
                    const height = `${maxHeight}px`
                    flickityViewport.style.height = height
                    serviceCards.forEach(card => {
                        card.style.height = height
                    })
                }
            }
        }

        // Initial set
        setTimeout(setFlickityHeight, 100) // Small delay to ensure Flickity is initialized

        // Update on window resize
        window.addEventListener('resize', setFlickityHeight)
    })

    onMount(() => {
        document.body.classList.add('template--services')
    })
    onDestroy(() => {
        document.body.classList.remove('template--services')
        window.removeEventListener('resize', setFlickityHeight)
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
