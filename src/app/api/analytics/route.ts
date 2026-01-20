import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { DailyAnalytics, AnalyticsEvent } from '@/lib/db/analytics-types';

interface AnalyticsSummaryResponse {
    totalPageViews: number;
    totalUniqueVisitors: number;
    totalResumeDownloads: number;
    totalContactSubmissions: number;
    last30DaysViews: number;
    last7DaysViews: number;
    dailyStats: Array<{
        date: string;
        views: number;
        downloads: number;
        contacts: number;
    }>;
    topProjects: Array<{
        projectId: string;
        projectTitle: string;
        clicks: number;
    }>;
    topReferrers: Array<{
        referrer: string;
        count: number;
    }>;
}

/**
 * GET /api/analytics - Get user's analytics summary
 * Query params: ?days=30 (default: 30)
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const days = Math.min(90, Math.max(7, parseInt(request.nextUrl.searchParams.get('days') || '30')));
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setUTCHours(0, 0, 0, 0);

        const client = await clientPromise;
        const db = client.db();

        // Get daily stats for the period
        const dailyStats = await db.collection<DailyAnalytics>('dailyAnalytics')
            .find({
                userId: new ObjectId(session.user.id),
                date: { $gte: startDate },
            })
            .sort({ date: 1 })
            .toArray();

        // Calculate totals
        let totalPageViews = 0;
        let totalResumeDownloads = 0;
        let totalContactSubmissions = 0;
        const projectClicks: Record<string, number> = {};
        const referrerCounts: Record<string, number> = {};

        dailyStats.forEach(day => {
            totalPageViews += day.pageViews || 0;
            totalResumeDownloads += (day.resumeDownloads?.en || 0) + (day.resumeDownloads?.fr || 0);
            totalContactSubmissions += day.contactSubmissions || 0;

            // Aggregate project clicks
            if (day.projectClicks) {
                Object.entries(day.projectClicks).forEach(([projectId, count]) => {
                    projectClicks[projectId] = (projectClicks[projectId] || 0) + count;
                });
            }

            // Aggregate referrers
            if (day.topReferrers) {
                Object.entries(day.topReferrers).forEach(([referrer, count]) => {
                    referrerCounts[referrer] = (referrerCounts[referrer] || 0) + count;
                });
            }
        });

        // Get unique visitors (count distinct ipHash)
        const uniqueVisitors = await db.collection<AnalyticsEvent>('analyticsEvents')
            .distinct('ipHash', {
                userId: new ObjectId(session.user.id),
                createdAt: { $gte: startDate },
            });

        // Get last 7 days views
        const last7DaysStart = new Date();
        last7DaysStart.setDate(last7DaysStart.getDate() - 7);
        const last7DaysViews = dailyStats
            .filter(d => d.date >= last7DaysStart)
            .reduce((sum, d) => sum + (d.pageViews || 0), 0);

        // Get project titles
        const projectIds = Object.keys(projectClicks);
        let projectsWithTitles: Array<{ projectId: string; projectTitle: string; clicks: number }> = [];

        if (projectIds.length > 0) {
            const projects = await db.collection('projects')
                .find({ _id: { $in: projectIds.map(id => new ObjectId(id)) } })
                .project({ title: 1 })
                .toArray();

            const projectTitleMap = new Map(
                projects.map(p => [p._id.toString(), p.title?.en || 'Untitled'])
            );

            projectsWithTitles = Object.entries(projectClicks)
                .map(([projectId, clicks]) => ({
                    projectId,
                    projectTitle: projectTitleMap.get(projectId) || 'Unknown',
                    clicks,
                }))
                .sort((a, b) => b.clicks - a.clicks)
                .slice(0, 5);
        }

        // Format top referrers
        const topReferrers = Object.entries(referrerCounts)
            .map(([referrer, count]) => ({
                referrer: referrer.replace(/_/g, '.'),
                count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Format daily stats for chart
        const formattedDailyStats = dailyStats.map(day => ({
            date: day.date.toISOString().split('T')[0],
            views: day.pageViews || 0,
            downloads: (day.resumeDownloads?.en || 0) + (day.resumeDownloads?.fr || 0),
            contacts: day.contactSubmissions || 0,
        }));

        const response: AnalyticsSummaryResponse = {
            totalPageViews,
            totalUniqueVisitors: uniqueVisitors.length,
            totalResumeDownloads,
            totalContactSubmissions,
            last30DaysViews: totalPageViews,
            last7DaysViews,
            dailyStats: formattedDailyStats,
            topProjects: projectsWithTitles,
            topReferrers,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
