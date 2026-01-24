import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { AnalyticsEvent, AnalyticsEventType, DailyAnalytics } from '@/lib/db/analytics-types';
import { normalizeDate, hashIP } from '@/lib/db/analytics-types';

/**
 * POST /api/analytics/track - Track an analytics event
 * Body: { userId, eventType, metadata }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, eventType, metadata = {} } = body;

        if (!userId || !eventType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const validEventTypes: AnalyticsEventType[] = [
            'page_view', 'project_click', 'resume_download',
            'contact_submit', 'testimonial_submit', 'social_click'
        ];

        if (!validEventTypes.includes(eventType)) {
            return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
        }

        // Get visitor info
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Geo Info
        const country = request.headers.get('x-vercel-ip-country') ||
            request.headers.get('cf-ipcountry') ||
            'Unknown';
        const city = request.headers.get('x-vercel-ip-city') || 'Unknown';

        const userAgent = request.headers.get('user-agent') || undefined;
        const referrer = request.headers.get('referer') || undefined;

        // Create visitor ID from cookie or generate
        const visitorId = request.cookies.get('visitor_id')?.value ||
            Math.random().toString(36).substring(2, 15);

        const client = await clientPromise;
        const db = client.db();

        // Create the event
        const event: Omit<AnalyticsEvent, '_id'> = {
            userId: new ObjectId(userId),
            eventType,
            metadata: {
                ...metadata,
                referrer,
                userAgent,
                country,
                city,
            },
            visitorId,
            ipHash: hashIP(ip, process.env.AUTH_SECRET || 'salt'),
            createdAt: new Date(),
        };

        await db.collection<AnalyticsEvent>('analyticsEvents').insertOne(event as AnalyticsEvent);

        // Update daily aggregates
        const today = normalizeDate(new Date());

        const incOps: Record<string, number> = {
            pageViews: eventType === 'page_view' ? 1 : 0,
            contactSubmissions: eventType === 'contact_submit' ? 1 : 0,
            testimonialSubmissions: eventType === 'testimonial_submit' ? 1 : 0,
        };

        // Track location for page views
        if (eventType === 'page_view' && country !== 'Unknown') {
            incOps[`locations.${country}`] = 1;
        }

        const updateOps = {
            $inc: incOps,
            $setOnInsert: {
                userId: new ObjectId(userId),
                date: today,
            },
        };

        // Handle specific event types
        if (eventType === 'project_click' && metadata.projectId) {
            incOps[`projectClicks.${metadata.projectId}`] = 1;
        }

        if (eventType === 'resume_download' && metadata.resumeLanguage) {
            incOps[`resumeDownloads.${metadata.resumeLanguage}`] = 1;
        }

        if (eventType === 'block_click' && metadata.blockId) {
            incOps[`blockClicks.${metadata.blockId}`] = 1;
        }

        if (eventType === 'social_click' && metadata.socialPlatform) {
            incOps[`socialClicks.${metadata.socialPlatform}`] = 1;
        }

        if (referrer) {
            try {
                const referrerHost = new URL(referrer).hostname;
                incOps[`topReferrers.${referrerHost.replace(/\./g, '_')}`] = 1;
            } catch {
                // Invalid referrer URL
            }
        }

        await db.collection<DailyAnalytics>('dailyAnalytics').updateOne(
            { userId: new ObjectId(userId), date: today },
            updateOps,
            { upsert: true }
        );

        // Set visitor cookie in response
        const response = NextResponse.json({ success: true });
        response.cookies.set('visitor_id', visitorId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365, // 1 year
        });

        return response;
    } catch (error) {
        console.error('Error tracking analytics:', error);
        return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
    }
}
