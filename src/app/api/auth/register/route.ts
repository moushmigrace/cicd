import { NextResponse } from 'next/server'
import { registerUser } from '@/modules/auth/auth.service'

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()
    const result = await registerUser(email, password, name)
    return NextResponse.json(result)
  } catch (e: any) {
    if (e.message === 'USER_EXISTS') {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
