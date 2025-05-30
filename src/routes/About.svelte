<script>
    import Layout from '../components/layout/Layout.svelte'
    import Avatar from '../components/Avatar.svelte'

    import teamLinesDesktop from '../assets/images/team-lines-desktop.svg'
    import teamLinesMobile from '../assets/images/team-lines-mobile.svg'

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
                    <Avatar name="Himanshu" surname="Kaushik" location="🇮🇳" />
                    <Avatar name="Ritesh" surname="Kamal" location="🇮🇳" />
                    <Avatar name="Chris" surname="Abad" location="🇬🇧" />
                    <Avatar name="Mark" surname="Rechax" location="🇪🇸" />
                </div>
                <div class="team__col">
                    <Avatar name="Leonel" surname="Orsi" big location="🇦🇷" />
                    <Avatar name="Leonel" surname="Orsi" location="🇦🇷" />
                    <Avatar name="Flavio" surname="Iardino" location="🇦🇷" />
                    <Avatar name="Steven" surname="Hong" location="🇦🇺" />
                    <Avatar name="Leandro" surname="Planas" location="🇦🇷" />
                </div>
                <img
                    class="team__lines--desktop"
                    src={teamLinesDesktop}
                    alt="Lines connecting team members showing sinergy"
                    aria-hidden="true" />
            </div>
        </div>
        <div class="col-r">
            <h1 class="text--section l-hidden">About</h1>
            <h2 class="text--subheadingSm">
                Two decades of creativity, reinvention, and bold decisions.


            </h2>

            <div class="wysiwyg text--small">
                <p>
                    My journey began in Argentina, where a deep love for art, design, and storytelling led me to work as an advertising art director. Long after having finished my studies and having worked more than 13 years as a graphic designer and creative director—including co-founding the successful digital agency Manada—I made a life-changing move to New Zealand in 2018. There, I transitioned into front-end development, contributing to high-impact digital projects across diverse industries.
                </p>
                <p>
                   I combined years of UX, UI, and design expertise with a growing passion for artificial intelligence and automation, and eventually, I took a leap of faith—not just to embrace new technologies, but to step out on my own. But I wasn’t alone. Over the past 20 years, I’ve built an amazing network of professionals and friends whose collaboration and support have been instrumental. These technologies quickly became central to my process—unlocking new ways to think, build, and deliver value.




                </p>
                <div class="l-hidden">
                    <div class="team">
                        <div class="team__col">
                            <Avatar name="Martin" surname="Mana" big location="🇳🇿" />
                            <Avatar name="Himanshu" surname="Kaushik" location="🇮🇳" />
                            <Avatar name="Ritesh" surname="Kamal" location="🇮🇳" />
                            <Avatar name="Chris" surname="Abad" location="🇬🇧" />
                            <Avatar name="Mark" surname="Rechax" location="🇪🇸" />
                        </div>
                        <div class="team__col">
                            <Avatar name="Leonel" surname="Orsi" big location="🇦🇷" />
                            <Avatar name="Leonel" surname="Orsi" location="🇦🇷" />
                            <Avatar name="Flavio" surname="Iardino" location="🇦🇷" />
                            <Avatar name="Steven" surname="Hong" location="🇦🇺" />
                            <Avatar name="Leandro" surname="Planas" location="🇦🇷" />
                        </div>
                        <img
                            class="team__lines--desktop"
                            src={teamLinesDesktop}
                            alt="Lines connecting team members showing sinergy"
                            aria-hidden="true" />
                        <img
                            class="team__lines--mobile"
                            src={teamLinesMobile}
                            alt="Lines connecting team members showing sinergy"
                            aria-hidden="true" />
                    </div>
                </div>
                <p></p>
                <p>
                    Today, I work at the intersection of AI automation and high-performance UX/UI design. With a global network of talented collaborators, my team and I blend creativity, innovation, and precision to deliver exceptional results.


                </p>
                <p>
                    In 2024, I partnered with ThumbStack.in, an IoT and IT company based in India, to enhance our capabilities and take on more ambitious challenges. Together, we offer forward-thinking, end-to-end solutions rooted in design excellence and powered by AI.
                </p>
                <p>
                    I’m passionate about creating intelligent, beautiful products that clients love—and users truly enjoy.
                </p>
            </div>
        </div>
    </div>
</Layout>
