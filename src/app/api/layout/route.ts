import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { PortfolioLayout, DeviceType, GridBlock } from '@/lib/db/layout-types';

const DEFAULT_CONFIG = {
    desktop: { cols: 12, rowHeight: 80 },
    mobile: { cols: 4, rowHeight: 60 },
} as const;

/**
 * GET /api/layout - Get user's layout configuration
 * Query params: ?device=desktop|mobile
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const device = (request.nextUrl.searchParams.get('device') || 'desktop') as DeviceType;

        const client = await clientPromise;
        const db = client.db();

        const layout = await db.collection<PortfolioLayout>('layouts').findOne({
            userId: new ObjectId(session.user.id),
            device,
        });

        if (!layout) {
            // Return default empty layout
            return NextResponse.json({
                device,
                layout: [],
                cols: DEFAULT_CONFIG[device].cols,
                rowHeight: DEFAULT_CONFIG[device].rowHeight,
                enabled: false,
            });
        }

        return NextResponse.json(layout);
    } catch (error) {
        console.error('Error fetching layout:', error);
        return NextResponse.json({ error: 'Failed to fetch layout' }, { status: 500 });
    }
}

/**
 * POST /api/layout - Save layout configuration
 */
const DEFAULT_LAYOUT_CONFIG = {
    desktop: { cols: 12, rowHeight: 80 },
    mobile: { cols: 4, rowHeight: 60 },
} as const;

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { blocks, layouts, settings } = body;

        const client = await clientPromise;
        const db = client.db();
        const userId = new ObjectId(session.user.id);

        // 1. Save Blocks - Delete removed blocks first
        if (Array.isArray(blocks)) {
            // Get IDs of blocks being saved
            const blockIdsToKeep = blocks
                .filter((b: GridBlock) => b._id)
                .map((b: GridBlock) => new ObjectId(b._id));

            // Delete blocks not in the new list
            await db.collection('blocks').deleteMany({
                userId,
                _id: { $nin: blockIdsToKeep }
            });

            // Update/Insert remaining blocks
            const blockOperations = blocks.map((block: GridBlock) => ({
                updateOne: {
                    filter: { _id: new ObjectId(block._id), userId },
                    update: {
                        $set: {
                            content: block.content,
                            type: block.type,
                            updatedAt: new Date()
                        },
                        $setOnInsert: {
                            userId,
                            createdAt: block.createdAt || new Date()
                        }
                    },
                    upsert: true
                }
            }));

            if (blockOperations.length > 0) {
                await db.collection('blocks').bulkWrite(blockOperations);
            }
        }

        // 2. Save Layouts for each device
        if (layouts && typeof layouts === 'object') {
            const deviceTypes = ['desktop', 'mobile'] as const;

            for (const d of deviceTypes) {
                const deviceLayout = layouts[d];
                const deviceSettings = settings?.[d] || DEFAULT_LAYOUT_CONFIG[d];

                if (Array.isArray(deviceLayout)) {
                    await db.collection('layouts').updateOne(
                        {
                            userId: userId,
                            device: d,
                        },
                        {
                            $set: {
                                layout: deviceLayout,
                                cols: deviceSettings.cols,
                                rowHeight: deviceSettings.rowHeight,
                                enabled: true,
                                updatedAt: new Date(),
                            },
                            $setOnInsert: {
                                userId: userId,
                                device: d,
                            },
                        },
                        { upsert: true }
                    );
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving layout:', error);
        return NextResponse.json({ error: 'Failed to save layout' }, { status: 500 });
    }
}
