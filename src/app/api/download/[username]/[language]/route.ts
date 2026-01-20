import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { sendResumeDownloadNotification } from '@/lib/notifications/email-notifications';

// GET - Fetch resume and track download
export async function GET(
    request: Request,
    { params }: { params: Promise<{ username: string; language: string }> }
) {
    try {
        const { username, language } = await params;

        if (language !== 'en' && language !== 'fr') {
            return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        // Find the user by username
        const user = await db.collection('users').findOne({ username });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find the resume
        const resume = await db.collection('resumes').findOne({
            userId: new ObjectId(user._id),
            language,
        });

        if (!resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        // Track the download
        const headers = request.headers;
        const userAgent = headers.get('user-agent') || 'unknown';
        const referer = headers.get('referer') || null;
        const forwardedFor = headers.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

        await db.collection('downloads').insertOne({
            type: 'resume',
            resourceId: resume._id,
            userId: user._id,
            language,
            visitorIp: ip,
            userAgent,
            referer,
            downloadedAt: new Date(),
        });

        // Update download count on the resume
        await db.collection('resumes').updateOne(
            { $inc: { downloadCount: 1 } }
        );

        // Check notification preferences and send email
        const preferences = await db.collection('notification_preferences').findOne({ userId: user._id });

        if (preferences?.emailAlerts?.resumeDownload && user.email) {
            await sendResumeDownloadNotification({
                to: user.email,
                userName: user.name,
                resumeLanguage: language as 'en' | 'fr',
            });
        }

        // Redirect to the actual file URL
        return NextResponse.redirect(resume.fileUrl);
    } catch (error) {
        console.error('Error tracking download:', error);
        return NextResponse.json({ error: 'Download failed' }, { status: 500 });
    }
}
