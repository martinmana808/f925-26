<script>
    import Icon from '../components/Icon.svelte'
    import Layout from '../components/layout/Layout.svelte'
    import { onMount, onDestroy } from 'svelte'
    onMount(() => {
        document.body.classList.add('template--contact2')
    })
    onDestroy(() => {
        document.body.classList.remove('template--contact2')
    })

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
    import qrContact from '../assets/images/qrContact.svg'

    let credentials = {
        url:
            import.meta.env.MODE === 'development'
                ? '/src/assets/Another-Studio-Credentials.pdf'
                : '../assets/Another-Studio-Credentials.pdf',
        format: 'PDF',
        filesize: '', // Will be filled later
    }
</script>

<Layout>
    <div class="grid gutter-x h-100 relative">
        <div class="col-l">
            {#if !formMessage.includes('Error') && formMessage.length > 0}
                <!-- <h1 class="text--section">🙌</h1> -->
            {:else}{/if}
            {#if formMessage.includes('Error') || formMessage.length === 0}
                <h1 class="text--section">Drop us a line</h1>
                <h2 class="text--subheadingSm">Take that first step. Just send us a message and we'll do the rest.</h2>
                <div class="text--small">
                    Or if you prefer, you can straight away <a class="link" href="contact">book a free consultation</a> and we can have a relaxed chat, no commitments, no pressure, no obligation.
                </div>
                <!-- <div class="mt-md l-visible">
                    <img class="qrContact" src={qrContact} alt="QR code for contract" />
                </div> -->
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
                        <!-- <p>
                            In the meantime, feel free to <a class="link" href="/contact">book a free call</a>
                            and we can talk it through, no pressure.
                        </p> -->
                    </div>
                {/if}
            </form>
            <div class="contact__bottom gutter-x mt-lg">
                <div class="">
                    <a class="link--on-hover" href="mailto:hello@f925.works">hello@f925.works</a>
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
