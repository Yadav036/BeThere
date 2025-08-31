import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthFromHeader } from "@/lib/jwt"

export async function GET(req: Request) {
  const auth = getAuthFromHeader(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || ""
  if (!q) return NextResponse.json({ users: [] })

  const users = await prisma.user.findMany({
    where: {
      OR: [{ username: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }],
    },
    take: 10,
    select: { id: true, username: true, email: true },
  })
  return NextResponse.json({ users })
}
