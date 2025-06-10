<script>
    import Icon from '../../components/Icon.svelte'
    import siteFooterLogo from '../../assets/images/logo--footer.svg'
    export let selectRandomImages
    let isWorkPage = false

    let credentials = {
        url:
            import.meta.env.MODE === 'development'
                ? '/src/assets/Another-Studio-Credentials.pdf'
                : '../assets/Another-Studio-Credentials.pdf',
        format: 'PDF',
        filesize: '', // Will be filled later
    }

    import { onMount } from 'svelte'

    onMount(async () => {
        const path = window.location.pathname
        isWorkPage = path.endsWith('/work')

        // // Fetch the PDF file and calculate size
        // try {
        //     const response = await fetch(credentials.url)
        //     if (!response.ok) {
        //         throw new Error(`Failed to fetch PDF: ${response.statusText}`)
        //     }
        //     const blob = await response.blob()
        //     const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2) + ' MB'
        //     credentials.filesize = sizeInMB
        // } catch (error) {
        //     console.error('Failed to download PDF and calculate size:', error)
        //     credentials.filesize = 'Unknown size'
        // }
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
                <a class="inline-flex" href="/" title="Go to homepage">
                    <img class="" src={siteFooterLogo} alt="Another logo" width="182" height="104" />
                    <span class="visuallyhidden">Go to homepage</span>
                </a>
            </div>
            <div class="col col-4 l-hidden">
                <div class="spacer-4 s-hidden"></div>
                <nav class="footer-nav">
                    <ul>
                        <li class="">
                            <a class="link--on-hover" href="/services">Services</a>
                        </li>
                        <li class="">
                            <a class="link--on-hover" href="/work">Work</a>
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
                <div class="flex items-center  h-100">
                    <span class="text--small">{currentTime.toUpperCase()} 🇳🇿</span>
                </div>
            </div>
            <div class="col-r l-flex items-center justify-between">
                <div class="l-hidden mt-lg">
                    <a
                        class="button"
                        target="_blank"
                        rel="noopener"
                        href="https://wa.me/640272182988?text=Hello%Martin!%20:)%0AI%20would%20like%20to%20chat%20with%20you.">
                        Let's chat <Icon name="social-whatsapp" />
                    </a>
                </div>
                <div class="l-visible text--small flex">
                    <a class="link--on-hover" href="mailto:martinmana808@gmail.com">
                        martinmana808@gmail.com
                    </a>
                    <a href="tel:+640272182988" class="link--on-hover ml-2">
                        +640272182988
                    </a>
                </div>
                <!-- <div class="spacer-4 l-hidden"></div> -->
                <!-- <nav class="footer__social-nav flex items-center">
                    <ul class="flex">
                        <li>
                            <a href="https://www.linkedin.com/company/weareanotherstudio" target="_blank">
                                <Icon name="social-li" />
                                <span class="visuallyhidden">Visit Another LinkedIn</span>
                            </a>
                        </li>
                        <li>
                            <a href="https://www.instagram.com/weareanother.studio" target="_blank">
                                <Icon name="social-ig" />
                                <span class="visuallyhidden">Visit Another Instagram</span>
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://www.facebook.com/people/Weareanotherstudio/61564888761626/"
                                target="_blank">
                                <Icon name="social-fb" />
                                <span class="visuallyhidden">Visit Another Facebook</span>
                            </a>
                        </li>
                        <li>
                            <a href="https://linktr.ee/weareanother.studio" target="_blank">
                                <Icon name="social-linktree" />
                                <span class="visuallyhidden">Another Linktr.ee</span>
                            </a>
                        </li>
                    </ul>
                </nav> -->
                <div class="footer__copyright text--small l-visible">© {currentYear} martinmana.com</div>
            </div>
        </div>
        <div class="footer__copyright text--small l-hidden mt-sm">© {currentYear} martinmana.com. All rights reserved.</div>
    </div>
</footer>
