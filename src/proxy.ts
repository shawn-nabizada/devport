import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

// Rate limited API routes
const RATE_LIMITED_ROUTES = [
    '/api/messages',
    '/api/testimonials',
    '/api/auth/register',
    '/api/auth/verify',
    '/api/download',
];

const authMiddleware = auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;

    // Check rate limiting for public API routes
    if (RATE_LIMITED_ROUTES.some(route => pathname.startsWith(route))) {
        const rateLimitResponse = checkRateLimit(req as unknown as NextRequest);
        if (rateLimitResponse) {
            return rateLimitResponse;
        }
    }

    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard'];
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // Auth routes (login, register) - redirect to dashboard if already logged in
    const authRoutes = ['/login', '/register'];
    const isAuthRoute = authRoutes.includes(pathname);

    if (isProtectedRoute && !isLoggedIn) {
        const loginUrl = new URL('/login', req.nextUrl.origin);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL('/dashboard', req.nextUrl.origin));
    }

    // Add security headers
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
});

// Next.js 16 uses 'proxy' instead of 'middleware'
export { authMiddleware as proxy };

export const config = {
    matcher: [
        // Match all routes except static files
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
