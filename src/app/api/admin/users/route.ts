import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 20;
        const skip = (page - 1) * limit;

        const client = await clientPromise;
        const db = client.db();

        const users = await db.collection('users')
            .find({}, { projection: { password: 0 } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        const total = await db.collection('users').countDocuments();

        return NextResponse.json({ users, total, pages: Math.ceil(total / limit) });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

        const client = await clientPromise;
        const db = client.db();
        const oid = new ObjectId(userId);

        // Cascade Delete
        await Promise.all([
            db.collection('users').deleteOne({ _id: oid }),
            db.collection('profiles').deleteOne({ userId: oid }),
            db.collection('skills').deleteMany({ userId: oid }),
            db.collection('projects').deleteMany({ userId: oid }),
            db.collection('experience').deleteMany({ userId: oid }),
            db.collection('education').deleteMany({ userId: oid }),
            db.collection('hobbies').deleteMany({ userId: oid }),
            db.collection('resumes').deleteMany({ userId: oid }),
            db.collection('testimonials').deleteMany({ userId: oid }),
            db.collection('messages').deleteMany({ userId: oid }),
            db.collection('layouts').deleteMany({ userId: oid }),
            db.collection('blocks').deleteMany({ userId: oid }),
            db.collection('themeSettings').deleteOne({ userId: oid }),
            db.collection('notification_preferences').deleteOne({ userId: oid }),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
