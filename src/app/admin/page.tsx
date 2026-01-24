'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, Eye, BarChart3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

interface AdminStats {
    usersCount: number;
    activeUsersCount: number;
    projectsCount: number;
    viewsCount: number;
}

export default function AdminDashboardPage() {
    const { t } = useTranslation();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">{t('admin.title')}</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{t('admin.stats.totalUsers')}</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.usersCount || 0}</div>
                        <p className="text-xs text-muted-foreground">{stats?.activeUsersCount || 0} {t('admin.stats.activeUsers').toLowerCase()}</p>
                        <Button variant="link" size="sm" className="px-0 mt-2" asChild>
                            <Link href="/admin/users">{t('dashboard.manage')}</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{t('admin.stats.totalProjects')}</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.projectsCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Portfolios created</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{t('admin.stats.totalViews')}</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.viewsCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Platform-wide views</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{t('admin.stats.testimonials')}</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Moderate</div>
                        <p className="text-xs text-muted-foreground">{t('admin.stats.actionRequired')}</p>
                        <Button variant="link" size="sm" className="px-0 mt-2" asChild>
                            <Link href="/admin/testimonials">{t('admin.testimonialsTitle')}</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
