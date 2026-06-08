<script>
    import Layout from '../components/layout/Layout.svelte'
    import { onMount, onDestroy } from 'svelte'
    import { headContent } from '../stores/headContent.js'
    
    onMount(() => {
        document.body.classList.add('template--404')
        // Set 404-specific SEO
        headContent.set({
            title: 'Page Not Found • F925',
            description: 'The page you are looking for could not be found. Please check the URL or return to the home page.',
            canonical: 'https://f925.ai/404',
            ogImage: '/og-1200x630.png',
            ogType: 'website',
            links: [],
            scripts: []
        })
    })
    onDestroy(() => {
        document.body.classList.remove('template--404')
    })
</script>

<Layout >
    <img src="/assets/tino.gif" alt="Tino waving hello!" class="tino-gif" />
    <div class="grid gutter-x h-100 z-3 relative">
        <div class="col-l">
            <div class="flex gutter-x items-end">
                <h1 class="text--hero">Error 404</h1>
            </div>
            <p>Oops! It looks like the page you're trying to access doesn't exist or has been moved.</p>
            <p>
                Please check the URL for any mistakes, or go back to our <a class="link" href="/">home page</a>
                .
            </p>
            <p class="text--small mt-sm">
                If you believe this is a mistake, feel free to <a class="link" href="/contact">contact us</a>
                and let us know.
            </p>
        </div>
        <div class="col-r"></div>
    </div>
</Layout>
