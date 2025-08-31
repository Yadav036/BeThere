import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthFromHeader } from "@/lib/jwt"
import { distanceMatrix } from "@/lib/google"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const auth = getAuthFromHeader(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const event = await prisma.event.findUnique({ where: { id: params.id } })
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 })

  const participants = await prisma.eventParticipant.findMany({
    where: { eventId: params.id },
    select: {
      user: { select: { id: true, username: true, email: true } },
      lastLat: true,
      lastLng: true,
    },
  })

  const withCoords = participants
    .map((p) => ({
      user: p.user,
      coord:
        typeof p.lastLat === "number" && typeof p.lastLng === "number"
          ? { lat: p.lastLat as number, lng: p.lastLng as number }
          : null,
    }))
    .filter((p) => p.coord !== null) as {
    user: { id: string; username: string; email: string }
    coord: { lat: number; lng: number }
  }[]

  const dm = withCoords.length
    ? await distanceMatrix(
        withCoords.map((x) => x.coord),
        { lat: event.locationLat, lng: event.locationLng },
      )
    : { rows: [] }

  const rows = (dm as any).rows || []
  const eventTs = new Date(event.eventTime).getTime()
  const bufferSec = 180 // 3 minutes buffer; adjust as needed

  const results = withCoords.map((p, idx) => {
    const element = rows[idx]?.elements?.[0]
    const travelSec = element?.duration?.value ?? null
    const leaveAt = travelSec != null ? new Date(eventTs - (travelSec + bufferSec) * 1000) : null
    return {
      user: p.user,
      leaveAtISO: leaveAt ? leaveAt.toISOString() : null,
      etaSeconds: travelSec,
    }
  })

  return NextResponse.json({ results, eventTimeISO: new Date(eventTs).toISOString(), bufferSec })
}
