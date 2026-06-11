import { SYSTEM_PROMPT } from '../../lib/gary-system-prompt.js';
import { completeWithFallback } from '../../lib/gary-models.js';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!GROQ_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing GROQ_API_KEY environment variable' }),
    };
  }

  try {
    const { messages } = JSON.parse(event.body || '{}');

    const result = await completeWithFallback({
      apiKey: GROQ_API_KEY,
      systemPrompt: SYSTEM_PROMPT,
      messages,
    });

    if (!result.ok) {
      console.error('All Groq models failed:', result.error);
      return { statusCode: result.status, body: `Groq API Error: ${result.error}` };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.data),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
