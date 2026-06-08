<script>
    import Layout from '../components/layout/Layout.svelte'
    import Avatar from '../components/Avatar.svelte'
    import Icon from '../components/Icon.svelte'

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
            <div class="team">
                <div class="team__col">
                    <Avatar name="Martin" surname="Mana" big location="🇳🇿" />
                    <Avatar name="Leonel" surname="Orsi" location="🇦🇷" />
                </div>
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
                    <div class="team">
                        <div class="team__col">
                            <Avatar name="Martin" surname="Mana" big location="🇳🇿" />
                            <Avatar name="Leonel" surname="Orsi" location="🇦🇷" />
                        </div>
                    </div>
                </div>
                <p>
                    We're small and senior by design. A tight core team — Martin on product and AI, Leo on infrastructure and systems, Mike on operations — backed by a trusted network we've built over twenty years. That keeps us fast, hands-on, and accountable for everything we ship.
                </p>
                <p>
                    AI is our tool, our material, and our objective. We use it to build better and faster — and we make sure our clients get products that are genuinely intelligent, not just decorated with the word.
                </p>
            </div>

            <div class="l-visible">
                <div class="footer__social-nav flex gutter-x mt-4">
                    <a
                        class=""
                        target="_blank"
                        rel="noopener"
                        href="https://wa.me/640272182988?text=Hello%20F925!%20:)%0AI%20would%20like%20to%20chat%20about%20a%20project.">
                        <Icon name="social-whatsapp" />
                        <span class="visuallyhidden">Chat on WhatsApp</span>
                    </a>
                    <a href="https://www.linkedin.com/in/martinmana808/" target="_blank">
                        <Icon name="social-li" />
                        <span class="visuallyhidden">Visit F925 on LinkedIn</span>
                    </a>
                    <a href="https://www.instagram.com/martinmana/" target="_blank">
                        <Icon name="social-ig" />
                        <span class="visuallyhidden">Visit F925 on Instagram</span>
                    </a>
                </div>
            </div>

        </div>
    </div>
</Layout>
