"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type MemberInfo = {
  id: string
  name: string | null
  email: string
  lastLat: number | null
  lastLng: number | null
}

export type EtaInfo = {
  userId: string
  etaSeconds: number | null
  distanceMeters: number | null
}

export default function EventMemberCard({
  member,
  eta,
  eventTimeISO,
  isSelf,
}: {
  member: MemberInfo
  eta?: EtaInfo
  eventTimeISO?: string
  isSelf?: boolean
}) {
  const etaMin = eta?.etaSeconds != null ? Math.round(eta.etaSeconds / 60) : null
  const distKm = eta?.distanceMeters != null ? Math.max(0, Math.round((eta.distanceMeters / 1000) * 10) / 10) : null

  const arrivalTime = eta?.etaSeconds != null ? new Date(Date.now() + eta.etaSeconds * 1000) : null
  const eventTime = eventTimeISO ? new Date(eventTimeISO) : null
  const late = arrivalTime && eventTime ? arrivalTime.getTime() > eventTime.getTime() : false

  return (
    <Card
      className={cn("transition-colors", late ? "border-4 border-red-500 bg-red-50" : "border-4 border-yellow-400")}
    >
      <CardHeader className={cn("text-black", late ? "bg-red-500" : "bg-yellow-400")}>
        <CardTitle className="text-pretty text-xl font-bold">
          {member.name || member.email} {isSelf ? "(You)" : ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 p-4">
        <p className="text-sm">
          Need to travel : <span className="font-semibold">{etaMin != null ? `${etaMin} min` : "—"}</span>
        </p>
        <p className="text-sm">
          Distance: <span className="font-semibold">{distKm != null ? `${distKm} km` : "—"}</span>
        </p>
        {arrivalTime && (
          <p className="text-sm">
            Arrives by: <span className="font-semibold">{arrivalTime.toLocaleTimeString()}</span>
          </p>
        )}
        {eventTime && (
          <p className="text-sm">
            Event time: <span className="font-semibold">{eventTime.toLocaleTimeString()}</span>
          </p>
        )}
        {late && <p className="text-sm font-semibold text-red-600">Might be late</p>}
      </CardContent>
    </Card>
  )
}
