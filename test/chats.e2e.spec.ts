import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

import { POST as register } from '@/app/api/auth/register/route'
import { POST as sendConnection } from '@/app/api/connections/send/route'
import { POST as acceptConnection } from '@/app/api/connections/accept/route'
import { POST as sendChat } from '@/app/api/chats/send/route'
import { GET as fetchChat } from '@/app/api/chats/fetch/route'

function post(url: string, body?: any, token?: string, userId?: string) {
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(userId ? { 'x-user-id': userId } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

function get(url: string, token: string, userId: string) {
  return new NextRequest(url, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${token}`,
      'x-user-id': userId,
    },
  })
}

describe('Chats E2E', () => {
  let tokenA: string
  let tokenB: string
  let userAId: string
  let userBId: string

  beforeAll(async () => {
    await prisma.message.deleteMany()
    await prisma.connection.deleteMany()
    await prisma.user.deleteMany()

    // Register User A
    const resA = await register(
      post('http://localhost/api/auth/register', {
        name: 'User A',
        email: 'a@test.com',
        password: '123456',
      })
    )
    const bodyA = await resA.json()
    tokenA = bodyA.token
    userAId = bodyA.user.id

    // Register User B
    const resB = await register(
      post('http://localhost/api/auth/register', {
        name: 'User B',
        email: 'b@test.com',
        password: '123456',
      })
    )
    const bodyB = await resB.json()
    tokenB = bodyB.token
    userBId = bodyB.user.id

    // Send connection
    await sendConnection(
      post(
        'http://localhost/api/connections/send',
        { receiverId: userBId },
        tokenA,
        userAId
      )
    )

    // Wait for DB commit
    let connection = null
    for (let i = 0; i < 5; i++) {
      connection = await prisma.connection.findFirst({
        where: {
          OR: [
            { senderId: userAId, receiverId: userBId },
            { senderId: userBId, receiverId: userAId },
          ],
        },
      })
      if (connection) break
      await new Promise(r => setTimeout(r, 200))
    }

    if (!connection) {
      throw new Error('Connection not found after retry')
    }

    // Accept connection (IMPORTANT FIX)
    await acceptConnection(
      post(
        'http://localhost/api/connections/accept',
        { connectionId: connection.id },
        tokenB,
        userBId
      )
    )
  })

  it('sends a chat message', async () => {
    const res = await sendChat(
      post(
        'http://localhost/api/chats/send',
        {
          receiverId: userBId,
          content: 'Hello!',
        },
        tokenA,
        userAId
      )
    )

    expect(res.status).toBe(200)
  })

  it('fetches chat messages', async () => {
    const res = await fetchChat(
      get(
        `http://localhost/api/chats/fetch?friendId=${userBId}`,
        tokenA,
        userAId
      )
    )

    const body = await res.json()
    expect(Array.isArray(body.messages)).toBe(true)
    expect(body.messages.length).toBeGreaterThan(0)
  })
})
