import { auth } from '@/auth'
import { NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register']
const PUBLIC_API = ['/api/auth', '/api/register']

export default auth((req) => {
  const { pathname } = req.nextUrl

  const isPublic =
    PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/')) ||
    PUBLIC_API.some(p => pathname.startsWith(p))

  if (isPublic) return NextResponse.next()

  const session = req.auth
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
