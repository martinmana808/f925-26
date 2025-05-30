<script>
    import Layout from '../components/layout/Layout.svelte'
    import Icon from '../components/Icon.svelte'

    import { onMount, onDestroy } from 'svelte'

    onMount(() => {
        document.body.classList.add('template--404')
    })
    onDestroy(() => {
        document.body.classList.remove('template--404')
    })
</script>

<Layout>
    <div class="grid gutter-x h-100">
        <div class="col-l">
            <h1 class="text--hero">error 404</h1>
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
