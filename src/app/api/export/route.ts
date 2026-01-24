import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = new ObjectId(session.user.id);
        const client = await clientPromise;
        const db = client.db();

        // Fetch all data in parallel
        const [
            user,
            profile,
            skills,
            projects,
            experience,
            education,
            hobbies,
            resumes,
            testimonials,
            messages,
            layouts,
            blocks,
            themeSettings,
            notificationPreferences
        ] = await Promise.all([
            db.collection('users').findOne({ _id: userId }, { projection: { password: 0 } }), // Exclude password
            db.collection('profiles').findOne({ userId }),
            db.collection('skills').find({ userId }).toArray(),
            db.collection('projects').find({ userId }).toArray(),
            db.collection('experience').find({ userId }).toArray(),
            db.collection('education').find({ userId }).toArray(),
            db.collection('hobbies').find({ userId }).toArray(),
            db.collection('resumes').find({ userId }).toArray(),
            db.collection('testimonials').find({ userId }).toArray(),
            db.collection('messages').find({ userId }).toArray(),
            db.collection('layouts').find({ userId }).toArray(),
            db.collection('blocks').find({ userId }).toArray(),
            db.collection('themeSettings').findOne({ userId }),
            db.collection('notification_preferences').findOne({ userId }),
        ]);

        const exportData = {
            exportDate: new Date(),
            user,
            profile,
            skills,
            projects,
            experience,
            education,
            hobbies,
            resumes,
            testimonials,
            messages,
            layouts,
            blocks,
            themeSettings,
            notificationPreferences
        };

        const json = JSON.stringify(exportData, null, 2);

        return new NextResponse(json, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="devport-export-${session.user.username}-${Date.now()}.json"`,
            },
        });
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
    }
}
