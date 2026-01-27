'use client';

import React, { useCallback, useState, useRef, useEffect, forwardRef } from 'react';
import GridLayout, { LayoutItem as RGLLayoutItem, Layout as RGLLayout, GridLayoutProps } from 'react-grid-layout';

// Define our own EventCallback type that matches what GridLayout accepts
type GridEventCallback = NonNullable<GridLayoutProps['onDrag']>;
import { useGridContext } from './grid-context';
import { BlockRenderer } from './block-renderer';
import type { LayoutItem } from '@/lib/db/layout-types';
import { Loader2 } from 'lucide-react';
// import 'react-grid-layout/css/styles.css'; // Removed to prevent conflict with globals.css

interface GridEditorProps {
    width?: number;
}

interface ExtendedLayoutItem extends RGLLayoutItem {
    resizeHandles?: Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'>;
}

// Custom Resize Handle
const ResizeHandle = forwardRef<HTMLDivElement, { handleAxis?: string }>(
    ({ handleAxis, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-axis={handleAxis}
                className="custom-resize-handle absolute bottom-1 right-1 cursor-se-resize p-1 z-20 opacity-0 transition-opacity duration-200"
                {...props}
            >
                {/* Visual handle: A small indicator */}
                <div className="w-4 h-4 rounded-sm bg-background hover:bg-muted border border-border flex items-center justify-center shadow-sm">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-50 -rotate-45"
                    >
                        <polyline points="21 15 21 21 15 21" />
                    </svg>
                </div>
            </div>
        );
    }
);
ResizeHandle.displayName = "ResizeHandle";

// Background Grid Lines
const GridLines = ({
    width,
    cols,
    rowHeight,
    margin = [16, 16],
    containerPadding = [16, 16],
}: {
    width: number;
    cols: number;
    rowHeight: number;
    margin?: [number, number];
    containerPadding?: [number, number];
}) => {
    // Calculate column width exactly as React-Grid-Layout does
    // width = colWidth * cols + margin * (cols - 1) + containerPadding * 2
    // colWidth = (width - containerPadding * 2 - margin * (cols - 1)) / cols
    const colWidth =
        (width - containerPadding[0] * 2 - margin[0] * (cols - 1)) / cols;

    // Render a sufficient number of rows. 
    // In a real app, this might calculate based on the layout's max Y, but for a "background" feel, 
    // we'll render enough to cover a reasonable viewport height (e.g. 20 rows ~ 3000px).
    const rowCount = 30;
    const gridHeight =
        containerPadding[1] * 2 + rowCount * rowHeight + (rowCount - 1) * margin[1];

    if (colWidth <= 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-0">
            <svg
                width={width}
                height={gridHeight}
                className="stroke-gray-300 dark:stroke-gray-700"
            >
                {/* Vertical Lines (Columns) */}
                {Array.from({ length: cols + 1 }).map((_, i) => {
                    // Lines are drawn at the gap centers
                    // Shift lines by half margin to center the grid visually around items
                    const x = containerPadding[0] + i * (colWidth + margin[0]) - (margin[0] / 2);

                    // Don't draw lines outside for the very first and last if we want them flush,
                    // but standard graph paper usually has lines.
                    // The 'grid' project implementation:
                    // x = containerPadding[0] + i * (colWidth + margin[0]) - (margin[0] / 2);

                    if (i === 0 && margin[0] === 0) return null; // Skip first if no margin? Keeping consistent with source.

                    return (
                        <line
                            key={`v-${i}`}
                            x1={x}
                            y1={0}
                            x2={x}
                            y2={gridHeight}
                            strokeWidth={1}
                            strokeDasharray="4 4"
                        />
                    );
                })}

                {/* Horizontal Lines (Rows) */}
                {Array.from({ length: rowCount + 1 }).map((_, i) => {
                    const y = containerPadding[1] + i * (rowHeight + margin[1]) - (margin[1] / 2);
                    return (
                        <line
                            key={`h-${i}`}
                            x1={0}
                            y1={y}
                            x2={width}
                            y2={y}
                            strokeWidth={1}
                            strokeDasharray="4 4"
                        />
                    );
                })}
            </svg>
        </div>
    );
};

