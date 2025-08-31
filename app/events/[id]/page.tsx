"use client"

import useSWR from "swr"
import { useEffect, useMemo, useState } from "react"
import { apiFetch, getAuthToken } from "@/lib/api"
import { useParams, useRouter } from "next/navigation"
import { useLocationReporter } from "@/hooks/use-location-reporter"
import ParticipantCard from "@/components/event/participant-card"

type Participant = {
  user: { id: string; username: string; email: string }
  lastLat?: number | null
  lastLng?: number | null
  lastLocationAt?: string | null
  joinedAt: string
}

type EventInfo = {
  id: string
  name: string
  eventTime: string
  locationName?: string
  eventLocation?: { lat: number; lng: number; address: string }
}

type EtaResult = {
  user: { id: string; username: string; email: string }
  etaSeconds: number | null
  distanceMeters: number | null
}

export default function EventRoomPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>({})

  // Auth check and event loading
  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      console.log("No auth token, redirecting to login")
      router.push("/login")
      return
    }

    if (!id) {
      console.error("No event ID provided")
      return
    }

    const loadEventInfo = async () => {
      try {
        console.log("Loading event info for ID:", id)
        const res = await apiFetch<{ events: EventInfo[] }>("/api/events")
        console.log("Events API response:", res)
        
        const found = res.events.find((e) => e.id === id)
        if (found) {
          console.log("Found event:", found)
          setEventInfo(found)
        } else {
          console.error("Event not found in list:", id)
          setDebugInfo(prev => ({ ...prev, eventNotFound: true, availableEvents: res.events.map(e => e.id) }))
        }
      } catch (error) {
        console.error("Failed to load event info:", error)
        setDebugInfo(prev => ({ ...prev, eventLoadError: error }))
      }
    }

    loadEventInfo()
  }, [id, router])

  // Auto-join event
  useEffect(() => {
    if (!id) return
    
    const joinEvent = async () => {
      try {
        console.log("Joining event:", id)
        await apiFetch(`/api/events/${id}/join`, { 
          method: "POST", 
          body: JSON.stringify({}) 
        })
        console.log("Successfully joined event")
      } catch (error) {
        console.error("Failed to join event:", error)
        setDebugInfo(prev => ({ ...prev, joinError: error }))
      }
    }

    joinEvent()
  }, [id])

  // Start location reporting
  useLocationReporter(id)

  // Fetch participants data
  const { data: participantsData, error: participantsError, mutate: refreshParticipants } = useSWR<{ participants: Participant[] }>(
    id ? `/api/events/${id}/participants` : null,
    (url) => apiFetch(url),
    { 
      refreshInterval: 5000, // Reduced to 5 seconds for better real-time updates
      onError: (error) => {
        console.error("Participants fetch error:", error)
        setDebugInfo(prev => ({ ...prev, participantsError: error }))
      },
      onSuccess: (data) => {
        console.log("Participants data:", data)
        setDebugInfo(prev => ({ ...prev, participantsData: data }))
      }
    }
  )

  // Fetch ETA data
  const { data: etaData, error: etaError, mutate: refreshEta } = useSWR<{
    results: EtaResult[]
  }>(
    id ? `/api/events/${id}/eta` : null, 
    (url) => apiFetch(url), 
    { 
      refreshInterval: 10000,
      onError: (error) => {
        console.error("ETA fetch error:", error)
        setDebugInfo(prev => ({ ...prev, etaError: error }))
      },
      onSuccess: (data) => {
        console.log("ETA data:", data)
        setDebugInfo(prev => ({ ...prev, etaData: data }))
      }
    }
  )

  // Merge participants with ETA data
  const mergedParticipants = useMemo(() => {
    console.log("Merging data:", { participantsData, etaData })
    
    if (!participantsData?.participants) {
      console.log("No participants data available")
      return []
    }

    const etaMap = new Map(etaData?.results?.map((r) => [r.user.id, r]) || [])
    console.log("ETA map:", etaMap)
    
    const merged = participantsData.participants.map((participant) => {
      const etaResult = etaMap.get(participant.user.id)
      
      // Convert location data for travelling detection
      const lastLocation = participant.lastLat && participant.lastLng && participant.lastLocationAt ? {
        lat: participant.lastLat,
        lng: participant.lastLng,
        ts: new Date(participant.lastLocationAt).getTime()
      } : undefined

      const result = {
        user: participant.user,
        etaSeconds: etaResult?.etaSeconds ?? null,
        distanceMeters: etaResult?.distanceMeters ?? null,
        lastLocation,
        prevLocation: undefined, // You'll need to track this separately or get from backend
        participantData: participant, // For debugging
        etaResult // For debugging
      }
      
      console.log("Merged participant:", result)
      return result
    })
    
    console.log("Final merged participants:", merged)
    return merged
  }, [participantsData, etaData])

  // Debug panel (remove in production)
  const showDebug = process.env.NODE_ENV === 'development'

  if (!eventInfo) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading event...</p>
          {showDebug && (
            <div className="mt-4 p-4 bg-black/50 rounded-lg text-left text-xs text-gray-300">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(120,119,198,0.3),transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.2),transparent_60%)]"></div>

      {/* Header */}
      <header className="relative z-10 px-4 py-4">
        <div className="relative bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <div className="w-5 h-5 rounded-lg bg-white/20 backdrop-blur-sm"></div>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white tracking-tight">{eventInfo.name}</h1>
              <div className="text-gray-400 text-xs mt-0.5">
                {new Date(eventInfo.eventTime).toLocaleString()} • {eventInfo.eventLocation?.address || eventInfo.locationName || 'Location TBD'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-white text-sm font-medium">
                {mergedParticipants.length} participant{mergedParticipants.length !== 1 ? 's' : ''}
              </div>
              <div className="text-gray-400 text-xs">
                {participantsError || etaError ? 'Connection issues' : 'Live updates'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Debug Panel (Development Only) */}
      {showDebug && (
        <div className="relative z-10 px-4 mb-4">
          <details className="bg-black/50 rounded-lg p-4 text-xs text-gray-300">
            <summary className="cursor-pointer text-white mb-2">Debug Info</summary>
            <div className="space-y-2">
              <div><strong>Event ID:</strong> {id}</div>
              <div><strong>Participants Count:</strong> {participantsData?.participants?.length || 0}</div>
              <div><strong>ETA Results Count:</strong> {etaData?.results?.length || 0}</div>
              <div><strong>Merged Count:</strong> {mergedParticipants.length}</div>
              <div><strong>Errors:</strong> {JSON.stringify({ participantsError, etaError })}</div>
              <pre className="bg-black/30 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify({ participantsData, etaData, debugInfo }, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}

      {/* Participants Section */}
      <section className="relative z-10 px-6 py-8 pb-8">
        {mergedParticipants.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg mb-2">No participants yet</div>
            <div className="text-gray-500 text-sm">Share the event link to invite others</div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {mergedParticipants.map((participant) => {
              // Create previous location for travelling detection
              // This is a simplified approach - you might want to track this properly in backend
              const prevLocation = participant.lastLocation ? {
                ...participant.lastLocation,
                ts: participant.lastLocation.ts - 60000 // Fake previous location 1 min ago
              } : undefined

              return (
                <ParticipantCard
                  key={participant.user.id}
                  user={participant.user}
                  etaSeconds={participant.etaSeconds}
                  distanceMeters={participant.distanceMeters}
                  eventTimeISO={eventInfo.eventTime}
                  lastLocation={participant.lastLocation}
                  prevLocation={prevLocation}
                />
              )
            })}
          </div>
        )}
      </section>

      {/* Refresh Button */}
      <div className="fixed bottom-6 right-6 z-20">
        <button
          onClick={() => {
            console.log("Manual refresh triggered")
            refreshParticipants()
            refreshEta()
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </main>
  )
}