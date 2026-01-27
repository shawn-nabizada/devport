'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import {
    GridBlock,
    DeviceType,
    DEFAULT_LAYOUT_CONFIG,
    BlockContent,
    LayoutItem
} from '@/lib/db/layout-types';

// Define the shape of our context
interface GridContextType {
    // Mode
    editMode: boolean;
    setEditMode: (mode: boolean) => void;

    // Device
    device: DeviceType;
    setDevice: (device: DeviceType) => void;

    // Grid Settings
    cols: number;
    rowHeight: number;
    updateGridSettings: (settings: { cols?: number; rowHeight?: number }) => void;

    // Blocks & Layout
    blocks: GridBlock[];
    layouts: { desktop: LayoutItem[]; mobile: LayoutItem[] };
    updateLayout: (newLayout: LayoutItem[]) => void;

    // Selection
    selectedBlockId: string | null;
    setSelectedBlockId: (id: string | null) => void;

    // CRUD
    addBlock: (block: GridBlock) => void;
    updateBlock: (id: string, content: BlockContent) => void;
    removeBlock: (id: string) => void;

    // Persistence
    saveLayout: () => Promise<void>;
    isSaving: boolean;
    isDirty: boolean;
    setIsDirty: (dirty: boolean) => void;

    // History
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    saveCheckpoint: () => void;
    resetLayout: () => void;
}

const GridContext = createContext<GridContextType | undefined>(undefined);

export function useGridContext() {
    const context = useContext(GridContext);
    if (!context) {
        throw new Error('useGridContext must be used within a GridProvider');
    }
    return context;
}

interface GridProviderProps {
    children: ReactNode;
    initialBlocks?: GridBlock[];
    initialLayout?: { desktop: LayoutItem[]; mobile: LayoutItem[] }; // LayoutItem generally compatible with Layout if fields match
    initialSettings?: {
        desktop: { cols: number; rowHeight: number };
        mobile: { cols: number; rowHeight: number };
    };
}

