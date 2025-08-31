import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthFromHeader } from "@/lib/jwt"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const auth = getAuthFromHeader(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const participants = await prisma.eventParticipant.findMany({
    where: { eventId: params.id },
    select: {
      id: true,
      user: { select: { id: true, username: true, email: true } },
      lastLat: true,
      lastLng: true,
      lastLocationAt: true,
      joinedAt: true,
    },
  })
  return NextResponse.json({ participants })
}
