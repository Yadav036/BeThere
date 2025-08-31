import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.warn("[ETA] Missing JWT_SECRET env variable. Set it in Project Settings.")
}

export interface JWTPayload {
  sub: string
  email: string
  username: string
}

export function signToken(payload: JWTPayload) {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: "7d" })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET!) as JWTPayload
  } catch {
    return null
  }
}

export function getAuthFromHeader(req: Request): JWTPayload | null {
  const auth = req.headers.get("authorization") || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : ""
  if (!token) return null
  return verifyToken(token)
}