export function GridEditor({ width: initialWidth = 1200 }: GridEditorProps) {
    const {
        layout,
        setLayout,
        blocks,
        editMode,
        device,
        cols,         // Get from context
        rowHeight,    // Get from context
        selectedBlockId,
        isLoadingDevice,
        undo,
        redo,
        saveCheckpoint,
        removeBlock,
    } = useGridContext();

    const [width, setWidth] = useState(initialWidth);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Resize Observer for robust width
    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setWidth(entry.contentRect.width);
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    const selectedBlock = blocks.find(b => b._id.toString() === selectedBlockId);

    const margin: [number, number] = [16, 16];
    const containerPadding: [number, number] = [16, 16];

    const handleLayoutChange = useCallback((newLayout: RGLLayout) => {
        if (!editMode) return;

        const updatedLayout: LayoutItem[] = newLayout.map((item: RGLLayoutItem) => ({
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
        saveCheckpoint();
        setIsDragging(true);
    }, [saveCheckpoint]);

    const handleDragStop = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!editMode) return;
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
            if ((e.ctrlKey && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y')) { e.preventDefault(); redo(); }
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedBlockId) {
                    const tagName = (e.target as HTMLElement).tagName;
                    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName)) return;
                    if ((e.target as HTMLElement).isContentEditable) return;
                    e.preventDefault();
                    saveCheckpoint();
                    removeBlock(selectedBlockId);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [editMode, undo, redo, saveCheckpoint, removeBlock, selectedBlockId]);

    // Convert our layout items to react-grid-layout format
    const gridLayout: RGLLayoutItem[] = layout.map((item) => ({
        ...item,
        isDraggable: editMode,
        isResizable: editMode,
        // resizeHandles: ['sw', 'nw', 'se', 'ne'],
    })) as ExtendedLayoutItem[];

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
        <div
            ref={containerRef}
            id="portfolio-preview"
            className={`grid-editor relative rounded-md overflow-hidden min-h-[600px] w-full ${device === 'mobile' ? 'max-w-[400px] mx-auto' : ''} [&_.react-grid-item:hover_.custom-resize-handle]:opacity-100`}
            style={{
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
            }}
        >
            {/* SVG Grid Lines */}
            {editMode && (
                <GridLines
                    width={width}
                    cols={cols}
                    rowHeight={rowHeight}
                    margin={margin}
                    containerPadding={containerPadding}
                />
            )}

            <GridLayout
                key={`${cols}-${rowHeight}`}
                className="layout"
                layout={gridLayout}
                width={width}
                // @ts-expect-error - The types for react-grid-layout are missing cols
                cols={cols}
                rowHeight={rowHeight}
                margin={margin}
                containerPadding={containerPadding}
                compactType={null} // No gravity, free movement
                preventCollision={false} // Allow pushing
                resizeHandle={<ResizeHandle />}
                onLayoutChange={handleLayoutChange}
                onDragStart={handleDragStart}
                onDragStop={handleDragStop}
                isDraggable={editMode}
                isResizable={editMode}
                draggableCancel=".non-draggable"
            >
                {blocks.map((block) => {
                    const isSelected = selectedBlockId === block._id.toString();
                    return (
                        <div
                            key={block._id.toString()}
                            className={`bg-card rounded-lg shadow-sm overflow-visible ${isSelected ? 'z-50 ring-2 ring-primary' : 'z-0'
                                } ${editMode ? 'cursor-move' : ''}`}
                            style={{
                                zIndex: isSelected ? 50 : 1
                            }}
                            onClick={(e) => {
                                // Prevent selecting passed-through checks if needed?
                            }}
                        >
                            <div className="w-full h-full overflow-hidden rounded-lg">
                                <BlockRenderer block={block} />
                            </div>
                        </div>
                    );
                })}
            </GridLayout>

            {blocks.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center text-muted-foreground bg-background/80 p-6 rounded-lg backdrop-blur-sm border shadow-sm">
                        <p className="text-lg font-medium mb-1">Canvas is empty</p>
                        <p className="text-sm">Add blocks from the sidebar to start building</p>
                    </div>
                </div>
            )}

            {/* Debug Info */}
            <div className="absolute top-2 right-2 bg-black/80 text-white p-4 rounded shadow-xl z-[100] font-mono text-xs pointer-events-none">
                <div className="font-bold border-b border-white/20 mb-2 pb-1 text-green-400">DEBUG GRID</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span className="text-gray-400">Width:</span> <span>{Math.round(width)}px</span>
                    <span className="text-gray-400">Cols:</span> <span>{cols}</span>
                    <span className="text-gray-400">RowH:</span> <span>{rowHeight}px</span>
                    <span className="text-gray-400">Margin:</span> <span>{margin[0]}px</span>
                </div>
                {selectedBlock && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                        <div className="font-bold text-yellow-400 mb-1">Selected: {selectedBlock.type}</div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {(() => {
                                const item = layout.find(l => l.i === selectedBlock._id.toString());
                                return item ? (
                                    <>
                                        <span className="text-gray-400">x:</span> <span>{item.x}</span>
                                        <span className="text-gray-400">y:</span> <span>{item.y}</span>
                                        <span className="text-gray-400">w:</span> <span>{item.w}</span>
                                        <span className="text-gray-400">h:</span> <span>{item.h}</span>
                                    </>
                                ) : <span className="col-span-2 text-red-400">Item not in layout!</span>;
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

