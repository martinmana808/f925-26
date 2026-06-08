<script>
    import Icon from '../components/Icon.svelte'
    import Layout from '../components/layout/Layout.svelte'
    import { onMount, onDestroy } from 'svelte'
    
    let calendlyContainer;

    onMount(() => {
        document.body.classList.add('template--contact')
        
        // Load Calendly script
        const script = document.createElement('script')
        script.src = 'https://assets.calendly.com/assets/external/widget.js'
        script.async = true
        document.head.appendChild(script)

        // Initialize Calendly after a short delay to ensure the script is loaded
        setTimeout(() => {
            if (calendlyContainer) {
                // @ts-ignore
                window.Calendly?.initInlineWidget({
                    url: 'https://calendly.com/martinmana808/martinmana-15m?hide_event_type_details=1&hide_gdpr_banner=1',
                    parentElement: calendlyContainer,
                    prefill: {},
                    utm: {}
                });
            }
        }, 1000);
    })

    onDestroy(() => {
        document.body.classList.remove('template--contact')
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
                <h1 class="text--section">Book a free call</h1>
                <h2 class="text--subheadingSm">Take the first step — we'll take it from there.</h2>
                <div>
                    <p>Tell us about your project, your business, or how you currently do things. There's always room to optimize, automate, and grow. Even if you're not sure what you need yet, that's okay — we'll talk it through, find the right direction, and map out the next steps. Whether we end up working together or not, you'll walk away with clarity.</p>
                    <br>
                    <p class="text--small">
                    Prefer the old-school way? <a class="link" href="contact2">Send us a message</a> and we'll get back to you.
                    </p>
                </div>
            {/if}
        </div>

        <div class="col-r">
            <div class="calendlyContainer"
                bind:this={calendlyContainer}
                style="min-width:320px;height:700px;">
            </div>
        </div>
    </div>
</Layout>
