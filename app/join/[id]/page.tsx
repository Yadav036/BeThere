"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiPost } from "@/lib/api"

export default function QuickJoinPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [state, setState] = useState<"joining" | "ok" | "error">("joining")

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await apiPost(`/api/events/${params.id}/join`)
        if (cancelled) return
        setState("ok")
        router.replace(`/events/${params.id}`)
      } catch {
        if (!cancelled) setState("error")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [params.id, router])

  return (
    <main className="min-h-[60vh] grid place-items-center p-6">
      {state === "joining" && (
        <div className="rounded-2xl border-2 border-black bg-yellow-400 px-6 py-4 text-black font-extrabold">
          Joining event…
        </div>
      )}
      {state === "error" && (
        <div className="rounded-2xl border-2 border-black bg-background px-6 py-4 font-bold">
          Could not join this event. Make sure you’re logged in and the invite is valid.
        </div>
      )}
    </main>
  )
}
