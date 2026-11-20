/**
 * Frontend API client communicating with backend server
 */

const BASE_URL = '/api';

export async function getConversations(searchQuery = '') {
  const url = searchQuery
    ? `${BASE_URL}/conversations?search=${encodeURIComponent(searchQuery)}`
    : `${BASE_URL}/conversations`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch conversation history');
  const json = await res.json();
  return json.data || [];
}

export async function getConversationById(id) {
  const res = await fetch(`${BASE_URL}/conversations/${id}`);
  if (!res.ok) throw new Error('Failed to load conversation');
  const json = await res.json();
  return json.data;
}

export async function createConversation(title, tone = 'Professional') {
  const res = await fetch(`${BASE_URL}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, tone }),
  });
  if (!res.ok) throw new Error('Failed to create conversation');
  const json = await res.json();
  return json.data;
}

export async function deleteConversation(id) {
  const res = await fetch(`${BASE_URL}/conversations/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete conversation');
  const json = await res.json();
  return json;
}

export async function updateConversationTone(id, tone) {
  const res = await fetch(`${BASE_URL}/conversations/${id}/tone`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tone }),
  });
  if (!res.ok) throw new Error('Failed to update tone');
  const json = await res.json();
  return json.data;
}

/**
 * Handles real-time SSE stream consumption
 */
export async function streamChatResponse({
  conversationId,
  message,
  tone,
  provider,
  model,
  onStart,
  onChunk,
  onDone,
  onError,
}) {
  try {
    const response = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversationId, message, tone, provider, model }),
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || ''; // Keep partial line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.type === 'start') {
              onStart?.(data);
            } else if (data.type === 'chunk') {
              onChunk?.(data.text);
            } else if (data.type === 'done') {
              onDone?.(data);
            } else if (data.type === 'error') {
              onError?.(new Error(data.error || 'Streaming error occurred'));
            }
          } catch (err) {
            console.error('Failed to parse SSE payload:', err, line);
          }
        }
      }
    }
  } catch (err) {
    console.error('Chat stream exception:', err);
    onError?.(err);
  }
}
