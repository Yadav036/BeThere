import { NextResponse } from "next/server"
import { placeDetails } from "@/lib/google"
import { getAuthFromHeader } from "@/lib/jwt"

export async function GET(req: Request) {
  const auth = getAuthFromHeader(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const placeId = searchParams.get("placeId")
  if (!placeId) return NextResponse.json({ error: "Missing placeId" }, { status: 400 })

  const data = await placeDetails(placeId)
  const loc = data?.result?.geometry?.location
  return NextResponse.json({
    name: data?.result?.name,
    location: loc ? { lat: loc.lat, lng: loc.lng } : null,
  })
}
