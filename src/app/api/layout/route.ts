import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { PortfolioLayout, DeviceType } from '@/lib/db/layout-types';

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
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { device, layout, enabled } = body;

        if (!device || !['desktop', 'mobile'].includes(device)) {
            return NextResponse.json({ error: 'Invalid device type' }, { status: 400 });
        }

        if (!Array.isArray(layout)) {
            return NextResponse.json({ error: 'Layout must be an array' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection<PortfolioLayout>('layouts').updateOne(
            {
                userId: new ObjectId(session.user.id),
                device,
            },
            {
                $set: {
                    layout,
                    cols: DEFAULT_CONFIG[device as DeviceType].cols,
                    rowHeight: DEFAULT_CONFIG[device as DeviceType].rowHeight,
                    enabled: enabled ?? true,
                    updatedAt: new Date(),
                },
                $setOnInsert: {
                    userId: new ObjectId(session.user.id),
                    device,
                },
            },
            { upsert: true }
        );

        return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
    } catch (error) {
        console.error('Error saving layout:', error);
        return NextResponse.json({ error: 'Failed to save layout' }, { status: 500 });
    }
}
