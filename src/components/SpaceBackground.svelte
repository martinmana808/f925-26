<script>
    import { onMount } from 'svelte';

    // Which nebula to show: 'tarantula' (default, landscape) or 'pillars'
    export let image = 'tarantula';

    const SOURCES = {
        tarantula: '/assets/images/space/tarantula.webp',
        pillars: '/assets/images/space/pillars.webp',
    };
    $: src = SOURCES[image] || SOURCES.tarantula;

    let canvas;

    onMount(() => {
        const ctx = canvas.getContext('2d');
        let raf;
        let stars = [];
        let w = 0;
        let h = 0;
        let dpr = Math.min(window.devicePixelRatio || 1, 2);
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function resize() {
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            seed();
        }

        function seed() {
            const count = Math.round((w * h) / 9000); // density
            stars = [];
            for (let i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    r: Math.random() * 1.3 + 0.2,
                    a: Math.random() * 0.5 + 0.25,
                    tw: Math.random() * 0.02 + 0.004,
                    ph: Math.random() * Math.PI * 2,
                    drift: Math.random() * 0.06 + 0.02,
                });
            }
        }

        function draw(t) {
            ctx.clearRect(0, 0, w, h);
            for (const s of stars) {
                const alpha = reduce ? s.a : s.a + Math.sin(t * s.tw + s.ph) * 0.35;
                ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = s.r > 1 ? '#cfe0ff' : '#ffffff';
                ctx.fill();
                if (!reduce) {
                    s.y += s.drift;
                    if (s.y > h + 2) {
                        s.y = -2;
                        s.x = Math.random() * w;
                    }
                }
            }
            ctx.globalAlpha = 1;
            raf = requestAnimationFrame(draw);
        }

        resize();
        window.addEventListener('resize', resize);
        raf = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
        };
    });
</script>

<div class="space-bg" aria-hidden="true">
    <div class="space-bg__nebula" style="background-image: url({src});"></div>
    <div class="space-bg__overlay"></div>
    <div class="space-bg__glow"></div>
    <canvas class="space-bg__stars" bind:this={canvas}></canvas>
</div>

<style>
    /* Let the fixed background show through the app chrome */
    :global(html),
    :global(body) {
        background: transparent !important;
    }
    :global(.site-header) {
        background: transparent !important;
    }
    :global(.site-footer) {
        background: transparent !important;
    }

    .space-bg {
        position: fixed;
        inset: 0;
        z-index: -1;
        overflow: hidden;
        background: #05060c;
        pointer-events: none;
    }

    .space-bg__nebula {
        position: absolute;
        inset: -6%;
        background-size: cover;
        background-position: 70% 40%;
        opacity: 0.55;
        will-change: transform;
        animation: space-drift 90s ease-in-out infinite alternate;
    }

    /* Darken for text readability — strongest at top (nav) and bottom (footer) */
    .space-bg__overlay {
        position: absolute;
        inset: 0;
        background:
            linear-gradient(
                to bottom,
                rgba(5, 6, 12, 0.92) 0%,
                rgba(5, 6, 12, 0.55) 22%,
                rgba(5, 6, 12, 0.5) 55%,
                rgba(5, 6, 12, 0.82) 100%
            ),
            radial-gradient(120% 90% at 50% 38%, rgba(5, 6, 12, 0) 40%, rgba(5, 6, 12, 0.7) 100%);
    }

    /* Subtle on-brand electric-blue glow */
    .space-bg__glow {
        position: absolute;
        inset: 0;
        background:
            radial-gradient(40% 35% at 78% 28%, rgba(45, 107, 255, 0.18) 0%, rgba(45, 107, 255, 0) 70%),
            radial-gradient(45% 40% at 18% 75%, rgba(95, 139, 255, 0.12) 0%, rgba(95, 139, 255, 0) 70%);
        mix-blend-mode: screen;
    }

    .space-bg__stars {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
    }

    @keyframes space-drift {
        from {
            transform: scale(1.05) translate3d(-1.5%, -1%, 0);
        }
        to {
            transform: scale(1.12) translate3d(1.5%, 1.5%, 0);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .space-bg__nebula {
            animation: none;
        }
    }
</style>
