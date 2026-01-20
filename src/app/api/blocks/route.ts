import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { GridBlock, BlockType, BlockContent } from '@/lib/db/layout-types';
import { sanitizeObject } from '@/lib/sanitize';

/**
 * GET /api/blocks - Get all blocks for user
 */
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db();

        const blocks = await db.collection<GridBlock>('blocks')
            .find({ userId: new ObjectId(session.user.id) })
            .sort({ createdAt: 1 })
            .toArray();

        return NextResponse.json(blocks);
    } catch (error) {
        console.error('Error fetching blocks:', error);
        return NextResponse.json({ error: 'Failed to fetch blocks' }, { status: 500 });
    }
}

/**
 * POST /api/blocks - Create a new block
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { type, content } = body;

        const validTypes: BlockType[] = ['text', 'image', 'skills', 'social', 'video'];
        if (!type || !validTypes.includes(type)) {
            return NextResponse.json({ error: 'Invalid block type' }, { status: 400 });
        }

        if (!content) {
            return NextResponse.json({ error: 'Block content is required' }, { status: 400 });
        }

        // Sanitize content
        const sanitizedContent = sanitizeObject(content);

        const client = await clientPromise;
        const db = client.db();

        const now = new Date();
        const block: Omit<GridBlock, '_id'> = {
            userId: new ObjectId(session.user.id),
            type,
            content: { type, data: sanitizedContent } as BlockContent,
            createdAt: now,
            updatedAt: now,
        };

        const result = await db.collection<GridBlock>('blocks').insertOne(block as GridBlock);

        return NextResponse.json({
            _id: result.insertedId,
            ...block,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating block:', error);
        return NextResponse.json({ error: 'Failed to create block' }, { status: 500 });
    }
}
