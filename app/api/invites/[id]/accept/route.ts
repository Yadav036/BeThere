import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const invite = await prisma.eventInvite.findFirst({
    where: { id: params.id, invitedUserId: user.id, status: "pending" },
    select: { id: true, eventId: true },
  })
  if (!invite) {
    return NextResponse.json({ error: "Invite not found or already processed" }, { status: 404 })
  }

  await prisma.$transaction([
    prisma.eventParticipant.upsert({
      where: { eventId_userId: { eventId: invite.eventId, userId: user.id } },
      update: {},
      create: { eventId: invite.eventId, userId: user.id },
    }),
    prisma.eventInvite.update({
      where: { id: invite.id },
      data: { status: "accepted" },
    }),
  ])

  return NextResponse.json({ ok: true, eventId: invite.eventId })
}
