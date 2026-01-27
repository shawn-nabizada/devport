'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Responsive as ResponsiveGridLayout } from 'react-grid-layout';
import { useGridContext } from './grid-context';
import { RibbonToolbar } from './ribbon-toolbar';
import { GridBlockWrapper } from './grid-block-wrapper';
import { cn } from '@/lib/utils';
import {
    getThemeById,
    getThemeStyleVariables,
    ThemeId,
    ThemeColors,
    PRESET_THEMES,
} from '@/lib/db/theme-types';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Reuse the resize handle from the reference project
const ResizeHandle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    (props, ref) => {
        return (
            <div
                ref={ref}
                className="absolute bottom-1 right-1 cursor-se-resize p-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                {...props}
            >
                <div className="w-4 h-4 rounded-sm bg-primary/20 backdrop-blur-sm border border-primary/50 flex items-center justify-center">
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
                        className="opacity-70 -rotate-45 text-primary"
                    >
                        <polyline points="21 15 21 21 15 21" />
                    </svg>
                </div>
            </div>
        );
    }
);
ResizeHandle.displayName = "ResizeHandle";

const GridLines = ({
    width,
    cols,
    rowHeight,
    minHeight = 1000,
    margin = [16, 16],
    containerPadding = [16, 16],
}: {
    width: number;
    cols: number;
    rowHeight: number;
    minHeight?: number;
    margin?: [number, number];
    containerPadding?: [number, number];
}) => {
    const colWidth = (width - containerPadding[0] * 2 - margin[0] * (cols - 1)) / cols;

    // Calculate how many rows fit in the current minimum height
    // We ensure we cover at least the minHeight, essentially.
    const effectiveHeight = Math.max(minHeight, 500);
    const rowCount = Math.ceil((effectiveHeight - containerPadding[1] * 2) / (rowHeight + margin[1])) + 5; // Add buffer rows

    const gridHeight = containerPadding[1] * 2 + rowCount * rowHeight + (rowCount - 1) * margin[1];

    if (width <= 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-0" style={{ height: gridHeight }}>
            <svg
                width={width}
                height={gridHeight}
                className="stroke-border"
            >
                {/* Vertical Lines */}
                {Array.from({ length: cols + 1 }).map((_, i) => {
                    const x = containerPadding[0] + i * (colWidth + margin[0]) - (margin[0] / 2);
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

                {/* Horizontal Lines */}
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

export function GridEditor() {
    const {
        editMode,
        device,
        cols,
        rowHeight,
        blocks,
        layouts,
        updateLayout,
        selectedBlockId,
        setSelectedBlockId,
        removeBlock,
        saveCheckpoint,
    } = useGridContext();
    const { resolvedTheme } = useTheme();

    const [width, setWidth] = useState(1200);
    const containerRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    // Theme state
    const [currentThemeId, setCurrentThemeId] = useState<ThemeId>('tech');
    const [customColors, setCustomColors] = useState<Partial<ThemeColors>>({});


    // Load saved theme settings on mount
    useEffect(() => {
        async function loadThemeSettings() {
            try {
                const res = await fetch('/api/theme');
                if (res.ok) {
                    const data = await res.json();
                    if (data.themeId) {
                        setCurrentThemeId(data.themeId);
                    }
                    if (data.customColors) {
                        setCustomColors(data.customColors);
                    }
                }
            } catch (error) {
                console.error('Failed to load theme settings:', error);
            } finally {
                // Loaded
            }
        }
        loadThemeSettings();
    }, []);

    const handleThemeSelect = async (themeId: ThemeId) => {
        const selectedTheme = getThemeById(themeId);
        if (!selectedTheme) return;

        setCurrentThemeId(themeId);
        // Clear custom colors when switching theme
        const mode = resolvedTheme === 'dark' ? 'dark' : 'light';
        setCustomColors({
            primary: selectedTheme.colors[mode].primary,
            secondary: selectedTheme.colors[mode].secondary,
            accent: selectedTheme.colors[mode].accent,
            background: selectedTheme.colors[mode].background,
            foreground: selectedTheme.colors[mode].foreground,
            card: selectedTheme.colors[mode].card,
            muted: selectedTheme.colors[mode].muted,
            border: selectedTheme.colors[mode].border,
        });

        try {
            await fetch('/api/theme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ themeId }),
            });
            toast.success('Theme saved');
        } catch (error) {
            console.error('Failed to save theme:', error);
            toast.error('Failed to save theme');
        }
    };

    // Apply custom color and save to API
    const applyCustomColor = (colorName: string, colorValue: string) => {
        const newColors = { ...customColors, [colorName]: colorValue };
        setCustomColors(newColors);

        // Save to API (debounced via requestAnimationFrame)
        requestAnimationFrame(() => {
            fetch('/api/theme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    themeId: currentThemeId,
                    customColors: newColors
                }),
            }).catch(err => console.error('Failed to save custom color:', err));
        });
    };

    // Initial mount hydration fix
    useEffect(() => {
        setTimeout(() => setMounted(true), 0);
    }, []);

    // Resize observer for grid width
    useEffect(() => {
        if (!containerRef.current) return;

        // Immediate measurement to handle device switch instantly
        setWidth(containerRef.current.offsetWidth);

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setWidth(entry.contentRect.width);
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [mounted, device]);

    // Local interface for RGL layout items to ensure type safety
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

    // Map internal layout items to RGL structure to ensure clean types
    const rglLayouts = React.useMemo(() => {
        return layouts[device].map(l => ({
            i: l.i,
            x: l.x,
            y: l.y,
            w: l.w,
            h: l.h,
            minW: l.minW,
            maxW: l.maxW,
            static: l.static
        })) as unknown as RGLLayoutItem[];
    }, [layouts, device]);

    // Handle Layout Change
    const handleLayoutChange = (currentLayout: RGLLayoutItem[]) => {
        // Only update if mounted to avoid initial thrashing
        if (mounted) {
            // Map RGL layout back to our LayoutItem type
            const newLayoutItems = currentLayout.map((l) => ({
                i: l.i,
                x: l.x,
                y: l.y,
                w: l.w,
                h: l.h,
                minW: l.minW,
                maxW: l.maxW,
                static: l.static
            }));

            updateLayout(newLayoutItems);
        }
    };

    const handleDragStart = () => {
        saveCheckpoint();
    };

    const handleResizeStart = () => {
        saveCheckpoint();
    };

    // Calculate container width based on device to simulate view
    const getContainerStyle = () => {
        if (device === 'mobile') {
            return {
                width: '375px', // iPhone SE / Common Mobile width
                margin: '0 auto',
                borderLeft: '1px solid var(--border)',
                borderRight: '1px solid var(--border)',
                minHeight: '100vh',
            };
        }
        return {
            width: '100%',
            minHeight: '100vh',
        };
    };

    if (!mounted) return null;

    // Calculate dynamic grid height to ensure lines cover all blocks
    const maxGridY = rglLayouts.reduce((max, item) => {
        if (item.y === Infinity) return max;
        return Math.max(max, item.y + item.h);
    }, 0);
    // Approximate height in pixels: (rows * rowHeight) + (rows * margin) + padding
    const contentHeight = maxGridY * (rowHeight + 16) + 200; // + buffer

    // Dynamic margins/padding based on device
    const margin: [number, number] = device === 'mobile' ? [10, 10] : [16, 16];
    const containerPadding: [number, number] = device === 'mobile' ? [10, 10] : [16, 16];

    // Compute theme styles
    const selectedTheme = getThemeById(currentThemeId) || PRESET_THEMES[0];
    const isDark = resolvedTheme === 'dark';
    const baseThemeVariables = getThemeStyleVariables(selectedTheme, isDark);

    // Override with custom colors (convert camelCase to kebab-case variables)
    const customVariables: Record<string, string> = {};
    Object.entries(customColors).forEach(([key, value]) => {
        if (value) {
            // Simple mapping for demo purposes, robust solution would use toKebabCase helper if exported
            const kebab = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            customVariables[`--${kebab}`] = value;
        }
    });

    const themeStyles = { ...baseThemeVariables, ...customVariables };

    return (
        <div className="flex flex-col h-screen bg-background">
            <RibbonToolbar
                currentThemeId={currentThemeId}
                currentCustomColors={customColors}
                onThemeSelect={handleThemeSelect}
                onCustomColorChange={applyCustomColor}
            />

            <div className="flex flex-1 overflow-hidden">
                {/* Main Canvas */}
                <div className="flex-1 bg-muted/10 overflow-auto relative custom-scrollbar">
                    <div
                        id="portfolio-preview"
                        className="min-h-full relative bg-background shadow-sm overflow-hidden"
                        style={{
                            ...getContainerStyle(),
                            ...(themeStyles as React.CSSProperties)
                        }}
                        ref={containerRef}
                        onClick={() => setSelectedBlockId(null)} // Click background to deselect
                    >
                        {/* Background Grid Lines */}
                        {editMode && (
                            <GridLines
                                width={width}
                                cols={cols}
                                rowHeight={rowHeight}
                                margin={margin}
                                containerPadding={containerPadding}
                                minHeight={Math.max(contentHeight, 1000)} // Ensure at least screen height
                            />
                        )}

                        <ResponsiveGridLayout
                            {...({
                                className: cn("layout", !editMode && "pointer-events-none"),
                                layouts: { lg: rglLayouts },
                                breakpoints: { lg: 0 },
                                cols: { lg: cols },
                                rowHeight: rowHeight,
                                width: width,
                                margin: margin,
                                containerPadding: containerPadding,
                                isDraggable: editMode,
                                isResizable: editMode,
                                resizeHandle: <ResizeHandle />,
                                onLayoutChange: handleLayoutChange,
                                onResizeStart: handleResizeStart,
                                onDragStart: handleDragStart,
                                compactType: null,
                                preventCollision: false
                            } as unknown as React.ComponentProps<typeof ResponsiveGridLayout> & { isDraggable: boolean, isResizable: boolean })}
                        >
                            {blocks.map((block) => {
                                // Find layout item to verify existence? Not strictly needed as RGL handles it,
                                // but we use blocks.map as the source of truth for DOM.
                                return (
                                    <div key={block._id.toString()}>
                                        <GridBlockWrapper
                                            block={block}
                                            isSelected={selectedBlockId === block._id.toString()}
                                            isEditMode={editMode}
                                            onRemove={removeBlock}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Wrapper clicked, prevent deselection
                                            }}
                                            onMouseDown={() => {
                                                // Allow bubbling to RGL for drag
                                                setSelectedBlockId(block._id.toString());
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </ResponsiveGridLayout>
                    </div>
                </div>
            </div>
        </div >
    );
}
