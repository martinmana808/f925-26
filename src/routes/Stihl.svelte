<script>
    import Layout from '../components/layout/Layout.svelte'
    import Icon from '../components/Icon.svelte'
    import StihlShopSlider from '../components/StihlShopSlider.svelte'
    import { onMount, onDestroy } from 'svelte'

    onMount(() => {
        document.body.classList.add('template--services-detail')
        // On a hot-reload swap the OLD instance's onDestroy fires after this
        // mount and strips the class; re-assert it on the next tick so dev
        // edits never unlock the template layout.
        const t = setTimeout(() => document.body.classList.add('template--services-detail'), 0)
        return () => clearTimeout(t)
    })
    onDestroy(() => {
        document.body.classList.remove('template--services-detail')
    })

    let currentPath = window.location.pathname

    let businessName = ''
    let formMessage = ''

    // Privacy / Terms open in an in-page modal (iframed) so visitors never
    // leave the page. null | 'privacy' | 'terms'
    let legalModal = null
    const legalUrls = {
        privacy: 'https://stihl-social-posting.netlify.app/privacy',
        terms: 'https://stihl-social-posting.netlify.app/terms',
    }

    function onKeydown(event) {
        if (event.key === 'Escape') legalModal = null
    }

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
        <span>Get set up — $89/month</span>
        <Icon name="arrowDown" extraClass="" />
    </a>
    <div class="grid gutter-x h-100 relative">
        <div class="col-l">
            <div class="flex flex-column items-start h-100">
                <h1 class="text--section">Brandkit posting</h1>
                <!-- <h2 class="text--subheadingSm"></h2> -->
                <p>
                    If you don't post the designed, scheduled marketing STIHL hands you every month, you're
                    wasting money, wasting reach, wasting potential. We make sure none of it goes to waste:
                    every brand-kit post, published to your Facebook and Instagram for you, exactly as
                    designed. Nothing for you to do.
                </p>
                <div class="buttons">
                    <a href="#stihl-form" class="button --1">
                        <span>Get set up</span>
                    </a>
                </div>
                <div class="text--small stihl-hero__note">$89/month. No setup fee.</div>
            </div>
        </div>

        <div class="col-r">
            <div class="spacer-lg l-hidden"></div>

            <StihlShopSlider />

            <!-- <section class="stihl-section">
                <div class="wysiwyg">
                    <p>
                        Every STIHL brand-kit post, published to your Facebook and Instagram for you — on
                        STIHL's schedule, exactly as designed. It's marketing you already pay for; we make
                        sure it actually goes out. Nothing for you to do.
                    </p>
                </div>
            </section> -->

            <section class="stihl-section">
                <h2 class="text--subheadingSm">An outdated, inconsistent feed destroys trust in your shop</h2>
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
                <h2 class="text--subheadingSm">What you get</h2>
                <div class="stihl-compare">
                    <div class="stihl-compare__card --get">
                        <ul class="list-reset">
                            <li>Posts on STIHL's dates, identical to the official brand kit</li>
                        </ul>
                    </div>
                    <div class="stihl-compare__card --get">
                        <ul class="list-reset">
                            <li>Facebook and Instagram, both covered</li>
                        </ul>
                    </div>
                    <div class="stihl-compare__card --get">
                        <ul class="list-reset">
                            <li>A feed that's never empty or out of date</li>
                        </ul>
                    </div>
                    <div class="stihl-compare__card --get">
                        <ul class="list-reset">
                            <li>Zero effort, nothing to manage</li>
                        </ul>
                    </div>
                    <div class="spacer-2"></div>
                        <div class="stihl-note2 text--small">
<strong>Consistency is the exactly what we want</strong>, so we publish STIHL's official calendar exactly as STIHL designed it, that way stay 100% in sync and consistent with the brand. This brandkit is a marketing tool you already have, but you don't use.
                        </div>
                </div>
            </section>

            <section class="stihl-section">
                <h2 class="text--subheadingSm">Price</h2>
                <div class="stihl-price">
                    <div class="stihl-price__amount">
                        $89
                        <span>/ month per store</span>
                    </div>
                    <div class="text--subheadingSm mb-0">No setup fee.</div>

                    <div class="text--small ">
                    🥳 That's $3 bucks a day!
                    </div>
                    <div class="text--xsmall stihl-price__fine">
                        Minimum term 3 months; after that, month-to-month — cancel anytime.
                    </div>
                </div>
                <div class="spacer-2"></div>
                
                <aside class="stihl-note2 text--small">
                    <strong>And it compounds.</strong> Every post stays on your feed, so month after month your shop looks
                    more established, more active, more trustworthy — while the price stays the same.
                    The longer it runs, the more every dollar buys.
                    
                </aside>
               
            </section>
            

           

            <section class="stihl-section" id="stihl-form">
                {#if formMessage.includes('Error') || formMessage.length === 0}
                    <h2 class="text--subheadingSm">Get set up</h2>
                    <p>Tell us your details and we'll get you posting.</p>
                    <div class="spacer-2"></div>
                {/if}
                <form
                    class="stihl-form form"
                    action="https://usebasin.com/f/ffd6ed74ada9"
                    method="POST"
                    on:submit={handleSubmit}>
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
                <div class="mt-4 stihl-hero__note text--small">
                <a
                    class="link"
                    href={legalUrls.privacy}
                    on:click|preventDefault={() => (legalModal = 'privacy')}>
                    Privacy
                </a>
                ·
                <a
                    class="link"
                    href={legalUrls.terms}
                    on:click|preventDefault={() => (legalModal = 'terms')}>
                    Terms
                </a>
            </div>
            </section>

             

            
        </div>
    </div>

    {#if legalModal}
        <div
            class="stihl-legal-modal"
            role="dialog"
            aria-modal="true"
            aria-label={legalModal === 'privacy' ? 'Privacy policy' : 'Terms of service'}>
            <button
                class="stihl-legal-modal__backdrop"
                type="button"
                aria-label="Close"
                on:click={() => (legalModal = null)}></button>
            <div class="stihl-legal-modal__panel">
                <button
                    class="stihl-legal-modal__close"
                    type="button"
                    on:click={() => (legalModal = null)}>
                    <span aria-hidden="true">×</span>
                    <span class="visuallyhidden">Close</span>
                </button>
                <iframe
                    src={legalUrls[legalModal]}
                    title={legalModal === 'privacy' ? 'Privacy policy' : 'Terms of service'} />
            </div>
        </div>
    {/if}
</Layout>

<svelte:window on:keydown={onKeydown} />
