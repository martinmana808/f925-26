<script>
    import Layout from '../../components/layout/Layout.svelte'
    import ServiceDetail from '../../components/ServiceDetail.svelte'
    import ServiceDetailLeft from '../../components/ServiceDetailLeft.svelte'
    import ServiceDetailLvl2Nav from '../../components/ServiceDetailLvl2Nav.svelte'
    import Icon from '../../components/Icon.svelte'

    let activeTab = 'services-lvl2--wireframing'

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
            title: 'Wireframing',
            // altTitle: 'Unique & Boutique',
            // linkDemo: 'https://lighthouseco.in',
            // linkLabel: 'lighthouseco.in',
            description:
                'Wireframing is the blueprint of your digital product. It provides a clear, visual representation of the layout, structure, and functionality of your interface, allowing you to map out the user journey and prioritize essential features. This crucial step helps streamline the design process, ensuring a solid foundation for a user-friendly experience before diving into detailed design elements.',
            imageSrc: '/services--wireframing.jpg',
        },
        {
            title: 'Prototyping',
            // altTitle: 'In control; within budget',
            // linkDemo: '',
            // linkLabel: '',
            description:
                'Prototyping brings your ideas to life, transforming wireframes into interactive models that simulate user interactions. This stage allows you to test functionality, gather feedback, and refine the user experience early in the design process. With prototypes, you can validate concepts and make informed decisions, ultimately saving time and resources while enhancing the final product.',
            imageSrc: '/services--prototyping.png',
            // imageSrc: '/path/to/seo-service-image.png',
        },
        {
            title: 'Visual Design',
            // altTitle: 'Who said good, great and affordable could not co-exist?',
            // linkDemo: '',
            // linkLabel: '',
            description:
                'Visual design is where aesthetics meet functionality. This stage focuses on creating a cohesive and engaging visual language that aligns with your brand identity. From color schemes and typography to imagery and layout, effective visual design not only enhances the user experience but also reinforces brand recognition and trust, making your digital product both beautiful and user-friendly.',
            // imageSrc: '/path/to/seo-service-image.png',
        },
        {
            title: 'Interaction Design',
            // altTitle: 'Bespoke, on the most commonly used platform',
            // linkDemo: '',
            // linkLabel: '',
            description:
                'Interaction design focuses on how users engage with your product. This involves crafting intuitive and seamless interactions that enhance the user experience, ensuring that every action feels natural and satisfying. By considering elements like feedback, transitions, and affordances, interaction design creates a responsive environment that keeps users engaged and encourages exploration, making your digital product a pleasure to use.',
            // imageSrc: '/path/to/seo-service-image.png',
        },
    ]
    function goBack() {
        history.back()
    }
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
            <h1 class="text--section">UX/UI design</h1>
        </div>
        <div class="col-r">
            <ServiceDetailLvl2Nav
                {activeTab}
                {setActiveTab}
                lvl2pages={[
                    { title: 'Wireframing' },
                    { title: 'Prototyping' },
                    { title: 'Visual Design' },
                    { title: 'Interaction Design' },
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
