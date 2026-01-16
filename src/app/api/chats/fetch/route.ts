import { NextResponse } from 'next/server'
import { fetchMessages } from '@/modules/chats/chats.service'

export async function GET(req: Request) {
  const userId = req.headers.get('x-user-id')!
  const friendId = new URL(req.url).searchParams.get('friendId')

  if (!friendId) {
    return NextResponse.json(
      { error: 'friendId is required' },
      { status: 400 }
    )
  }

  const messages = await fetchMessages(userId, friendId)
  return NextResponse.json({ messages })
}
