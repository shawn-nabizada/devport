'use client';

import { LanguageToggle } from '@/components/language-toggle';
import Link from 'next/link';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-muted/30">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4">
                <Link href="/" className="text-xl font-bold text-foreground">
                    DevPort
                </Link>
                <LanguageToggle />
            </header>

            {/* Content */}
            <main className="flex flex-1 items-center justify-center p-6">
                {children}
            </main>
        </div>
    );
}
