
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const idToken = request.cookies.get('firebaseIdToken')?.value;

  if (idToken) {
    requestHeaders.set('Authorization', `Bearer ${idToken}`);
  }

  // Directly return a new response with the modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  // Match all paths except for static assets and image optimization files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
