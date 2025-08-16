
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase'; // Assuming you have this configured

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const idToken = request.cookies.get('firebaseIdToken')?.value;

  if (idToken) {
    requestHeaders.set('Authorization', `Bearer ${idToken}`);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/:path*',
};
