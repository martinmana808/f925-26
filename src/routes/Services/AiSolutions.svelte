<script>
    import Layout from '../../components/layout/Layout.svelte'
    import ServiceDetail from '../../components/ServiceDetail.svelte'
    import ServiceDetailLeft from '../../components/ServiceDetailLeft.svelte'
    import ServiceDetailLvl2Nav from '../../components/ServiceDetailLvl2Nav.svelte'
    import Icon from '../../components/Icon.svelte'

    let activeTab = 'services-lvl2--support-chatbots'

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
            title: 'Support Chatbots',
            // altTitle: 'Unique & Boutique',
            // linkDemo: 'https://lighthouseco.in',
            // linkLabel: 'lighthouseco.in',
            description:
                'We design intelligent, responsive chatbots that enhance your customer support. These AI-powered solutions handle inquiries, provide instant responses, and improve customer engagement. By automating interactions, we free up your team to focus on more complex tasks, while ensuring a consistent and efficient service experience for your customers.',
            // imageSrc: '/services--bespoke.png',
            // type: 'mockup',
        },
        {
            title: 'Task Automation',
            // altTitle: 'In control; within budget',
            // linkDemo: '',
            // linkLabel: '',
            description:
                'We streamline repetitive tasks with AI-powered automation, improving efficiency and reducing operational costs. Our solutions eliminate manual processes, enabling your team to focus on high-value work. From data entry to scheduling, our automation tools help you save time and boost productivity across every department.',
            // imageSrc: '/path/to/seo-service-image.png',
        },
        {
            title: 'Data Analysis',
            // altTitle: 'Good, great and affordable',
            // linkDemo: '',
            // linkLabel: '',
            description:
                "Harness the power of AI to analyze vast amounts of data and extract actionable insights. Our data-driven solutions help you make informed decisions, identify trends, and improve business strategies. By providing accurate, real-time analysis, we empower you to optimize operations and stay ahead of the competition.",
            // imageSrc: '/path/to/seo-service-image.png',
        },
        {
            title: 'Marketing Optimization',
            // altTitle: 'Bespoke, on the most commonly used platform',
            // linkDemo: '',
            // linkLabel: '',
            description:
                'We leverage AI to optimize your marketing strategies for better engagement and conversion. By analyzing customer data, tracking behavior, and predicting trends, our solutions ensure that your marketing efforts are data-driven and highly effective. From targeting the right audience to maximizing ad spend, we help you achieve measurable results with AI.',
            // imageSrc: '/path/to/seo-service-image.png',
        },
        {
            title: 'Bespoke AI Development',
            // altTitle: 'Bespoke, on the most commonly used platform',
            // linkDemo: '',
            // linkLabel: '',
            description:
                'We create custom AI solutions tailored to the unique needs of your business. From advanced machine learning models to specialized algorithms, our bespoke AI development services are designed to solve specific challenges and unlock new opportunities. With tailored training and seamless integration, we ensure your AI solutions deliver real, tangible value to your operations.',
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
                    { title: 'Support Chatbots' },
                    { title: 'Task Automation' },
                    { title: 'Data Analysis' },
                    { title: 'Marketing Optimization' },
                    { title: 'Bespoke AI Development' },

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
