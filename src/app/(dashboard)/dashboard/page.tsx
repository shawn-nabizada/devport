'use client';

import { useSession } from 'next-auth/react';
import { useTranslation } from '@/lib/i18n';
import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    FolderKanban,
    Briefcase,
    GraduationCap,
    Sparkles,
    MessageSquare,
    Quote,
    CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
    skills: number;
    projects: number;
    experience: number;
    education: number;
    messages: number;
    testimonials: number;
    resumes: number;
}

export default function DashboardPage() {
    const { t } = useTranslation();
    const { data: session } = useSession();
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.ok ? res.json() : null)
            .then(setStats)
            .catch(console.error);
    }, []);

    const quickActions = [
        { href: '/dashboard/skills', icon: Sparkles, labelKey: 'nav.skills' as const, count: stats?.skills || 0 },
        { href: '/dashboard/projects', icon: FolderKanban, labelKey: 'nav.projects' as const, count: stats?.projects || 0 },
        { href: '/dashboard/experience', icon: Briefcase, labelKey: 'nav.experience' as const, count: stats?.experience || 0 },
        { href: '/dashboard/education', icon: GraduationCap, labelKey: 'nav.education' as const, count: stats?.education || 0 },
        { href: '/dashboard/messages', icon: MessageSquare, labelKey: 'nav.messages' as const, count: stats?.messages || 0 },
        { href: '/dashboard/testimonials', icon: Quote, labelKey: 'nav.testimonials' as const, count: stats?.testimonials || 0 },
    ];

    const checklist = [
        { label: 'dashboard.addYourSkills', completed: (stats?.skills || 0) > 0 },
        { label: 'dashboard.uploadProjects', completed: (stats?.projects || 0) > 0 },
        { label: 'dashboard.addExperience', completed: (stats?.experience || 0) > 0 },
        { label: 'dashboard.uploadResume', completed: (stats?.resumes || 0) > 0 },
    ];

    const allCompleted = checklist.every(item => item.completed);

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">
                    {t('dashboard.welcome')}, {session?.user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="mt-2 text-muted-foreground">
                    {t('dashboard.managePortfolioAt')}{' '}
                    <Link
                        href={`/${session?.user?.username}`}
                        className="font-medium text-primary hover:underline"
                    >
                        devport.com/{session?.user?.username}
                    </Link>
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {quickActions.map((action) => (
                    <Link key={action.href} href={action.href}>
                        <Card className="transition-colors hover:bg-accent/50 h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t(action.labelKey)}
                                </CardTitle>
                                <action.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats ? action.count : '-'}</div>
                                <p className="text-xs text-muted-foreground">{t('common.items')}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Getting Started */}
            {!allCompleted && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('dashboard.gettingStarted')}</CardTitle>
                        <CardDescription>
                            {t('dashboard.gettingStartedDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {checklist.map((item, index) => (
                                <li key={index} className="flex items-center gap-3">
                                    {item.completed ? (
                                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600">
                                            <CheckCircle className="h-4 w-4" />
                                        </div>
                                    ) : (
                                        <div className="h-6 w-6 rounded-full border-2 border-muted" />
                                    )}
                                    <span className={item.completed ? 'text-muted-foreground line-through' : 'text-foreground'}>
                                        {t(item.label as string)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {allCompleted && (
                <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            {t('dashboard.allSet') || 'You are all set!'}
                        </CardTitle>
                        <CardDescription>
                            Your portfolio is looking great. Keep it updated!
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}
        </div>
    );
}
