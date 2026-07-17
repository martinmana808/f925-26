<script>
    import Layout from '../components/layout/Layout.svelte'
    import Icon from '../components/Icon.svelte'
    import StihlShopSlider from '../components/StihlShopSlider.svelte'
    import { onMount, onDestroy } from 'svelte'

    onMount(() => {
        document.body.classList.add('template--services-detail')
    })
    onDestroy(() => {
        document.body.classList.remove('template--services-detail')
    })

    let currentPath = window.location.pathname

    let businessName = ''
    let formMessage = ''

    function handleSubmit(event) {
        event.preventDefault()
        const form = event.target
        const formData = new FormData(form)

        // Honeypot: a real visitor never sees this field — pretend success, send nothing.
        if (formData.get('Website')) {
            formMessage = 'Success'
            return
        }

        fetch(form.action, {
            method: 'POST',
            body: formData,
        })
            .then((response) => {
                if (response.ok) {
                    formMessage = 'Success'
                    if (typeof window.gtag === 'function') {
                        window.gtag('event', 'generate_lead', {
                            event_category: 'stihl-landing',
                            event_label: formData.get('Business') || '',
                        })
                    }
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
    <a class="service-detail__contact-button" href="#stihl-form">
        <span>Get set up — $50/month</span>
        <Icon name="arrowDown" extraClass="" />
    </a>
    <div class="grid gutter-x h-100 relative">
        <div class="col-l">
            <div class="flex flex-column items-start h-100">
                <h1 class="text--section">Effortless socials</h1>
                <h2 class="text--subheadingSm">STIHL tells you what to post. We post it for you. Easy.</h2>
                <p class="">
                    Every STIHL brand-kit post, published to your Facebook and Instagram for you — on
                    STIHL's schedule, exactly as designed. It's marketing you already pay for; we make sure it
                    actually goes out. Nothing for you to do.
                </p>
                <div class="buttons">
                    <a href="#stihl-form" class="button --1">
                        <span>Get set up</span>
                    </a>
                </div>
                <div class="text--small stihl-hero__note">$50/month. No setup fee.</div>
            </div>
        </div>

        <div class="col-r">
            <div class="spacer-lg l-hidden"></div>

            <StihlShopSlider />

            <section class="stihl-section">
                <h2 class="text--block">An outdated, inconsistent feed destroys trust in your shop</h2>
                <p>
                    Before anyone walks through your door, they've already looked you up. A feed that's
                    months old reads as unprofessional at best — closed at worst.
                </p>
                <div class="spacer-2"></div>
                <div class="stihl-stats">
                    <div class="stihl-stat">
                        <div class="stihl-stat__value">87%</div>
                        <div class="stihl-stat__label">
                            research a local business online before deciding to visit
                        </div>
                    </div>
                    <div class="stihl-stat">
                        <div class="stihl-stat__value">74%</div>
                        <div class="stihl-stat__label">check a shop's social pages before walking in</div>
                    </div>
                    <div class="stihl-stat">
                        <div class="stihl-stat__value">76%</div>
                        <div class="stihl-stat__label">
                            have visited a shop because of what they saw on its feed
                        </div>
                    </div>
                    <div class="stihl-stat">
                        <div class="stihl-stat__value">$0</div>
                        <div class="stihl-stat__label">
                            to fix yours — the posts are already made, in your STIHL brand kit
                        </div>
                    </div>
                </div>
                <div class="stihl-stats__source text--small">
                    Sources: BrightLocal Local Consumer Review Survey · Sprout Social Consumer Trends Report
                </div>
            </section>

            <section class="stihl-section">
                <div class="wysiwyg">
                    <h2 class="text--subheadingSm">No more wasted marketing</h2>
                    <p>
                        The thing is, STIHL already solved this for you. Every month STIHL New Zealand sends
                        you a professionally designed social calendar — ready-to-post images and captions,
                        part of what you already get as a STIHL dealer. But between the workshop, the counter,
                        and everything else, it rarely makes it online. Marketing you've already paid for goes
                        to waste.
                    </p>
                    <p>
                        We make sure it doesn't. STIHL creates it, we publish it, and your feed stays
                        permanently up to date — you do nothing.
                    </p>
                </div>
            </section>

            <section class="stihl-section">
                <h2 class="text--subheadingSm">How it works</h2>
                <ol class="stihl-steps list-reset">
                    <li>
                        <h3>Connect once.</h3>
                        
                            One click through Facebook. No passwords, ever — you stay in full control and can
                            disconnect anytime from your Facebook settings.
                        
                    </li>
                    <li>
                        <h3>We publish it for you.</h3>
                        
                            Each month we load STIHL's brand-kit calendar and post it to your Facebook Page and
                            Instagram on the exact dates STIHL intends.
                        
                    </li>
                    <li>
                        <h3>You do nothing.</h3>
                        
                            That's the point. No editing, no approvals, no logging in. Your feed stays active
                            and up to date with STIHL's official content — never empty, never months old.
                        
                    </li>
                </ol>
            </section>

            <section class="stihl-section">
                <h2 class="text--subheadingSm">What you get — and what it's not</h2>
                <div class="stihl-compare">
                    <div class="stihl-compare__card --get">
                        <h3>You get</h3>
                        <ul class="list-reset">
                            <li>Posts on STIHL's dates, identical to the official brand kit</li>
                            <li>Facebook and Instagram, both covered</li>
                            <li>A feed that's never empty or out of date</li>
                            <li>Zero effort, nothing to manage</li>
                        </ul>
                    </div>
                    <div class="stihl-compare__card">
                        <h3>What it's not</h3>
                        <p class="text--small">
                            This isn't a marketing agency and it isn't custom content. It publishes STIHL's
                            official calendar exactly as STIHL designed it — that consistency is the whole
                            idea.
                        </p>
                    </div>
                </div>
            </section>

            <section class="stihl-section">
                <h2 class="text--subheadingSm">Price</h2>
                <div class="stihl-price">
                    <div class="stihl-price__amount">
                        $50
                        <span>/ month per location</span>
                    </div>
                    <div class="text--subheadingSm mb-0">No setup fee.</div>
                    <div class="text--small stihl-price__fine">
                        Minimum term 3 months; after that, month-to-month — cancel anytime.
                    </div>
                </div>
            </section>

            <section class="stihl-section">
                <aside class="stihl-note text--small">
                    <strong>One thing to check:</strong> to publish to Instagram you'll need an Instagram
                    Business or Creator account linked to your Facebook Page. A personal Instagram can't be
                    posted to — if you're not set up, we'll help you switch over.
                </aside>
            </section>

            <section class="stihl-section" id="stihl-form">
                {#if formMessage.includes('Error') || formMessage.length === 0}
                    <h2 class="text--subheadingSm">Get set up</h2>
                    <p>Tell us your details and we'll get you posting.</p>
                    <div class="spacer-2"></div>
                {/if}
                <form class="stihl-form form" action="https://usebasin.com/f/ffd6ed74ada9" on:submit={handleSubmit}>
                    {#if formMessage.includes('Error') || formMessage.length === 0}
                        <input type="hidden" name="Location" value={currentPath} />
                        <input
                            type="hidden"
                            name="Subject"
                            value={`STIHL posting enquiry — ${businessName || 'STIHL dealer'}`} />
                        <div class="visuallyhidden" aria-hidden="true">
                            <label for="stihl-website">Leave this field empty</label>
                            <input
                                id="stihl-website"
                                name="Website"
                                type="text"
                                tabindex="-1"
                                autocomplete="off" />
                        </div>
                        <div class="form-field field--text">
                            <label for="stihl-business" class="label visuallyhidden">
                                Business / dealership name
                                <span class="field-required" title="This field is required">*</span>
                            </label>
                            <input
                                id="stihl-business"
                                name="Business"
                                class="input--txt"
                                type="text"
                                bind:value={businessName}
                                placeholder="Business / dealership name *"
                                required />
                        </div>
                        <div class="form-field field--text">
                            <label for="stihl-name" class="label visuallyhidden">
                                Your name
                                <span class="field-required" title="This field is required">*</span>
                            </label>
                            <input
                                id="stihl-name"
                                name="Name"
                                class="input--txt"
                                type="text"
                                value=""
                                placeholder="Your name *"
                                required />
                        </div>
                        <div class="form-field field--text">
                            <label for="stihl-email" class="label visuallyhidden">
                                Email
                                <span class="field-required" title="This field is required">*</span>
                            </label>
                            <input
                                id="stihl-email"
                                name="Email"
                                class="input--txt"
                                type="email"
                                value=""
                                placeholder="Email *"
                                required />
                        </div>
                        <div class="form-field field--text">
                            <label for="stihl-facebook" class="label visuallyhidden">
                                Facebook Page name or URL
                                <span class="field-required" title="This field is required">*</span>
                            </label>
                            <input
                                id="stihl-facebook"
                                name="FacebookPage"
                                class="input--txt"
                                type="text"
                                value=""
                                placeholder="Facebook Page name or URL *"
                                required />
                        </div>
                        <div class="form-field field--text">
                            <label for="stihl-message" class="label visuallyhidden">Message (optional)</label>
                            <textarea id="stihl-message" name="Message" placeholder="Message (optional)"></textarea>
                        </div>
                        <div class="form-field field--submit">
                            <div class="spacer-1"></div>
                            <button type="submit" class="button --1">
                                <span>Get set up</span>
                            </button>
                        </div>
                        {#if formMessage.includes('Error')}
                            <div class="formMessage --error">
                                {formMessage}
                            </div>
                        {/if}
                    {/if}
                    {#if !formMessage.includes('Error') && formMessage.length > 0}
                        <h2 class="text--block">Thanks — we've got your details</h2>
                        <p>We'll be in touch to get you set up.</p>
                    {/if}
                </form>
            </section>

            <div class="mt-4 stihl-hero__note text--small">
                <a
                    class="link"
                    href="https://stihl-social-posting.netlify.app/privacy"
                    target="_blank"
                    rel="noopener">
                    Privacy
                </a>
                ·
                <a
                    class="link"
                    href="https://stihl-social-posting.netlify.app/terms"
                    target="_blank"
                    rel="noopener">
                    Terms
                </a>
            </div>
        </div>
    </div>
</Layout>
