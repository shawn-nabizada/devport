'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { GridProvider } from '@/components/dashboard/grid/grid-context';
import { GridEditor } from '@/components/dashboard/grid/grid-editor';
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
                    fetch('/api/layout?device=desktop', { cache: 'no-store' }),
                    fetch('/api/blocks', { cache: 'no-store' }),
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
            // Placeholder if needed for responsive logic
        };

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
        <GridProvider
            initialLayout={{
                desktop: initialLayout,
                mobile: [] // TODO: Fetch mobile layout
            }}
            initialBlocks={initialBlocks}
        >
            <div className="min-h-screen bg-muted/30">
                {/* Main Editor Area - Full Width */}
                <main className="p-4 md:p-6">
                    <div id="editor-container" className="container mx-auto">
                        <div className="bg-card rounded-xl shadow-lg p-6 min-h-[600px]">
                            <GridEditor />
                        </div>
                    </div>
                </main>
            </div>
        </GridProvider>
    );
}
