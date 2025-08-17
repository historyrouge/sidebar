
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const idToken = request.cookies.get('firebaseIdToken')?.value;

  if (idToken) {
    requestHeaders.set('Authorization', `Bearer ${idToken}`);
  }

  // A next-intl workaround to ensure the middleware can be chained.
  // See: https://github.com/amannn/next-intl/issues/833#issuecomment-1953158211
  requestHeaders.set('x-url', request.url);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
