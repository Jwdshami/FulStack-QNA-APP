import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import getOrCreateDB from './src/models/server/dbsetup'
import getOrCreateStorage from './src/models/server/storage'

export async function proxy(request: NextRequest) {
  await Promise.all([
    getOrCreateDB(),
    getOrCreateStorage()
  ])
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}