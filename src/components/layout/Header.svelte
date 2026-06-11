<script>
    import Logo from '../../components/Logo.svelte'
    import Icon from '../../components/Icon.svelte'
    import { openGary } from '../../stores/gary.js'
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

    function chatWithGary() {
        closeNav()
        openGary()
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
                            <a class="link--chat" href="/services">Services</a>
                        </li>
                        <li class={currentPath.includes('/portfolio') ? 'active' : ''}>
                            <a class="link--chat" href="/portfolio">Portfolio</a>
                        </li>
                        <li class={currentPath.includes('/about') ? 'active' : ''}>
                            <a class="link--chat" href="/about">About</a>
                        </li>
                        <li class={currentPath.includes('/contact') ? 'active' : ''}>
                            <a class="link--chat" href="/contact">Contact</a>
                        </li>
                        <li class="l-hidden mt-lg ">
                            <button type="button" class=" gary-nav-trigger" on:click={chatWithGary}>
                                Chat with Gary
                            </button>
                        </li>

                        <li class="l-visible">
                            <button type="button" class=" gary-nav-trigger" on:click={chatWithGary}>
                                <span class="gary-nav-dot" aria-hidden="true"></span>Chat with Gary
                            </button>
                        </li>

                    </ul>
                    <div class="l-hidden">
                        <div class="buttons">
                            <a class="button --1" href="/contact"><span>Get in touch</span></a>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    </div>
</header>

<style>
    .gary-nav-trigger:hover, .gary-nav-trigger:focus {
            border-color: #16b585;
    background: rgba(22, 181, 133, 0.12);
    color: #0f8a64;
    }
    .gary-nav-trigger {
        background: none;
    border: none;
    padding: 0;
    margin: 0;
    font: inherit;
    color: inherit;
    line-height: inherit;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    font-size: 14px;
    border: 2px solid #8daaa1;
    border-radius: 100rem;
    padding-inline: 1rem;
        transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
    }
    .gary-nav-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #16b585;
        box-shadow: 0 0 8px rgba(22, 181, 133, 0.6);
        flex: 0 0 auto;
    }
</style>
