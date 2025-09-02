"use client"

import { useEffect, useState } from "react"
import CreateEventForm from "@/components/event/create-event-form"
import InvitePeople from "@/components/event/invite-people"
import { apiFetch, getAuthToken } from "@/lib/api"
import { useRouter } from "next/navigation"

// Helper function to decode JWT and extract username
function getUsernameFromToken(token: string): string | null {
  try {
    // JWT has 3 parts separated by dots: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    // Decode the payload (second part)
    const payload = parts[1]
    // Add padding if needed for base64 decoding
    const paddedPayload = payload.padEnd(payload.length + (4 - payload.length % 4) % 4, '=')
    const decoded = JSON.parse(atob(paddedPayload))
    
    // Return username, email, or sub field (adjust based on your JWT structure)
    return decoded.username || decoded.email || decoded.sub || null
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

export default function HomePage() {
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      router.push("/login")
      return
    }
    
    // Extract username from token
    const extractedUsername = getUsernameFromToken(token)
    setUsername(extractedUsername)
    
    ;(async () => {
      try {
        const res = await apiFetch<{ events: any[] }>("/api/events")
        setEvents(res.events)
      } catch {}
    })()
  }, [router])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(120,119,198,0.3),transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.2),transparent_60%)]"></div>

      <header className="relative z-10 px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <div className="w-6 h-12 rounded-lg bg-white/20 backdrop-blur-sm"></div>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">BeThere</h1>
          </div>
          <div className="flex items-center gap-4">
            {username && (
              <span className="text-white/80 text-sm font-medium">
                Welcome, {username}
              </span>
            )}
            <button
              onClick={() => {
                localStorage.removeItem("token")
                router.push("/login")
              }}
              className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="relative z-10 px-6 mb-8">
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <CreateEventForm onCreated={(e) => router.push(`/events/${e.id}`)} />
          <InvitePeople onSelect={(u) => alert(`Invited @${u.username} (stub) — wire to EventInvite if needed`)} />
        </div>
      </section>

      <section className="relative z-10 px-6 pb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Your Events</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {events.map((e) => (
            <button
              key={e.id}
              onClick={() => router.push(`/events/${e.id}`)}
              className="relative bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-left hover:bg-white/[0.12] transition-all duration-300 transform hover:scale-[1.02] shadow-xl"
            >
              <div className="text-xl font-bold text-white mb-2">{e.name}</div>
              <div className="text-gray-400 text-sm mb-1">{new Date(e.eventTime).toLocaleString()}</div>
              <div className="text-gray-400 text-sm">{e.locationName}</div>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}