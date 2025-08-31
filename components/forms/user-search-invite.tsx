"use client"

import * as React from "react"
import useSWR from "swr"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { apiGet } from "@/lib/client-api"

export default function UserSearchInvite({ eventId }: { eventId?: string }) {
  const [q, setQ] = React.useState("")
  const { data } = useSWR(q ? `/api/users/search?q=${encodeURIComponent(q)}` : null, null, {
    fetcher: (url) => apiGet<{ users: { id: string; name: string; email: string }[] }>(url),
  })

  const inviteLink = eventId ? `${typeof window !== "undefined" ? window.location.origin : ""}/events/${eventId}` : ""

  async function copy() {
    if (!inviteLink) return
    await navigator.clipboard.writeText(inviteLink)
  }

  return (
    <Card className="border-4 border-lime-400">
      <CardHeader className="bg-lime-400 text-black">
        <CardTitle className="text-pretty text-2xl font-bold">Invite Friends</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users by name or email"
            className="text-base"
          />
          <Button onClick={copy} variant="secondary" className="border-2 border-black">
            Copy Link
          </Button>
        </div>
        {data?.users?.length ? (
          <ul className="grid gap-2">
            {data.users.map((u) => (
              <li key={u.id} className="flex items-center justify-between rounded-md border p-2">
                <div>
                  <p className="font-semibold">{u.name || u.email}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <Button size="sm" variant="outline" className="border-yellow-400 text-yellow-700 bg-transparent">
                  Invite
                </Button>
              </li>
            ))}
          </ul>
        ) : q ? (
          <p className="text-sm text-muted-foreground">No users found.</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
