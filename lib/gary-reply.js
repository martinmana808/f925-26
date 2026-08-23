// Whatever a model hands back, the widget gets {reply, suggestions}.
//
// Models on the lower rungs of the ladder do not all honour JSON mode, and some
// of them are reasoning models that narrate their thinking before answering.
// Normalising here — rather than in the widget — means every client, current or
// future, is protected from a model that decided to be creative about format.

const THINK_BLOCK = /<think>[\s\S]*?<\/think>/gi
const UNCLOSED_THINK = /<think>[\s\S]*$/i
const FENCE = /^```(?:json)?\s*|\s*```$/gi

// Pull the first balanced {...} out of a string, ignoring braces inside strings.
function firstJsonObject(text) {
    const start = text.indexOf('{')
    if (start === -1) return null

    let depth = 0
    let inString = false
    let escaped = false

    for (let i = start; i < text.length; i++) {
        const char = text[i]

        if (escaped) {
            escaped = false
            continue
        }
        if (char === '\\') {
            escaped = true
            continue
        }
        if (char === '"') {
            inString = !inString
            continue
        }
        if (inString) continue

        if (char === '{') depth++
        else if (char === '}') {
            depth--
            if (depth === 0) return text.slice(start, i + 1)
        }
    }
    return null
}

function cleanSuggestions(value) {
    if (!Array.isArray(value)) return []
    return value
        .filter((s) => typeof s === 'string')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 3)
}

/**
 * @param {string} content raw assistant content from any provider
 * @returns {{reply: string, suggestions: string[]}} reply is '' when nothing usable came back
 */
export function normaliseReply(content) {
    if (typeof content !== 'string') return { reply: '', suggestions: [] }

    const stripped = content.replace(THINK_BLOCK, '').replace(UNCLOSED_THINK, '').replace(FENCE, '').trim()

    if (!stripped) return { reply: '', suggestions: [] }

    const candidate = firstJsonObject(stripped)
    if (candidate) {
        try {
            const parsed = JSON.parse(candidate)
            const reply = typeof parsed.reply === 'string' ? parsed.reply.trim() : ''
            if (reply) return { reply, suggestions: cleanSuggestions(parsed.suggestions) }
        } catch {
            // fall through to plain text
        }
    }

    // No usable JSON — if the model just answered in prose, that is still a
    // perfectly good reply. Anything that still looks like raw JSON is not.
    if (stripped.startsWith('{') || stripped.startsWith('[')) return { reply: '', suggestions: [] }
    return { reply: stripped, suggestions: [] }
}
