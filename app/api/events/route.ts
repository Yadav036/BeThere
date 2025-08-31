import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthFromHeader } from "@/lib/jwt"

export async function POST(req: Request) {
  const auth = getAuthFromHeader(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const {
    name,
    eventTime,
    location,
    shareLocation = true,
  } = body as {
    name: string
    eventTime: string
    location: { name: string; lat: number; lng: number }
    shareLocation?: boolean
  }

  if (!name || !eventTime || !location?.name || !location?.lat || !location?.lng) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const event = await prisma.event.create({
    data: {
      name,
      creatorId: auth.sub,
      eventTime: new Date(eventTime),
      locationName: location.name,
      locationLat: location.lat,
      locationLng: location.lng,
      shareLocation,
      participants: {
        create: { userId: auth.sub }, // creator joins as participant
      },
    },
    select: {
      id: true,
      name: true,
      eventTime: true,
      locationName: true,
      locationLat: true,
      locationLng: true,
      shareLocation: true,
    },
  })

  return NextResponse.json({ event })
}

export async function GET(req: Request) {
  const auth = getAuthFromHeader(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const events = await prisma.event.findMany({
    where: { participants: { some: { userId: auth.sub } } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      eventTime: true,
      locationName: true,
      locationLat: true,
      locationLng: true,
    },
  })
  return NextResponse.json({ events })
}
