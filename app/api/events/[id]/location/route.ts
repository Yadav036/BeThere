import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthFromHeader } from "@/lib/jwt"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = getAuthFromHeader(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { lat, lng } = await req.json()
  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "Invalid coords" }, { status: 400 })
  }

  const updated = await prisma.eventParticipant
    .update({
      where: { eventId_userId: { eventId: params.id, userId: auth.sub } },
      data: { lastLat: lat, lastLng: lng, lastLocationAt: new Date() },
      select: { id: true, lastLat: true, lastLng: true, lastLocationAt: true },
    })
    .catch(async () => {
      // in case user wasn't joined yet, auto-join
      return prisma.eventParticipant.create({
        data: { eventId: params.id, userId: auth.sub, lastLat: lat, lastLng: lng, lastLocationAt: new Date() },
        select: { id: true, lastLat: true, lastLng: true, lastLocationAt: true },
      })
    })

  return NextResponse.json({ updated })
}
