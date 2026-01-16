import { NextResponse } from 'next/server'
import { sendConnection } from '@/modules/connections/connections.service'

export async function POST(req: Request) {
  const userId = req.headers.get('x-user-id')!
  const { receiverId } = await req.json()

  try {
    const connection = await sendConnection(userId, receiverId)
    return NextResponse.json({ connection })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 400 }
    )
  }
}
