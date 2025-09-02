"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { apiGet, apiPost } from "@/lib/client-api"
import { useRouter } from "next/navigation"

type Suggestion = { description: string; place_id: string }

export default function CreateEventForm() {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<Suggestion | null>(null)
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([])
  const [eventTime, setEventTime] = React.useState<string>("")
  const [shareLocation, setShareLocation] = React.useState(true)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Debounced autocomplete
  React.useEffect(() => {
    const t = setTimeout(async () => {
      try {
        if (!query || selected && query === selected.description) return
        const res = await apiGet<{ predictions: Suggestion[] }>(
          `/api/places/autocomplete?input=${encodeURIComponent(query)}`,
        )
        setSuggestions(res.predictions ?? [])
      } catch (e: any) {
        // ignore autocomplete errors
      }
    }, 300)
    return () => clearTimeout(t)
  }, [query, selected])

  const onSelect = (s: Suggestion) => {
    setSelected(s)
    setQuery(s.description)
    setSuggestions([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      let eventLat: number | null = null
      let eventLng: number | null = null
      let eventAddress: string | null = null

      if (selected?.place_id) {
        const geo = await apiGet<{ lat: number; lng: number; address?: string }>(
          `/api/places/geocode?place_id=${encodeURIComponent(selected.place_id)}`,
        )
        eventLat = geo.lat
        eventLng = geo.lng
        eventAddress = geo.address || query
      }

      // Fallback if user didn't pick from suggestions
      if (!eventLat || !eventLng) {
        const geo = await apiGet<{ lat: number; lng: number; address?: string }>(
          `/api/places/geocode?text=${encodeURIComponent(query)}`,
        )
        eventLat = geo.lat
        eventLng = geo.lng
        eventAddress = geo.address || query
      }

      let currentLat: number | null = null
      let currentLng: number | null = null
      if (shareLocation && typeof window !== "undefined" && navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 }),
        )
        currentLat = pos.coords.latitude
        currentLng = pos.coords.longitude
      }

      const res = await apiPost<{ id: string }>(`/api/events`, {
        name,
        eventTime, // ISO string from input type=datetime-local
        eventLocation: { lat: eventLat, lng: eventLng, address: eventAddress },
        currentLocation: currentLat && currentLng ? { lat: currentLat, lng: currentLng } : null,
        shareLocation,
      })
      router.push(`/events/${res.id}`)
    } catch (e: any) {
      setError(e.message || "Failed to create event")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-4 border-yellow-400 shadow-lg">
      <CardHeader className="bg-yellow-400 text-black">
        <CardTitle className="text-pretty text-2xl font-bold">Create Event</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="font-semibold">Event Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Brunch at Central Park"
              required
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Event Location</Label>
            <Input
              value={query}
              onChange={(e) => {
                setSelected(null)
                setQuery(e.target.value)
              }}
              placeholder="Search place..."
              className="text-base"
            />
            {suggestions.length > 0 && (
              <div className="rounded-md border bg-background">
                {suggestions.map((s) => (
                  <button
                    type="button"
                    key={s.place_id}
                    onClick={() => onSelect(s)}
                    className="block w-full cursor-pointer px-3 py-2 text-left hover:bg-yellow-50"
                  >
                    <span className="text-sm">{s.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Event Time</Label>
            <Input
              type="datetime-local"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              required
              className="text-base"
            />
          </div>

          <div className="flex items-center justify-between gap-2 rounded-md border p-3">
            <div>
              <Label className="font-semibold">Share my live location</Label>
              <p className="text-xs text-muted-foreground">Updates every 10s while on event page</p>
            </div>
            <Switch checked={shareLocation} onCheckedChange={setShareLocation} />
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full bg-yellow-400 text-black hover:bg-yellow-300">
            {loading ? "Creating..." : "Create Event"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
