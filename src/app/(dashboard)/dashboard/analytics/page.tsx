'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import {
    TrendingUp,
    Users,
    Download,
    MessageSquare,
    Eye,
    ExternalLink,
    Loader2,
    BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalyticsData {
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

function StatCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
}: {
    title: string;
    value: number;
    description?: string;
    icon: React.ElementType;
    trend?: number;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value.toLocaleString()}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
                {trend !== undefined && (
                    <p className={`text-xs mt-1 flex items-center gap-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
                        {Math.abs(trend)}% vs last period
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

function SimpleBarChart({ data }: { data: Array<{ date: string; views: number }> }) {
    const maxValue = Math.max(...data.map(d => d.views), 1);

    return (
        <div className="flex items-end gap-1 h-32">
            {data.slice(-14).map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                        className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                        style={{ height: `${(day.views / maxValue) * 100}%`, minHeight: day.views > 0 ? '4px' : '0' }}
                        title={`${day.date}: ${day.views} views`}
                    />
                    <span className="text-[10px] text-muted-foreground mt-1 rotate-45 origin-left">
                        {new Date(day.date).getDate()}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function AnalyticsPage() {
    const { data: session, status } = useSession();
    const { t } = useTranslation();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login');
        }
    }, [status]);

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const res = await fetch('/api/analytics?days=30');
                if (res.ok) {
                    setAnalytics(await res.json());
                }
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        }

        if (session) {
            fetchAnalytics();
        }
    }, [session]);

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center py-16 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('analytics.noData')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-blue-500" />
                    {t('analytics.title')}
                </h1>
                <p className="text-muted-foreground mt-1">
                    {t('analytics.description')}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title={t('analytics.pageViews')}
                    value={analytics.totalPageViews}
                    description={t('analytics.last30Days')}
                    icon={Eye}
                />
                <StatCard
                    title={t('analytics.uniqueVisitors')}
                    value={analytics.totalUniqueVisitors}
                    description={t('analytics.last30Days')}
                    icon={Users}
                />
                <StatCard
                    title={t('analytics.resumeDownloads')}
                    value={analytics.totalResumeDownloads}
                    description={t('analytics.last30Days')}
                    icon={Download}
                />
                <StatCard
                    title={t('analytics.contactMessages')}
                    value={analytics.totalContactSubmissions}
                    description={t('analytics.last30Days')}
                    icon={MessageSquare}
                />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Views Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.viewsOverTime')}</CardTitle>
                        <CardDescription>{t('analytics.last14Days')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SimpleBarChart data={analytics.dailyStats} />
                    </CardContent>
                </Card>

                {/* Top Projects */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.topProjects')}</CardTitle>
                        <CardDescription>{t('analytics.mostClicked')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {analytics.topProjects.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t('analytics.noProjectClicks')}</p>
                        ) : (
                            <div className="space-y-3">
                                {analytics.topProjects.map((project, index) => (
                                    <div key={project.projectId} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold text-muted-foreground">
                                                #{index + 1}
                                            </span>
                                            <span className="font-medium truncate max-w-[200px]">
                                                {project.projectTitle}
                                            </span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {project.clicks} {t('analytics.clicks')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Referrers */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('analytics.topReferrers')}</CardTitle>
                    <CardDescription>{t('analytics.whereVisitorsComeFrom')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {analytics.topReferrers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t('analytics.noReferrers')}</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {analytics.topReferrers.map((ref) => (
                                <div
                                    key={ref.referrer}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full text-sm"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    <span>{ref.referrer}</span>
                                    <span className="font-medium">({ref.count})</span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
