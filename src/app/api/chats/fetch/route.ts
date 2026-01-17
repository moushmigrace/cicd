import { NextResponse } from 'next/server'
import { fetchMessages } from '@/modules/chats/chats.service'

export async function GET(req: Request) {
    const userId = req.headers.get('x-user-id')
    const { searchParams } = new URL(req.url)
    const friendId = searchParams.get('friendId')
  
    if (!userId || !friendId) {
      return NextResponse.json(
        { error: 'Missing friendId' },
        { status: 400 }
      )
    }
  
    const messages = await fetchMessages(userId, friendId)
    return NextResponse.json({ messages })
  }