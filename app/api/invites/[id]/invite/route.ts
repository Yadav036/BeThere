import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { inviteeId } = await req.json()
  if (!inviteeId) {
    return NextResponse.json({ error: "Missing inviteeId" }, { status: 400 })
  }

  // make sure the event exists and the current user is allowed to invite
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    select: { id: true, creatorId: true },
  })
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }

  if (event.creatorId !== user.id) {
    return NextResponse.json({ error: "Only the event creator can invite" }, { status: 403 })
  }

  // upsert invite (avoid duplicates if already invited)
  const invite = await prisma.eventInvite.upsert({
    where: {
      eventId_invitedUserId: { eventId: event.id, invitedUserId: inviteeId },
    },
    update: { status: "pending" },
    create: {
      eventId: event.id,
      invitedUserId: inviteeId,
      invitedById: user.id,
      status: "pending",
    },
  })

  return NextResponse.json({ invite })
}
