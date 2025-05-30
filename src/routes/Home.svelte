<script>
    import Layout from '../components/layout/Layout.svelte'
    import { onMount, onDestroy } from 'svelte'
    onMount(() => {
        document.body.classList.add('template--home')
    })
    onDestroy(() => {
        document.body.classList.remove('template--home')
    })
    let heading = "I am an ai-driven digital developer, crafting expertly designed and innovative solutions."
    let subheading1 = "I love to integrate cutting-edge AI automation with UX, UI, and performance-focused design. I do create beautiful and intelligent products that people love and praise"
    let subheading2 = ''
    let cta1Label = "Book a free call"
    let cta1Url = "/contact"
    let cta2Label = "What I do"
    let cta2Url = "/services"

</script>

<Layout>
    <div class="grid gutter-x items-end h-100">
        <div class="col-l">
            <div class="home-hero">
                <h1 class="text--hero">
                    The nerdy stuff, but cool
                </h1>
            </div>
            <h2 class="text--subheadingLg l-hidden">
                { heading }
            </h2>
            <div class="l-hidden">
                { subheading1 }
                {#if subheading2 !== ''}
                    <br /> vacio
                    { subheading2 }
                {/if}
            </div>
        </div>
        <div class="col-r">
            <h2 class="text--subheadingLg l-visible">
                { heading }
            </h2>
            <div class="l-visible">
                { subheading1 }
                {#if subheading2 !== ''}
                    <br /> vacio
                    { subheading2 }
                {/if}
            </div>
            <div class="l-visible">
                <div class="buttons">
                    {#if cta1Label !== '' && cta1Url !== ''}
                        <a class="button --1" href="{cta1Url}"><span>{cta1Label}</span></a>
                    {/if}
                    {#if cta2Label !== '' && cta2Url !== ''}
                        <a class="button --1out" href="{cta2Url}">
                            <span>{cta2Label}</span>
                        </a>
                    {/if}
                </div>
            </div>
            <div class="l-hidden">
                <div class="buttons">
                    {#if cta1Label !== '' && cta1Url !== ''}
                        <a class="button --1" href="{cta1Url}">
                            <span>{cta1Label}</span>
                        </a>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</Layout>
