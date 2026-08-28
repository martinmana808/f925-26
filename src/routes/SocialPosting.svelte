<script>
    import Layout from '../components/layout/Layout.svelte'
    import Icon from '../components/Icon.svelte'
    import { onMount, onDestroy } from 'svelte'

    onMount(() => {
        document.body.classList.add('template--services-detail')
        const t = setTimeout(() => document.body.classList.add('template--services-detail'), 0)
        return () => clearTimeout(t)
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

        // Honeypot: a real visitor never sees this field.
        if (formData.get('Website')) {
            formMessage = 'Success'
            return
        }

        fetch(form.action, { method: 'POST', body: formData })
            .then((response) => {
                if (response.ok) {
                    formMessage = 'Success'
                    if (typeof window.gtag === 'function') {
                        window.gtag('event', 'generate_lead', {
                            event_category: 'social-posting-landing',
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
    <a class="service-detail__contact-button" href="#social-form">
        <span>Get started — from $59/mo</span>
        <Icon name="arrowDown" extraClass="" />
    </a>
    <div class="grid gutter-x h-100 relative">
        <div class="col-l">
            <div class="flex flex-column items-start h-100">
                <h1 class="text--section">Socials sorted</h1>
                <p>
                    Your customers check your Facebook and Instagram before they ever call, click or walk in.
                    We keep those feeds professionally active — designed posts, published on a consistent
                    schedule — so your business always looks current, credible and open. You do nothing.
                </p>
                <div class="buttons">
                    <a href="#pricing" class="button --1">
                        <span>See pricing</span>
                    </a>
                </div>
                <div class="text--small sp-hero__note">Done-for-you. From $59/month.</div>
            </div>
        </div>

        <div class="col-r">
            <div class="spacer-lg l-hidden"></div>

            <section class="stihl-section">
                <h2 class="text--subheadingSm">An empty feed quietly costs you customers</h2>
                <p>
                    Nearly everyone looks a business up online before deciding to trust it. A feed that's been
                    silent for months reads as unprofessional at best — closed at worst. The damage is
                    invisible: you never see the customers who checked, weren't convinced, and moved on.
                </p>
                <div class="spacer-2"></div>
                <div class="stihl-stats">
                    <div class="stihl-stat">
                        <div class="stihl-stat__value">87%</div>
                        <div class="stihl-stat__label">research a local business online before deciding to visit</div>
                    </div>
                    <div class="stihl-stat">
                        <div class="stihl-stat__value">74%</div>
                        <div class="stihl-stat__label">check a business's social pages before getting in touch</div>
                    </div>
                    <div class="stihl-stat">
                        <div class="stihl-stat__value">50%</div>
                        <div class="stihl-stat__label">trust a business less when its social feed looks inactive</div>
                    </div>
                    <div class="stihl-stat">
                        <div class="stihl-stat__value">0</div>
                        <div class="stihl-stat__label">minutes a month it takes you — we handle all of it</div>
                    </div>
                </div>
                <div class="stihl-stats__source text--small">
                    Sources: BrightLocal Local Consumer Review Survey · Sprout Social Consumer Trends Report
                </div>
            </section>

            <section class="stihl-section">
                <div class="wysiwyg">
                    <h2 class="text--subheadingSm">Most businesses start posting, then stop</h2>
                    <p>
                        You know it matters, so you post for a few weeks. Then the busy season hits, the counter
                        gets loud, and the feed goes quiet. Six months later it's still quiet — and every person
                        who looked you up in the meantime formed an impression you didn't choose.
                    </p>
                    <p>
                        We remove the willpower from the equation. It's not another tool for you to remember to
                        use — it's a service. We plan it, design it, publish it, and keep it running, month
                        after month, without you lifting a finger.
                    </p>
                </div>
            </section>

            <section class="stihl-section">
                <h2 class="text--subheadingSm">How it works</h2>
                <ol class="stihl-steps list-reset">
                    <li>
                        <h3>We connect once.</h3>
                        You give us access to your Facebook Page and Instagram — securely, through Facebook,
                        no passwords shared. You stay in full control and can disconnect anytime.
                    </li>
                    <li>
                        <h3>We create and schedule.</h3>
                        Each month we build your content — on-brand graphics and written captions — and load a
                        full calendar of posts, timed for when your audience is actually looking.
                    </li>
                    <li>
                        <h3>It posts itself.</h3>
                        Everything publishes automatically to Facebook and Instagram, on schedule. You get a
                        feed that's always active and on-brand — and you never had to think about it.
                    </li>
                </ol>
            </section>

            <section class="stihl-section">
                <h2 class="text--subheadingSm">What you get</h2>
                <div class="stihl-compare">
                    <div class="stihl-compare__card --get">
                        <ul class="list-reset"><li>A consistently active, professional feed</li></ul>
                    </div>
                    <div class="stihl-compare__card --get">
                        <ul class="list-reset"><li>On-brand posts designed by a real studio</li></ul>
                    </div>
                    <div class="stihl-compare__card --get">
                        <ul class="list-reset"><li>Facebook and Instagram, both handled</li></ul>
                    </div>
                    <div class="stihl-compare__card --get">
                        <ul class="list-reset"><li>One flat monthly fee — zero effort</li></ul>
                    </div>
                </div>
                <div class="spacer-2"></div>
                <aside class="stihl-note2 text--small">
                    <strong>We're a design studio, not a scheduling app.</strong> The posts look like they belong to
                    your brand because they're made by people who design brands for a living — not spun out of a
                    template.
                </aside>
            </section>

            <section class="stihl-section" id="pricing">
                <h2 class="text--subheadingSm">Pricing</h2>
                <p>Pick the cadence that fits. Every plan covers Facebook + Instagram, fully managed.</p>
                <div class="spacer-2"></div>

                <div class="sp-tiers">
                    <div class="sp-tier">
                        <div class="sp-tier__name">Publish</div>
                        <div class="sp-tier__price">$59<span>/mo</span></div>
                        <div class="sp-tier__tag">You create, we run it</div>
                        <ul class="sp-tier__list list-reset">
                            <li>Up to <strong>12 posts / month</strong> (3 a week)</li>
                            <li>You supply images + captions</li>
                            <li>We schedule + publish to FB + IG</li>
                            <li>Reliable, monitored delivery</li>
                        </ul>
                        <a href="#social-form" class="button --1 sp-tier__cta"><span>Choose Publish</span></a>
                    </div>

                    <div class="sp-tier --featured">
                        <div class="sp-tier__flag">Most popular</div>
                        <div class="sp-tier__name">Managed</div>
                        <div class="sp-tier__price">$149<span>/mo</span></div>
                        <div class="sp-tier__tag">We create and run it</div>
                        <ul class="sp-tier__list list-reset">
                            <li><strong>16 posts / month</strong> (4 a week)</li>
                            <li><strong>We design</strong> the graphics + write captions</li>
                            <li>Monthly content plan, on your brand</li>
                            <li>Facebook + Instagram, fully managed</li>
                            <li>One round of revisions each month</li>
                        </ul>
                        <a href="#social-form" class="button --1 sp-tier__cta"><span>Choose Managed</span></a>
                    </div>

                    <div class="sp-tier">
                        <div class="sp-tier__name">Full Studio</div>
                        <div class="sp-tier__price">$499<span>/mo</span></div>
                        <div class="sp-tier__tag">Your whole presence, handled</div>
                        <ul class="sp-tier__list list-reset">
                            <li><strong>Daily posting</strong> (20+ / month)</li>
                            <li>Everything in Managed, plus:</li>
                            <li>Reels + Stories</li>
                            <li>Seasonal campaigns</li>
                            <li>Quarterly strategy check-in</li>
                        </ul>
                        <a href="#social-form" class="button --1 sp-tier__cta"><span>Choose Full Studio</span></a>
                    </div>
                </div>

                <div class="text--xsmall sp-fine">
                    Prices in NZD, ex GST. Minimum term 3 months, then month-to-month —
                    cancel anytime. Need something in between, or a multi-location rate? Just ask.
                </div>
            </section>

            <section class="stihl-section" id="social-form">
                {#if formMessage.includes('Error') || formMessage.length === 0}
                    <h2 class="text--subheadingSm">Get started</h2>
                    <p>Tell us about your business and we'll put together a plan.</p>
                    <div class="spacer-2"></div>
                {/if}
                <form
                    class="stihl-form form"
                    action="https://usebasin.com/f/ffd6ed74ada9"
                    method="POST"
                    on:submit={handleSubmit}>
                    {#if formMessage.includes('Error') || formMessage.length === 0}
                        <input type="hidden" name="Location" value={currentPath} />
                        <input type="hidden" name="Service" value="Social media posting" />
                        <input
                            type="hidden"
                            name="Subject"
                            value={`Social posting enquiry — ${businessName || 'new lead'}`} />
                        <div class="visuallyhidden" aria-hidden="true">
                            <label for="sp-website">Leave this field empty</label>
                            <input id="sp-website" name="Website" type="text" tabindex="-1" autocomplete="off" />
                        </div>
                        <div class="form-field field--text">
                            <label for="sp-business" class="label visuallyhidden">Business name *</label>
                            <input id="sp-business" name="Business" class="input--txt" type="text"
                                bind:value={businessName} placeholder="Business name *" required />
                        </div>
                        <div class="form-field field--text">
                            <label for="sp-name" class="label visuallyhidden">Your name *</label>
                            <input id="sp-name" name="Name" class="input--txt" type="text"
                                placeholder="Your name *" required />
                        </div>
                        <div class="form-field field--text">
                            <label for="sp-email" class="label visuallyhidden">Email *</label>
                            <input id="sp-email" name="Email" class="input--txt" type="email"
                                placeholder="Email *" required />
                        </div>
                        <div class="form-field field--text">
                            <label for="sp-social" class="label visuallyhidden">Instagram or Facebook</label>
                            <input id="sp-social" name="SocialHandle" class="input--txt" type="text"
                                placeholder="Your Instagram or Facebook (optional)" />
                        </div>
                        <div class="form-field field--text">
                            <label for="sp-plan" class="label visuallyhidden">Which plan</label>
                            <input id="sp-plan" name="Plan" class="input--txt" type="text"
                                placeholder="Which plan interests you? (optional)" />
                        </div>
                        <div class="form-field field--text">
                            <label for="sp-message" class="label visuallyhidden">Message (optional)</label>
                            <textarea id="sp-message" name="Message" placeholder="Anything you'd like us to know (optional)"></textarea>
                        </div>
                        <div class="form-field field--submit">
                            <div class="spacer-1"></div>
                            <button type="submit" class="button --1"><span>Send</span></button>
                        </div>
                        {#if formMessage.includes('Error')}
                            <div class="formMessage --error">{formMessage}</div>
                        {/if}
                    {/if}
                    {#if !formMessage.includes('Error') && formMessage.length > 0}
                        <h2 class="text--block">Thanks — we've got your details</h2>
                        <p>We'll be in touch shortly with a plan.</p>
                    {/if}
                </form>
            </section>
        </div>
    </div>
</Layout>

<style>
    .sp-tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
    }
    @media (max-width: 800px) {
        .sp-tiers {
            grid-template-columns: 1fr;
        }
    }
    .sp-tier {
        border: 1px solid currentColor;
        border-radius: 12px;
        padding: 1.4rem 1.2rem;
        display: flex;
        flex-direction: column;
        position: relative;
    }
    .sp-tier.--featured {
        border-width: 2px;
    }
    .sp-tier__flag {
        position: absolute;
        top: -0.7rem;
        left: 1.2rem;
        font-size: 0.65rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-weight: 700;
        background: currentColor;
        padding: 0.15rem 0.6rem;
        border-radius: 99px;
    }
    .sp-tier__flag :global(*),
    .sp-tier.--featured .sp-tier__flag {
        color: inherit;
    }
    .sp-tier__flag {
        color: #c8a04a;
    }
    .sp-tier__name {
        font-weight: 700;
        font-size: 1.05rem;
        margin-top: 0.3rem;
    }
    .sp-tier__price {
        font-size: 2.1rem;
        font-weight: 700;
        line-height: 1.1;
        margin: 0.4rem 0 0.1rem;
    }
    .sp-tier__price span {
        font-size: 0.9rem;
        font-weight: 400;
        opacity: 0.7;
    }
    .sp-tier__tag {
        font-size: 0.8rem;
        opacity: 0.7;
        margin-bottom: 0.9rem;
    }
    .sp-tier__list {
        font-size: 0.85rem;
        line-height: 1.5;
        margin: 0 0 1.2rem;
        flex: 1;
    }
    .sp-tier__list li {
        padding: 0.28rem 0;
        border-bottom: 1px solid rgba(128, 128, 128, 0.18);
    }
    .sp-tier__list li:last-child {
        border-bottom: 0;
    }
    .sp-tier__cta {
        align-self: flex-start;
    }
    .sp-fine {
        margin-top: 1.2rem;
        opacity: 0.7;
    }
</style>
