import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { getToneSystemInstruction } from './tonePrompts.js';

/**
 * Streams AI completion from OpenAI using official OpenAI SDK.
 */
export async function streamOpenAIResponse({
  prompt,
  tone = 'Professional',
  model,
  conversationHistory = [],
  onChunk,
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_openai_api_key_here') {
    throw new Error(
      'OpenAI API key is missing or unconfigured. Please define OPENAI_API_KEY in backend/.env.'
    );
  }

  const selectedModel = model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const toneSystemInstruction = getToneSystemInstruction(tone);

  const formattedMessages = [
    { role: 'system', content: toneSystemInstruction },
    ...conversationHistory
      .filter((m) => m && m.content && (m.role === 'user' || m.role === 'assistant'))
      .slice(-10)
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    { role: 'user', content: prompt.trim() },
  ];

  const openai = new OpenAI({ apiKey: apiKey.trim() });

  try {
    const stream = await openai.chat.completions.create({
      model: selectedModel,
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
        `OpenAI Model Unavailable (404): The model "${selectedModel}" is not recognized or not accessible with this API key.`
      );
    } else if (err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
      throw new Error(
        'OpenAI Network Error: Failed to establish connection to OpenAI API endpoints. Please verify network connectivity.'
      );
    }

    throw new Error(err.message || 'An error occurred while communicating with OpenAI.');
  }
}

/**
 * Streams AI completion from Anthropic Claude using official Anthropic SDK.
 */
export async function streamClaudeResponse({
  prompt,
  tone = 'Professional',
  model,
  conversationHistory = [],
  onChunk,
}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_anthropic_api_key_here') {
    throw new Error(
      'Anthropic Claude API key is missing or unconfigured. Please define ANTHROPIC_API_KEY in backend/.env.'
    );
  }

  const selectedModel = model || process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';
  const toneSystemInstruction = getToneSystemInstruction(tone);

  const formattedMessages = [
    ...conversationHistory
      .filter((m) => m && m.content && (m.role === 'user' || m.role === 'assistant'))
      .slice(-10)
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    { role: 'user', content: prompt.trim() },
  ];

  const anthropic = new Anthropic({ apiKey: apiKey.trim() });

  try {
    const stream = await anthropic.messages.stream({
      model: selectedModel,
      system: toneSystemInstruction,
      messages: formattedMessages,
      max_tokens: 2048,
    });

    let fullText = '';
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.text) {
        fullText += event.delta.text;
        onChunk(event.delta.text);
      }
    }

    if (!fullText.trim()) {
      throw new Error('Claude returned an empty completion stream.');
    }

    return fullText;
  } catch (err) {
    if (err.status === 400 && err.message?.includes('credit balance is too low')) {
      throw new Error(
        'Anthropic Claude Credit Limit (400): Your credit balance is too low to access the Anthropic API. Please upgrade or purchase credits at console.anthropic.com.'
      );
    } else if (err.status === 401) {
      throw new Error(
        'Anthropic Authentication Error (401): Invalid Claude API key provided. Please check ANTHROPIC_API_KEY in backend/.env.'
      );
    } else if (err.status === 429) {
      throw new Error(
        'Anthropic Claude Rate Limit Exceeded (429): Please verify your Anthropic rate limits or wait a few moments.'
      );
    } else if (err.status === 404) {
      throw new Error(
        `Anthropic Model Unavailable (404): The model "${selectedModel}" is not available for this API key.`
      );
    } else if (err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
      throw new Error(
        'Anthropic Network Error: Failed to establish connection to Anthropic API endpoints. Please verify network connectivity.'
      );
    }

    throw new Error(err.message || 'An error occurred while communicating with Anthropic Claude.');
  }
}

/**
 * Unified AI streaming service router supporting both OpenAI and Claude.
 */
export async function streamAIResponse({
  provider = 'openai',
  model,
  prompt,
  tone,
  conversationHistory,
  onChunk,
}) {
  const normalizedProvider = (provider || 'openai').toLowerCase();

  if (normalizedProvider === 'claude') {
    return await streamClaudeResponse({
      prompt,
      tone,
      model,
      conversationHistory,
      onChunk,
    });
  }

  // Default to OpenAI
  return await streamOpenAIResponse({
    prompt,
    tone,
    model,
    conversationHistory,
    onChunk,
  });
}
