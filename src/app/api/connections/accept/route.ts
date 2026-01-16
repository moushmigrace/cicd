import { NextResponse } from 'next/server'
import { acceptConnection } from '@/modules/connections/connections.service'

export async function POST(req: Request) {
  const userId = req.headers.get('x-user-id')!
  const { connectionId } = await req.json()

  try {
    const connection = await acceptConnection(userId, connectionId)
    return NextResponse.json({ connection })
  } catch {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }
}
