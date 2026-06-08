<script>
    import Router from './Router.svelte'
    import SpaceBackground from './components/SpaceBackground.svelte'
    import StructuredData from './components/StructuredData.svelte'
    import { onMount } from 'svelte'
    import { headContent } from './stores/headContent.js'
    let isLoading = true // Set loading state to true initially

    // Use onMount to run code after the component is first rendered
    onMount(() => {
        window.addEventListener('load', () => {
            document.body.classList.remove('loading')
            isLoading = false
            // setTimeout(() => {
            //     document.body.classList.remove('no-transition')
            // }, 2000)
        })
    })
</script>

<svelte:head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{$headContent.title}</title>

    <meta name="description" content={$headContent.description} />
    
    {#if $headContent.canonical}
        <link rel="canonical" href={$headContent.canonical} />
    {/if}

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content={$headContent.ogType} />
    <meta property="og:url" content={$headContent.canonical || 'https://f925.ai'} />
    <meta property="og:title" content={$headContent.title} />
    <meta property="og:description" content={$headContent.description} />
    <meta property="og:image" content={$headContent.ogImage} />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={$headContent.canonical || 'https://f925.ai'} />
    <meta property="twitter:title" content={$headContent.title} />
    <meta property="twitter:description" content={$headContent.description} />
    <meta property="twitter:image" content={$headContent.ogImage} />

    <link rel="icon" href="/favicon.png" sizes="any" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

    <link rel="manifest" href="/site.webmanifest" />
    <meta name="theme-color" content="#191c1f" />
    
    <!-- Sitemap -->
    <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
    
    <!-- Structured Data -->
    <StructuredData 
        type="website"
        title={$headContent.title}
        description={$headContent.description}
        url={$headContent.canonical || 'https://f925.ai'}
        image={$headContent.ogImage}
    />
    
    <link
        rel="preload"
        href="../../src/assets/fonts/bentonsanscomp-black-webfont.woff2"
        as="font"
        type="font/woff2"
        crossorigin="anonymous" />
    <link
        rel="preload"
        href="../../src/assets/fonts/bentonsanscond-black-webfont.woff2"
        as="font"
        type="font/woff2"
        crossorigin="anonymous" />
    <link
        rel="preload"
        href="../../src/assets/fonts/bentonsansextracomp-black-webfont.woff2"
        as="font"
        type="font/woff2"
        crossorigin="anonymous" />
    <!-- <link
        rel="preload"
        href="../../src/assets/fonts/Inter-Regular.woff2"
        as="font"
        type="font/woff2"
        crossorigin="anonymous" />
    <link
        rel="preload"
        href="../../src/assets/fonts/Inter-Italic.woff2"
        as="font"
        type="font/woff2"
        crossorigin="anonymous" />
    <link
        rel="preload"
        href="../../src/assets/fonts/Inter-Medium.woff2"
        as="font"
        type="font/woff2"
        crossorigin="anonymous" />
    <link
        rel="preload"
        href="../../src/assets/fonts/Inter-MediumItalic.woff2"
        as="font"
        type="font/woff2"
        crossorigin="anonymous" />
    <link
        rel="preload"
        href="../../src/assets/fonts/Inter-SemiBold.woff2"
        as="font"
        type="font/woff2"
        crossorigin="anonymous" />
    <link
        rel="preload"
        href="../../src/assets/fonts/Inter-SemiBoldItalic.woff2"
        as="font"
        type="font/woff2"
        crossorigin="anonymous" /> -->
</svelte:head>

<SpaceBackground image="tarantula" />
<Router />
