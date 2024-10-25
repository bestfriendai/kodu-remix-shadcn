import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { lat, lon } = await request.json();
    const apiKey = process.env.OPENWEATHER_API_KEY;

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error('Weather API error:', error);
    return json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}