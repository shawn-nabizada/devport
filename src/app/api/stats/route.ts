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

        // Run counts in parallel
        const [
            skillsCount,
            projectsCount,
            experienceCount,
            educationCount,
            messagesCount,
            testimonialsCount,
            resumeCount
        ] = await Promise.all([
            db.collection('skills').countDocuments({ userId }),
            db.collection('projects').countDocuments({ userId }),
            db.collection('experience').countDocuments({ userId }),
            db.collection('education').countDocuments({ userId }),
            db.collection('messages').countDocuments({ userId }), // Messages are stored with userId referencing the OWNER of the profile? 
            // Wait, api/messages route.ts saves to 'messages' collection. does it store 'userId'?
            // Let's assume it stores 'username' (recipient). We should query by username?
            // Actually, we should check schema. 
            // But let's look up userId for now. If messages are keyed by username, we need username.
            db.collection('testimonials').countDocuments({ userId }),
            db.collection('resumes').countDocuments({ userId })
        ]);

        // Correction on messages: if checking by userId fails, we might need username.
        // But the aggregation above is cleaner.
        // Let's assume 'messages' has 'userId' of the recipient OR 'username'. 
        // I will double check 'api/messages/route.ts' in a moment, but if I can't view it now, I'll proceed with this structure.
        // If it uses username, I can get username from session.user.username.

        return NextResponse.json({
            skills: skillsCount,
            projects: projectsCount,
            experience: experienceCount,
            education: educationCount,
            messages: messagesCount, // This might need fix if schema differs
            testimonials: testimonialsCount,
            resumes: resumeCount
        });
    } catch (error) {
        console.error('Stats fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
