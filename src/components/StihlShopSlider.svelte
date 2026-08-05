<script>
    import { onMount, onDestroy } from 'svelte'
    import Icon from './Icon.svelte'
    import abandonedPic from '../assets/images/stihl-shop-abandoned.png?w=800;1200&format=avif;webp;jpg&quality=60&as=picture'
    import activePic from '../assets/images/stihl-shop-active.png?w=800;1200&format=avif;webp;jpg&quality=60&as=picture'

    let pinEl
    let progress = 0
    let reduceMotion = false
    let ticking = false

    function measure() {
        ticking = false
        if (!pinEl) return
        const sticky = pinEl.firstElementChild
        if (!sticky) return
        const pinRect = pinEl.getBoundingClientRect()
        const stickyRect = sticky.getBoundingClientRect()
        // How far the sticky slider has travelled inside its pin wrapper (0 → pin distance)
        const travel = pinRect.height - stickyRect.height
        if (travel <= 0) return
        progress = Math.min(Math.max((stickyRect.top - pinRect.top) / travel, 0), 1)
    }

    function onScroll() {
        if (ticking) return
        ticking = true
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(measure)
        } else {
            measure()
        }
    }

    onMount(() => {
        reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (reduceMotion) {
            progress = 0.5
            return
        }
        // capture:true also catches the desktop template's .col-r scroll container
        window.addEventListener('scroll', onScroll, { capture: true, passive: true })
        window.addEventListener('resize', onScroll, { passive: true })
        measure()
    })

    onDestroy(() => {
        window.removeEventListener('scroll', onScroll, { capture: true })
        window.removeEventListener('resize', onScroll)
    })

    $: pct = progress * 100
    $: dividerOpacity = Math.min(1, progress * 25)
    // keep the hint bouncing until the slider ride is fully done
    $: hintHidden = progress >= 1

    function mime(format) {
        return `image/${format === 'jpg' ? 'jpeg' : format}`
    }
</script>

<div class="stihl-shopslider-pin" class:--static={reduceMotion} bind:this={pinEl}>
    <figure class="stihl-shopslider">
        <div class="stihl-shopslider__stage">
            <div class="stihl-shopslider__layer">
                <picture>
                    {#each Object.entries(abandonedPic.sources) as [format, srcset]}
                        <source {srcset} type={mime(format)} sizes="(min-width: 62.5em) 60vw, 100vw" />
                    {/each}
                    <img
                        src={abandonedPic.img.src}
                        width={abandonedPic.img.w}
                        height={abandonedPic.img.h}
                        alt="A run-down, abandoned STIHL shop — what a neglected social feed says about your business" />
                </picture>
            </div>
            <div
                class="stihl-shopslider__layer stihl-shopslider__layer--reveal"
                style="clip-path: inset(0 {100 - pct}% 0 0);"
                aria-hidden="true">
                <picture>
                    {#each Object.entries(activePic.sources) as [format, srcset]}
                        <source {srcset} type={mime(format)} sizes="(min-width: 62.5em) 60vw, 100vw" />
                    {/each}
                    <img
                        src={activePic.img.src}
                        width={activePic.img.w}
                        height={activePic.img.h}
                        alt="" />
                </picture>
            </div>
            <div
                class="stihl-shopslider__divider"
                style="left: {pct}%; opacity: {dividerOpacity};"
                aria-hidden="true">
                <span class="stihl-shopslider__handle"></span>
            </div>
            <div class="stihl-shopslider__hint" class:--hidden={hintHidden || reduceMotion} aria-hidden="true">
                <span>Scroll down here</span>
                <Icon name="arrowDown" extraClass="" />
            </div>
        </div>
        <!-- STIHL tells you what to post. We post it for you. Easy. -->
        <figcaption class="stihl-shopslider__caption">
            {#if reduceMotion}
                <span class="stihl-shopslider__caption-text --after">
                    You trusting us to handle your socials for you.
                </span>
            {:else}
                <span class="stihl-shopslider__caption-text --before" style="clip-path: inset(0 0 0 {pct}%);">
                    You trying to keep up with your socials yourself.
                </span>
                <span
                    class="stihl-shopslider__caption-text --after"
                    style="clip-path: inset(0 {100 - pct}% 0 0);"
                    aria-hidden="true">
                    You trusting us to handle your socials for you.
                </span>
            {/if}
        </figcaption>
    </figure>
    <div class="stihl-shopslider-pin__space" aria-hidden="true"></div>
</div>
