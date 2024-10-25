import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Card } from '~/components/ui/card'
import { MapView } from '~/components/map-view'
import { WeatherPanel } from '~/components/weather-panel'
import { ChatInterface } from '~/components/chat-interface'
import { getPublicEnvVars } from '~/config/env.server'

interface Location {
  name: string
  coordinates: google.maps.LatLngLiteral
}

export async function loader() {
  return json({
    env: getPublicEnvVars()
  })
}

export default function Index() {
  const { env } = useLoaderData<typeof loader>()
  const [waypoints, setWaypoints] = useState<Location[]>([])
  const [locationInput, setLocationInput] = useState('')

  const handleAddLocation = async () => {
    if (!locationInput.trim()) return

    // Use Google Maps Geocoding API to convert address to coordinates
    const geocoder = new google.maps.Geocoder()
    
    try {
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ address: locationInput }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results) {
            resolve(results)
          } else {
            reject(status)
          }
        })
      })

      const location = result[0]
      if (location && location.geometry) {
        setWaypoints(prev => [...prev, {
          name: locationInput,
          coordinates: {
            lat: location.geometry.location.lat(),
            lng: location.geometry.location.lng()
          }
        }])
        setLocationInput('')
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
  }

  const handleRemoveWaypoint = (index: number) => {
    setWaypoints(prev => prev.filter((_, i) => i !== index))
  }

  const handleOptimizeRoute = async () => {
    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waypoints })
      })

      if (!response.ok) throw new Error('Failed to optimize route')

      const data = await response.json()
      if (data.waypoints) {
        setWaypoints(data.waypoints)
      }
    } catch (error) {
      console.error('Route optimization error:', error)
    }
  }

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Left Sidebar */}
      <div className="w-80 border-r border-slate-800 p-6 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 mb-2">RoadTripAI</h1>
          <p className="text-sm text-slate-400">Plan your perfect road trip with AI assistance</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-50">Trip Planner</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Enter location"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
              className="flex-1 bg-slate-900 border-slate-800"
            />
            <Button onClick={handleAddLocation} variant="default">Add</Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <h3 className="text-sm font-medium text-slate-50 mb-2">Waypoints</h3>
          {waypoints.map((waypoint, index) => (
            <Card key={index} className="p-3 mb-2 bg-slate-900/60 border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-50">{waypoint.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveWaypoint(index)}
                  className="hover:bg-slate-800 hover:text-slate-50"
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {waypoints.length >= 2 && (
          <Button 
            onClick={handleOptimizeRoute}
            className="w-full bg-slate-50 text-slate-900 hover:bg-slate-50/90"
          >
            Optimize Route
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        <MapView 
          waypoints={waypoints.map(wp => wp.coordinates)}
          googleMapsApiKey={env.GOOGLE_MAPS_API_KEY}
        />
        <WeatherPanel 
          waypoints={waypoints.map(wp => wp.coordinates)}
          apiKey={env.OPENWEATHER_API_KEY}
        />
        <ChatInterface />
      </div>
    </div>
  )
}