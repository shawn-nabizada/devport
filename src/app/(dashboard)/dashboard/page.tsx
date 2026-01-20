'use client';

import { useSession } from 'next-auth/react';
import { useTranslation } from '@/lib/i18n';
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
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const { t } = useTranslation();
    const { data: session } = useSession();

    const quickActions = [
        { href: '/dashboard/skills', icon: Sparkles, labelKey: 'nav.skills' as const, count: 0 },
        { href: '/dashboard/projects', icon: FolderKanban, labelKey: 'nav.projects' as const, count: 0 },
        { href: '/dashboard/experience', icon: Briefcase, labelKey: 'nav.experience' as const, count: 0 },
        { href: '/dashboard/education', icon: GraduationCap, labelKey: 'nav.education' as const, count: 0 },
        { href: '/dashboard/messages', icon: MessageSquare, labelKey: 'nav.messages' as const, count: 0 },
        { href: '/dashboard/testimonials', icon: Quote, labelKey: 'nav.testimonials' as const, count: 0 },
    ];

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
                        <Card className="transition-colors hover:bg-accent/50">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t(action.labelKey)}
                                </CardTitle>
                                <action.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{action.count}</div>
                                <p className="text-xs text-muted-foreground">{t('common.items')}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Getting Started */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboard.gettingStarted')}</CardTitle>
                    <CardDescription>
                        {t('dashboard.gettingStartedDescription')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded-full border-2 border-muted" />
                            <span className="text-muted-foreground">{t('dashboard.addYourSkills')}</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded-full border-2 border-muted" />
                            <span className="text-muted-foreground">{t('dashboard.uploadProjects')}</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded-full border-2 border-muted" />
                            <span className="text-muted-foreground">{t('dashboard.addExperience')}</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded-full border-2 border-muted" />
                            <span className="text-muted-foreground">{t('dashboard.uploadResume')}</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
