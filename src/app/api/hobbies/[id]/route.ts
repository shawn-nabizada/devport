import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';

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

        const client = await clientPromise;
        const db = client.db();

        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if (body.name) updateData.name = body.name;
        if (body.icon !== undefined) updateData.icon = body.icon;
        if (body.order !== undefined) updateData.order = body.order;

        const result = await db.collection('hobbies').updateOne(
            { _id: new ObjectId(id), userId: new ObjectId(session.user.id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Hobby not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Hobby updated' });
    } catch (error) {
        console.error('Error updating hobby:', error);
        return NextResponse.json({ error: 'Failed to update hobby' }, { status: 500 });
    }
}

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

        const result = await db.collection('hobbies').deleteOne({
            _id: new ObjectId(id),
            userId: new ObjectId(session.user.id),
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Hobby not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Hobby deleted' });
    } catch (error) {
        console.error('Error deleting hobby:', error);
        return NextResponse.json({ error: 'Failed to delete hobby' }, { status: 500 });
    }
}
