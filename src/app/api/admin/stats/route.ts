import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db();

        const [usersCount, projectsCount, analyticsEventsCount] = await Promise.all([
            db.collection('users').countDocuments(),
            db.collection('projects').countDocuments(),
            db.collection('analyticsEvents').countDocuments({ eventType: 'page_view' })
        ]);

        const activeUsers = await db.collection('analyticsEvents').distinct('userId', {
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        return NextResponse.json({
            usersCount,
            activeUsersCount: activeUsers.length,
            projectsCount,
            viewsCount: analyticsEventsCount
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
