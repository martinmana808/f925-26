<script>
    import Icon from '../components/Icon.svelte'
    import Layout from '../components/layout/Layout.svelte'
    import { onMount, onDestroy } from 'svelte'

    onMount(() => {
        document.body.classList.add('template--contact')

        // --- Book a free call (Calendly) — commented out, kept for easy restore ---
        // const script = document.createElement('script')
        // script.src = 'https://assets.calendly.com/assets/external/widget.js'
        // script.async = true
        // document.head.appendChild(script)
        // setTimeout(() => {
        //     if (calendlyContainer) {
        //         // @ts-ignore
        //         window.Calendly?.initInlineWidget({
        //             url: 'https://calendly.com/martinmana808/martinmana-15m?hide_event_type_details=1&hide_gdpr_banner=1',
        //             parentElement: calendlyContainer,
        //             prefill: {},
        //             utm: {}
        //         });
        //     }
        // }, 1000);
    })

    onDestroy(() => {
        document.body.classList.remove('template--contact')
    })

    // Get the current pathname
    let currentPath = window.location.pathname

    function isActive(basePath) {
        const base = basePath.endsWith('/') ? basePath : `${basePath}/`
        return currentPath.startsWith(base)
    }

    function updatePath() {
        currentPath = window.location.pathname
    }

    window.addEventListener('popstate', updatePath)

    onMount(() => {
        currentPath = window.location.pathname
    })

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
</script>

<Layout>
    <div class="grid gutter-x h-100 relative">
        <div class="col-l">
            {#if formMessage.includes('Error') || formMessage.length === 0}
                <h1 class="text--section">Drop us a line</h1>
                <h2 class="text--subheadingSm">Take that first step — tell us what you're thinking and we'll take it from there.</h2>
                <div class="wysiwyg text--small">
                    <p>Tell us about your project, your business, or how you currently do things. There's always room to optimize, automate, and grow. Even if you're not sure what you need yet, that's okay — send us a message and we'll talk it through, find the right direction, and map out the next steps. Whether we end up working together or not, you'll walk away with clarity.</p>
                </div>
            {/if}
        </div>

        <div class="col-r">
            <form
                class="form contact-form --inline-labels"
                action="https://usebasin.com/f/ffd6ed74ada9"
                on:submit={handleSubmit}
                id="my-contact-form"
                method="POST">
                {#if formMessage.includes('Error') || formMessage.length === 0}
                    <input name="Location" class="visuallyhidden" type="text" value={currentPath} />
                    <div class="form-field field--text">
                        <input name="Name" class="input--txt" type="text" value="" placeholder=" " required />
                        <label for="Name" class="label">
                            Name
                            <span class="field-required" title="This field is required">*</span>
                        </label>
                    </div>
                    <div class="form-field field--text">
                        <input name="Email" class="input--txt" type="email" value="" placeholder=" " required />
                        <label for="Email" class="label">
                            Email
                            <span class="field-required" title="This field is required">*</span>
                        </label>
                    </div>
                    <div class="form-field field--text">
                        <textarea name="Message" placeholder=" "></textarea>
                        <label for="Message" class="label">Message</label>
                    </div>
                    <div class="form-field field--submit">
                        <button type="submit" class="button --1">
                            <span>Send message</span>
                        </button>
                    </div>
                    {#if formMessage.includes('Error')}
                        <div class="formMessage --error">
                            {formMessage}
                        </div>
                    {/if}
                {/if}
                {#if !formMessage.includes('Error') && formMessage.length > 0}
                    <div class="text--subheadingLg mb-0">
                        Thank you
                        <br />
                        for your message
                    </div>

                    <div class="mt-sm">
                        <p>You are a legend. We will be in touch shortly.</p>
                    </div>
                {/if}
            </form>
            <div class="contact__bottom gutter-x mt-lg">
                <div class="">
                    <a class="link--on-hover" href="mailto:f925.limited@gmail.com">f925.limited@gmail.com</a>
                </div>
                <div>
                    <div>
                        <a class="link--on-hover" href="tel:+64 027 218 2988">+64 027 218 2988</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</Layout>
