<script>
    import Layout from '../components/layout/Layout.svelte'
    import Icon from '../components/Icon.svelte'

    import martinImg from '../assets/images/team--Martin.png'
    import leoImg from '../assets/images/team--Leonel.png'
    import mikeImg from '../assets/images/team--Mike.png'
    import isoImg from '../assets/images/iso.svg'

    const core = [
        { img: martinImg, first: 'Martin', last: 'Mana', flag: '🇳🇿', role: 'Product & AI' },
        { img: leoImg, first: 'Leonel', last: 'Orsi', flag: '🇦🇷', role: 'Infrastructure & Systems' },
        { img: mikeImg, first: 'Michael', last: 'McLarnon', flag: '🇳🇿', role: 'Operations' },
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
            <div class="about-iso">
                <img src={isoImg} alt="F925 isotype" />
            </div>
        </div>
        <div class="col-r">
            <h1 class="text--section l-hidden">About</h1>
            <h2 class="text--subheadingSm">
                An AI-native studio building things that actually work.
            </h2>

            <div class="wysiwyg text--small">
                <p>
                    F925 is the work of three founders whose paths have crossed for more than three decades. Martin Mana and Leonel Orsi first met in Argentina and have collaborated, on and off, ever since — a partnership grounded in a shared standard for craft and a conviction that the best products are built by people who trust one another.
                </p>
                <p>
                    Their careers took them in complementary directions. Leonel built deep technical expertise across IoT and e-commerce while leading engineering teams in Taiwan. Martin co-founded the agency Manada in Argentina before relocating to New Zealand in 2018, where he moved from design into front-end development and delivered high-profile projects across a range of industries.
                </p>
                <p>
                    Reunited around a common ambition, they founded F925 on decades of combined experience in UX, UI, design, and engineering — and on a shared commitment to artificial intelligence and automation. We treat AI not as an add-on but as a core material of how we design and build, applied with discipline to create products that are genuinely intelligent.
                </p>
                <p>
                    Michael McLarnon completes the founding team, leading operations from New Zealand and ensuring that every engagement is delivered to the standard our clients expect — on scope, on time, and accountable from start to finish.
                </p>
                <p>
                    Today, F925 brings together a multicultural team drawn from a global network of senior professionals, combining AI automation with performance-driven UX, UI, and design. Our objective is simple: to build intelligent, well-engineered, and beautifully crafted products that our clients trust and their users value.
                </p>
            </div>

            <ul class="team-list">
                {#each core as m}
                    <li class="team-member">
                        <img src={m.img} alt={`${m.first} ${m.last}`.trim() + ', F925'} />
                        <div class="team-text">
                            <span class="team-name">{`${m.first} ${m.last}`.trim()} {m.flag}</span>
                            <span class="team-role">{m.role}</span>
                        </div>
                    </li>
                {/each}
            </ul>

        </div>
    </div>
</Layout>

<style>
    .about-iso {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        height: 100%;
        padding-right: 2rem;
    }

    .about-iso img {
        display: block;
        width: 100%;
        max-width: 260px;
        height: auto;
        opacity: 0.92;
    }

    .team-list {
        list-style: none;
        margin: 2.5rem 0 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 18px;
    }

    .team-member {
        display: flex;
        align-items: center;
        gap: 14px;
    }

    .team-member img {
        display: block;
        width: 64px;
        height: 64px;
        flex: 0 0 auto;
        border-radius: 50%;
        object-fit: cover;
        object-position: center top;
        border: 2px solid #ffffff;
        background: #e9ebf1;
        box-shadow: 0 6px 18px rgba(20, 30, 60, 0.12);
    }

    .team-text {
        display: flex;
        flex-direction: column;
        line-height: 1.3;
    }

    .team-name {
        font-size: 15px;
        font-weight: 600;
        color: #191c1f;
    }

    .team-role {
        font-size: 13px;
        color: rgba(25, 28, 31, 0.55);
    }
</style>
