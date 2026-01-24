'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { LayoutItem, GridBlock, DeviceType } from '@/lib/db/layout-types';

interface DeviceLayoutState {
    layout: LayoutItem[];
    blocks: GridBlock[];
    isDirty: boolean;
}

interface GridContextValue {
    // Layout state (current device)
    layout: LayoutItem[];
    setLayout: (layout: LayoutItem[]) => void;

    // Blocks (current device)
    blocks: GridBlock[];
    setBlocks: (blocks: GridBlock[]) => void;

    // Editor state
    editMode: boolean;
    setEditMode: (mode: boolean) => void;
    selectedBlockId: string | null;
    setSelectedBlockId: (id: string | null) => void;

    // Device preview
    device: DeviceType;
    setDevice: (device: DeviceType) => void;

    // Actions
    addBlock: (block: GridBlock) => void;
    updateBlock: (id: string, content: GridBlock['content']) => void;
    removeBlock: (id: string) => void;
    saveLayout: () => Promise<void>;

    // Undo/redo
    undo: () => void;
    redo: () => void;
    saveCheckpoint: () => void;
    canUndo: boolean;
    canRedo: boolean;

    // Loading state
    isSaving: boolean;
    isDirty: boolean;
    isLoadingDevice: boolean;
    readOnly?: boolean;
}

const GridContext = createContext<GridContextValue | null>(null);

export function useGridContext() {
    const context = useContext(GridContext);
    if (!context) {
        throw new Error('useGridContext must be used within a GridProvider');
    }
    return context;
}

interface GridProviderProps {
    children: ReactNode;
    initialLayout?: LayoutItem[];
    initialBlocks?: GridBlock[];
    initialMobileLayout?: LayoutItem[];
    initialMobileBlocks?: GridBlock[];
    readOnly?: boolean;
}

