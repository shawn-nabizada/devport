'use client';

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
} from 'lucide-react';

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard.overview' },
    { href: '/dashboard/layout-editor', icon: LayoutGrid, labelKey: 'dashboard.layoutEditor.title' },
    { href: '/dashboard/analytics', icon: BarChart3, labelKey: 'analytics.title' },
    { href: '/dashboard/skills', icon: Sparkles, labelKey: 'nav.skills' },
    { href: '/dashboard/projects', icon: FolderKanban, labelKey: 'nav.projects' },
    { href: '/dashboard/experience', icon: Briefcase, labelKey: 'nav.experience' },
    { href: '/dashboard/education', icon: GraduationCap, labelKey: 'nav.education' },
    { href: '/dashboard/hobbies', icon: Heart, labelKey: 'nav.hobbies' },
    { href: '/dashboard/resume', icon: FileText, labelKey: 'nav.resume' },
    { href: '/dashboard/messages', icon: MessageSquare, labelKey: 'nav.contact' },
    { href: '/dashboard/testimonials', icon: Quote, labelKey: 'nav.testimonials' },
];

export function Sidebar() {
    const { t } = useTranslation();
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <aside className="fixed top-14 left-0 flex h-[calc(100vh-56px)] w-64 flex-col border-r border-border bg-card z-40">
            {/* User Info */}
            <div className="border-b border-border p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium">{session?.user?.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                            @{session?.user?.username}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                        }`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {t(item.labelKey as Parameters<typeof t>[0])}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom Section */}
            <div className="border-t border-border p-4">
                <Link
                    href="/dashboard/settings"
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${pathname === '/dashboard/settings'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                >
                    <Settings className="h-4 w-4" />
                    {t('dashboard.settings')}
                </Link>
            </div>
        </aside>
    );
}

