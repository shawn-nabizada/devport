import { NextResponse } from 'next/server';
import { PRESET_THEMES } from '@/lib/db/theme-types';

/**
 * GET /api/theme/presets - Get all available preset themes
 */
export async function GET() {
    return NextResponse.json(PRESET_THEMES);
}
