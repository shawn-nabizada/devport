'use client';

import React from 'react';
import { LayoutItem, GridBlock, DeviceType } from '@/lib/db/layout-types';
import { GridBlockWrapper } from './grid-block-wrapper';
import { cn } from '@/lib/utils';
import { Responsive as ResponsiveGridLayout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

interface PublicGridRendererProps {
    blocks: GridBlock[];
    layouts: { device: DeviceType; layout: LayoutItem[] }[];
    cols?: { desktop: number; mobile: number };
    rowHeight?: number;
    className?: string;
    width?: number; // Optional override
}

export function PublicGridRenderer({
    blocks,
    layouts,
    cols = { desktop: 12, mobile: 4 },
    rowHeight = 80,
    className,
    width: propWidth,
}: PublicGridRendererProps) {
    const [width, setWidth] = React.useState(propWidth || 1200);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (propWidth) {
            setWidth(propWidth);
            return;
        }

        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setWidth(entry.contentRect.width);
            }
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, [propWidth]);

    // Local interface for RGL layout items
    interface RGLLayoutItem {
        i: string;
        x: number;
        y: number;
        w: number;
        h: number;
        minW?: number;
        maxW?: number;
        static?: boolean;
    }

    // Map device layouts to RGL breakpoints
    const rglLayouts = {
        lg: (layouts.find(l => l.device === 'desktop')?.layout || []).map(l => ({ ...l, static: true })) as unknown as RGLLayoutItem[],
        md: (layouts.find(l => l.device === 'desktop')?.layout || []).map(l => ({ ...l, static: true })) as unknown as RGLLayoutItem[],
        sm: (layouts.find(l => l.device === 'mobile')?.layout || []).map(l => ({ ...l, static: true })) as unknown as RGLLayoutItem[],
        xs: (layouts.find(l => l.device === 'mobile')?.layout || []).map(l => ({ ...l, static: true })) as unknown as RGLLayoutItem[],
        xxs: (layouts.find(l => l.device === 'mobile')?.layout || []).map(l => ({ ...l, static: true })) as unknown as RGLLayoutItem[],
    } as unknown as { [key: string]: RGLLayoutItem[] };

    return (
        <div ref={containerRef} className={cn("w-full min-h-screen", className)}>
            <ResponsiveGridLayout
                {...({
                    className: "layout",
                    layouts: rglLayouts,
                    breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
                    cols: { lg: cols.desktop, md: cols.desktop, sm: cols.mobile, xs: cols.mobile, xxs: cols.mobile },
                    rowHeight: rowHeight,
                    width: width,
                    margin: [16, 16],
                    containerPadding: [16, 16],
                    isDraggable: false,
                    isResizable: false,
                    useCSSTransforms: true
                } as unknown as React.ComponentProps<typeof ResponsiveGridLayout> & { isDraggable: boolean, isResizable: boolean })}
            >
                {blocks.map((block) => (
                    <div key={block._id.toString()}>
                        <GridBlockWrapper
                            block={block}
                            isSelected={false}
                            isEditMode={false}
                            onRemove={() => { }}
                            onClick={() => { }}
                        />
                    </div>
                ))}
            </ResponsiveGridLayout>
        </div >
    );
}
