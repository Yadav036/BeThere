"use client"

import useSWR from "swr"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { apiGet, apiPost } from "@/lib/api"

type Invite = {
  id: string
  createdAt: string
  event: {
    id: string
    name: string
    eventTime: string | null
    locationName: string | null
  }
  invitedBy?: { id: string; name: string | null } | null
}

const fetcher = (url: string) => apiGet(url).then((r) => r.json())

export function InviteList({ className }: { className?: string }) {
  const router = useRouter()
  const { data, isLoading, mutate } = useSWR<{ invites: Invite[] }>("/api/invites", fetcher, {
    refreshInterval: 15000,
  })

  const onJoin = async (inviteId: string, eventId: string) => {
    const res = await apiPost(`/api/invites/${inviteId}/accept`)
    if (res.ok) {
      mutate()
      router.push(`/events/${eventId}`)
    }
  }

  if (isLoading) {
    return (
      <div className={cn("rounded-xl border-4 border-black bg-yellow-400 p-4", className)}>
        <p className="font-extrabold text-black">Checking invites…</p>
      </div>
    )
  }

  const invites = data?.invites ?? []
  if (invites.length === 0) {
    return (
      <div className={cn("rounded-xl border-4 border-black bg-white p-4", className)}>
        <p className="font-bold text-black">No invites yet</p>
        <p className="text-sm text-black/70">Friends can invite you to events by searching your username.</p>
      </div>
    )
  }

  return (
    <div className={cn("rounded-xl border-4 border-black bg-white", className)}>
      <div className="border-b-4 border-black bg-yellow-400 px-4 py-3">
        <h2 className="text-lg font-extrabold text-black">Invites</h2>
      </div>
      <ul className="divide-y-4 divide-black">
        {invites.map((inv) => (
          <li key={inv.id} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="font-bold text-black text-pretty">{inv.event.name}</p>
              <p className="text-sm text-black/70">
                {inv.event.locationName ?? "Location TBA"}
                {inv.event.eventTime ? ` • ${new Date(inv.event.eventTime).toLocaleString()}` : ""}
              </p>
              {inv.invitedBy?.name && <p className="text-xs text-black/60">Invited by {inv.invitedBy.name}</p>}
            </div>
            <button
              onClick={() => onJoin(inv.id, inv.event.id)}
              className="shrink-0 rounded-xl border-2 border-black bg-yellow-400 px-4 py-2 font-bold text-black hover:brightness-95 active:translate-y-[1px]"
            >
              Join
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}