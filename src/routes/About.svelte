<script>
    import Layout from '../components/layout/Layout.svelte'
    import Icon from '../components/Icon.svelte'

    import martinImg from '../assets/images/team--Martin.png'
    import leoImg from '../assets/images/team--Leonel.png'
    import mikeImg from '../assets/images/team--Mike.png'

    const core = [
        { img: martinImg, first: 'Martin', last: 'Mana', flag: '🇳🇿' },
        { img: leoImg, first: 'Leonel', last: 'Orsi', flag: '🇦🇷' },
        { img: mikeImg, first: 'Michael', last: 'McLarnon', flag: '🇳🇿' },
    ]

    import { onMount, onDestroy } from 'svelte'
    onMount(() => {
        document.body.classList.add('template--about')
    })
    onDestroy(() => {
        document.body.classList.remove('template--about')
    })
</script>

<Layout>
    <div class="grid gutter-x h-100 relative">
        <div class="col-l l-visible">
            <div class="core-team">
                {#each core as m}
                    <figure class="core-member">
                        <img src={m.img} alt={`${m.first} ${m.last}`.trim() + ', F925'} />
                        <figcaption class="core-name">{`${m.first} ${m.last}`.trim()} {m.flag}</figcaption>
                    </figure>
                {/each}
            </div>
        </div>
        <div class="col-r">
            <h1 class="text--section l-hidden">About</h1>
            <h2 class="text--subheadingSm">
                An AI-native studio building things that actually work.
            </h2>

            <div class="wysiwyg text--small">
                <p>
                    F925 is a design-and-build studio founded by Martin Mana. After two decades in art direction, design, and front-end development — from co-founding the agency Manada in Argentina to high-impact digital work in New Zealand — Martin built F925 around a simple conviction: AI isn't the future, it's the present, and everything we make should be threaded with it.
                </p>
                <p>
                    We design and build website products, platforms, and AI systems. Not throwaway brochure sites — complex solutions that have to work properly, for businesses that care about the difference. A website without a chatbot is already falling behind. A process without automation is just work waiting to be removed.
                </p>
                <div class="l-hidden">
                    <div class="core-team">
                        {#each core as m}
                            <figure class="core-member">
                                <img src={m.img} alt={`${m.name}, F925`} />
                                <span class="core-flag" aria-hidden="true">{m.flag}</span>
                            </figure>
                        {/each}
                    </div>
                </div>
                <p>
                    We're small and senior by design. A tight core team — Martin on product and AI, Leo on infrastructure and systems, Mike on operations — backed by a trusted network we've built over twenty years. That keeps us fast, hands-on, and accountable for everything we ship.
                </p>
                <p>
                    AI is our tool, our material, and our objective. We use it to build better and faster — and we make sure our clients get products that are genuinely intelligent, not just decorated with the word.
                </p>
            </div>

            <!-- <div class="l-visible">
                <div class="footer__social-nav flex gutter-x mt-4">
                    <a
                        class=""
                        target="_blank"
                        rel="noopener"
                        href="https://wa.me/640272182988?text=Hello%20F925!%20:)%0AI%20would%20like%20to%20chat%20about%20a%20project.">
                        <Icon name="social-whatsapp" />
                        <span class="visuallyhidden">Chat on WhatsApp</span>
                    </a>
                </div>
            </div> -->

        </div>
    </div>
</Layout>

<style>
    .core-team {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 16px;
        margin: 1rem 0 2rem;
    }
    
    @media(min-width: 64em){
        .core-team {
            flex-direction: column;
        }
    }

    /* Mobile duplicate sits inside the text column */
    :global(.template--about) .l-hidden .core-team {
        justify-content: center;
        margin: 2rem 0;
    }

    .core-member {
        position: relative;
        flex: 1 1 0;
        max-width: 180px;
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .core-member img {
        display: block;
        width: 100%;
        aspect-ratio: 1 / 1;
        border-radius: 50%;
        object-fit: cover;
        object-position: center top;
        border: 4px solid #191c1f;
        background: #191c1f;
    }

    .core-name {
        margin-top: 10px;
        font-size: 13px;
        line-height: 1.25;
        text-align: center;
        color: rgba(255, 255, 255, 0.75);
    }

    @media (max-width: 600px) {
        .core-team {
            gap: 12px;
        }
        .core-member {
            max-width: 104px;
        }
        .core-name {
            font-size: 11px;
            margin-top: 6px;
        }
    }
</style>
