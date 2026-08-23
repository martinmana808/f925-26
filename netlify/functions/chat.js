import { getPersona } from '../../lib/gary-personas.js'
import { completeWithFallback } from '../../lib/gary-models.js'
import { checkRateLimit, clientIp, isAllowedOrigin, sanitiseMessages } from '../../lib/gary-guards.js'

// Netlify function — mirrors api/chat.js
export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const headers = event.headers || {}

    if (!isAllowedOrigin(headers.origin)) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) }
    }

    const limit = checkRateLimit(clientIp(headers))
    if (!limit.ok) {
        return {
            statusCode: 429,
            headers: { 'Retry-After': String(limit.retryAfter || 60) },
            body: JSON.stringify({ error: 'Too many messages — give it a minute.' }),
        }
    }

    const keys = {
        groq: process.env.GROQ_API_KEY,
        cerebras: process.env.CEREBRAS_API_KEY,
        gemini: process.env.GEMINI_API_KEY,
        openrouter: process.env.OPENROUTER_API_KEY,
    }

    if (!Object.values(keys).some(Boolean)) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'No model provider API key configured' }),
        }
    }

    try {
        const { messages, persona } = JSON.parse(event.body || '{}')

        const result = await completeWithFallback({
            keys,
            systemPrompt: getPersona(persona).systemPrompt,
            messages: sanitiseMessages(messages),
        })

        if (!result.ok) {
            console.error('Gary: every provider failed:', result.error)
            return {
                statusCode: result.status,
                body: JSON.stringify({ error: 'All model providers unavailable' }),
            }
        }

        return { statusCode: 200, body: JSON.stringify(result.data) }
    } catch (error) {
        console.error('Error:', error)
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) }
    }
}