export function GridProvider({
    children,
    initialLayout = [],
    initialBlocks = [],
    initialMobileLayout = [],
    initialMobileBlocks = [],
    readOnly = false
}: GridProviderProps) {
    // Separate state for each device
    const [desktopState, setDesktopState] = useState<DeviceLayoutState>({
        layout: initialLayout,
        blocks: initialBlocks,
        isDirty: false,
    });
    const [mobileState, setMobileState] = useState<DeviceLayoutState>({
        layout: initialMobileLayout,
        blocks: initialMobileBlocks,
        isDirty: false,
    });
    const [mobileLoaded, setMobileLoaded] = useState(initialMobileLayout.length > 0);

    const [editMode, setEditMode] = useState(false);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [device, setDeviceState] = useState<DeviceType>('desktop');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingDevice, setIsLoadingDevice] = useState(false);

    // Get current device state
    const currentState = device === 'desktop' ? desktopState : mobileState;
    const setCurrentState = device === 'desktop' ? setDesktopState : setMobileState;

    const loadDeviceLayout = useCallback(async (targetDevice: DeviceType) => {
        if (readOnly) return;
        setIsLoadingDevice(true);
        try {
            const [layoutRes, blocksRes] = await Promise.all([
                fetch(`/api/layout?device=${targetDevice}`),
                fetch(`/api/blocks?device=${targetDevice}`),
            ]);

            let layoutData: LayoutItem[] = [];
            let blocksData: GridBlock[] = [];

            if (layoutRes.ok) {
                const data = await layoutRes.json();
                layoutData = data.layout || [];
            }

            if (blocksRes.ok) {
                blocksData = await blocksRes.json();
            }

            if (targetDevice === 'mobile') {
                setMobileState({
                    layout: layoutData,
                    blocks: blocksData,
                    isDirty: false,
                });
                setMobileLoaded(true);
            } else {
                setDesktopState({
                    layout: layoutData,
                    blocks: blocksData,
                    isDirty: false,
                });
            }
        } catch (error) {
            console.error(`Failed to load ${targetDevice} layout:`, error);
        } finally {
            setIsLoadingDevice(false);
        }
    }, [readOnly]);

    // Load mobile layout when first switching to mobile
    useEffect(() => {
        if (device === 'mobile' && !mobileLoaded && !readOnly) {
            loadDeviceLayout('mobile');
        }
    }, [device, mobileLoaded, readOnly, loadDeviceLayout]);

    const setDevice = useCallback((newDevice: DeviceType) => {
        // Clear selection when switching devices
        setSelectedBlockId(null);
        setDeviceState(newDevice);
    }, []);

    const setLayout = useCallback((newLayout: LayoutItem[]) => {
        setCurrentState(prev => ({
            ...prev,
            layout: newLayout,
            isDirty: true,
        }));
    }, [setCurrentState]);

    const setBlocks = useCallback((newBlocks: GridBlock[]) => {
        setCurrentState(prev => ({
            ...prev,
            blocks: newBlocks,
            isDirty: true,
        }));
    }, [setCurrentState]);

    const addBlock = useCallback((block: GridBlock) => {
        setCurrentState(prev => {
            const maxY = prev.layout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
            return {
                ...prev,
                blocks: [...prev.blocks, block],
                layout: [
                    ...prev.layout,
                    {
                        i: block._id.toString(),
                        x: 0,
                        y: maxY,
                        w: device === 'desktop' ? 4 : 2,
                        h: 2,
                        minW: device === 'desktop' ? 2 : 1,
                        minH: 1,
                    },
                ],
                isDirty: true,
            };
        });
    }, [device, setCurrentState]);

    const updateBlock = useCallback((id: string, content: GridBlock['content']) => {
        setCurrentState(prev => ({
            ...prev,
            blocks: prev.blocks.map(block =>
                block._id.toString() === id
                    ? { ...block, content, updatedAt: new Date() }
                    : block
            ),
            isDirty: true,
        }));
    }, [setCurrentState]);

    const removeBlock = useCallback((id: string) => {
        setCurrentState(prev => ({
            ...prev,
            blocks: prev.blocks.filter(block => block._id.toString() !== id),
            layout: prev.layout.filter(item => item.i !== id),
            isDirty: true,
        }));
    }, [setCurrentState]);

    const saveLayout = useCallback(async () => {
        if (readOnly) return;
        setIsSaving(true);
        try {
            // Save layout for current device
            await fetch('/api/layout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    device,
                    layout: currentState.layout,
                    enabled: true
                }),
            });

            // Save each modified block (with device association)
            for (const block of currentState.blocks) {
                await fetch(`/api/blocks/${block._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: block.content,
                        device, // Save which device this block config is for
                    }),
                });
            }

            // Mark current device as not dirty
            setCurrentState(prev => ({
                ...prev,
                isDirty: false,
            }));
        } catch (error) {
            console.error('Failed to save layout:', error);
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [device, currentState, setCurrentState, readOnly]);

    // History State
    const [history, setHistory] = useState<{ past: DeviceLayoutState[]; future: DeviceLayoutState[] }>({ past: [], future: [] });

    // Reset history on device change
    useEffect(() => {
        setHistory({ past: [], future: [] });
    }, [device]);

    const saveCheckpoint = useCallback(() => {
        setHistory(prev => ({
            past: [...prev.past, { ...currentState }], // Deep copy state? layout/blocks refer to arrays. { ...currentState } shadows.
            future: []
        }));
    }, [currentState]);

    const undo = useCallback(() => {
        setHistory(prev => {
            if (prev.past.length === 0) return prev;
            const newPast = [...prev.past];
            const previousState = newPast.pop()!;

            // Push current to future
            const newFuture = [{ ...currentState }, ...prev.future];

            // Restore state
            setCurrentState(previousState);

            return {
                past: newPast,
                future: newFuture
            };
        });
    }, [currentState, setCurrentState]);

    const redo = useCallback(() => {
        setHistory(prev => {
            if (prev.future.length === 0) return prev;
            const newFuture = [...prev.future];
            const nextState = newFuture.shift()!;

            // Push current to past
            const newPast = [...prev.past, { ...currentState }];

            // Restore state
            setCurrentState(nextState);

            return {
                past: newPast,
                future: newFuture
            };
        });
    }, [currentState, setCurrentState]);

    // Wrap state setters to support history where needed?
    // Actually, we rely on manual saveCheckpoint() calls in Editor.

    const value: GridContextValue = {
        layout: currentState.layout,
        setLayout,
        blocks: currentState.blocks,
        setBlocks,
        editMode,
        setEditMode,
        selectedBlockId,
        setSelectedBlockId,
        device,
        setDevice,
        addBlock,
        updateBlock,
        removeBlock,
        saveLayout,
        isSaving,
        isDirty: currentState.isDirty,
        isLoadingDevice,
        readOnly,
        undo,
        redo,
        saveCheckpoint,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
    };

    return <GridContext.Provider value={value}>{children}</GridContext.Provider>;
}

