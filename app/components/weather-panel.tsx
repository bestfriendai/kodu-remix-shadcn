import { useEffect, useState } from 'react'
import { Card } from './ui/card'

interface WeatherInfo {
  temperature: number
  description: string
  icon: string
}

interface WeatherPanelProps {
  waypoints: google.maps.LatLngLiteral[]
  apiKey: string
}

export function WeatherPanel({ waypoints, apiKey }: WeatherPanelProps) {
  const [weatherData, setWeatherData] = useState<WeatherInfo[]>([])

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const weatherPromises = waypoints.map(async (point) => {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${point.lat}&lon=${point.lng}&appid=${apiKey}&units=metric`
          )
          const data = await response.json()
          
          return {
            temperature: Math.round(data.main.temp),
            description: data.weather[0].description,
            icon: data.weather[0].icon
          }
        })

        const results = await Promise.all(weatherPromises)
        setWeatherData(results)
      } catch (error) {
        console.error('Error fetching weather:', error)
      }
    }

    if (waypoints.length > 0) {
      fetchWeather()
    }
  }, [waypoints, apiKey])

  if (weatherData.length === 0) return null

  return (
    <Card className="absolute bottom-4 left-4 z-10 p-4 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 border-slate-800">
      <h3 className="text-sm font-medium text-slate-50 mb-2">Weather Conditions</h3>
      <div className="flex gap-4">
        {weatherData.map((weather, index) => (
          <div key={index} className="text-center">
            <img
              src={`http://openweathermap.org/img/w/${weather.icon}.png`}
              alt={weather.description}
              className="w-8 h-8 mx-auto invert"
            />
            <div className="text-sm font-medium text-slate-50">{weather.temperature}°C</div>
            <div className="text-xs text-slate-400">
              {weather.description}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}