import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { signToken } from "@/lib/jwt"

export async function POST(req: Request) {
  const { email, password, username } = await req.json()

  if (!email || !password || !username) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } })
  if (existing) return NextResponse.json({ error: "Email or username already in use" }, { status: 409 })

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { email, username, passwordHash },
    select: { id: true, email: true, username: true, createdAt: true },
  })

  const token = signToken({ sub: user.id, email: user.email, username: user.username })
  return NextResponse.json({ user, token })
}
