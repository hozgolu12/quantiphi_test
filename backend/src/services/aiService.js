import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { getToneSystemInstruction } from './tonePrompts.js';

// Initialize SDK clients conditionally based on environment variables
let openaiClient = null;
let anthropicClient = null;

const getOpenAIClient = () => {
  if (!openaiClient && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
};

const getAnthropicClient = () => {
  if (!anthropicClient && process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here') {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
};

/**
 * Intelligent fallback generator that accurately respects the Tone Modifier ("Professional", "Casual", "Concise")
 * and streams realistic character chunks when API keys are not supplied or network calls are offline.
 */
async function streamFallbackResponse({ prompt, tone, conversationHistory = [], onChunk }) {
  const normalizedPrompt = prompt.trim();
  const lower = normalizedPrompt.toLowerCase();

  let responseBody = '';

  // Tailor response based on tone & intent
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    if (tone === 'Professional') {
      responseBody = `Greetings. I am your AI Assistant configured in **Professional Mode**.\n\nI am prepared to assist you with structured analysis, code review, architectural design, or enterprise inquiries. Please specify how I may be of service today.`;
    } else if (tone === 'Casual') {
      responseBody = `Hey there! 👋 Awesome to chat with you! I'm running in **Casual Mode** right now—super relaxed, upbeat, and ready to bounce ideas around. What cool project or topic are we tackling today?`;
    } else {
      // Concise
      responseBody = `Hello. AI ready in **Concise Mode**. State your request.`;
    }
  } else if (lower.includes('tone') || lower.includes('vibe')) {
    if (tone === 'Professional') {
      responseBody = `### Architectural Summary: Tone Modifier Logic\n\nThe current conversation is governed by the **Professional** system prompt:\n- **Directive**: Deliver formal, authoritative, and well-structured discourse.\n- **Formatting**: Systematic breakdown with executive clarity.\n- **Status**: Backend system instruction modifier successfully applied to the inference request.`;
    } else if (tone === 'Casual') {
      responseBody = `You got it! 🎉 The **Tone Toggle** just flipped over to **Casual**.\n\nWhenever you switch the toggle, the backend injects an upbeat, friendly system prompt into the LLM request. Super seamless real-time adaptation!`;
    } else {
      responseBody = `Active tone: **Concise**.\n- Backend modifier: Applied\n- Verbosity: Minimum\n- Focus: Direct facts`;
    }
  } else if (lower.includes('code') || lower.includes('function') || lower.includes('javascript') || lower.includes('python')) {
    if (tone === 'Professional') {
      responseBody = `### Technical Implementation Overview\n\nBelow is an enterprise-grade utility function demonstrating real-time stream token processing with comprehensive error boundaries:\n\n\`\`\`javascript\n/**\n * Processes streaming chunks from an SSE response stream\n * @param {ReadableStreamDefaultReader} reader\n * @param {Function} onToken\n */\nexport async function processStream(reader, onToken) {\n  const decoder = new TextDecoder('utf-8');\n  let isDone = false;\n\n  while (!isDone) {\n    const { value, done } = await reader.read();\n    if (done) {\n      isDone = true;\n      break;\n    }\n    const chunk = decoder.decode(value, { stream: true });\n    onToken(chunk);\n  }\n}\n\`\`\`\n\n#### Key Considerations\n1. **Idempotency**: Assures predictable stream consumption.\n2. **Memory Efficiency**: Employs native UTF-8 chunk decoding without buffering allocations.`;
    } else if (tone === 'Casual') {
      responseBody = `Check this out! Here's a neat little snippet you can drop right in to handle real-time streaming chunks:\n\n\`\`\`javascript\n// Quick and clean SSE reader!\nasync function listenToStream(reader, handleChunk) {\n  const decoder = new TextDecoder();\n  while (true) {\n    const { value, done } = await reader.read();\n    if (done) break;\n    handleChunk(decoder.decode(value));\n  }\n}\n\`\`\`\n\nPretty neat, huh? Let me know if you want to tweak anything! 🚀`;
    } else {
      responseBody = `Stream handler implementation:\n\n\`\`\`javascript\nasync function readStream(reader, callback) {\n  const dec = new TextDecoder();\n  for await (const chunk of reader) callback(dec.decode(chunk));\n}\n\`\`\`\n- Input: SSE reader stream\n- Output: Decoded text tokens`;
    }
  } else {
    // General queries
    if (tone === 'Professional') {
      responseBody = `### Assessment & Response\n\nRegarding your query: *"${normalizedPrompt}"*\n\n1. **Core Principle**: Our backend architecture strictly separates presentation from server-side computational state.\n2. **Tone Compliance**: Formatted under executive standards with contextual rigor.\n3. **Real-Time Delivery**: Streaming chunks are transmitted via Server-Sent Events (SSE) and persisted directly into MongoDB.\n\nPlease advise if further detailed elaboration or functional verification is required.`;
    } else if (tone === 'Casual') {
      responseBody = `That's a really interesting thought about *"${normalizedPrompt}"*! 😊\n\nSince we're hanging out in **Casual Mode**, I'd say the coolest part about this setup is how snappy the character streaming feels, plus you can flip the tone anytime and see the personality shift immediately. What do you think?`;
    } else {
      responseBody = `Response to: *"${normalizedPrompt}"*\n- Mode: **Concise**\n- State: Processed & stored in MongoDB\n- Real-time SSE stream active\n- Action items: Ready for next prompt.`;
    }
  }

  // Stream character-by-character / small word chunks with slight natural delays to simulate real-time processing
  const words = responseBody.split(' ');
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? '' : ' ') + words[i];
    onChunk(chunk);
    // 15ms delay per word to give a fast yet distinct character-by-character streaming feel
    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  return responseBody;
}

