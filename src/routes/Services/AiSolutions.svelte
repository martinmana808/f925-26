<script>
    import Layout from '../../components/layout/Layout.svelte'
    import ServiceDetail from '../../components/ServiceDetail.svelte'
    import ServiceDetailLeft from '../../components/ServiceDetailLeft.svelte'
    import ServiceDetailLvl2Nav from '../../components/ServiceDetailLvl2Nav.svelte'
    import Icon from '../../components/Icon.svelte'

    import illoSupportChatbots from '../../assets/images/illustrations/support-chatbots.svg'
    import illoLeadGeneration from '../../assets/images/illustrations/lead-generation.svg'
    import illoRagAgents from '../../assets/images/illustrations/rag-agents.svg'
    import illoAgenticWorkflows from '../../assets/images/illustrations/agentic-workflows.svg'
    import illoBespokeAi from '../../assets/images/illustrations/bespoke-ai.svg'

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
            description:
                "We design intelligent, responsive chatbots that handle customer inquiries, give instant answers, and keep service consistent around the clock — like Gary, our own AI interface. By automating the repetitive conversations, we free your team to focus on the complex ones.",
            imageSrc: illoSupportChatbots,
            type: 'illustration',
        },
        {
            title: 'Lead generation',
            description:
                "Our chat agents don't just answer questions — they qualify leads. They learn what a visitor needs, make the case for your business, and capture the details your team needs to follow up, turning your website into an always-on sales conversation.",
            imageSrc: illoLeadGeneration,
            type: 'illustration',
        },
        {
            title: 'RAG agents',
            description:
                "We build private, secure agents that learn from your manuals, documents, and data using retrieval-augmented generation. They give accurate, source-referenced answers grounded in your business — no hallucinated slop.",
            imageSrc: illoRagAgents,
            type: 'illustration',
        },
        {
            title: 'Agentic workflows',
            description:
                "Agents that do things, not just chat. Diagnose, recommend, act — full multi-step workflows that read your systems, make decisions, and execute tasks across email, CRM, and forms.",
            imageSrc: illoAgenticWorkflows,
            type: 'illustration',
        },
        {
            title: 'Bespoke AI',
            description:
                "Custom AI built around a specific problem in your business. From specialized assistants to tailored models and integrations, we design and ship AI that delivers real, measurable value — not a demo.",
            imageSrc: illoBespokeAi,
            type: 'illustration',
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

<Layout >
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
            <h1 class="text--section">AI Agents &amp; Chatbots</h1>
        </div>
        <div class="col-r">
            <ServiceDetailLvl2Nav
                {activeTab}
                {setActiveTab}
                lvl2pages={[
                    { title: 'Support Chatbots' },
                    { title: 'Lead generation' },
                    { title: 'RAG agents' },
                    { title: 'Agentic workflows' },
                    { title: 'Bespoke AI' },
                ]} />

            <ServiceDetail {serviceDetails} {activeTab} {setActiveTab} type="ai" />

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
                        <!-- <div class="text--small">
                            In the meantime, you can also
                            <a class="link" href="/contact">book a free call</a>
                            .
                        </div> -->
                    {/if}
                </form>
            </div>
        </div>
    </div>
</Layout>
