<!-- Soft, slowly-moving, colour-shifting light mesh-gradient background -->
<div class="grad-bg" aria-hidden="true">
    <div class="grad-blobs">
        <span class="blob b1"></span>
        <span class="blob b2"></span>
        <span class="blob b3"></span>
        <span class="blob b4"></span>
        <span class="blob b5"></span>
    </div>
    <div class="grad-veil"></div>
</div>

<style>
    /* Let the fixed background show through the app chrome */
    :global(html),
    :global(body) {
        background: transparent !important;
    }
    :global(.site-header),
    :global(.site-footer) {
        background: transparent !important;
    }

    .grad-bg {
        display: none;
        position: fixed;
        inset: 0;
        z-index: -1;
        overflow: hidden;
        background: #ffffff;
        pointer-events: none;
    }

    /* All blobs share a blur + a very slow hue drift so colours gently "change" */
    .grad-blobs {
        position: absolute;
        inset: -25%;
        filter: blur(80px) saturate(125%);
        animation: grad-hue 60s linear infinite;
    }

    .blob {
        position: absolute;
        width: 60vw;
        height: 60vw;
        border-radius: 50%;
        opacity: 0.5;
        will-change: transform;
    }
    .b1 {
        background: radial-gradient(circle, #93e8c6 0%, rgba(147, 232, 198, 0) 62%);
        top: -12%;
        left: -8%;
        animation: drift1 26s ease-in-out infinite alternate;
    }
    .b2 {
        background: radial-gradient(circle, #b6d2ff 0%, rgba(182, 210, 255, 0) 62%);
        top: -6%;
        right: -12%;
        animation: drift2 31s ease-in-out infinite alternate;
    }
    .b3 {
        background: radial-gradient(circle, #dcd0ff 0%, rgba(220, 208, 255, 0) 62%);
        bottom: -16%;
        left: 6%;
        animation: drift3 35s ease-in-out infinite alternate;
    }
    .b4 {
        background: radial-gradient(circle, #ffe1c8 0%, rgba(255, 225, 200, 0) 62%);
        bottom: -12%;
        right: 2%;
        animation: drift4 29s ease-in-out infinite alternate;
    }
    .b5 {
        background: radial-gradient(circle, #c9f4e4 0%, rgba(201, 244, 228, 0) 60%);
        top: 28%;
        left: 32%;
        animation: drift5 38s ease-in-out infinite alternate;
    }

    /* Soft white veil keeps text readable over the colour */
    .grad-veil {
        position: absolute;
        inset: 0;
        background:
            radial-gradient(130% 120% at 50% 0%, rgba(255, 255, 255, 0) 45%, rgba(255, 255, 255, 0.4) 100%),
            linear-gradient(rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.22));
    }

    @keyframes drift1 { from { transform: translate(0, 0) scale(1); } to { transform: translate(7vw, 6vh) scale(1.18); } }
    @keyframes drift2 { from { transform: translate(0, 0) scale(1.1); } to { transform: translate(-8vw, 5vh) scale(1); } }
    @keyframes drift3 { from { transform: translate(0, 0) scale(1); } to { transform: translate(6vw, -7vh) scale(1.2); } }
    @keyframes drift4 { from { transform: translate(0, 0) scale(1.12); } to { transform: translate(-5vw, -5vh) scale(1); } }
    @keyframes drift5 { from { transform: translate(0, 0) scale(0.95); } to { transform: translate(-6vw, 7vh) scale(1.15); } }

    @keyframes grad-hue {
        from { filter: blur(80px) saturate(125%) hue-rotate(0deg); }
        to { filter: blur(80px) saturate(125%) hue-rotate(40deg); }
    }

    @media (prefers-reduced-motion: reduce) {
        .grad-blobs { animation: none; }
        .blob { animation: none; }
    }
</style>
