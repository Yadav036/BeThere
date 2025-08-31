import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const raw = await prisma.eventInvite.findMany({
    where: { invitedUserId: user.id, status: "pending" },
    select: {
      id: true,
      createdAt: true,
      event: {
        select: {
          id: true,
          name: true,
          eventTime: true,
          locationName: true,
          locationLat: true,
          locationLng: true,
          creator: { select: { id: true, username: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // return a stable shape expected by the client list (with invitedBy synthesized from event.creator)
  const invites = raw.map((inv) => ({
    id: inv.id,
    createdAt: inv.createdAt,
    event: inv.event,
    invitedBy: inv.event?.creator
      ? { id: inv.event.creator.id, name: inv.event.creator.username || inv.event.creator.email }
      : null,
  }))

  return NextResponse.json({ invites })
}
