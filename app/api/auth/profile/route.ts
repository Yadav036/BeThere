import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthFromHeader } from "@/lib/jwt"

export async function GET(req: Request) {
  const auth = getAuthFromHeader(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: { id: true, email: true, username: true, createdAt: true },
  })
  return NextResponse.json({ user })
}
