// Gary's model fallback ladder.
//
// The rule is the same one Gary has always used, extended one level up: always
// START at the smartest thing available and walk DOWN whenever something is
// unavailable — rate-limited, out of free quota, decommissioned, overloaded, or
// simply not enabled on the account. Previously that walk happened across Groq
// models; now it walks across Groq models first, then across other providers,
// so a drained free tier degrades to a different vendor instead of to nothing.
//
// Every provider here speaks the OpenAI chat-completions shape, which is why the
// whole ladder is one loop and not four integrations.
//
// KEYS (all optional except Groq — a provider with no key is skipped silently):
//   GROQ_API_KEY        api.groq.com        — fastest, primary
//   CEREBRAS_API_KEY    api.cerebras.ai     — free tier, very fast
//   GEMINI_API_KEY      Google AI Studio    — free tier, OpenAI-compatible endpoint
//   OPENROUTER_API_KEY  openrouter.ai       — last resort, ":free" models
//
// Model IDs go stale — providers decommission them constantly. That is safe
// here: an unknown model returns 404 and we fall straight through to the next
// entry, so a stale list degrades quality, never availability.

import { normaliseReply } from './gary-reply.js'

export const PROVIDERS = [
    {
        id: 'groq',
        envKey: 'GROQ_API_KEY',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        // Verified against this account's catalogue. To refresh:
        //   curl -sH "Authorization: Bearer $GROQ_API_KEY" \
        //        https://api.groq.com/openai/v1/models | jq -r '.data[].id'
        // Free-tier limits are per model, so falling through also spreads load.
        models: [
            'openai/gpt-oss-120b', // smartest available, honors JSON mode
            'openai/gpt-oss-20b', // fast, reliable, honors JSON mode
            'groq/compound-mini', // last resort, rarely contended
            // Deliberately not listed: reasoning models (qwen3.x) — they blow
            // the token budget narrating, and fail Groq's JSON validation.
        ],
    },
    {
        id: 'cerebras',
        envKey: 'CEREBRAS_API_KEY',
        endpoint: 'https://api.cerebras.ai/v1/chat/completions',
        models: ['gpt-oss-120b', 'llama-3.3-70b', 'llama3.1-8b'],
    },
    {
        id: 'gemini',
        envKey: 'GEMINI_API_KEY',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        // Gemini's flash models think before they answer, and those reasoning
        // tokens come out of max_tokens — at 512 the answer gets truncated to
        // nothing. Hence the roomier budget and the lowest reasoning setting
        // the endpoint will accept ("none" is rejected). To refresh the list:
        //   curl -sH "Authorization: Bearer $GEMINI_API_KEY" \
        //     https://generativelanguage.googleapis.com/v1beta/openai/models
        extras: { max_tokens: 2048, reasoning_effort: 'low' },
        models: [
            'gemini-3.7-flash', // newest flash; busy at peak, falls through fast
            'gemini-flash-lite-latest', // self-updating alias, ~1.5s, very reliable
            'gemini-3.5-flash-lite', // pinned backstop if the alias moves badly
        ],
    },
    {
        id: 'openrouter',
        envKey: 'OPENROUTER_API_KEY',
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        models: ['meta-llama/llama-3.3-70b-instruct:free', 'google/gemma-2-9b-it:free'],
    },
]

// Kept for anything still importing the old name.
export const GROQ_MODELS = PROVIDERS[0].models

// "This one is unavailable right now, try the next" — quota, credits, unknown
// model, payload, upstream trouble.
const FALLBACK_STATUSES = new Set([401, 402, 403, 404, 413, 429, 500, 502, 503, 529])

const DEFAULT_TIMEOUT_MS = 12000

async function callModel({ endpoint, apiKey, model, payload, timeoutMs }) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ model, ...payload }),
            signal: controller.signal,
        })
        return response
    } finally {
        clearTimeout(timer)
    }
}

/**
 * Walk the ladder and return the first successful completion.
 *
 * @param {object}  args
 * @param {string}  args.systemPrompt
 * @param {Array}   args.messages       already sanitised {role, content} pairs
 * @param {object}  args.keys           { groq, cerebras, gemini, openrouter } — missing = skipped
 * @param {string} [args.apiKey]        legacy single-key form, treated as the Groq key
 * @param {number} [args.timeoutMs]
 * @returns {Promise<{ok: true, data: object, model: string, provider: string}
 *                 | {ok: false, status: number, error: string}>}
 */
export async function completeWithFallback({
    systemPrompt,
    messages,
    keys = {},
    apiKey,
    timeoutMs = DEFAULT_TIMEOUT_MS,
}) {
    const resolvedKeys = { groq: apiKey, ...keys }

    const basePayload = {
        messages: [{ role: 'system', content: systemPrompt }, ...(messages || [])],
        temperature: 0.7,
        max_tokens: 512, // replies are short; requested tokens count against free-tier TPM
    }

    let lastStatus = 502
    let lastError = 'No models available'

    for (const provider of PROVIDERS) {
        const key = resolvedKeys[provider.id]
        if (!key) continue

        for (const model of provider.models) {
            // Two shots at most per model: JSON mode, then plain if the provider
            // rejects response_format. Gary's contract is a JSON object, and the
            // client falls back to treating the raw text as the reply, so a
            // provider without JSON mode still works.
            for (const jsonMode of [true, false]) {
                const payload = {
                    ...basePayload,
                    ...(provider.extras || {}),
                    ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
                }

                try {
                    const response = await callModel({
                        endpoint: provider.endpoint,
                        apiKey: key,
                        model,
                        payload,
                        timeoutMs,
                    })

                    if (response.ok) {
                        const data = await response.json()

                        // A 200 is not automatically a usable answer. Coerce
                        // whatever came back into Gary's contract, and if there
                        // is nothing usable in it, treat this model as failed
                        // and keep walking down the ladder.
                        const raw = data?.choices?.[0]?.message?.content
                        const normalised = normaliseReply(raw)

                        if (!normalised.reply) {
                            lastStatus = 502
                            lastError = 'Model returned an unusable reply'
                            console.error(`Gary: ${provider.id}/${model} returned an unusable reply`)
                            break
                        }

                        // Hand back the OpenAI envelope the client already
                        // understands, with the content cleaned up.
                        data.choices[0].message.content = JSON.stringify(normalised)
                        return { ok: true, data, model, provider: provider.id }
                    }

                    const errorText = await response.text()
                    lastStatus = response.status
                    lastError = errorText
                    console.error(
                        `Gary: ${provider.id}/${model}${jsonMode ? '' : ' (plain)'} failed (${response.status}): ${errorText.slice(0, 300)}`,
                    )

                    // A 400 while asking for JSON mode is usually the provider
                    // saying it does not support response_format — worth one
                    // retry without it. Any other 400 is the request itself, so
                    // move to the next model.
                    if (response.status === 400 && jsonMode) continue
                    if (FALLBACK_STATUSES.has(response.status)) break
                    break
                } catch (err) {
                    lastStatus = 502
                    lastError = err?.name === 'AbortError' ? 'Upstream timeout' : err?.message || String(err)
                    console.error(`Gary: ${provider.id}/${model} threw: ${lastError}`)
                    break
                }
            }
        }
    }

    return { ok: false, status: lastStatus, error: lastError }
}
