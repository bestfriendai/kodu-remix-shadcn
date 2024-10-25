import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { generateResponse } from '~/services/ai.server';

interface Waypoint {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface OptimizeRequest {
  waypoints: Waypoint[];
}

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { waypoints } = (await request.json()) as OptimizeRequest;
    
    // Use Claude to optimize the route
    const prompt = `I have a road trip with the following waypoints:
${waypoints.map((wp: Waypoint, i: number) => `${i + 1}. ${wp.name}`).join('\n')}

Please suggest an optimal order for visiting these locations considering:
1. Logical geographical progression
2. Minimizing total travel distance
3. Popular tourist routes
4. Scenic routes when available

Respond with just the numbered list of locations in the optimal order.`;

    const response = await generateResponse([{ role: 'user', content: prompt }]);
    
    // Extract the optimized order from Claude's response
    const optimizedOrder = response
      .match(/\d+\.\s+([^\n]+)/g)
      ?.map((line: string) => line.replace(/^\d+\.\s+/, ''))
      || waypoints.map((wp: Waypoint) => wp.name);

    // Reorder the waypoints based on Claude's suggestion
    const optimizedWaypoints = optimizedOrder.map((name: string) => 
      waypoints.find((wp: Waypoint) => wp.name === name)
    ).filter((wp): wp is Waypoint => wp !== undefined);

    return json({ waypoints: optimizedWaypoints });
  } catch (error) {
    console.error('Route optimization error:', error);
    return json(
      { error: 'Failed to optimize route' },
      { status: 500 }
    );
  }
}