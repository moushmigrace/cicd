import { NextResponse } from 'next/server'
import { loginUser } from '@/modules/auth/auth.service'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    const result = await loginUser(email, password)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  }
}
