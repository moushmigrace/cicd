import { NextRequest } from 'next/server'

export function mockRequest(
  url: string,
  method: string,
  body?: any,
  token?: string
) {
  return new NextRequest(url, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}
