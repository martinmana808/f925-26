import { getPersona } from '../lib/gary-personas.js'
import { completeWithFallback } from '../lib/gary-models.js'
import { checkRateLimit, clientIp, isAllowedOrigin, sanitiseMessages } from '../lib/gary-guards.js'

// Vercel serverless function — mirrors netlify/functions/chat.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed')
        return
    }

    const headers = req.headers || {}

    if (!isAllowedOrigin(headers.origin)) {
        res.status(403).json({ error: 'Forbidden' })
        return
    }

    const limit = checkRateLimit(clientIp(headers))
    if (!limit.ok) {
        res.setHeader('Retry-After', String(limit.retryAfter || 60))
        res.status(429).json({ error: 'Too many messages — give it a minute.' })
        return
    }

    const keys = {
        groq: process.env.GROQ_API_KEY,
        cerebras: process.env.CEREBRAS_API_KEY,
        gemini: process.env.GEMINI_API_KEY,
        openrouter: process.env.OPENROUTER_API_KEY,
    }

    if (!Object.values(keys).some(Boolean)) {
        res.status(500).json({ error: 'No model provider API key configured' })
        return
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
        const { messages, persona } = body

        const result = await completeWithFallback({
            keys,
            systemPrompt: getPersona(persona).systemPrompt,
            messages: sanitiseMessages(messages),
        })

        if (!result.ok) {
            console.error('Gary: every provider failed:', result.error)
            res.status(result.status).json({ error: 'All model providers unavailable' })
            return
        }

        res.status(200).json(result.data)
    } catch (error) {
        console.error('Error:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}
