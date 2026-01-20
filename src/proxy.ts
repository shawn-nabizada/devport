import { auth } from '@/auth';
import { NextResponse } from 'next/server';

const authMiddleware = auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;

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

    return NextResponse.next();
});

// Next.js 16 uses 'proxy' instead of 'middleware'
export { authMiddleware as proxy };

export const config = {
    matcher: [
        // Match all routes except static files and API routes (except auth)
        '/((?!api(?!/auth)|_next/static|_next/image|favicon.ico).*)',
    ],
};
