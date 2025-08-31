import { NextResponse } from "next/server"
import { placesAutocomplete } from "@/lib/google"
import { getAuthFromHeader } from "@/lib/jwt"

export async function GET(req: Request) {
  const auth = getAuthFromHeader(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || ""
  if (!q) return NextResponse.json({ predictions: [] })

  const data = await placesAutocomplete(q)
  return NextResponse.json(data)
}
