"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { InviteList } from "@/components/invites/invite-list"

import { jwtDecode } from "jwt-decode"


export default function HomePage() {
  const router = useRouter()
  const [username, setUsername] = React.useState<string | null>(null)

  React.useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      router.replace("/login")
    } else {
      try {
        const decoded: any = jwtDecode(token)
        setUsername(decoded.username || decoded.email || decoded.name || null)
      } catch {
        setUsername(null)
      }
    }
  }, [router])

  return (
    <div>
    <main className="mx-auto grid max-w-3xl gap-6 p-4">
      <header className="flex items-center justify-between rounded-xl border-4 border-black bg-yellow-400 px-4 py-3 text-black">
        <h1 className="text-balance text-3xl font-extrabold">Snap Events</h1>
        <div className="flex items-center gap-2">
          {username && (
            <span className="font-semibold px-2">{username}</span>
          )}
          <Button
            variant="secondary"
            onClick={() => {
              localStorage.removeItem("token")
              window.location.href = "/login"
            }}
            className="border-2 border-black"
          >
            Logout
          </Button>
        </div>
      </header>

      <CreateEventForm />
      <UserSearchInvite />
      <InviteList />

      <section className="rounded-xl border-4 border-black p-4">
        <h2 className="mb-2 text-2xl font-bold">Your Events</h2>
        <p className="text-sm text-muted-foreground">
          After creating an event, you’ll see it here.
        </p>
      </section>
    </main>
    </div>
  )
}
