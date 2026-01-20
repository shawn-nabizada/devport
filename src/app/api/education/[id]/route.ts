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
        const fields = ['institution', 'degree', 'field', 'location', 'order'];
        fields.forEach((field) => {
            if (body[field] !== undefined) updateData[field] = body[field];
        });
        if (body.startDate) updateData.startDate = new Date(body.startDate);
        if (body.endDate !== undefined) {
            updateData.endDate = body.endDate ? new Date(body.endDate) : null;
        }

        const result = await db.collection('education').updateOne(
            { _id: new ObjectId(id), userId: new ObjectId(session.user.id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Education not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Education updated' });
    } catch (error) {
        console.error('Error updating education:', error);
        return NextResponse.json({ error: 'Failed to update education' }, { status: 500 });
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

        const result = await db.collection('education').deleteOne({
            _id: new ObjectId(id),
            userId: new ObjectId(session.user.id),
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Education not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Education deleted' });
    } catch (error) {
        console.error('Error deleting education:', error);
        return NextResponse.json({ error: 'Failed to delete education' }, { status: 500 });
    }
}
