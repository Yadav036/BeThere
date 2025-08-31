"use client"

import { useEffect, useRef } from "react"
import { apiFetch } from "@/lib/api"

export function useLocationReporter(eventId: string | undefined) {
  const timer = useRef<any>(null)

  useEffect(() => {
    if (!eventId) return

    async function once() {
      if (!("geolocation" in navigator)) return
      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              await apiFetch(`/api/events/${eventId}/location`, {
                method: "POST",
                body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
              })
            } catch {}
            resolve()
          },
          () => resolve(),
          { enableHighAccuracy: true, maximumAge: 5000 },
        )
      })
    }

    once()
    timer.current = setInterval(once, 10000)

    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [eventId])
}
