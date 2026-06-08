<script>
    import Logo from '../../components/Logo.svelte'
    import Icon from '../../components/Icon.svelte'
    // Get the current pathname
    let currentPath = window.location.pathname
    let isWorkPage = false

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

    import { onMount } from 'svelte'
    onMount(() => {
        currentPath = window.location.pathname
    })

    function openNav() {
        document.body.classList.add('nav-open')
    }
    function closeNav() {
        document.body.classList.remove('nav-open')
    }

    onMount(async () => {
        const path = window.location.pathname
        isWorkPage = path.endsWith('/work')
    })
</script>

<header class="site-header spacing-x">
    <div class="header-nav__overlay" on:click={closeNav}></div>
    <div class="mw-container mx-auto w-100">
        <div class="grid gutter-x h-100">
            <div class="col-l relative header__logo-container">
                <a href="/" class="header__logo-link no-outline" title="Go to homepage">
                    <Logo />
                    <span class="visuallyhidden">Go to homepage</span>
                </a>
                <button class="header__toggler" on:click={openNav}>
                    <Icon name="menu" />
                    <span class="visuallyhidden">Open menu</span>
                </button>
            </div>
            <div class="col-r flex items-center">
                <nav class="header-nav">
                    <a href="/" class="header-nav__logo no-outline" title="Go to homepage">
                        <Logo />
                    </a>
                    <button class="header__toggler --close" on:click={closeNav}>
                        <Icon name="menu" extraClass="menu" />
                        <span class="visuallyhidden">Close menu</span>
                    </button>
                    <ul>
                        <li class={currentPath.includes('/services') ? 'active' : ''}>
                            <a href="/services">Services</a>
                        </li>
                        <li class={currentPath.includes('/portfolio') ? 'active' : ''}>
                            <a href="/portfolio">Portfolio</a>
                        </li>
                        <li class={currentPath.includes('/about') ? 'active' : ''}>
                            <a href="/about">About</a>
                        </li>
                        <li class={currentPath.includes('/contact') ? 'active' : ''}>
                            <a href="/contact">Contact</a>
                        </li>
                        <li class="l-hidden mt-lg ">
                            <a
                                class="link--chat"
                                target="_blank"
                                rel="noopener"
                                href="https://wa.me/640272182988?text=Hello%20F925!%20:)%0AI%20would%20like%20to%20chat%20about%20a%20project.">
                                Let's chat <Icon name="social-whatsapp" />
                            </a>
                        </li>
                    
                        <li class="l-visible">
                            <a
                                class="link--on-hover"
                                target="_blank"
                                rel="noopener"
                                href="https://wa.me/640272182988?text=Hello%20F925!%20:)%0AI%20would%20like%20to%20chat%20about%20a%20project.">
                                Let's chat <Icon name="social-whatsapp" />
                            </a>
                        </li>

                    </ul>
                    <div class="l-hidden">
                        <div class="buttons">
                            <a class="button --1" href="/contact"><span>Book a free call</span></a> 
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    </div>
</header>
