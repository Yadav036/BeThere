import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      eventTime: true,
      locationName: true,
      locationLat: true,
      locationLng: true,
    },
  })

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({
    id: event.id,
    name: event.name,
    eventTime: typeof event.eventTime === "string" ? event.eventTime : event.eventTime.toISOString(),
    locationName: event.locationName,
    locationLat: event.locationLat,
    locationLng: event.locationLng,
  })
}
