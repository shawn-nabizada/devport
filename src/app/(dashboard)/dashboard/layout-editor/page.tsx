'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { GridProvider } from '@/components/dashboard/grid/grid-context';
import { GridEditor } from '@/components/dashboard/grid/grid-editor';
import { RibbonToolbar } from '@/components/dashboard/grid/ribbon-toolbar';
import { useTranslation } from '@/lib/i18n';
import type { LayoutItem, GridBlock } from '@/lib/db/layout-types';

export default function LayoutEditorPage() {
    const { data: session, status } = useSession();
    const { t } = useTranslation();
    const [initialLayout, setInitialLayout] = useState<LayoutItem[]>([]);
    const [initialBlocks, setInitialBlocks] = useState<GridBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [editorWidth, setEditorWidth] = useState(1200);

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

    // Update editor width on resize
    useEffect(() => {
        const updateWidth = () => {
            // Full width minus some padding
            setEditorWidth(Math.min(1400, window.innerWidth - 64));
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-muted-foreground">{t('common.loading')}</div>
            </div>
        );
    }

    return (
        <GridProvider initialLayout={initialLayout} initialBlocks={initialBlocks}>
            <div className="min-h-screen bg-muted/30">
                {/* Ribbon Toolbar */}
                <RibbonToolbar />

                {/* Main Editor Area - Full Width */}
                <main className="p-6">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="bg-card rounded-xl shadow-lg p-6 min-h-[600px]">
                            <GridEditor width={editorWidth} />
                        </div>
                    </div>
                </main>
            </div>
        </GridProvider>
    );
}
