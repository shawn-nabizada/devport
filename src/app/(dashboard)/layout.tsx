import { SessionProvider } from 'next-auth/react';
import { Sidebar } from '@/components/dashboard/sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider>
            <div className="flex min-h-screen bg-background">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                    <div className="p-8">{children}</div>
                </main>
            </div>
        </SessionProvider>
    );
}
