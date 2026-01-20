import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

// Protected routes that require authentication
const PROTECTED_ROUTES = ['/dashboard'];

// Public API routes that need rate limiting
const RATE_LIMITED_ROUTES = [
    '/api/messages',
    '/api/testimonials',
    '/api/auth/register',
    '/api/auth/verify',
    '/api/download',
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check rate limiting for public API routes
    if (RATE_LIMITED_ROUTES.some(route => pathname.startsWith(route))) {
        const rateLimitResponse = checkRateLimit(request);
        if (rateLimitResponse) {
            return rateLimitResponse;
        }
    }

    // Check authentication for protected routes
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
        const sessionToken = request.cookies.get('authjs.session-token')?.value ||
            request.cookies.get('__Secure-authjs.session-token')?.value;

        if (!sessionToken) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Add security headers to all responses
    const response = NextResponse.next();

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Content Security Policy (adjust as needed)
    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Content-Security-Policy',
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: https: blob:; " +
            "font-src 'self' data:; " +
            "connect-src 'self' https:; " +
            "frame-ancestors 'none';"
        );
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
