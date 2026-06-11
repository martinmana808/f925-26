import { SYSTEM_PROMPT } from '../lib/gary-system-prompt.js';
import { completeWithFallback } from '../lib/gary-models.js';

// Vercel serverless function — mirrors netlify/functions/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    res.status(500).json({ error: 'Missing GROQ_API_KEY environment variable' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { messages } = body;

    const result = await completeWithFallback({
      apiKey: GROQ_API_KEY,
      systemPrompt: SYSTEM_PROMPT,
      messages,
    });

    if (!result.ok) {
      console.error('All Groq models failed:', result.error);
      res.status(result.status).send(`Groq API Error: ${result.error}`);
      return;
    }

    res.status(200).json(result.data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
