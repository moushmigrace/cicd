import { POST as register } from '@/app/api/auth/register/route'
import { POST as sendConnection } from '@/app/api/connections/send/route'
import { NextRequest } from 'next/server'
import { resetDatabase } from './reset-db'

beforeAll(async () => {
  await resetDatabase()
})

function post(url: string, body: any, token?: string) {
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
}

describe('Connections E2E', () => {
  let tokenA: string
  let userBId: string
  it('registers two users', async () => {
    const emailA = `a_${Date.now()}@test.com`
    const emailB = `b_${Date.now()}@test.com`
  
    const resA = await register(
      post('http://localhost/api/auth/register', {
        name: 'User A',
        email: emailA,
        password: '123456',
      })
    )
    const bodyA = await resA.json()
    expect(resA.status).toBe(200)
    tokenA = bodyA.token
  
    const resB = await register(
      post('http://localhost/api/auth/register', {
        name: 'User B',
        email: emailB,
        password: '123456',
      })
    )
    const bodyB = await resB.json()
    expect(resB.status).toBe(200)
    userBId = bodyB.user.id
  
    expect(userBId).toBeDefined()
  })
  
})