export function GridProvider({
    children,
    initialBlocks = [],
    initialLayout = { desktop: [], mobile: [] },
    initialSettings = DEFAULT_LAYOUT_CONFIG
}: GridProviderProps) {
    // State
    const [editMode, setEditMode] = useState(false);
    const [device, setDevice] = useState<DeviceType>('desktop');
    const [blocks, setBlocks] = useState<GridBlock[]>(initialBlocks);

    // We assume LayoutItem has at least i, x, y, w, h
    const [layouts, setLayouts] = useState<{ desktop: LayoutItem[]; mobile: LayoutItem[] }>({
        desktop: initialLayout.desktop,
        mobile: initialLayout.mobile
    });

    const [settings, setSettings] = useState(initialSettings);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Sync state with props when data loads
    useEffect(() => {
        if (initialBlocks.length > 0) {
            setBlocks(initialBlocks);
        }
    }, [initialBlocks]);

    useEffect(() => {
        if (initialLayout.desktop.length > 0 || initialLayout.mobile.length > 0) {
            setLayouts({
                desktop: initialLayout.desktop,
                mobile: initialLayout.mobile
            });
        }
    }, [initialLayout]);

    // History State
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [history, setHistory] = useState<any[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Derived values
    const currentCols = settings[device].cols;
    const currentRowHeight = settings[device].rowHeight;

    // Load initial data if needed (mocking for now, or assuming passed in props)
    // In a real app, you might fetch here if not passed in props.

    // History management
    const saveCheckpoint = useCallback(() => {
        const currentState = {
            blocks: JSON.parse(JSON.stringify(blocks)),
            layouts: JSON.parse(JSON.stringify(layouts)),
            settings: JSON.parse(JSON.stringify(settings)),
        };

        // Remove future history if we're in the middle of the stack
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(currentState);

        // Limit history size
        if (newHistory.length > 20) {
            newHistory.shift();
        }

        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setIsDirty(true);
    }, [blocks, layouts, settings, history, historyIndex]);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const prevState = history[historyIndex - 1];
            setBlocks(prevState.blocks);
            setLayouts(prevState.layouts);
            setSettings(prevState.settings);
            setHistoryIndex(historyIndex - 1);
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const nextState = history[historyIndex + 1];
            setBlocks(nextState.blocks);
            setLayouts(nextState.layouts);
            setSettings(nextState.settings);
            setHistoryIndex(historyIndex + 1);
        }
    }, [history, historyIndex]);

    // Actions
    const updateGridSettings = useCallback((newSettings: { cols?: number; rowHeight?: number }) => {
        saveCheckpoint();
        setSettings(prev => ({
            ...prev,
            [device]: {
                ...prev[device],
                ...newSettings
            }
        }));
    }, [device, saveCheckpoint]);

    const updateLayout = useCallback((newLayout: LayoutItem[]) => {
        // Only save checkpoint if layout actually changed significantly
        // For drag/drop, we might want to debounce or wait for drag stop
        // But for now, let's just update state.
        // NOTE: react-grid-layout calls this on every drag event.
        // Ideally we only checkpoint on drag stop.
        // relying on 'onDragStop' from the component to call saveCheckpoint,
        // and this function just updates state.

        setLayouts(prev => ({
            ...prev,
            [device]: newLayout
        }));
        setIsDirty(true);
    }, [device]);

    const addBlock = useCallback((block: GridBlock) => {
        saveCheckpoint();
        setBlocks(prev => [...prev, block]);

        // Add to layouts
        const newLayoutItem: LayoutItem = {
            i: block._id.toString(),
            x: 0,
            y: Infinity, // Put at bottom
            w: 4,
            h: 4,
        };

        setLayouts(prev => ({
            desktop: [...prev.desktop, newLayoutItem],
            mobile: [...prev.mobile, { ...newLayoutItem, w: 2 }] // Default smaller on mobile
        }));

        // Select the new block
        setSelectedBlockId(block._id.toString());
    }, [saveCheckpoint]);

    const updateBlock = useCallback((id: string, content: BlockContent) => {
        saveCheckpoint();
        setBlocks(prev => prev.map(b =>
            b._id.toString() === id ? { ...b, content } : b
        ));
    }, [saveCheckpoint]);

    const removeBlock = useCallback((id: string) => {
        saveCheckpoint();
        setBlocks(prev => prev.filter(b => b._id.toString() !== id));
        setLayouts(prev => ({
            desktop: prev.desktop.filter(l => l.i !== id),
            mobile: prev.mobile.filter(l => l.i !== id)
        }));
        if (selectedBlockId === id) setSelectedBlockId(null);
    }, [selectedBlockId, saveCheckpoint]);

    const saveLayout = useCallback(async () => {
        setIsSaving(true);
        try {
            // Transform internal Layout[] to simple objects for API to avoid circular structure issues if any
            // and perform the save
            const payload = {
                blocks,
                layouts,
                settings,
                device // Optionally save the last viewed device
            };

            const res = await fetch('/api/layout', { // Corrected endpoint
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to save');

            setIsDirty(false);
            toast.success('Layout saved successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save layout');
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [blocks, layouts, settings, device]);
    const resetLayout = useCallback(() => {
        saveCheckpoint();
        setBlocks([]);
        setLayouts({ desktop: [], mobile: [] });
        setSelectedBlockId(null);
        setIsDirty(true);
    }, [saveCheckpoint]);

    return (
        <GridContext.Provider value={{
            editMode,
            setEditMode,
            device,
            setDevice,
            cols: currentCols,
            rowHeight: currentRowHeight,
            updateGridSettings,
            blocks,
            layouts,
            updateLayout,
            selectedBlockId,
            setSelectedBlockId,
            addBlock,
            updateBlock,
            removeBlock,
            saveLayout,
            resetLayout,
            isSaving,
            isDirty,
            setIsDirty,
            undo,
            redo,
            canUndo: historyIndex > 0,
            canRedo: historyIndex < history.length - 1,
            saveCheckpoint,
        }}>
            {children}
        </GridContext.Provider>
    );
}
