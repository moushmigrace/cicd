import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/jwt'
import { AuthResponse } from './auth.types'
import { validateRegister, validateLogin } from './auth.validation'

export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  validateRegister(email, password, name)

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) throw new Error('USER_EXISTS')

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name },
  })

  return {
    user: { id: user.id, email: user.email, name: user.name },
    token: signToken(user.id),
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  validateLogin(email, password)

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('INVALID_CREDENTIALS')

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new Error('INVALID_CREDENTIALS')

  return {
    user: { id: user.id, email: user.email, name: user.name },
    token: signToken(user.id),
  }
}
