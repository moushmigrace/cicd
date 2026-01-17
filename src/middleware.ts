import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export const runtime = 'nodejs'

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  const auth = req.headers.get('authorization')

  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = auth.split(' ')[1]
  const decoded = verifyToken(token)

  if (!decoded) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const res = NextResponse.next()
  res.headers.set('x-user-id', decoded.userId)
  return res
}

export const config = {
  matcher: ['/api/connections/:path*', '/api/chats/:path*'],
}
