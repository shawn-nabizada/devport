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
        const experience = await db
            .collection('experience')
            .find({ userId: new ObjectId(session.user.id) })
            .sort({ order: 1 })
            .toArray();

        return NextResponse.json(experience);
    } catch (error) {
        console.error('Error fetching experience:', error);
        return NextResponse.json({ error: 'Failed to fetch experience' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { company, position, description, location, startDate, endDate } = body;

        if (!company || !position?.en || !position?.fr) {
            return NextResponse.json(
                { error: 'Company and position required' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db();

        const lastExp = await db
            .collection('experience')
            .findOne(
                { userId: new ObjectId(session.user.id) },
                { sort: { order: -1 } }
            );
        const order = (lastExp?.order ?? -1) + 1;

        const now = new Date();
        const result = await db.collection('experience').insertOne({
            userId: new ObjectId(session.user.id),
            company,
            position,
            description: description || { en: '', fr: '' },
            location: location || null,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            order,
            createdAt: now,
            updatedAt: now,
        });

        return NextResponse.json(
            { _id: result.insertedId, message: 'Experience created' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating experience:', error);
        return NextResponse.json({ error: 'Failed to create experience' }, { status: 500 });
    }
}
