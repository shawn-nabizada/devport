'use client';

import React from 'react';
import GridLayout, { LayoutItem as RGLLayoutItem } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import type { LayoutItem, GridBlock } from '@/lib/db/layout-types';
import { BlockRenderer } from '@/components/dashboard/grid/block-renderer';

interface HeatmapGridProps {
    layout: LayoutItem[];
    blocks: GridBlock[];
    blockClicks: Record<string, number>;
}

export function HeatmapGrid({ layout, blocks, blockClicks }: HeatmapGridProps) {
    const width = 800; // Fixed width for heatmap preview
    const cols = 12;
    const rowHeight = 80;
    const margin = 16;

    // Adapt layout for RGL
    const gridLayout: RGLLayoutItem[] = layout.map(item => ({
        ...item,
        static: true
    }));

    // Find max clicks for scaling
    // fallback to 1 to avoid divide by zero
    const maxClicks = Math.max(...Object.values(blockClicks), 1);

    return (
        <div className="relative bg-background rounded-lg border overflow-hidden mx-auto" style={{ width: '850px' }}>
            <GridLayout
                className="layout"
                layout={gridLayout}
                width={width}
                gridConfig={{
                    cols,
                    rowHeight,
                    margin: [margin, margin],
                    containerPadding: [margin, margin],
                }}
                dragConfig={{ enabled: false }}
                resizeConfig={{ enabled: false }}
            >
                {blocks.map(block => {
                    const clicks = blockClicks[block._id.toString()] || 0;
                    // Intensity 0.1 to 0.8
                    const intensity = (clicks / maxClicks) * 0.7 + (clicks > 0 ? 0.1 : 0);

                    const overlayColor = `rgba(255, 50, 50, ${intensity})`;

                    return (
                        <div key={block._id.toString()} className="relative bg-card rounded-md shadow-sm overflow-hidden border">
                            {/* Block Content (Dimmed to visible underneath) */}
                            <div className="opacity-40 pointer-events-none h-full w-full overflow-hidden">
                                {/* We mock the block renderer or use it directly - ensure it is read-only */}
                                <BlockRenderer block={block} />
                            </div>

                            {/* Heatmap Overlay */}
                            <div
                                className="absolute inset-0 flex items-center justify-center transition-colors z-10"
                                style={{ backgroundColor: overlayColor }}
                                title={`${clicks} clicks`}
                            >
                                <div className="bg-black/80 text-white text-xs font-bold px-2 py-1 rounded shadow-lg backdrop-blur-sm">
                                    {clicks}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </GridLayout>
        </div>
    );
}
