import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { LayoutDashboard, MessageSquare, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
        redirect('/dashboard');
    }

    return (
        <div className="flex min-h-screen bg-muted/20">
            {/* Admin Sidebar */}
            <aside className="w-64 border-r bg-background hidden md:block">
                <div className="flex h-14 items-center border-b px-6">
                    <Shield className="mr-2 h-6 w-6 text-primary" />
                    <span className="font-bold">DevPort Admin</span>
                </div>
                <nav className="p-4 space-y-2">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Overview
                    </Link>
                    <Link
                        href="/admin/testimonials"
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                    >
                        <MessageSquare className="h-4 w-4" />
                        Testimonials (Moderation)
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
                    <div className="flex-1" />
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/dashboard">Exit Admin</Link>
                    </Button>
                </header>
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
