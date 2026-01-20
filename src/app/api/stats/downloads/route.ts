import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db();
        const userId = new ObjectId(session.user.id);

        // Get total downloads
        const totalDownloads = await db.collection('downloads').countDocuments({
            userId,
            type: 'resume',
        });

        // Get downloads by language
        const downloadsByLanguage = await db.collection('downloads').aggregate([
            { $match: { userId, type: 'resume' } },
            { $group: { _id: '$language', count: { $sum: 1 } } },
        ]).toArray();

        // Get downloads over time (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyDownloads = await db.collection('downloads').aggregate([
            {
                $match: {
                    userId,
                    type: 'resume',
                    downloadedAt: { $gte: thirtyDaysAgo },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$downloadedAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]).toArray();

        // Get recent downloads (last 10)
        const recentDownloads = await db.collection('downloads')
            .find({ userId, type: 'resume' })
            .sort({ downloadedAt: -1 })
            .limit(10)
            .toArray();

        // Get downloads this week and this month
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [downloadsThisWeek, downloadsThisMonth] = await Promise.all([
            db.collection('downloads').countDocuments({
                userId,
                type: 'resume',
                downloadedAt: { $gte: startOfWeek },
            }),
            db.collection('downloads').countDocuments({
                userId,
                type: 'resume',
                downloadedAt: { $gte: startOfMonth },
            }),
        ]);

        return NextResponse.json({
            total: totalDownloads,
            thisWeek: downloadsThisWeek,
            thisMonth: downloadsThisMonth,
            byLanguage: downloadsByLanguage.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {} as Record<string, number>),
            daily: dailyDownloads.map((d) => ({
                date: d._id,
                count: d.count,
            })),
            recent: recentDownloads.map((d) => ({
                language: d.language,
                userAgent: d.userAgent,
                downloadedAt: d.downloadedAt,
            })),
        });
    } catch (error) {
        console.error('Error fetching download stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