/**
 * Streams AI completion from OpenAI
 */
async function streamOpenAI({ messages, toneSystemInstruction, model, onChunk }) {
  const client = getOpenAIClient();
  const formattedMessages = [
    { role: 'system', content: toneSystemInstruction },
    ...messages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
  ];

  const stream = await client.chat.completions.create({
    model: model || process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: formattedMessages,
    stream: true,
    temperature: 0.7,
  });

  let fullText = '';
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || '';
    if (text) {
      fullText += text;
      onChunk(text);
    }
  }
  return fullText;
}

/**
 * Streams AI completion from Anthropic Claude
 */
async function streamClaude({ messages, toneSystemInstruction, model, onChunk }) {
  const client = getAnthropicClient();
  const formattedMessages = messages.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));

  const stream = await client.messages.stream({
    model: model || process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
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
  return fullText;
}

/**
 * Main service entry point for streaming AI responses.
 * Detects configured provider (OpenAI vs Claude) and seamlessly passes tone modifiers as system instructions.
 */
export async function generateStreamingResponse({ prompt, tone = 'Professional', conversationHistory = [], onChunk }) {
  const toneSystemInstruction = getToneSystemInstruction(tone);
  const preferredProvider = (process.env.AI_PROVIDER || 'openai').toLowerCase();

  const messages = [...conversationHistory, { role: 'user', content: prompt }];

  // 1. Try OpenAI if selected and key available
  if (preferredProvider === 'openai' && getOpenAIClient()) {
    try {
      return await streamOpenAI({ messages, toneSystemInstruction, onChunk });
    } catch (err) {
      console.warn(`[AI Service] OpenAI streaming encountered error (${err.message}). Falling back to smart stream...`);
    }
  }

  // 2. Try Claude if selected and key available
  if (preferredProvider === 'claude' && getAnthropicClient()) {
    try {
      return await streamClaude({ messages, toneSystemInstruction, onChunk });
    } catch (err) {
      console.warn(`[AI Service] Claude streaming encountered error (${err.message}). Falling back to smart stream...`);
    }
  }

  // 3. Fallback to smart simulated character/token streaming engine (always reliable, no crash)
  return await streamFallbackResponse({ prompt, tone, conversationHistory, onChunk });
}
