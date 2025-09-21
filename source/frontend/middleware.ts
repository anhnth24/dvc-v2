import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_req: NextRequest) {
  // Placeholder auth check
  return NextResponse.next();
}

export const config = {
  matcher: ['/((dashboard|api))/((?!_next/static|_next/image|favicon.ico).*)'],
};
