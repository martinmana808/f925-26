<script>
    import Header from './Header.svelte'
    import Footer from './Footer.svelte'
    import PageLoader from '../PageLoader.svelte'
    import GaryChat from '../GaryChat.svelte'
    export let bodyClass = ''
    import '../../styles/styles.less'
</script>

<Header />
<div class="page-loader spacing-x">
    <div class="mw-container mx-auto w-100 h-100 relative">
        <PageLoader />
    </div>
</div>
<main class="site-main">
    <div class="site-main__inner">
        <div class="spacing-x">
            <div class="mw-container mx-auto w-100">
                <slot></slot>
                <!-- This is where the page-specific content will go -->
            </div>
        </div>
    </div>
</main>

<Footer  />

<GaryChat />
