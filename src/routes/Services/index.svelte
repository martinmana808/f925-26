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
            <h2 class="text--subheadingSm">A one-stop shop on your way to success</h2>
            <p>
                I offer complete, end-to-end solutions tailored to your business needs. Thanks to the strong network and reliable on-demand team I've built over the years, I'm able to offer a wide range of services and ensure that no loose ends are left behind.
            </p>
            <p>
                <span class="text--small">You can read more about me and my background <a href="/about" class="link">here</a>.</span>
            </p>
        </div>
        <div class="col-r">
            <div
                class="service-cards list-reset gutter-x main-carousel"
                data-flickity={JSON.stringify(flickityOptions)}>
                <ServicesCard
                    title="AI solutions"
                    description="'There's an easier, faster, and more efficient way to get things done.'<br>
                    AI can enhance almost every aspect of your business. I implement AI-powered solutions to streamline workflows, reduce costs, and deliver measurable results."
                    tags={[
                        { title: 'Task Automation' },
                        { title: 'Chatbots & Support' },
                        { title: 'Data Analysis & Decision Making' },
                        { title: 'Marketing Optimization' },
                        { title: 'Employee & Client Onboarding' },
                        { title: 'Bespoke AI Developments' },
                        { title: 'Lead generation' },
                        { title: 'Email marketing' },
                    ]}
                    url="/services/ai-solutions" />
                    <!-- HIS NEEDS REWORK same as the following items. I should put a link to process and how we do it  -->
                <ServicesCard
                    title="UI/UX design"
                    description="I design interfaces that are not only visually striking but also user-friendly to ensure a seamless interaction and optimal usability for an intuitive digital experience."
                    tags={[
                        { title: 'Wireframing' },
                        { title: 'Prototyping' },
                        { title: 'Visual Design' },
                        { title: 'Interaction Design' },
                    ]}
                    url="/services/ux-ui-design" />
                <ServicesCard
                    title="Website development"
                    description="I build websites that amplify your brand, engage users, and drive business growth. I mix fluid and engaging UX with sleek and clean UI. I pay attention to detail. Accessibility, performance, and security are key."
                    tags={[
                        { title: 'Bespoke website' },
                        { title: 'Wordpress' },
                        { title: 'WooCommerce' },
                        { title: 'Shopify' },
                        { title: 'SEO' },
                        { title: 'Performance optimization' },
                    ]}
                    url="/services/website-development" />
                <ServicesCard
                    title="App development"
                    description="I design and build apps with my team to enhance user experiences and streamline operations, delivering intuitive and powerful tools that bring your ideas to life on any platform."
                    tags={[{ title: 'iOS' }, { title: 'Android' }, { title: 'Cross-Platform' }, { title: 'WPA' }]}
                    url="/services/app-development" />
                
                <ServicesCard
                    title="Graphic design"
                    description="From branding to marketing materials, I create compelling visuals that resonate with your audience. My designs communicate your message and elevate your brand identity."
                    tags={[
                        { title: 'Branding' },
                        { title: 'Packaging' },
                        { title: 'Digital media' },
                        { title: 'Promotional Design' },
                    ]}
                    url="/services/graphic-design" />

                <div class="service-card --link">
                    <a class="flex justify-between items-center no-outline" href="/work">
                        <h2 class="text--subheadingLg mb-0">
                            View
                            <br />
                            my work
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
