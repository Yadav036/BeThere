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

export default function EventRoomPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [eventInfo, setEventInfo] = useState<any | null>(null)

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      router.push("/login")
      return
    }
    ;(async () => {
      try {
        const res = await apiFetch<{ events: any[] }>("/api/events")
        const found = res.events.find((e) => e.id === id)
        if (found) setEventInfo(found)
      } catch {}
    })()
  }, [id, router])

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        await apiFetch(`/api/events/${id}/join`, { method: "POST", body: JSON.stringify({}) })
      } catch {}
    })()
  }, [id])

  useLocationReporter(id)

  const { data: participantsData, mutate: refreshParticipants } = useSWR<{ participants: Participant[] }>(
    id ? `/api/events/${id}/participants` : null,
    (url) => apiFetch(url),
    { refreshInterval: 10000 },
  )
  const { data: etaData, mutate: refreshEta } = useSWR<{
    results: { user: Participant["user"]; etaSeconds: number | null; distanceMeters: number | null }[]
  }>(id ? `/api/events/${id}/eta` : null, (url) => apiFetch(url), { refreshInterval: 10000 })

  const merged = useMemo(() => {
    const ets = new Map(etaData?.results?.map((r) => [r.user.id, r]) || [])
    const list = (participantsData?.participants || []).map((p) => {
      const er = ets.get(p.user.id)
      return {
        user: p.user,
        etaSeconds: er?.etaSeconds ?? null,
        distanceMeters: er?.distanceMeters ?? null,
      }
    })
    return list
  }, [participantsData, etaData])

  if (!eventInfo) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading event...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(120,119,198,0.3),transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.2),transparent_60%)]"></div>

     <header className="relative z-10 px-4 py-4">
  <div className="relative bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-9 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
        <div className="w-5 h-5 rounded-lg bg-white/20 backdrop-blur-sm"></div>
      </div>
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">{eventInfo.name}</h1>
        <div className="text-gray-400 text-xs mt-0.5">
          {new Date(eventInfo.eventTime).toLocaleString()} • {eventInfo.locationName}
        </div>
      </div>
    </div>
  </div>
</header>


      <section className="relative z-10 px-6 py-12 pb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {merged.map((m) => (
            <ParticipantCard
              key={m.user.id}
              user={m.user}
              etaSeconds={m.etaSeconds}
              distanceMeters={m.distanceMeters}
              eventTimeISO={eventInfo.eventTime}
            />
          ))}
        </div>
      </section>
    </main>
  )
}