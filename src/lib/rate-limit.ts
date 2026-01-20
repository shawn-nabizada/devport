import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configuration by endpoint pattern
const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
    '/api/messages': { limit: 5, windowMs: 60 * 1000 }, // 5 per minute
    '/api/testimonials': { limit: 3, windowMs: 60 * 1000 }, // 3 per minute
    '/api/auth/register': { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
    '/api/auth/verify': { limit: 10, windowMs: 60 * 1000 }, // 10 per minute
    '/api/download': { limit: 20, windowMs: 60 * 1000 }, // 20 per minute
};

function getClientIp(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }
    return request.headers.get('x-real-ip') || 'unknown';
}

function cleanupExpiredEntries() {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

export function checkRateLimit(request: NextRequest): NextResponse | null {
    const pathname = request.nextUrl.pathname;

    // Find matching rate limit config
    let config: { limit: number; windowMs: number } | null = null;
    for (const [pattern, cfg] of Object.entries(RATE_LIMITS)) {
        if (pathname.startsWith(pattern)) {
            config = cfg;
            break;
        }
    }

    // No rate limit for this endpoint
    if (!config) {
        return null;
    }

    // Only rate limit POST/PUT/DELETE requests
    if (!['POST', 'PUT', 'DELETE'].includes(request.method)) {
        return null;
    }

    const ip = getClientIp(request);
    const key = `${ip}:${pathname}`;
    const now = Date.now();

    // Cleanup expired entries periodically
    if (Math.random() < 0.1) {
        cleanupExpiredEntries();
    }

    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
        // Create new entry
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        return null;
    }

    if (entry.count >= config.limit) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        return NextResponse.json(
            {
                error: 'Too many requests. Please try again later.',
                retryAfter,
            },
            {
                status: 429,
                headers: {
                    'Retry-After': retryAfter.toString(),
                    'X-RateLimit-Limit': config.limit.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': entry.resetTime.toString(),
                },
            }
        );
    }

    // Increment counter
    entry.count++;
    rateLimitStore.set(key, entry);

    return null;
}
