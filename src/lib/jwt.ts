import jwt from 'jsonwebtoken'
import { env } from '@/config/env'

export type JwtPayload = {
  userId: string
}

export function signToken(userId: string): string {
  return jwt.sign(
    { userId },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}
