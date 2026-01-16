import { NextResponse } from 'next/server'
import { sendMessage } from '@/modules/chats/chats.service'

export async function POST(req: Request) {
  const userId = req.headers.get('x-user-id')!
  const { receiverId, content } = await req.json()

  try {
    const message = await sendMessage(userId, receiverId, content)
    return NextResponse.json({ message })
  } catch {
    return NextResponse.json(
      { error: 'You can only chat with friends' },
      { status: 403 }
    )
  }
}
