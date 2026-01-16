import { NextResponse } from 'next/server'
import { getFriends } from '@/modules/connections/connections.service'

export async function GET(req: Request) {
  const userId = req.headers.get('x-user-id')!
  const friends = await getFriends(userId)
  return NextResponse.json({ friends })
}
