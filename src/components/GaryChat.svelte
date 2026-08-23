<script>
    import { tick, onMount } from 'svelte';
    import { scale, fade } from 'svelte/transition';
    import { garyOpen, garyPrime } from '../stores/gary.js';

    // Platform-neutral endpoint. On Vercel this hits /api/chat directly;
    // on Netlify a redirect maps /api/* to /.netlify/functions/*.
    const ENDPOINT = '/api/chat';

    // ── Configuration ────────────────────────────────────────────────────────
    // Defaults reproduce the original F925 widget exactly, so existing mounts
    // (<GaryChat /> in Layout) keep working untouched. A page that wants a
    // different Gary passes props instead of forking the component.
    export let persona = 'f925';
    export let title = 'Gary';
    export let subtitle = 'F925 · AI assistant';
    export let placeholder = 'Ask Gary anything…';
    export let theme = 'mint'; // 'mint' | 'dark'
    export let launcher = false; // render our own floating button
    export let launcherLabel = 'Ask Gary';
    export let greeting =
        "Hello, I'm Gary. I work for F925, building AI systems that solve real-world inefficiencies. To see how we can help, tell me about your business. What are you currently working on?";
    export let starters = [
        'I run a digital agency.',
        "I'm looking to automate data entry.",
        'What exactly do you guys build?',
    ];
    export let contactLine = 'reach the team at hello@f925.works';
    // When every model provider is down, the widget stops being a chatbot and
    // becomes a lead form — a dead assistant on a page that sells assistants is
    // the one outcome worth engineering around. Leave blank to disable.
    export let leadEndpoint = '';
    export let leadSubject = 'Gary chat enquiry';

    let messages = [{ id: 'init-1', role: 'assistant', content: greeting }];
    let suggestions = [...starters];
    let input = '';
    let isTyping = false;
    let scrollEl;
    let inputEl;

    // Lead-capture fallback state
    let degraded = false;
    let leadName = '';
    let leadContact = '';
    let leadSent = false;
    let leadSending = false;

    let nextId = 1;
    function makeId() {
        return `m-${nextId++}`;
    }

    async function scrollToBottom() {
        await tick();
        if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
    }

    async function processResponse(history) {
        isTyping = true;
        suggestions = [];
        await scrollToBottom();
        try {
            const apiMessages = history.map((m) => ({ role: m.role, content: m.content }));
            const response = await fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: apiMessages, persona }),
            });
            if (!response.ok) throw new Error(`AI Service Error: ${response.statusText}`);

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content ?? '';
            let parsed;
            try {
                parsed = JSON.parse(content);
            } catch (e) {
                parsed = { reply: content, suggestions: [] };
            }

            messages = [...messages, { id: makeId(), role: 'assistant', content: parsed.reply }];
            suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
            degraded = false;
        } catch (error) {
            degraded = Boolean(leadEndpoint);
            messages = [
                ...messages,
                {
                    id: makeId(),
                    role: 'assistant',
                    content: degraded
                        ? "Sorry — my end has dropped out for a moment. Leave your name and a number or email below and someone will get back to you properly."
                        : `I'm having trouble connecting to my neural core right now. Try again in a moment, or ${contactLine}.`,
                },
            ];
        } finally {
            isTyping = false;
            await scrollToBottom();
        }
    }

    async function send(text) {
        const trimmed = (text ?? '').trim();
        if (!trimmed || isTyping) return;
        messages = [...messages, { id: makeId(), role: 'user', content: trimmed }];
        await processResponse(messages);
    }

    function handleSubmit(e) {
        e.preventDefault();
        const value = input;
        input = '';
        send(value);
    }

    // The transcript goes with the lead — whatever they typed before it fell
    // over is the most useful thing in the follow-up call.
    async function submitLead(e) {
        e.preventDefault();
        if (leadSending || !leadName.trim() || !leadContact.trim()) return;
        leadSending = true;

        const data = new FormData();
        data.append('Name', leadName);
        data.append('Contact', leadContact);
        data.append('Subject', leadSubject);
        data.append('Location', typeof window !== 'undefined' ? window.location.pathname : '');
        data.append(
            'Transcript',
            messages.map((m) => `${m.role === 'user' ? 'Them' : 'Gary'}: ${m.content}`).join('\n'),
        );

        try {
            await fetch(leadEndpoint, { method: 'POST', body: data });
            leadSent = true;
            messages = [
                ...messages,
                {
                    id: makeId(),
                    role: 'assistant',
                    content: 'Got it — thanks. Someone will be in touch shortly.',
                },
            ];
            await scrollToBottom();
        } catch (err) {
            leadSent = true; // never trap them in a form that will not close
        } finally {
            leadSending = false;
        }
    }

    function close() {
        garyOpen.set(false);
    }

    function open() {
        garyOpen.set(true);
    }

    // React to open state: focus input, and send any primed message
    $: if ($garyOpen) {
        focusInput();
    }

    async function focusInput() {
        await tick();
        if (inputEl) inputEl.focus();
        scrollToBottom();
    }

    // Auto-send a primed message (e.g. from the hero "Talk to Gary" CTA)
    $: if ($garyOpen && $garyPrime) {
        const primed = $garyPrime;
        garyPrime.set(null);
        send(primed);
    }

    function onKeydown(e) {
        if (e.key === 'Escape' && $garyOpen) close();
    }

    // ?gary=open opens the panel on load; ?gary=<question> opens it and asks
    // that question straight away. Handy for a cold-email CTA that drops someone
    // into a live conversation instead of a page they have to read — and it
    // works on any page that mounts Gary, not just the ones with a launcher.
    function applyUrlTrigger() {
        if (typeof window === 'undefined') return;
        const value = new URLSearchParams(window.location.search).get('gary');
        if (value === null) return;

        const asQuestion = value.trim();
        const isFlag = ['', 'open', '1', 'true', 'yes'].includes(asQuestion.toLowerCase());
        if (!isFlag && asQuestion.length > 3) garyPrime.set(asQuestion.slice(0, 200));
        garyOpen.set(true);
    }

    onMount(() => {
        window.addEventListener('keydown', onKeydown);
        applyUrlTrigger();
        return () => window.removeEventListener('keydown', onKeydown);
    });
