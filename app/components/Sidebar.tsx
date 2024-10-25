import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'

interface Location {
  name: string
  coordinates: google.maps.LatLngLiteral
}

interface SidebarProps {
  waypoints: Location[]
  onAddWaypoint: (location: Location) => void
  onRemoveWaypoint: (index: number) => void
  onOptimizeRoute: () => void
}

export default function Sidebar({ 
  waypoints, 
  onAddWaypoint, 
  onRemoveWaypoint, 
  onOptimizeRoute 
}: SidebarProps) {
  const [locationInput, setLocationInput] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)

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
        onAddWaypoint({
          name: locationInput,
          coordinates: {
            lat: location.geometry.location.lat(),
            lng: location.geometry.location.lng()
          }
        })
        setLocationInput('')
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
  }

  const handleOptimizeRoute = async () => {
    setIsOptimizing(true)
    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waypoints })
      })

      if (!response.ok) throw new Error('Failed to optimize route')

      const data = await response.json()
      if (data.waypoints) {
        onOptimizeRoute()
      }
    } catch (error) {
      console.error('Route optimization error:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <div className="w-80 h-full bg-background border-r p-4 flex flex-col gap-4">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Trip Planner</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Enter location"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
          />
          <Button onClick={handleAddLocation}>Add</Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <h3 className="text-sm font-medium mb-2">Waypoints</h3>
        {waypoints.map((waypoint, index) => (
          <Card key={index} className="p-3 mb-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">{waypoint.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveWaypoint(index)}
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
          disabled={isOptimizing}
        >
          {isOptimizing ? 'Optimizing...' : 'Optimize Route'}
        </Button>
      )}
    </div>
  )
}