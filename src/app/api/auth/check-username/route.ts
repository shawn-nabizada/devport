import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        if (!/^[a-z0-9_-]+$/.test(username)) {
            return NextResponse.json({ available: false, error: 'Invalid format' });
        }

        const client = await clientPromise;
        const db = client.db();

        const existingUser = await db.collection('users').findOne(
            { username: username.toLowerCase() },
            { projection: { _id: 1 } }
        );

        return NextResponse.json({ available: !existingUser });
    } catch (error) {
        console.error('Error checking username:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
