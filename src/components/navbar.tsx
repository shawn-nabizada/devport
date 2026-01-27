'use client';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useSession, signOut } from 'next-auth/react';
import { useTranslation } from '@/lib/i18n';
import { LanguageToggle } from './language-toggle';
const ModeToggle = dynamic(() => import('./mode-toggle').then(mod => mod.ModeToggle), { ssr: false });
import { LogOut, Settings, LayoutDashboard, Compass, Ship } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function Navbar() {
    const { data: session, status } = useSession();
    const { t } = useTranslation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isAuthenticated = status === 'authenticated' && session?.user;

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-[999] w-full border-b border-border bg-background"
            style={{ viewTransitionName: 'topnav' } as React.CSSProperties}
        >
            {/* 3-column grid: left, center, right - each section stays in its place */}
            <div className="container mx-auto grid grid-cols-3 h-24 items-center px-4">
                {/* Left section - Logo (left-aligned) */}
                <div className="flex justify-start">
                    <Link
                        href="/"
                        className="flex items-center gap-2 font-bold text-2xl hover:opacity-80 transition-opacity text-foreground"
                    >
                        <Ship className="w-8 h-8 text-primary" />
                        <span className="hidden sm:inline">DevPort</span>
                    </Link>
                </div>

                {/* Center section - Nav links (centered) */}
                <div className="flex items-center justify-center gap-6">
                    <Link
                        href="/gallery"
                        className="flex items-center gap-2 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                    >
                        <Compass className="h-4 w-4" />
                        <span>{t('nav.explore')}</span>
                    </Link>

                    {isAuthenticated && (
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            <span>{t('nav.myPortfolio')}</span>
                        </Link>
                    )}
                </div>

                {/* Right section - User controls (right-aligned) */}
                <div className="flex items-center justify-end gap-4">
                    {/* Theme Toggle */}
                    <ModeToggle />

                    {/* Language Toggle */}
                    <LanguageToggle />

                    {/* User Avatar / Auth */}
                    {isAuthenticated ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                aria-label="User menu"
                            >
                                {session.user.image ? (
                                    <Image
                                        src={session.user.image}
                                        alt={session.user.name || 'User'}
                                        width={36}
                                        height={36}
                                        className="rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-base font-medium">
                                        {session.user.name?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-white dark:bg-gray-900 shadow-xl py-1 z-[100]">
                                    {/* User info */}
                                    <div className="px-4 py-3 border-b border-border">
                                        <p className="text-base font-medium text-foreground truncate">
                                            {session.user.name}
                                        </p>
                                        <p className="text-base text-muted-foreground truncate">
                                            @{session.user.username || session.user.email}
                                        </p>
                                    </div>

                                    {/* Menu items */}
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-2 px-4 py-2 text-lg text-foreground hover:bg-accent transition-colors"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        {t('nav.myPortfolio')}
                                    </Link>
                                    <Link
                                        href="/dashboard/settings"
                                        className="flex items-center gap-2 px-4 py-2 text-lg text-foreground hover:bg-accent transition-colors"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <Settings className="h-4 w-4" />
                                        {t('dashboard.settings')}
                                    </Link>

                                    <div className="border-t border-border my-1" />

                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            signOut({ callbackUrl: '/' });
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        {t('auth.logout')}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-6">
                            <Link
                                href="/login"
                                className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                            >
                                {t('auth.login')}
                            </Link>
                            <Link
                                href="/register"
                                className="text-lg font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
                            >
                                {t('auth.register')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
