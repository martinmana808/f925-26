// Gary's Groq model fallback chain.
//
// Ordered smartest -> most resilient. We always START at the top of the list
// (the most capable model) and walk DOWN to the next one whenever a model is
// unavailable: rate-limited, out of quota/credits, decommissioned, overloaded,
// or simply not enabled on the account. Because we treat "model not found"
// (404) as a fall-through, it's safe to list aspirational/preview models at the
// top — if they're not on the account, Gary silently drops to the next one.
//
// To re-prioritise, just reorder this array.
export const GROQ_MODELS = [
  'openai/gpt-oss-120b',                        // smartest available, honors JSON mode
  'llama-3.3-70b-versatile',                    // reliable workhorse, always-on anchor
  'openai/gpt-oss-20b',                         // capable mid-tier, honors JSON mode
  'meta-llama/llama-4-scout-17b-16e-instruct',  // fast + capable fallback
  'llama-3.1-8b-instant',                       // last-resort, cheap, rarely rate-limited
];

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// Status codes that mean "this model is unavailable right now, try the next one"
// 429 rate limit / quota, 402 payment, 403 forbidden, 404 unknown model,
// 413 payload, 5xx upstream/overloaded.
const FALLBACK_STATUSES = new Set([402, 403, 404, 413, 429, 500, 502, 503, 529]);

/**
 * Call Groq with automatic model fallback.
 *
 * Walks the GROQ_MODELS list from smartest to most-resilient, returning the
 * first successful completion. Falls through on rate limits, exhausted
 * credits/usage, decommissioned models, or transient upstream errors.
 *
 * @returns {Promise<{ ok: true, data: object, model: string } | { ok: false, status: number, error: string }>}
 */
export async function completeWithFallback({ apiKey, systemPrompt, messages }) {
  const payloadBase = {
    messages: [
      { role: 'system', content: systemPrompt },
      ...(messages || []),
    ],
    temperature: 0.7,
    max_tokens: 1024,
    response_format: { type: 'json_object' },
  };

  let lastStatus = 502;
  let lastError = 'No models available';

  for (const model of GROQ_MODELS) {
    try {
      const response = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, ...payloadBase }),
      });

      if (response.ok) {
        const data = await response.json();
        return { ok: true, data, model };
      }

      // Not ok — decide whether to fall through to the next model.
      const errorText = await response.text();
      lastStatus = response.status;
      lastError = errorText;
      console.error(`Groq model "${model}" failed (${response.status}): ${errorText}`);

      if (FALLBACK_STATUSES.has(response.status)) {
        continue; // try the next, smarter-to-cheaper model
      }

      // Non-fallback error (e.g. 400 bad request that every model would reject) —
      // still try the next model in case it's model-specific, but keep the record.
      continue;
    } catch (err) {
      lastStatus = 502;
      lastError = err?.message || String(err);
      console.error(`Groq model "${model}" threw: ${lastError}`);
      continue;
    }
  }

  return { ok: false, status: lastStatus, error: lastError };
}
