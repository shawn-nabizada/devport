'use client';

import React, { useCallback, useState } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import { useGridContext } from './grid-context';
import { BlockRenderer } from './block-renderer';
import type { LayoutItem } from '@/lib/db/layout-types';
import { Loader2 } from 'lucide-react';
import 'react-grid-layout/css/styles.css';

interface GridEditorProps {
    width?: number;
}

interface SnapGuide {
    type: 'vertical' | 'horizontal';
    position: number; // in pixels
}

export function GridEditor({ width = 1200 }: GridEditorProps) {
    const {
        layout,
        setLayout,
        blocks,
        editMode,
        device,
        selectedBlockId,
        isLoadingDevice,
    } = useGridContext();

    const [isDragging, setIsDragging] = useState(false);
    const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);

    const cols = device === 'desktop' ? 12 : 4;
    const rowHeight = device === 'desktop' ? 80 : 60;
    const gridWidth = device === 'mobile' ? 400 : width;
    const colWidth = (gridWidth - 32) / cols; // Account for container padding
    const margin = 16;

    const handleLayoutChange = useCallback((newLayout: Layout[]) => {
        if (!editMode) return;

        const updatedLayout: LayoutItem[] = newLayout.map((item) => ({
            i: item.i,
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
            minW: item.minW,
            minH: item.minH,
            maxW: item.maxW,
            maxH: item.maxH,
            static: item.static,
        }));

        setLayout(updatedLayout);
    }, [editMode, setLayout]);

    const handleDragStart = useCallback(() => {
        setIsDragging(true);
    }, []);

    const handleDrag = useCallback((
        _layout: Layout[],
        _oldItem: Layout,
        newItem: Layout,
    ) => {
        if (!editMode) return;

        // Calculate snap guides based on other items
        const guides: SnapGuide[] = [];

        // Add column guides (vertical lines)
        for (let i = 0; i <= cols; i++) {
            const x = margin + i * colWidth;
            guides.push({ type: 'vertical', position: x });
        }

        // Add alignment guides based on other blocks
        layout.forEach((item) => {
            if (item.i === newItem.i) return;

            // Left edge alignment
            const leftEdge = margin + item.x * colWidth;
            if (!guides.find(g => g.type === 'vertical' && Math.abs(g.position - leftEdge) < 2)) {
                guides.push({ type: 'vertical', position: leftEdge });
            }

            // Right edge alignment
            const rightEdge = margin + (item.x + item.w) * colWidth;
            if (!guides.find(g => g.type === 'vertical' && Math.abs(g.position - rightEdge) < 2)) {
                guides.push({ type: 'vertical', position: rightEdge });
            }

            // Top edge alignment
            const topEdge = margin + item.y * (rowHeight + margin);
            if (!guides.find(g => g.type === 'horizontal' && Math.abs(g.position - topEdge) < 2)) {
                guides.push({ type: 'horizontal', position: topEdge });
            }

            // Bottom edge alignment
            const bottomEdge = margin + (item.y + item.h) * (rowHeight + margin);
            if (!guides.find(g => g.type === 'horizontal' && Math.abs(g.position - bottomEdge) < 2)) {
                guides.push({ type: 'horizontal', position: bottomEdge });
            }
        });

        // Only show guides near the dragged item
        const draggedLeft = margin + newItem.x * colWidth;
        const draggedRight = margin + (newItem.x + newItem.w) * colWidth;
        const draggedTop = margin + newItem.y * (rowHeight + margin);
        const draggedBottom = margin + (newItem.y + newItem.h) * (rowHeight + margin);

        const snapThreshold = 20; // pixels

        const activeGuides = guides.filter((guide) => {
            if (guide.type === 'vertical') {
                return (
                    Math.abs(guide.position - draggedLeft) < snapThreshold ||
                    Math.abs(guide.position - draggedRight) < snapThreshold
                );
            } else {
                return (
                    Math.abs(guide.position - draggedTop) < snapThreshold ||
                    Math.abs(guide.position - draggedBottom) < snapThreshold
                );
            }
        });

        setSnapGuides(activeGuides);
    }, [editMode, layout, cols, colWidth, rowHeight, margin]);

    const handleDragStop = useCallback(() => {
        setIsDragging(false);
        setSnapGuides([]);
    }, []);

    // Convert our layout items to react-grid-layout format
    const gridLayout: Layout[] = layout.map((item) => ({
        ...item,
        isDraggable: editMode,
        isResizable: editMode,
    }));

    if (isLoadingDevice) {
        return (
            <div className={`grid-editor relative ${device === 'mobile' ? 'max-w-[400px] mx-auto' : ''}`}>
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <span className="ml-3 text-gray-500">Loading {device} layout...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`grid-editor relative ${device === 'mobile' ? 'max-w-[400px] mx-auto' : ''}`}>
            {/* Snap Guides */}
            {isDragging && editMode && snapGuides.map((guide, index) => (
                <div
                    key={`guide-${index}`}
                    className={`absolute pointer-events-none z-50 ${guide.type === 'vertical'
                        ? 'w-px h-full bg-blue-500/50'
                        : 'h-px w-full bg-blue-500/50'
                        }`}
                    style={{
                        left: guide.type === 'vertical' ? `${guide.position}px` : 0,
                        top: guide.type === 'horizontal' ? `${guide.position}px` : 0,
                    }}
                />
            ))}

            <GridLayout
                className="layout"
                layout={gridLayout}
                cols={cols}
                rowHeight={rowHeight}
                width={gridWidth}
                onLayoutChange={handleLayoutChange}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragStop={handleDragStop}
                onResizeStart={handleDragStart}
                onResize={handleDrag}
                onResizeStop={handleDragStop}
                isDraggable={editMode}
                isResizable={editMode}
                margin={[margin, margin]}
                containerPadding={[margin, margin]}
                useCSSTransforms={true}
                compactType="vertical"
                preventCollision={false}
            >
                {blocks.map((block) => {
                    const isSelected = selectedBlockId === block._id.toString();
                    return (
                        <div
                            key={block._id.toString()}
                            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-visible ${isSelected ? 'z-50' : 'z-0'}`}
                            style={isSelected ? { zIndex: 50 } : undefined}
                        >
                            <BlockRenderer block={block} />
                        </div>
                    );
                })}
            </GridLayout>

            {blocks.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                    <p className="text-lg mb-2">No blocks yet</p>
                    <p className="text-sm">Add blocks from the sidebar to build your layout</p>
                </div>
            )}

            {/* Grid overlay for edit mode */}
            {editMode && !isDragging && (
                <div
                    className="absolute inset-0 pointer-events-none opacity-10"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, #3b82f6 1px, transparent 1px),
                            linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
                        `,
                        backgroundSize: `${colWidth}px ${rowHeight + margin}px`,
                        backgroundPosition: `${margin}px ${margin}px`,
                    }}
                />
            )}
        </div>
    );
}

