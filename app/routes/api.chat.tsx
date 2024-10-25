import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { generateResponse } from '~/services/ai.server';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { messages } = await request.json();
    
    const response = await generateResponse(messages);
    
    // Extract any location suggestions from the response
    const locationRegex = /\b([A-Z][a-zA-Z\s]*(?:,\s*[A-Z][a-zA-Z\s]*)*)\b/g;
    const suggestions = response.match(locationRegex) || [];
    
    return json({
      message: response,
      suggestion: suggestions.length > 0 ? suggestions[0] : null
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}