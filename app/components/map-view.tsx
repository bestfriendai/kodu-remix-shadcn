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

const darkMapStyles = [
  {
    elementType: "geometry",
    stylers: [{ color: "#1a1b1e" }]
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242424" }]
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#746855" }]
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }]
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }]
  }
]

interface MapViewProps {
  waypoints?: google.maps.LatLngLiteral[]
  onMapClick?: (location: google.maps.LatLngLiteral) => void
  googleMapsApiKey: string
}

export function MapView({ waypoints = [], onMapClick, googleMapsApiKey }: MapViewProps) {
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
          options={{
            styles: darkMapStyles,
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false
          }}
        >
          {waypoints.map((waypoint, index) => (
            <Marker
              key={`${waypoint.lat}-${waypoint.lng}-${index}`}
              position={waypoint}
              label={{
                text: `${index + 1}`,
                color: '#FFFFFF',
                fontWeight: 'bold'
              }}
            />
          ))}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  strokeColor: '#FFFFFF',
                  strokeWeight: 4
                },
                suppressMarkers: true
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  )
}