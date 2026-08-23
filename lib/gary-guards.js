// Guards for the public chat endpoint.
//
// The threat here is not cost — the providers are on free tiers — it is a script
// draining the daily quota before a real dealer ever gets to type. So: only our
// own pages may call it, history is clamped, and one IP can only ask so much.

const MAX_MESSAGES = 10 // turns of history sent upstream
const MAX_MESSAGE_CHARS = 1200
const MAX_TOTAL_CHARS = 8000

const WINDOW_MS = 30 * 60 * 1000 // 30 minutes
const MAX_PER_WINDOW = 25
const MIN_GAP_MS = 800 // burst guard between two messages

// Serverless instances come and go, so this is per-instance and best-effort by
// design — enough to stop a naive loop without adding a database to a chat
// widget. Anything determined enough to beat it is a problem for a real WAF.
const hits = new Map()

function prune(now) {
    if (hits.size < 500) return
    for (const [key, entry] of hits) {
        if (now - entry.last > WINDOW_MS) hits.delete(key)
    }
}

export function checkRateLimit(ip, now = Date.now()) {
    if (!ip) return { ok: true }
    prune(now)

    const entry = hits.get(ip)
    if (!entry || now - entry.start > WINDOW_MS) {
        hits.set(ip, { start: now, last: now, count: 1 })
        return { ok: true }
    }

    if (now - entry.last < MIN_GAP_MS) {
        return { ok: false, status: 429, retryAfter: 2, reason: 'too fast' }
    }

    entry.last = now
    entry.count += 1

    if (entry.count > MAX_PER_WINDOW) {
        return {
            ok: false,
            status: 429,
            retryAfter: Math.ceil((entry.start + WINDOW_MS - now) / 1000),
            reason: 'hourly limit',
        }
    }

    return { ok: true }
}

const ALLOWED_HOST_SUFFIXES = ['f925.works', 'vercel.app', 'netlify.app']
const ALLOWED_HOSTS = ['localhost', '127.0.0.1']

// A missing Origin header is allowed: same-origin form-style posts and some
// mobile browsers omit it, and blocking those would break real visitors.
export function isAllowedOrigin(origin) {
    if (!origin) return true
    try {
        const { hostname } = new URL(origin)
        if (ALLOWED_HOSTS.includes(hostname)) return true
        return ALLOWED_HOST_SUFFIXES.some(
            (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`),
        )
    } catch {
        return false
    }
}

/**
 * Clamp whatever arrived into something safe to forward upstream: known roles,
 * strings only, recent history only, bounded length.
 */
export function sanitiseMessages(raw) {
    if (!Array.isArray(raw)) return []

    const cleaned = raw
        .filter((m) => m && typeof m.content === 'string')
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
            role: m.role,
            content: m.content.trim().slice(0, MAX_MESSAGE_CHARS),
        }))
        .filter((m) => m.content.length > 0)
        .slice(-MAX_MESSAGES)

    let total = 0
    const bounded = []
    for (let i = cleaned.length - 1; i >= 0; i--) {
        total += cleaned[i].content.length
        if (total > MAX_TOTAL_CHARS) break
        bounded.unshift(cleaned[i])
    }
    return bounded
}

export function clientIp(headers = {}) {
    const get = (name) => headers[name] || headers[name.toLowerCase()] || ''
    const forwarded = get('x-forwarded-for')
    if (forwarded) return String(forwarded).split(',')[0].trim()
    return get('x-nf-client-connection-ip') || get('x-real-ip') || ''
}
