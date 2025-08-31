import { prisma } from "@/lib/prisma"
import { getAuthFromHeader } from "@/lib/jwt"

export type PublicUser = {
  id: string
  email: string
  username: string
  createdAt: Date
  updatedAt: Date
}

export async function getUserFromRequest(req: Request): Promise<PublicUser | null> {
  const payload = getAuthFromHeader(req)
  if (!payload) return null
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, username: true, createdAt: true, updatedAt: true },
  })
  return user
}
