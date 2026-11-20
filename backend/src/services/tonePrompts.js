/**
 * Tone modifier definitions for the AI Assistant ("The Vibe Check")
 * Formulated on the backend and passed as authoritative system instructions to OpenAI.
 */

export const TONE_MODIFIERS = {
  Professional: {
    name: 'Professional',
    description: 'Clear, formal, respectful language',
    instruction:
      'You are a professional AI assistant. Communicate with clear, formal, respectful language. Provide articulate, well-structured explanations and polite phrasing, avoiding casual colloquialisms.',
  },
  Casual: {
    name: 'Casual',
    description: 'Friendly, relaxed, simple language',
    instruction:
      'You are a friendly, approachable AI companion. Communicate with friendly, relaxed, simple language. Use natural conversational phrasing, warmth, and an upbeat tone.',
  },
  Concise: {
    name: 'Concise',
    description: 'Brief and direct, without unnecessary explanation',
    instruction:
      'You are a precision-focused AI assistant. Deliver answers that are brief and direct, without unnecessary explanation, pleasantries, or preamble. Maximum signal, minimum noise.',
  },
};

/**
 * Validates and returns the system instruction modifier string for the selected tone.
 * Validates against allowed tones on the server.
 */
export const getToneSystemInstruction = (tone) => {
  if (tone && TONE_MODIFIERS[tone]) {
    return TONE_MODIFIERS[tone].instruction;
  }
  return TONE_MODIFIERS.Professional.instruction;
};
