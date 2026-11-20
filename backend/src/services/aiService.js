import OpenAI from 'openai';
import { getToneSystemInstruction } from './tonePrompts.js';

/**
 * Streams AI completion from OpenAI using official OpenAI SDK.
 * Reads OPENAI_API_KEY from backend environment variables securely.
 * Never logs or exposes the API key.
 * Removes mock/hard-coded replies from the real chat path.
 */
export async function streamOpenAIResponse({ prompt, tone = 'Professional', conversationHistory = [], onChunk }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_openai_api_key_here') {
    throw new Error(
      'OpenAI API key is missing or unconfigured. Please define OPENAI_API_KEY in backend/.env.'
    );
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const toneSystemInstruction = getToneSystemInstruction(tone);

  // Format system instruction and relevant conversational history
  const formattedMessages = [
    { role: 'system', content: toneSystemInstruction },
    ...conversationHistory
      .filter((m) => m && m.content && (m.role === 'user' || m.role === 'assistant'))
      .slice(-10) // Retain last 10 turns for context
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    { role: 'user', content: prompt.trim() },
  ];

  const openai = new OpenAI({ apiKey: apiKey.trim() });

  try {
    const stream = await openai.chat.completions.create({
      model,
      messages: formattedMessages,
      stream: true,
      temperature: 0.7,
    });

    let fullText = '';
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        fullText += delta;
        onChunk(delta);
      }
    }

    if (!fullText.trim()) {
      throw new Error('OpenAI returned an empty completion stream.');
    }

    return fullText;
  } catch (err) {
    // Categorize errors into clear, actionable UI messages without logging secret keys
    if (err.status === 401 || err.code === 'invalid_api_key') {
      throw new Error(
        'OpenAI Authentication Error (401): Invalid API key provided. Please check OPENAI_API_KEY in backend/.env.'
      );
    } else if (err.status === 429 || err.code === 'insufficient_quota') {
      throw new Error(
        'OpenAI Quota / Rate Limit Exceeded (429): Please verify your OpenAI plan, credits, or rate limits.'
      );
    } else if (err.status === 404 || err.code === 'model_not_found') {
      throw new Error(
        `OpenAI Model Unavailable (404): The model "${model}" is not recognized or not accessible with this API key.`
      );
    } else if (err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
      throw new Error(
        'OpenAI Network Error: Failed to establish connection to OpenAI API endpoints. Please verify network connectivity.'
      );
    }

    // Re-throw genuine error message
    throw new Error(err.message || 'An error occurred while communicating with OpenAI.');
  }
}
