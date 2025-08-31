import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { comparePassword } from "@/lib/password"
import { signToken } from "@/lib/jwt"

export async function POST(req: Request) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

  const ok = await comparePassword(password, user.passwordHash)
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

  const token = signToken({ sub: user.id, email: user.email, username: user.username })
  return NextResponse.json({
    user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt },
    token,
  })
}
