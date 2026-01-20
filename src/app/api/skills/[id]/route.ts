import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';

// GET a single skill
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const client = await clientPromise;
        const db = client.db();

        const skill = await db.collection('skills').findOne({
            _id: new ObjectId(id),
            userId: new ObjectId(session.user.id),
        });

        if (!skill) {
            return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
        }

        return NextResponse.json(skill);
    } catch (error) {
        console.error('Error fetching skill:', error);
        return NextResponse.json({ error: 'Failed to fetch skill' }, { status: 500 });
    }
}

// PUT update a skill
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, category, proficiency, order } = body;

        const client = await clientPromise;
        const db = client.db();

        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if (name) updateData.name = name;
        if (category !== undefined) updateData.category = category;
        if (proficiency !== undefined) updateData.proficiency = proficiency;
        if (order !== undefined) updateData.order = order;

        const result = await db.collection('skills').updateOne(
            { _id: new ObjectId(id), userId: new ObjectId(session.user.id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Skill updated' });
    } catch (error) {
        console.error('Error updating skill:', error);
        return NextResponse.json({ error: 'Failed to update skill' }, { status: 500 });
    }
}

// DELETE a skill
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection('skills').deleteOne({
            _id: new ObjectId(id),
            userId: new ObjectId(session.user.id),
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Skill deleted' });
    } catch (error) {
        console.error('Error deleting skill:', error);
        return NextResponse.json({ error: 'Failed to delete skill' }, { status: 500 });
    }
}
