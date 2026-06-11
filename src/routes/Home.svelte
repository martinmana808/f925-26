<script>
    import Layout from '../components/layout/Layout.svelte'
    import { openGary } from '../stores/gary.js'
    import { onMount, onDestroy } from 'svelte'
    onMount(() => {
        document.body.classList.add('template--home')
    })
    onDestroy(() => {
        document.body.classList.remove('template--home')
    })
    let heading = "We design and build website products, platforms, and AI systems that actually work."
    let subheading1 = "F925 weaves AI through everything we ship — chatbots, automation, and intelligent products. A site without a chatbot today is already falling behind. We make sure yours isn't."
    let subheading2 = ''
    let cta1Label = "Get in touch"
    let cta1Url = "/contact"
    let cta2Label = "What we do"
    let cta2Url = "/services"

</script>

<Layout>
    <div class="grid gutter-x items-end h-100">
        <div class="col-l">
            <div class="home-hero l-visible">
                <h1 class="text--hero">
                    Sites that think.
                </h1>
            </div>
            <div class="home-hero l-hidden">
                <h1 class="text--hero">
                    Sites <br>that think.
                </h1>
            </div>
            <h2 class="text--subheadingLg l-hidden">
                { heading }
            </h2>
            <div class="l-hidden">
                <p>
                { subheading1 }
                {#if subheading2 !== ''}
                    <br /> vacio
                    { subheading2 }
                {/if}
                </p>
            </div>
        </div>
        <div class="col-r">
            <h2 class="text--subheadingLg l-visible">
                { heading }
            </h2>
            <div class="l-visible">
                <p> 
                { subheading1 }
                {#if subheading2 !== ''}
                    <br /> vacio
                    { subheading2 }
                {/if}
                </p>
            </div>
            <div class="">
                <div class="buttons">
                    <button class="button --1" type="button" on:click={() => openGary('Hi Gary — what does F925 build?')}>
                        <span>Talk to Gary</span>
                    </button>
                    <!-- {#if cta1Label !== '' && cta1Url !== ''}
                        <a class="button --1out" href="{cta1Url}"><span>{cta1Label}</span></a>
                    {/if} -->
                    {#if cta2Label !== '' && cta2Url !== ''}
                        <a class="button --0" href="{cta2Url}">
                            <span>{cta2Label}</span>
                        </a>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</Layout>
