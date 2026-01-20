import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db();

        const profile = await db.collection('profiles').findOne({
            userId: new ObjectId(session.user.id),
        });

        // Return default empty profile if not exists
        if (!profile) {
            return NextResponse.json({
                userId: new ObjectId(session.user.id),
                bio: { en: '', fr: '' },
                headline: { en: '', fr: '' },
                location: null,
                avatarUrl: null,
                socialLinks: {},
            });
        }

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { bio, headline, location, avatarUrl, socialLinks } = body;

        const client = await clientPromise;
        const db = client.db();

        const updateData = {
            bio: bio || { en: '', fr: '' },
            headline: headline || { en: '', fr: '' },
            location: location || null,
            avatarUrl: avatarUrl || null,
            socialLinks: socialLinks || {},
            updatedAt: new Date(),
        };

        await db.collection('profiles').updateOne(
            { userId: new ObjectId(session.user.id) },
            {
                $set: updateData,
                $setOnInsert: { userId: new ObjectId(session.user.id), createdAt: new Date() }
            },
            { upsert: true }
        );

        return NextResponse.json({ message: 'Profile updated' });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
