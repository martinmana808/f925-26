<script>
    import Layout from '../../components/layout/Layout.svelte'
    import ServiceDetail from '../../components/ServiceDetail.svelte'
    import ServiceDetailLeft from '../../components/ServiceDetailLeft.svelte'
    import ServiceDetailLvl2Nav from '../../components/ServiceDetailLvl2Nav.svelte'
    import Icon from '../../components/Icon.svelte'

    let activeTab = 'services-lvl2--bespoke-website'

    function setActiveTab(tabId) {
        activeTab = tabId
    }

    // Get the current pathname
    let currentPath = window.location.pathname

    // Function to check if a given path is active
    function isActive(basePath) {
        // Ensure basePath ends with a slash for consistent matching
        const base = basePath.endsWith('/') ? basePath : `${basePath}/`

        // Check if currentPath starts with basePath
        return currentPath.startsWith(base)
    }

    // Update currentPath on client-side navigation
    function updatePath() {
        currentPath = window.location.pathname
        console.log(currentPath)
    }

    window.addEventListener('popstate', updatePath)

    import { onMount, onDestroy } from 'svelte'
    onMount(() => {
        currentPath = window.location.pathname
    })

    onMount(() => {
        document.body.classList.add('template--services-detail')
    })
    onDestroy(() => {
        document.body.classList.remove('template--services-detail')
    })

    let serviceDetails = [
        {
            title: 'Bespoke Website',
            altTitle: 'Unique & Boutique',
            linkDemo: 'https://lighthouseco.in',
            linkLabel: 'lighthouseco.in',
            description:
                "A bespoke custom boutique website is a meticulously crafted digital experience tailored to your brand's distinct needs, blending function and aesthetics seamlessly. I create these unique experiences to make a bold, meaningful impact, setting your brand apart and driving a significant leap forward for your business.",
            imageSrc: '/services--bespoke.png',
            type: 'mockup',
        },
        {
            title: 'Wordpress',
            altTitle: 'In control; within budget',
            // linkDemo: '',
            // linkLabel: '',
            description:
                "A WordPress website offers unmatched flexibility and customization options, allowing me to craft a solution that perfectly aligns with your brand. I design for scalability and SEO optimization, making it ideal for businesses looking for a robust, easy-to-manage online presence that can grow with them.",
            // imageSrc: '/path/to/seo-service-image.png',
        },
        {
            title: 'WooCommerce',
            altTitle: 'Good, great and affordable',
            // linkDemo: '',
            // linkLabel: '',
            description:
                "I implement WooCommerce to bring powerful e-commerce capabilities to your website, tailored to your store's specific needs. Built within WordPress, I provide endless customization options and seamless integration. It's the perfect platform for businesses that need to manage products, sales, and customers while maintaining a visually stunning and user-friendly site. With my WooCommerce implementation, you get the flexibility and performance of WordPress combined with top-tier e-commerce functionality.",
            // imageSrc: '/path/to/seo-service-image.png',
        },
        {
            title: 'Shopify',
            altTitle: 'Bespoke, on the most commonly used platform',
            // linkDemo: '',
            // linkLabel: '',
            description:
                'Shopify offers a streamlined, user-friendly platform that allows your business to get up and running quickly while maintaining a professional look. I create custom Shopify stores that blend beautiful design with powerful functionality, providing the perfect balance between aesthetics and performance to drive online sales and customer engagement.',
            // imageSrc: '/path/to/seo-service-image.png',
        },
    ]
    let formMessage = ''
    function handleSubmit(event) {
        event.preventDefault()
        const form = event.target
        const formData = new FormData(form)

        fetch(form.action, {
            method: 'POST',
            body: formData,
        })
            .then((response) => {
                if (response.ok) {
                    formMessage = 'Success'
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
    function focusFirstInput() {
        const form = document.getElementById('service-detail-form--mobile')
        if (form) {
            // const formPosition = form.getBoundingClientRect().top + window.pageYOffset
            // window.scrollTo({
            //     top: formPosition - 50,
            //     behavior: 'smooth',
            // })
            setTimeout(() => {
                const firstInput = form.querySelector('input')
                if (firstInput) {
                    firstInput.focus()
                } else {
                    console.log('No input found in the form')
                }
            }, 1000)
        } else {
            console.log('Form not found')
        }
    }
</script>

<Layout>
    <a class="service-detail__contact-button" on:click={focusFirstInput} href="#service-detail-form--mobile">
        <span>Questions? Get in touch</span>
        <Icon name="arrowDown" extraClass="" />
    </a>
    <div class="grid gutter-x h-100 relative">
        <div class="col-l l-visible">
            <div class="flex flex-column items-start h-100">
                <ServiceDetailLeft {currentPath} />
            </div>
        </div>
        <div class="col-l l-hidden service-detail__headings--mobile">
            <a href="/services" class="icon-effect --back inline-flex items-end">
                <Icon name="arrow" extraClass="icon-effect--1" />
                <Icon name="arrow" extraClass="icon-effect--2" />
                <span class="visuallyhidden">Go back</span>
            </a>
            <div class="spacer-1"></div>
            <h1 class="text--section">Website Development</h1>
        </div>
        <div class="col-r">
            <ServiceDetailLvl2Nav
                {activeTab}
                {setActiveTab}
                lvl2pages={[
                    { title: 'Bespoke website' },
                    { title: 'Wordpress' },
                    { title: 'WooCommerce' },
                    { title: 'Shopify' },
                ]} />

            <ServiceDetail {serviceDetails} {activeTab} {setActiveTab} />

            <div class="mt-lg text--small w-100 l-hidden">
                {#if formMessage.includes('Error') || formMessage.length === 0}
                    <div class="text--subheadingSm mb-0">Questions? Get in touch</div>
                {/if}

                <div class="spacer-2"></div>
                <form
                    id="service-detail-form--mobile"
                    class="service-detail-form form"
                    action="https://usebasin.com/f/ffd6ed74ada9"
                    on:submit={handleSubmit}>
                    {#if formMessage.includes('Error') || formMessage.length === 0}
                        <div class="form-field field--text">
                            <label for="Name" class="label visuallyhidden">
                                Name
                                <span class="field-required" title="This field is required">*</span>
                            </label>
                            <input name="Name" class="input--txt" type="text" value="" placeholder="Name *" required />
                        </div>
                        <div class="form-field field--text">
                            <label for="Email" class="label visuallyhidden">
                                Email
                                <span class="field-required" title="This field is required">*</span>
                            </label>
                            <input
                                name="Email"
                                class="input--txt"
                                type="email"
                                value=""
                                placeholder="Email *"
                                required />
                        </div>
                        <div class="form-field field--text">
                            <label for="Message" class="label visuallyhidden">Message</label>
                            <textarea name="Message" placeholder="Message"></textarea>
                        </div>
                        <div class="form-field field--submit">
                            <div class="spacer-1"></div>
                            <button type="submit" class="button --1">
                                <span>Send message</span>
                            </button>
                        </div>
                        <input name="Location" class="visuallyhidden" type="text" value={currentPath} />
                        {#if formMessage.includes('Error')}
                            <div class="formMessage --error">
                                {formMessage}
                            </div>
                        {/if}
                    {/if}
                    {#if !formMessage.includes('Error') && formMessage.length > 0}
                        <div class="text--subheadingSm mb-0">Thank you for your message</div>
                        <div class="spacer-1"></div>
                        You are a legend. We will be in touch shortly.
                        <br />
                        <div class="spacer-1"></div>
                        <div class="text--small">
                            Until then, feel free to visit our
                            <a class="link" href="https://linktr.ee/weareanother.studio" target="_blank">linktr.ee</a>
                            .
                        </div>
                    {/if}
                </form>
            </div>
        </div>
    </div>
</Layout>
