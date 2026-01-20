import { Sidebar } from '@/components/dashboard/sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-[calc(100vh-56px)] bg-background">
            <Sidebar />
            {/* Main content with left margin for fixed sidebar */}
            <main className="ml-64 min-h-[calc(100vh-56px)] overflow-y-auto">
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}