</script>

{#if launcher && !$garyOpen}
    <button
        class="gary-launcher gary-theme--{theme}"
        type="button"
        on:click={open}
        transition:fade={{ duration: 150 }}>
        <span class="gary-launcher__dot" aria-hidden="true"></span>
        {launcherLabel}
    </button>
{/if}

<!-- Panel (grows from the top-right, anchored under the nav trigger) -->
{#if $garyOpen}
    <div class="gary-overlay" on:click={close} transition:fade={{ duration: 150 }} aria-hidden="true"></div>
    <section
        class="gary-panel gary-theme--{theme}"
        class:gary-panel--bottom={launcher}
        transition:scale={{ duration: 220, start: 0.85, opacity: 0 }}
        role="dialog"
        aria-label="Chat with {title}">
        <header class="gary-panel__header">
            <div class="gary-panel__id">
                <span class="gary-panel__status" aria-hidden="true"></span>
                <div>
                    <strong>{title}</strong>
                    <small>{subtitle}</small>
                </div>
            </div>
            <button class="gary-panel__close" on:click={close} aria-label="Close chat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
            </button>
        </header>

        <div class="gary-panel__messages" bind:this={scrollEl}>
            {#each messages as m (m.id)}
                <div class="gary-msg gary-msg--{m.role}">
                    {#if m.role === 'assistant'}<span class="gary-msg__tag">{title}</span>{/if}
                    <div class="gary-msg__bubble">{m.content}</div>
                </div>
            {/each}
            {#if isTyping}
                <div class="gary-msg gary-msg--assistant">
                    <div class="gary-msg__bubble gary-typing">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            {/if}
        </div>

        <div class="gary-panel__footer">
            {#if degraded && !leadSent}
                <form class="gary-lead" on:submit={submitLead}>
                    <input
                        bind:value={leadName}
                        type="text"
                        placeholder="Your name"
                        aria-label="Your name"
                        required />
                    <input
                        bind:value={leadContact}
                        type="text"
                        placeholder="Phone or email"
                        aria-label="Phone or email"
                        required />
                    <button type="submit" disabled={leadSending || !leadName.trim() || !leadContact.trim()}>
                        {leadSending ? 'Sending…' : 'Send'}
                    </button>
                </form>
            {/if}
            {#if suggestions.length > 0 && !isTyping}
                <div class="gary-suggestions" in:fade={{ duration: 150 }}>
                    {#each suggestions as s, i}
                        <button class="gary-suggestion" on:click={() => send(s)}>{s}</button>
                    {/each}
                </div>
            {/if}
            <form class="gary-input" on:submit={handleSubmit}>
                <input
                    bind:this={inputEl}
                    bind:value={input}
                    type="text"
                    {placeholder}
                    aria-label="Message" />
                <button type="submit" disabled={!input.trim() || isTyping} aria-label="Send message">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M4 12l16-8-6 16-3-7-7-1z" fill="currentColor" />
                    </svg>
                </button>
            </form>
        </div>
    </section>
{/if}

<style>
    /* ---- Themes ----
       Every colour in the widget comes from these variables, so a page can
       re-skin Gary without touching the markup. */
    .gary-theme--mint {
        --gary-surface: #ffffff;
        --gary-surface-2: #f4f5f9;
        --gary-bubble: #eef0f5;
        --gary-text: #191c1f;
        --gary-text-soft: rgba(25, 28, 31, 0.55);
        --gary-line: rgba(0, 0, 0, 0.08);
        --gary-line-strong: rgba(0, 0, 0, 0.16);
        --gary-accent: #16b585;
        --gary-accent-hover: #0f9f74;
        --gary-accent-soft: rgba(22, 181, 133, 0.12);
        --gary-accent-text: #0f8a64;
        --gary-on-accent: #ffffff;
        --gary-shadow: 0 24px 70px rgba(20, 30, 60, 0.18);
    }
    .gary-theme--dark {
        --gary-surface: #121417;
        --gary-surface-2: #16191d;
        --gary-bubble: #1c1f24;
        --gary-text: #f2f2f3;
        --gary-text-soft: rgba(242, 242, 243, 0.55);
        --gary-line: rgba(255, 255, 255, 0.1);
        --gary-line-strong: rgba(255, 255, 255, 0.18);
        --gary-accent: #ff6d00;
        --gary-accent-hover: #ff8226;
        --gary-accent-soft: rgba(255, 109, 0, 0.14);
        --gary-accent-text: #ffb072;
        --gary-on-accent: #140800;
        --gary-shadow: 0 24px 70px rgba(0, 0, 0, 0.6);
    }

    /* ---- Launcher ---- */
    .gary-launcher {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 9000;
        display: inline-flex;
        align-items: center;
        gap: 9px;
        padding: 13px 22px;
        border-radius: 999px;
        border: 1px solid var(--gary-line-strong);
        background: var(--gary-surface);
        color: var(--gary-text);
        font-family: inherit;
        font-size: 14.5px;
        font-weight: 500;
        cursor: pointer;
        box-shadow: var(--gary-shadow);
        transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .gary-launcher:hover {
        transform: translateY(-2px);
        border-color: var(--gary-accent);
    }
    .gary-launcher__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--gary-accent);
        box-shadow: 0 0 0 0 var(--gary-accent-soft);
        animation: gary-pulse 2.4s infinite;
    }
    @keyframes gary-pulse {
        0% {
            box-shadow: 0 0 0 0 var(--gary-accent-soft);
        }
        70% {
            box-shadow: 0 0 0 10px transparent;
        }
        100% {
            box-shadow: 0 0 0 0 transparent;
        }
    }

    /* ---- Overlay ---- */
    .gary-overlay {
        position: fixed;
        inset: 0;
        z-index: 8999;
        background: rgba(20, 24, 34, 0.25);
        backdrop-filter: blur(2px);
    }

    /* ---- Panel (anchored top-right, grows from the nav trigger) ---- */
    .gary-panel {
        position: fixed;
        right: 20px;
        top: 76px;
        transform-origin: top right;
        z-index: 9001;
        width: 390px;
        max-width: calc(100vw - 32px);
        height: 600px;
        max-height: calc(100vh - 96px);
        display: flex;
        flex-direction: column;
        background: var(--gary-surface);
        color: var(--gary-text);
        border: 1px solid var(--gary-line);
        border-radius: 18px;
        overflow: hidden;
        box-shadow: var(--gary-shadow);
        font-family: inherit;
    }
    /* Pages that use the floating launcher get the panel above it instead of
       under a nav trigger that does not exist there. */
    .gary-panel--bottom {
        top: auto;
        bottom: 20px;
        transform-origin: bottom right;
        max-height: calc(100vh - 40px);
    }

    .gary-panel__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 18px;
        background: var(--gary-surface-2);
        border-bottom: 1px solid var(--gary-line);
    }
    .gary-panel__id {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .gary-panel__id strong {
        display: block;
        font-size: 15px;
        line-height: 1.1;
    }
    .gary-panel__id small {
        font-size: 11px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--gary-text-soft);
    }
    .gary-panel__status {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: var(--gary-accent);
        box-shadow: 0 0 10px var(--gary-accent-soft);
    }
    .gary-panel__close {
        display: inline-flex;
        padding: 6px;
        border: none;
        background: transparent;
        color: var(--gary-text-soft);
        cursor: pointer;
        border-radius: 8px;
        transition: background 0.15s ease, color 0.15s ease;
    }
    .gary-panel__close:hover {
        background: var(--gary-accent-soft);
        color: var(--gary-text);
    }

    .gary-panel__messages {
        flex: 1;
        overflow-y: auto;
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    .gary-msg {
        display: flex;
        flex-direction: column;
        max-width: 85%;
    }
    .gary-msg--user {
        align-self: flex-end;
        align-items: flex-end;
    }
    .gary-msg--assistant {
        align-self: flex-start;
    }
    .gary-msg__tag {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--gary-accent);
        margin: 0 0 5px 2px;
    }
    .gary-msg__bubble {
        padding: 11px 15px;
        border-radius: 16px;
        font-size: 14.5px;
        line-height: 1.5;
        white-space: pre-wrap;
        word-wrap: break-word;
    }
    .gary-msg--assistant .gary-msg__bubble {
        background: var(--gary-bubble);
        color: var(--gary-text);
        border-bottom-left-radius: 4px;
    }
    .gary-msg--user .gary-msg__bubble {
        background: var(--gary-accent);
        color: var(--gary-on-accent);
        border-bottom-right-radius: 4px;
    }

    .gary-typing {
        display: inline-flex;
        gap: 5px;
        align-items: center;
    }
    .gary-typing span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--gary-text-soft);
        animation: gary-bounce 1.2s infinite ease-in-out;
    }
    .gary-typing span:nth-child(2) {
        animation-delay: 0.15s;
    }
    .gary-typing span:nth-child(3) {
        animation-delay: 0.3s;
    }
    @keyframes gary-bounce {
        0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
        }
        30% {
            transform: translateY(-5px);
            opacity: 1;
        }
    }

    .gary-panel__footer {
        padding: 12px 14px 14px;
        border-top: 1px solid var(--gary-line);
        background: var(--gary-surface);
    }
    .gary-suggestions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 12px;
        justify-content: flex-end;
    }
    .gary-suggestion {
        padding: 2px 12px;
        border-radius: 999px;
        border: 1px solid var(--gary-line-strong);
        background: transparent;
        color: var(--gary-text-soft);
        font-family: inherit;
        font-size: 12.5px;
        cursor: pointer;
        transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
    }
    .gary-suggestion:hover {
        border-color: var(--gary-accent);
        background: var(--gary-accent-soft);
        color: var(--gary-accent-text);
    }

    /* ---- Lead capture (shown only when every provider is down) ---- */
    .gary-lead {
        display: grid;
        grid-template-columns: 1fr 1fr auto;
        gap: 8px;
        margin-bottom: 12px;
    }
    .gary-lead input {
        min-width: 0;
        background: var(--gary-surface-2);
        border: 1px solid var(--gary-line-strong);
        border-radius: 10px;
        padding: 9px 12px;
        color: var(--gary-text);
        font-family: inherit;
        font-size: 13.5px;
    }
    .gary-lead input::placeholder {
        color: var(--gary-text-soft);
    }
    .gary-lead button {
        border: none;
        border-radius: 10px;
        padding: 0 16px;
        background: var(--gary-accent);
        color: var(--gary-on-accent);
        font-family: inherit;
        font-size: 13.5px;
        font-weight: 600;
        cursor: pointer;
    }
    .gary-lead button:disabled {
        opacity: 0.5;
        cursor: default;
    }

    .gary-input {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--gary-surface-2);
        border: 1px solid var(--gary-line-strong);
        border-radius: 999px;
        padding: 5px 5px 5px 18px;
    }
    .gary-input input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: var(--gary-text);
        font-family: inherit;
        font-size: 14.5px;
        padding: 9px 0;
    }
    .gary-input input::placeholder {
        color: var(--gary-text-soft);
    }
    .gary-input button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        flex: 0 0 38px;
        border: none;
        border-radius: 50%;
        background: var(--gary-accent);
        color: var(--gary-on-accent);
        cursor: pointer;
        transition: background 0.15s ease, opacity 0.15s ease;
    }
    .gary-input button:disabled {
        opacity: 0.4;
        cursor: default;
    }
    .gary-input button:not(:disabled):hover {
        background: var(--gary-accent-hover);
    }

    @media (max-width: 600px) {
        .gary-panel {
            right: 8px;
            left: 8px;
            top: 64px;
            width: auto;
            height: calc(100vh - 80px);
            max-height: none;
        }
        .gary-panel--bottom {
            top: 8px;
            bottom: 8px;
            height: auto;
        }
        .gary-launcher {
            right: 12px;
            bottom: 12px;
        }
        .gary-lead {
            grid-template-columns: 1fr 1fr;
        }
        .gary-lead button {
            grid-column: 1 / -1;
            padding: 10px 16px;
        }
    }
</style>
