"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"

type PlacePrediction = { description: string; place_id: string }

export default function CreateEventForm({ onCreated }: { onCreated?: (event: any) => void }) {
  const [name, setName] = useState("")
  const [time, setTime] = useState("")
  const [query, setQuery] = useState("")
  const [predictions, setPredictions] = useState<PlacePrediction[]>([])
  const [selectedPlace, setSelectedPlace] = useState<{ name: string; lat: number; lng: number } | null>(null)
  const [shareLocation, setShareLocation] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = setTimeout(async () => {
      if (query.trim().length < 2) {
        setPredictions([])
        return
      }
      try {
        const data = await apiFetch<any>(`/api/places/autocomplete?q=${encodeURIComponent(query)}`)
        setPredictions(
          (data?.predictions || []).map((p: any) => ({ description: p.description, place_id: p.place_id })),
        )
      } catch {
        // ignore
      }
    }, 250)
    return () => clearTimeout(id)
  }, [query])

  async function selectPrediction(p: PlacePrediction) {
    const geo = await apiFetch<{ name: string; location: { lat: number; lng: number } }>(
      `/api/places/geocode?placeId=${encodeURIComponent(p.place_id)}`,
    )
    setSelectedPlace({ name: geo.name, lat: geo.location.lat, lng: geo.location.lng })
    setQuery(geo.name)
    setPredictions([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!selectedPlace) {
      setError("Please choose a location suggestion")
      return
    }
    setLoading(true)
    try {
      const res = await apiFetch<{ event: any }>("/api/events", {
        method: "POST",
        body: JSON.stringify({
          name,
          eventTime: time,
          location: selectedPlace,
          shareLocation,
        }),
      })
      onCreated?.(res.event)
      setName("")
      setTime("")
      setQuery("")
      setSelectedPlace(null)
    } catch (err: any) {
      setError(err.message || "Failed to create event")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.2),transparent_50%)]"></div>

      <div className="relative w-full max-w-lg">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-lg"></div>
        
        <div className="relative bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-xl">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm"></div>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">SnapEvents</h1>
            <p className="text-gray-400 text-sm">Create a new event</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Event Name</label>
              <div className="relative group">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Brunch at Central Park"
                  required
                  className="w-full rounded-2xl px-4 py-4 bg-white/[0.05] text-white border border-white/10 focus:outline-none focus:border-blue-400/60 focus:bg-white/[0.08] transition-all duration-300 placeholder-gray-500"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500 pointer-events-none"></div>
              </div>
            </div>

            <div className="space-y-2 relative z-30">
              <label className="text-sm font-medium text-gray-300">Event Location</label>
              <div className="relative group">
                <input
                  value={query}
                  onChange={(e) => {
                    setSelectedPlace(null)
                    setQuery(e.target.value)
                  }}
                  placeholder="Search place..."
                  className="w-full rounded-2xl px-4 py-4 bg-white/[0.05] text-white border border-white/10 focus:outline-none focus:border-blue-400/60 focus:bg-white/[0.08] transition-all duration-300 placeholder-gray-500"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500 pointer-events-none"></div>
              </div>
              {predictions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 overflow-hidden shadow-2xl max-h-64 overflow-y-auto">
                  {predictions.map((p) => (
                    <button
                      type="button"
                      key={p.place_id}
                      onClick={() => selectPrediction(p)}
                      className="block w-full px-4 py-3 text-left text-white hover:bg-slate-800/80 transition-all duration-200 border-b border-slate-700/30 last:border-b-0 text-sm"
                    >
                      {p.description}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Event Time</label>
              <div className="relative group">
                <input
                  type="datetime-local"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full rounded-2xl px-4 py-4 bg-white/[0.05] text-white border border-white/10 focus:outline-none focus:border-blue-400/60 focus:bg-white/[0.08] transition-all duration-300 placeholder-gray-500"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500 pointer-events-none"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.05] border border-white/10">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Share my live location</label>
                <p className="text-xs text-gray-500">Updates every 10s while on event page</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={shareLocation}
                  onChange={(e) => setShareLocation(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden rounded-2xl py-4 font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                {loading ? "Creating..." : "Create Event"}
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}