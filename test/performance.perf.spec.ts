import { POST as register } from '@/app/api/auth/register/route'
import { POST as login } from '@/app/api/auth/login/route'
import { POST as sendConnection } from '@/app/api/connections/send/route'
import { POST as acceptConnection } from '@/app/api/connections/accept/route'
import { POST as sendChat } from '@/app/api/chats/send/route'
import { mockRequest, measure } from './utils'
import { prisma } from '@/lib/prisma'

describe('Performance Tests', () => {
  let tokenA: string
  let userAId: string
  let userBId: string
  let emailA: string
  let password = '123456'

  beforeAll(async () => {
    await prisma.message.deleteMany()
    await prisma.connection.deleteMany()
    await prisma.user.deleteMany()

    emailA = `perf_${Date.now()}@test.com`

    // Register User A
    const resA = await register(
      mockRequest(
        'http://localhost/api/auth/register',
        'POST',
        {
          name: 'Perf A',
          email: emailA,
          password,
        }
      )
    )
    const bodyA = await resA.json()
    userAId = bodyA.user.id

    // Register User B
    const resB = await register(
      mockRequest(
        'http://localhost/api/auth/register',
        'POST',
        {
          name: 'Perf B',
          email: `perf_b_${Date.now()}@test.com`,
          password,
        }
      )
    )
    const bodyB = await resB.json()
    userBId = bodyB.user.id

    // Login User A (for token)
    const loginRes = await login(
      mockRequest(
        'http://localhost/api/auth/login',
        'POST',
        {
          email: emailA,
          password,
        }
      )
    )
    const loginBody = await loginRes.json()
    tokenA = loginBody.token

    // Send connection
    await sendConnection(
      mockRequest(
        'http://localhost/api/connections/send',
        'POST',
        { receiverId: userBId },
        tokenA,
        userAId
      )
    )

    // Accept connection
    const connection = await prisma.connection.findFirstOrThrow({
      where: {
        senderId: userAId,
        receiverId: userBId,
      },
    })

    await acceptConnection(
      mockRequest(
        'http://localhost/api/connections/accept',
        'POST',
        { connectionId: connection.id },
        tokenA,
        userBId
      )
    )
  })

  it('login under 400ms', async () => {
    const { result: res, duration } = await measure(() =>
      login(
        mockRequest(
          'http://localhost/api/auth/login',
          'POST',
          {
            email: emailA,
            password,
          }
        )
      )
    )
  
    expect(res.status).toBe(200)
    expect(duration).toBeLessThan(400)
  })
  it('send chat under 150ms', async () => {
    const { result: res, duration } = await measure(() =>
      sendChat(
        mockRequest(
          'http://localhost/api/chats/send',
          'POST',
          {
            receiverId: userBId,
            content: 'Performance test message',
          },
          tokenA,
          userAId
        )
      )
    )

    expect(res.status).toBe(200)
    expect(duration).toBeLessThan(150)
  })
})