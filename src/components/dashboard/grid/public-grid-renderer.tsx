'use client';

import React, { useEffect, useState } from 'react';
import GridLayout, { LayoutItem as RGLLayoutItem } from 'react-grid-layout';
import { GridProvider, useGridContext } from './grid-context';
import { BlockRenderer } from './block-renderer';
import type { LayoutItem, GridBlock, DeviceType } from '@/lib/db/layout-types';
import 'react-grid-layout/css/styles.css';

interface PublicGridRendererProps {
    layouts: Array<{ device: DeviceType; layout: LayoutItem[] }>;
    blocks: Array<GridBlock & { device?: DeviceType }>;
}

function GridView({ width }: { width: number }) {
    const { layout, blocks, device, setDevice } = useGridContext();

    // Auto-switch specific layout based on width
    useEffect(() => {
        if (width < 768 && device !== 'mobile') {
            setDevice('mobile');
        } else if (width >= 768 && device !== 'desktop') {
            setDevice('desktop');
        }
    }, [width, device, setDevice]);

    const cols = device === 'desktop' ? 12 : 4;
    const rowHeight = device === 'desktop' ? 80 : 60;
    const gridWidth = width;
    const margin = 16;

    // Tracking


    // Get ownerId from blocks safely
    const ownerId = blocks.length > 0 ? blocks[0].userId : null;

    return (
        <div className="portfolio-grid relative min-h-[400px]">
            <GridLayout
                {...{
                    className: "layout",
                    layout: layout as RGLLayoutItem[],
                    width: gridWidth,
                    isDraggable: false,
                    isResizable: false,
                    cols,
                    rowHeight,
                    margin: [margin, margin],
                    containerPadding: [margin, 0],
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any}
            >
                {blocks.map((block) => (
                    <div
                        key={block._id.toString()}
                        className="bg-card rounded-lg shadow-sm overflow-hidden border border-border/50"
                    >
                        <BlockRenderer
                            block={block}
                            onInteract={(id) => {
                                if (ownerId) {
                                    // Send ownerId as body userId, because /track route expects { userId, ... } 
                                    // where userId is the OWNER of the portfolio, for aggregation?
                                    // Wait, /track uses userId to find WHERE to store analytics.
                                    // The person clicking is Anonymous (visitor).
                                    // So userId passed to track MUST be the Portfolio Owner.
                                    // blocks[0].userId is correct.
                                    fetch('/api/analytics/track', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            userId: ownerId,
                                            eventType: 'block_click',
                                            metadata: { blockId: id }
                                        }),
                                    });
                                }
                            }}
                        />
                    </div>
                ))}
            </GridLayout>
        </div>
    );
}

export function PublicGridRenderer({ layouts, blocks }: PublicGridRendererProps) {
    const [width, setWidth] = useState(1200);

    // Parse data
    const desktopLayoutData = layouts.find(l => l.device === 'desktop')?.layout || [];
    const mobileLayoutData = layouts.find(l => l.device === 'mobile')?.layout || [];

    // In the current API, blocks seem to be returned as a flat list.
    // Ideally we should filter them if they are device specific, but for now passing all to both might be safe 
    // if the layout only references available block IDs.
    // Actually, GridProvider loadDeviceLayout fetches blocks?device=...
    // If blocks are distinct, we need to know which are which.
    // The API /api/portfolio returns *all* blocks.
    // We can pass all blocks to both states, the Grid only renders blocks that match layout IDs?
    // No, GridLayout iterates `children` (blocks maps).
    // So we MUST filter blocks that are actually IN the layout.

    const filterBlocksForLayout = (layoutItems: LayoutItem[], allBlocks: GridBlock[]) => {
        const ids = new Set(layoutItems.map(i => i.i));
        return allBlocks.filter(b => ids.has(b._id.toString()));
    };

    const desktopBlocks = filterBlocksForLayout(desktopLayoutData, blocks);
    const mobileBlocks = filterBlocksForLayout(mobileLayoutData, blocks);

    useEffect(() => {
        const updateWidth = () => {
            // Container width logic
            const container = document.getElementById('portfolio-container');
            if (container) {
                setWidth(container.offsetWidth);
            } else {
                setWidth(Math.min(1400, window.innerWidth - 32));
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    return (
        <GridProvider
            readOnly={true}
            initialLayout={desktopLayoutData}
            initialBlocks={desktopBlocks}
            initialMobileLayout={mobileLayoutData}
            initialMobileBlocks={mobileBlocks}
        >
            <div id="portfolio-container" className="w-full">
                <GridView width={width} />
            </div>
        </GridProvider>
    );
}
