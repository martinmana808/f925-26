<script>
    import { tick, onMount } from 'svelte';
    import { scale, fade } from 'svelte/transition';
    import { garyOpen, garyPrime } from '../stores/gary.js';

    // Platform-neutral endpoint. On Vercel this hits /api/chat directly;
    // on Netlify a redirect maps /api/* to /.netlify/functions/*.
    const ENDPOINT = '/api/chat';

    const INITIAL_MESSAGE = {
        id: 'init-1',
        role: 'assistant',
        content:
            "Hello, I'm Gary. I work for F925, building AI systems that solve real-world inefficiencies. To see how we can help, tell me about your business. What are you currently working on?",
    };

    let messages = [INITIAL_MESSAGE];
    let suggestions = [
        'I run a digital agency.',
        "I'm looking to automate data entry.",
        'What exactly do you guys build?',
    ];
    let input = '';
    let isTyping = false;
    let scrollEl;
    let inputEl;

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
                body: JSON.stringify({ messages: apiMessages }),
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
        } catch (error) {
            messages = [
                ...messages,
                {
                    id: makeId(),
                    role: 'assistant',
                    content:
                        "I'm having trouble connecting to my neural core right now. Try again in a moment, or reach the team at f925.limited@gmail.com.",
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

    function close() {
        garyOpen.set(false);
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

    onMount(() => {
        window.addEventListener('keydown', onKeydown);
        return () => window.removeEventListener('keydown', onKeydown);
    });
</script>

<!-- Panel (grows from the top-right, anchored under the nav trigger) -->
{#if $garyOpen}
    <div class="gary-overlay" on:click={close} transition:fade={{ duration: 150 }} aria-hidden="true"></div>
    <section
        class="gary-panel"
        transition:scale={{ duration: 220, start: 0.85, opacity: 0 }}
        role="dialog"
        aria-label="Chat with Gary">
        <header class="gary-panel__header">
            <div class="gary-panel__id">
                <span class="gary-panel__status" aria-hidden="true"></span>
                <div>
                    <strong>Gary</strong>
                    <small>F925 · AI assistant</small>
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
                    {#if m.role === 'assistant'}<span class="gary-msg__tag">Gary</span>{/if}
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
                    placeholder="Ask Gary anything…"
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
        background: #ffffff;
        color: #191c1f;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 24px 70px rgba(20, 30, 60, 0.18);
        font-family: inherit;
    }

    .gary-panel__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 18px;
        background: #f4f5f9;
        border-bottom: 1px solid rgba(0, 0, 0, 0.07);
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
        color: rgba(25, 28, 31, 0.5);
    }
    .gary-panel__status {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #16b585;
        box-shadow: 0 0 10px rgba(22, 181, 133, 0.5);
    }
    .gary-panel__close {
        display: inline-flex;
        padding: 6px;
        border: none;
        background: transparent;
        color: rgba(25, 28, 31, 0.55);
        cursor: pointer;
        border-radius: 8px;
        transition: background 0.15s ease, color 0.15s ease;
    }
    .gary-panel__close:hover {
        background: rgba(0, 0, 0, 0.06);
        color: #191c1f;
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
        color: #16b585;
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
        background: #eef0f5;
        color: #191c1f;
        border-bottom-left-radius: 4px;
    }
    .gary-msg--user .gary-msg__bubble {
        background: #16b585;
        color: #fff;
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
        background: rgba(25, 28, 31, 0.35);
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
        border-top: 1px solid rgba(0, 0, 0, 0.07);
        background: #ffffff;
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
        border: 1px solid rgba(0, 0, 0, 0.16);
        background: transparent;
        color: rgba(25, 28, 31, 0.75);
        font-family: inherit;
        font-size: 12.5px;
        cursor: pointer;
        transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
    }
    .gary-suggestion:hover {
        border-color: #16b585;
        background: rgba(22, 181, 133, 0.12);
        color: #0f8a64;
    }

    .gary-input {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f4f5f9;
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 999px;
        padding: 5px 5px 5px 18px;
    }
    .gary-input input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: #191c1f;
        font-family: inherit;
        font-size: 14.5px;
        padding: 9px 0;
    }
    .gary-input input::placeholder {
        color: rgba(25, 28, 31, 0.4);
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
        background: #16b585;
        color: #fff;
        cursor: pointer;
        transition: background 0.15s ease, opacity 0.15s ease;
    }
    .gary-input button:disabled {
        opacity: 0.4;
        cursor: default;
    }
    .gary-input button:not(:disabled):hover {
        background: #0f9f74;
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
    }
</style>
