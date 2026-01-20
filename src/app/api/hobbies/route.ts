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
        const hobbies = await db
            .collection('hobbies')
            .find({ userId: new ObjectId(session.user.id) })
            .sort({ order: 1 })
            .toArray();

        return NextResponse.json(hobbies);
    } catch (error) {
        console.error('Error fetching hobbies:', error);
        return NextResponse.json({ error: 'Failed to fetch hobbies' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, icon } = body;

        if (!name?.en || !name?.fr) {
            return NextResponse.json(
                { error: 'Name required in both languages' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db();

        const lastHobby = await db
            .collection('hobbies')
            .findOne(
                { userId: new ObjectId(session.user.id) },
                { sort: { order: -1 } }
            );
        const order = (lastHobby?.order ?? -1) + 1;

        const now = new Date();
        const result = await db.collection('hobbies').insertOne({
            userId: new ObjectId(session.user.id),
            name,
            icon: icon || null,
            order,
            createdAt: now,
            updatedAt: now,
        });

        return NextResponse.json(
            { _id: result.insertedId, message: 'Hobby created' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating hobby:', error);
        return NextResponse.json({ error: 'Failed to create hobby' }, { status: 500 });
    }
}
