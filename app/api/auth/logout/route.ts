import { NextResponse } from "next/server"

export async function POST() {
  // With stateless JWT, server logout is a no-op. Client should remove the token from storage.
  return NextResponse.json({ ok: true })
}
