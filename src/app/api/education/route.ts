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
        const education = await db
            .collection('education')
            .find({ userId: new ObjectId(session.user.id) })
            .sort({ order: 1 })
            .toArray();

        return NextResponse.json(education);
    } catch (error) {
        console.error('Error fetching education:', error);
        return NextResponse.json({ error: 'Failed to fetch education' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { institution, degree, field, location, startDate, endDate } = body;

        if (!institution || !degree?.en || !degree?.fr) {
            return NextResponse.json(
                { error: 'Institution and degree required' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db();

        const lastEdu = await db
            .collection('education')
            .findOne(
                { userId: new ObjectId(session.user.id) },
                { sort: { order: -1 } }
            );
        const order = (lastEdu?.order ?? -1) + 1;

        const now = new Date();
        const result = await db.collection('education').insertOne({
            userId: new ObjectId(session.user.id),
            institution,
            degree,
            field: field || { en: '', fr: '' },
            location: location || null,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            order,
            createdAt: now,
            updatedAt: now,
        });

        return NextResponse.json(
            { _id: result.insertedId, message: 'Education created' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating education:', error);
        return NextResponse.json({ error: 'Failed to create education' }, { status: 500 });
    }
}
