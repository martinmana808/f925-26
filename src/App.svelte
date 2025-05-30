<script>
    import Router from './Router.svelte'
    import { onMount } from 'svelte'
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
    <title>Another Studio</title>

    <meta
        name="description"
        content="A full-service studio creating expertly crafted, beautiful digital products. Your one-stop shop on your road to success." />

    <link rel="icon" href="/favicon.png" sizes="any" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

    <link rel="manifest" href="/site.webmanifest" />
    <meta name="theme-color" content="#222222" />
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

<Router />
