import Anthropic from '@anthropic-ai/sdk';

let anthropicClient: Anthropic | null = null;

export function getAnthropicClient() {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }
    anthropicClient = new Anthropic({
      apiKey
    });
  }
  return anthropicClient;
}

interface MessageContent {
  type: 'text';
  text: string;
}

export async function generateResponse(messages: { role: string; content: string }[]) {
  const client = getAnthropicClient();
  
  // Convert chat history to a format Claude can understand
  const conversation = messages
    .map(msg => `\n\n${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
    .join('');

  const response = await client.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: conversation + '\n\nHuman: ' + messages[messages.length - 1].content
      }
    ]
  });

  const content = response.content[0] as MessageContent;
  if (content.type === 'text') {
    return content.text;
  }

  throw new Error('Unexpected response format from Claude');
}