<script>
    import Icon from './Icon.svelte'
    export let currentPath

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

    function goBack() {
        history.back()
    }
</script>

<a class="icon-effect --back inline-flex items-end" href="/services">
    <Icon name="arrow" extraClass="icon-effect--1" />
    <Icon name="arrow" extraClass="icon-effect--2" />
    <span class="visuallyhidden">Go back</span>
</a>
<div class="spacer-2"></div>
<!-- <h1 class="text--breadcrumb l-visible">Services</h1> -->
<ul class="services-nav--lvl1 text--small list-reset l-visible">
    <li>
        <a href="/services/ai-solutions" class={currentPath.includes('/ai-solutions') ? 'active' : ''}>
            AI solutions
        </a>
    </li>
    <li>
        <a href="/services/website-development" class={currentPath.includes('/website-development') ? 'active' : ''}>
            Website development
        </a>
    </li>
    <li>
        <a href="/services/app-development" class={currentPath.includes('/app-development') ? 'active' : ''}>
            App development
        </a>
    </li>
    <li>
        <a href="/services/ux-ui-design" class={currentPath.includes('/ux-ui-design') ? 'active' : ''}>
            UX / UI design
        </a>
    </li>
    <li>
        <a href="/services/graphic-design" class={currentPath.includes('/graphic-design') ? 'active' : ''}>
            Graphic design
        </a>
    </li>
</ul>
<div class="mt-auto text--small w-100 l-visible">
    {#if formMessage.includes('Error') || formMessage.length === 0}
        Questions? Get in touch
    {/if}

    <div class="spacer-2"></div>
    <form
        class="service-detail-form form"
        action="https://usebasin.com/f/ffd6ed74ada9"
        on:submit={handleSubmit}
        id="my-contact-form">
        {#if formMessage.includes('Error') || formMessage.length === 0}
            <input name="Location" class="visuallyhidden" type="text" value={currentPath} />
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
                <input name="Email" class="input--txt" type="email" value="" placeholder="Email *" required />
            </div>
            <div class="form-field field--text">
                <label for="Message" class="label visuallyhidden">Message</label>
                <textarea name="Message" placeholder="Message"></textarea>
            </div>
            <div class="form-field field--submit">
                <div class="spacer-1"></div>
                <button type="submit" class="button">
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
    <div class="spacer-4"></div>
</div>
