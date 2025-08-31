import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthFromHeader } from "@/lib/jwt"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = getAuthFromHeader(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { socketId } = await req.json().catch(() => ({}))

  // verify event exists
  const event = await prisma.event.findUnique({ where: { id: params.id } })
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 })

  const participant = await prisma.eventParticipant.upsert({
    where: { eventId_userId: { eventId: params.id, userId: auth.sub } },
    update: { socketId: socketId || null },
    create: { eventId: params.id, userId: auth.sub, socketId: socketId || null },
    select: { id: true, eventId: true, userId: true, socketId: true },
  })

  return NextResponse.json({ participant })
}
