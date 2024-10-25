import { useEffect, useRef, useState } from 'react'
import { LoadScript, GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '100%'
}

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
}

interface MapViewProps {
  waypoints?: google.maps.LatLngLiteral[]
  onMapClick?: (location: google.maps.LatLngLiteral) => void
  googleMapsApiKey: string
}

export default function MapView({ waypoints = [], onMapClick, googleMapsApiKey }: MapViewProps) {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)

  useEffect(() => {
    if (waypoints.length >= 2) {
      const directionsService = new google.maps.DirectionsService()

      const origin = waypoints[0]
      const destination = waypoints[waypoints.length - 1]
      const middleWaypoints = waypoints.slice(1, -1).map(location => ({
        location: new google.maps.LatLng(location.lat, location.lng),
        stopover: true
      }))

      directionsService.route(
        {
          origin,
          destination,
          waypoints: middleWaypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          optimizeWaypoints: true
        },
        (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result)
          }
        }
      )
    }
  }, [waypoints])

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (onMapClick && e.latLng) {
      onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() })
    }
  }

  return (
    <div className="w-full h-full">
      <LoadScript googleMapsApiKey={googleMapsApiKey}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={10}
          onClick={handleMapClick}
          onLoad={(map: google.maps.Map) => {
            mapRef.current = map
          }}
        >
          {waypoints.map((waypoint, index) => (
            <Marker
              key={`${waypoint.lat}-${waypoint.lng}-${index}`}
              position={waypoint}
              label={`${index + 1}`}
            />
          ))}
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </LoadScript>
    </div>
  )
}