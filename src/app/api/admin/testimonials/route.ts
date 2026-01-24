import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db();

        // Fetch pending testimonials from ALL users
        const testimonials = await db.collection('testimonials')
            .find({ status: 'pending' })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json(testimonials);
    } catch (error) {
        console.error('Error fetching admin testimonials:', error);
        return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
    }
}
