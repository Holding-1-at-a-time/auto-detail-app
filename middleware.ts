// middleware.ts
import { clerkMiddleware, createRouteMatcher, type ClerkMiddlewareAuth } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

const isProtectedRoute: (req: NextRequest) => boolean = createRouteMatcher([
  '/(app)(.*)', // Protect all routes inside the (app) group
]);

export default clerkMiddleware(async (auth: ClerkMiddlewareAuth, req: NextRequest) => {
  if (isProtectedRoute(req)) {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }
  return NextResponse.next();
});

export const config: { matcher: string[] } = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};