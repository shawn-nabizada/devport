'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { GridProvider } from '@/components/dashboard/grid/grid-context';
import { GridEditor } from '@/components/dashboard/grid/grid-editor';
import { BlockPalette } from '@/components/dashboard/grid/block-palette';
import { LayoutToolbar } from '@/components/dashboard/grid/layout-toolbar';
import { useTranslation } from '@/lib/i18n';
import type { LayoutItem, GridBlock } from '@/lib/db/layout-types';

export default function LayoutEditorPage() {
    const { data: session, status } = useSession();
    const { t } = useTranslation();
    const [initialLayout, setInitialLayout] = useState<LayoutItem[]>([]);
    const [initialBlocks, setInitialBlocks] = useState<GridBlock[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login');
        }
    }, [status]);

    useEffect(() => {
        async function loadData() {
            try {
                const [layoutRes, blocksRes] = await Promise.all([
                    fetch('/api/layout?device=desktop'),
                    fetch('/api/blocks'),
                ]);

                if (layoutRes.ok) {
                    const layoutData = await layoutRes.json();
                    setInitialLayout(layoutData.layout || []);
                }

                if (blocksRes.ok) {
                    const blocksData = await blocksRes.json();
                    setInitialBlocks(blocksData);
                }
            } catch (error) {
                console.error('Failed to load layout data:', error);
            } finally {
                setLoading(false);
            }
        }

        if (session) {
            loadData();
        }
    }, [session]);

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-gray-500">{t('common.loading')}</div>
            </div>
        );
    }

    return (
        <GridProvider initialLayout={initialLayout} initialBlocks={initialBlocks}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
                {/* Toolbar */}
                <LayoutToolbar />

                <div className="flex">
                    {/* Block Palette Sidebar */}
                    <BlockPalette />

                    {/* Main Editor Area */}
                    <main className="flex-1 p-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 min-h-[600px]">
                            <GridEditor width={Math.min(1200, typeof window !== 'undefined' ? window.innerWidth - 400 : 1000)} />
                        </div>
                    </main>
                </div>
            </div>
        </GridProvider>
    );
}
