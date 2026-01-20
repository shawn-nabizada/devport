import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { UserThemeSettings, ThemeId } from '@/lib/db/theme-types';
import { PRESET_THEMES } from '@/lib/db/theme-types';

/**
 * GET /api/theme - Get user's theme settings
 */
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db();

        const settings = await db.collection<UserThemeSettings>('themeSettings').findOne({
            userId: new ObjectId(session.user.id),
        });

        if (!settings) {
            // Return default theme
            return NextResponse.json({
                themeId: 'minimalist',
                theme: PRESET_THEMES.find(t => t.id === 'minimalist'),
            });
        }

        const theme = PRESET_THEMES.find(t => t.id === settings.themeId);

        return NextResponse.json({
            themeId: settings.themeId,
            theme,
            customColors: settings.customColors,
            customTypography: settings.customTypography,
            customSpacing: settings.customSpacing,
        });
    } catch (error) {
        console.error('Error fetching theme settings:', error);
        return NextResponse.json({ error: 'Failed to fetch theme settings' }, { status: 500 });
    }
}

/**
 * POST /api/theme - Save user's theme settings
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { themeId, customColors, customTypography, customSpacing } = body;

        // Validate theme ID
        const validThemeIds: ThemeId[] = ['minimalist', 'bold-innovator', 'creative', 'professional', 'dark-mode', 'custom'];
        if (!themeId || !validThemeIds.includes(themeId)) {
            return NextResponse.json({ error: 'Invalid theme ID' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        await db.collection<UserThemeSettings>('themeSettings').updateOne(
            { userId: new ObjectId(session.user.id) },
            {
                $set: {
                    themeId,
                    customColors: customColors || null,
                    customTypography: customTypography || null,
                    customSpacing: customSpacing || null,
                    updatedAt: new Date(),
                },
                $setOnInsert: {
                    userId: new ObjectId(session.user.id),
                },
            },
            { upsert: true }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving theme settings:', error);
        return NextResponse.json({ error: 'Failed to save theme settings' }, { status: 500 });
    }
}

/**
 * GET /api/theme/presets - Get all preset themes
 */
export async function OPTIONS() {
    return NextResponse.json(PRESET_THEMES);
}
