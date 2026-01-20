import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { GridBlock } from '@/lib/db/layout-types';
import { sanitizeObject } from '@/lib/sanitize';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/blocks/[id] - Get a single block
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid block ID' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const block = await db.collection<GridBlock>('blocks').findOne({
            _id: new ObjectId(id),
            userId: new ObjectId(session.user.id),
        });

        if (!block) {
            return NextResponse.json({ error: 'Block not found' }, { status: 404 });
        }

        return NextResponse.json(block);
    } catch (error) {
        console.error('Error fetching block:', error);
        return NextResponse.json({ error: 'Failed to fetch block' }, { status: 500 });
    }
}

/**
 * PUT /api/blocks/[id] - Update a block
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid block ID' }, { status: 400 });
        }

        const body = await request.json();
        const { content } = body;

        if (!content) {
            return NextResponse.json({ error: 'Block content is required' }, { status: 400 });
        }

        const sanitizedContent = sanitizeObject(content);

        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection<GridBlock>('blocks').updateOne(
            {
                _id: new ObjectId(id),
                userId: new ObjectId(session.user.id),
            },
            {
                $set: {
                    content: sanitizedContent,
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Block not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating block:', error);
        return NextResponse.json({ error: 'Failed to update block' }, { status: 500 });
    }
}

/**
 * DELETE /api/blocks/[id] - Delete a block
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid block ID' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection<GridBlock>('blocks').deleteOne({
            _id: new ObjectId(id),
            userId: new ObjectId(session.user.id),
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Block not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting block:', error);
        return NextResponse.json({ error: 'Failed to delete block' }, { status: 500 });
    }
}
