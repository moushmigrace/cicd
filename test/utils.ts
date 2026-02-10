import { NextRequest } from 'next/server'

export function mockRequest(
  url: string,
  method: string,
  body?: any,
  token?: string,
  userId?: string
) {
  return new NextRequest(url, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(userId ? { 'x-user-id': userId } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

export async function measure<T>(fn: () => Promise<T>) {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start
  return { result, duration }
}