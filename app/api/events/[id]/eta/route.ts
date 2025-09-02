import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthFromHeader } from "@/lib/jwt"
import { distanceMatrix } from "@/lib/google"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const auth = getAuthFromHeader(req)

  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const eventId = params.id

  const event = await prisma.event.findUnique({ where: { id: eventId } })
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

  if (withCoords.length === 0) return NextResponse.json({ results: [] })

  const dm = await distanceMatrix(
    withCoords.map((x) => x.coord),
    { lat: event.locationLat, lng: event.locationLng },
  )

  const rows = dm.rows || []
  const results = withCoords.map((p, idx) => {
    const element = rows[idx]?.elements?.[0]
    const durationSec = element?.duration?.value ?? null
    const distanceMeters = element?.distance?.value ?? null
    return {
      user: p.user,
      etaSeconds: durationSec,
      distanceMeters,
    }
  })

  return NextResponse.json({ results })
}
