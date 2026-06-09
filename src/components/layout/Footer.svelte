<script>
    import Icon from '../../components/Icon.svelte'
    let isWorkPage = false

    import { onMount } from 'svelte'

    onMount(async () => {
        const path = window.location.pathname
        isWorkPage = path.endsWith('/work')
    })

    // Get the current year
    let currentYear = new Date().getFullYear()

    let currentTime = new Date().toLocaleString('en-NZ', { 
    timeZone: 'Pacific/Auckland',
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
})

let timeInterval
onMount(() => {
    timeInterval = setInterval(() => {
        currentTime = new Date().toLocaleString('en-NZ', { 
            timeZone: 'Pacific/Auckland',
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }, 1000)
    return () => clearInterval(timeInterval)
})
</script>

<footer class="site-footer spacing-x">
    <div class="site-footer__inner mw-container mx-auto w-100 h-100">
        <div class="grid gutter-x h-100">
            <div class="col col-8 l-hidden">
                <!-- <a class="inline-flex" href="/" title="Go to homepage">
                    <img class="" src={siteFooterLogo} alt="Another logo" width="182" height="104" />
                    <span class="visuallyhidden">Go to homepage</span>
                </a> -->
                <!-- <div class="spacer-4 s-hidden"></div> -->
                <nav class="footer-nav">
                    <ul>
                        <li class="">
                            <a class="link--on-hover" href="/services">Services</a>
                        </li>
                        <li class="">
                            <a class="link--on-hover" href="/portfolio">Portfolio</a>
                        </li>
                        <li class="">
                            <a class="link--on-hover" href="/about">About</a>
                        </li>
                        <li class="">
                            <a class="link--on-hover" href="/contact">Contact</a>
                        </li>
                    </ul>
                </nav>
            </div>
            <div class="col-l l-visible">
                <div class="flex items-center h-100">
                    <span class="text--small">{currentTime.toUpperCase()} 🇳🇿</span>
                </div>
            </div>
            <div class="col-r l-flex items-center justify-between">
                <div class="l-hidden mt-3">
                    <nav class="footer__social-nav flex items-center">
                        <ul class="flex gutter-x">
                            <li class="">
                                <a
                                class="flex items-center gutter"
                                target="_blank"
                                rel="noopener"
                                href="https://wa.me/640272182988?text=Hello%20F925!%20:)%0AI%20would%20like%20to%20chat%20about%20a%20project.">
                                <Icon name="social-whatsapp" />
                                <span class="visuallyhidden">Chat on WhatsApp</span>
                            </a>
                        </li>
                            <!-- <li>
                                <a href="https://www.linkedin.com/in/martinmana808/" target="_blank">
                                    <Icon name="social-li" />
                                    <span class="visuallyhidden">Visit F925 on LinkedIn</span>
                                </a>
                            </li> -->
                            <li>
                                <a href="https://www.instagram.com/f925studio/" target="_blank">
                                    <Icon name="social-ig" />
                                    <span class="visuallyhidden">Visit F925 on Instagram</span>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
                <div class="text--small l-flex mt-1">
                    <div>
                        <a class="link--on-hover" href="mailto:f925.limited@gmail.com">
                            f925.limited@gmail.com
                        </a>
                    </div>
                    <div>
                        <a href="tel:+640272182988" class="link--on-hover l-ml-2">
                            +640272182988
                        </a>
                    </div>
                    <div>
                        <a href="https://www.instagram.com/f925studio/" target="_blank" rel="noopener" class="link--on-hover l-ml-2">
                            @f925studio
                        </a>
                    </div>
                </div>
                <div class="footer__copyright text--small l-visible">© {currentYear} F925</div>
            </div>
        </div>
        <div class="footer__copyright text--small hidden mt-1">© {currentYear} F925. All rights reserved.</div>
    </div>
</footer>
