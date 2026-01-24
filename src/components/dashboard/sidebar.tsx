'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import {
    LayoutDashboard,
    FolderKanban,
    Briefcase,
    GraduationCap,
    Sparkles,
    FileText,
    MessageSquare,
    Quote,
    Settings,
    User,
    Heart,
    LayoutGrid,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

const navGroups = [
    {
        title: 'nav.general',
        items: [
            { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard.overview' },
            { href: '/dashboard/analytics', icon: BarChart3, labelKey: 'analytics.title' },
        ],
    },
    {
        title: 'nav.builder',
        items: [
            { href: '/dashboard/layout-editor', icon: LayoutGrid, labelKey: 'dashboard.layoutEditor.title' },
            { href: '/dashboard/themes', icon: Palette, labelKey: 'dashboard.themes.title' },
        ],
    },
    {
        title: 'nav.content',
        items: [
            { href: '/dashboard/skills', icon: Sparkles, labelKey: 'nav.skills' },
            { href: '/dashboard/projects', icon: FolderKanban, labelKey: 'nav.projects' },
            { href: '/dashboard/experience', icon: Briefcase, labelKey: 'nav.experience' },
            { href: '/dashboard/education', icon: GraduationCap, labelKey: 'nav.education' },
            { href: '/dashboard/hobbies', icon: Heart, labelKey: 'nav.hobbies' },
            { href: '/dashboard/resume', icon: FileText, labelKey: 'nav.resume' },
        ],
    },
    {
        title: 'nav.communication',
        items: [
            { href: '/dashboard/messages', icon: MessageSquare, labelKey: 'nav.contact' },
            { href: '/dashboard/testimonials', icon: Quote, labelKey: 'nav.testimonials' },
        ],
    },
];

export function Sidebar() {
    const { t } = useTranslation();
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                "fixed top-24 left-0 flex flex-col border-r border-border bg-card z-40 transition-all duration-300 h-[calc(100vh-96px)]",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            {/* User Info / Collapse Toggle */}
            <div className={cn("border-b border-border p-4 flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
                {!isCollapsed && (
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <User className="h-4 w-4" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-medium">{session?.user?.name}</p>
                        </div>
                    </div>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn("h-8 w-8", isCollapsed ? "" : "ml-auto")}
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
                <TooltipProvider delayDuration={0}>
                    {navGroups.map((group, groupIndex) => (
                        <div key={groupIndex} className="mb-6">
                            {!isCollapsed && (
                                <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {t(group.title as string) || group.title.split('.').pop()}

                                </h3>
                            )}
                            <ul className="space-y-1 px-2">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <li key={item.href}>
                                            {isCollapsed ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={item.href}
                                                            className={cn(
                                                                "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
                                                                isActive
                                                                    ? "bg-primary text-primary-foreground"
                                                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                                            )}
                                                        >
                                                            <item.icon className="h-4 w-4" />
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right">
                                                        {t(item.labelKey as string)}
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : (
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                                                        isActive
                                                            ? "bg-primary text-primary-foreground"
                                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                                    )}
                                                >
                                                    <item.icon className="h-4 w-4" />
                                                    {t(item.labelKey as string)}
                                                </Link>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </TooltipProvider>
            </nav>

            {/* Bottom Section */}
            <div className="border-t border-border p-2">
                {isCollapsed ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    href="/dashboard/settings"
                                    className={cn(
                                        "flex h-10 w-10 mx-auto items-center justify-center rounded-md transition-colors",
                                        pathname === '/dashboard/settings'
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <Settings className="h-4 w-4" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                {t('dashboard.settings')}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <Link
                        href="/dashboard/settings"
                        className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                            pathname === '/dashboard/settings'
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        <Settings className="h-4 w-4" />
                        {t('dashboard.settings')}
                    </Link>
                )}
            </div>
        </aside>
    );
}
