import { POST as register } from '@/app/api/auth/register/route'
import { POST as login } from '@/app/api/auth/login/route'
import { NextRequest } from 'next/server'

function post(url: string, body: any) {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('Auth E2E', () => {
  const email = `alice_${Date.now()}@test.com`
  const password = '123456'

  it('registers a user', async () => {
    const res = await register(
      post('http://localhost/api/auth/register', {
        name: 'Alice',
        email,
        password,
      })
    )

    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.token).toBeDefined()
  })

  it('logs in a user', async () => {
    const res = await login(
      post('http://localhost/api/auth/login', {
        email,
        password,
      })
    )

    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.token).toBeDefined()
  })
})
