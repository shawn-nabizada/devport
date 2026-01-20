import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { NotificationPreferences } from '@/lib/db/notification-types';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@/lib/db/notification-types';

/**
 * GET /api/notifications/preferences - Get user's notification preferences
 */
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db();

        const preferences = await db.collection<NotificationPreferences>('notificationPreferences').findOne({
            userId: new ObjectId(session.user.id),
        });

        if (!preferences) {
            return NextResponse.json(DEFAULT_NOTIFICATION_PREFERENCES);
        }

        return NextResponse.json({
            emailOnResumeDownload: preferences.emailOnResumeDownload,
            emailOnContactMessage: preferences.emailOnContactMessage,
            emailOnTestimonial: preferences.emailOnTestimonial,
            emailDigest: preferences.emailDigest,
        });
    } catch (error) {
        console.error('Error fetching notification preferences:', error);
        return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }
}

/**
 * POST /api/notifications/preferences - Update notification preferences
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            emailOnResumeDownload,
            emailOnContactMessage,
            emailOnTestimonial,
            emailDigest,
        } = body;

        const client = await clientPromise;
        const db = client.db();

        await db.collection<NotificationPreferences>('notificationPreferences').updateOne(
            { userId: new ObjectId(session.user.id) },
            {
                $set: {
                    emailOnResumeDownload: emailOnResumeDownload ?? true,
                    emailOnContactMessage: emailOnContactMessage ?? true,
                    emailOnTestimonial: emailOnTestimonial ?? true,
                    emailDigest: emailDigest ?? 'weekly',
                    updatedAt: new Date(),
                },
                $setOnInsert: {
                    userId: new ObjectId(session.user.id),
                },
            },
            { upsert: true }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
    }
}
