import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';

// GET all skills for the authenticated user
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db();
        const skills = await db
            .collection('skills')
            .find({ userId: new ObjectId(session.user.id) })
            .sort({ order: 1 })
            .toArray();

        return NextResponse.json(skills);
    } catch (error) {
        console.error('Error fetching skills:', error);
        return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
    }
}

// POST create a new skill
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, category, proficiency } = body;

        if (!name?.en || !name?.fr) {
            return NextResponse.json(
                { error: 'Name is required in both languages' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db();

        // Get the highest order number
        const lastSkill = await db
            .collection('skills')
            .findOne(
                { userId: new ObjectId(session.user.id) },
                { sort: { order: -1 } }
            );
        const order = (lastSkill?.order ?? -1) + 1;

        const now = new Date();
        const result = await db.collection('skills').insertOne({
            userId: new ObjectId(session.user.id),
            name,
            category: category || null,
            proficiency: proficiency ?? 50,
            order,
            createdAt: now,
            updatedAt: now,
        });

        return NextResponse.json(
            { _id: result.insertedId, message: 'Skill created' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating skill:', error);
        return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 });
    }
}
