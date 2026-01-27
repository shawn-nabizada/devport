'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { useTheme } from 'next-themes';
import { useGridContext } from './grid-context';
import { useTranslation } from '@/lib/i18n';
import {
    PRESET_THEMES,
    FONT_OPTIONS,
    ThemeId,
    ThemeColors,
} from '@/lib/db/theme-types';
import {
    ArrowLeft,
    Monitor,
    Smartphone,
    Edit3,
    Eye,
    Save,
    Loader2,
    Type,
    Image,
    BarChart3,
    Video,
    FolderKanban,
    Briefcase,
    GraduationCap,
    Heart,
    FileText,
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Palette,
    ChevronDown,
    ChevronUp,
    Undo,
    Redo,
    RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { BlockType, GridBlock, BlockContent, TextBlockContent } from '@/lib/db/layout-types';

// Tab types
type TabId = 'home' | 'insert' | 'design';

// Block types for insert tab
const blockTypes: { type: BlockType; icon: React.ElementType; labelKey: string }[] = [
    { type: 'text', icon: Type, labelKey: 'text' },
    { type: 'image', icon: Image, labelKey: 'image' },
    { type: 'skills', icon: BarChart3, labelKey: 'skills' },
    { type: 'video', icon: Video, labelKey: 'video' },
    { type: 'projects', icon: FolderKanban, labelKey: 'projects' },
    { type: 'experience', icon: Briefcase, labelKey: 'experience' },
    { type: 'education', icon: GraduationCap, labelKey: 'education' },
    { type: 'hobbies', icon: Heart, labelKey: 'hobbies' },
    { type: 'resume', icon: FileText, labelKey: 'resume' },
];

// Font sizes
const fontSizes = ['12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '64', '72'];

function getDefaultContent(type: BlockType): BlockContent {
    switch (type) {
        case 'text':
            return {
                type: 'text',
                data: {
                    variant: 'paragraph',
                    text: { en: 'New text block', fr: 'Nouveau bloc de texte' },
                    fontSize: 16,
                    fontWeight: 'normal',
                    fontStyle: 'normal',
                    textDecoration: 'none',
                    textAlign: 'left',
                },
            };
        case 'image':
            return {
                type: 'image',
                data: {
                    imageUrl: '',
                    alt: { en: 'Image', fr: 'Image' },
                    fit: 'cover',
                },
            };
        case 'skills':
            return {
                type: 'skills',
                data: {
                    skillIds: [],
                    showLabels: true,
                    showPercentage: true,
                    layout: 'vertical',
                },
            };
        case 'video':
            return {
                type: 'video',
                data: {
                    source: 'youtube',
                    url: '',
                    autoplay: false,
                    muted: true,
                },
            };
        case 'projects':
            return {
                type: 'projects',
                data: {
                    projectIds: [],
                    layout: 'grid',
                    showDescription: true,
                    showTechnologies: true,
                    featuredOnly: false,

                },
            };
        case 'experience':
            return {
                type: 'experience',
                data: {
                    experienceIds: [],
                    layout: 'timeline',
                    showDescription: true,
                },
            };
        case 'education':
            return {
                type: 'education',
                data: {
                    educationIds: [],
                    layout: 'timeline',
                    showDescription: true,
                },
            };
        case 'hobbies':
            return {
                type: 'hobbies',
                data: {
                    layout: 'tags',
                },
            };
        case 'resume':
            return {
                type: 'resume',
                data: {
                    displayStyle: 'buttons',
                    showBothLanguages: true,
                },
            };
    }
}

interface RibbonToolbarProps {
    currentThemeId: ThemeId;
    currentCustomColors: Partial<ThemeColors>;
    onThemeSelect: (id: ThemeId) => void;
    onCustomColorChange: (colorName: string, colorValue: string) => void;
}

export function RibbonToolbar({
    currentThemeId,
    currentCustomColors,
    onThemeSelect,
    onCustomColorChange
}: RibbonToolbarProps) {
    const {
        editMode,
        setEditMode,
        device,
        setDevice,
        updateGridSettings,
        resetLayout,
        blocks,
        selectedBlockId,
        saveLayout,
        saveCheckpoint,
        addBlock,
        updateBlock,
        isDirty,
        undo,
        redo,
        canUndo,
        canRedo,
        isSaving,
        cols,
        rowHeight,
    } = useGridContext();
    const { t, language } = useTranslation();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _theme = useTheme(); // Keep hook call but suppress unused warning if intentionally keeping imports

    // Tab state
    const [activeTab, setActiveTab] = useState<TabId>('home');
    const [customExpanded, setCustomExpanded] = useState(false);

    // Get selected block for formatting
    const selectedBlock = blocks.find(b => b._id.toString() === selectedBlockId);
    const isTextBlock = selectedBlock?.type === 'text';
    const textContent = isTextBlock ? (selectedBlock.content.data as TextBlockContent) : null;

    const handleSave = async () => {
        try {
            await saveLayout();
            setEditMode(false);
        } catch (error) {
            console.error('Save failed:', error);
        }
    };

    const handleAddBlock = async (type: BlockType) => {
        if (!editMode) return;

        try {
            saveCheckpoint();
            const content = getDefaultContent(type);

            const res = await fetch('/api/blocks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, content: content.data, device }),
            });

            if (res.ok) {
                const newBlock = await res.json();
                addBlock(newBlock as GridBlock);
            }
        } catch (error) {
            console.error('Failed to create block:', error);
        }
    };

    // Text formatting handlers
    const updateTextFormatting = (updates: Partial<TextBlockContent>) => {
        if (!selectedBlockId || !isTextBlock || !textContent) return;

        const newContent: BlockContent = {
            type: 'text',
            data: { ...textContent, ...updates },
        };
        updateBlock(selectedBlockId, newContent);
    };

    const toggleBold = () => {
        updateTextFormatting({
            fontWeight: textContent?.fontWeight === 'bold' ? 'normal' : 'bold',
        });
    };

    const toggleItalic = () => {
        updateTextFormatting({
            fontStyle: textContent?.fontStyle === 'italic' ? 'normal' : 'italic',
        });
    };

    const toggleUnderline = () => {
        updateTextFormatting({
            textDecoration: textContent?.textDecoration === 'underline' ? 'none' : 'underline',
        });
    };

    const setAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
        updateTextFormatting({ textAlign: align });
    };

    const setFontSize = (size: string) => {
        updateTextFormatting({ fontSize: parseInt(size) });
    };



    // Warn on navigation with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    const tabs = [
        { id: 'home' as TabId, label: t('dashboard.layoutEditor.tabHome') },
        { id: 'insert' as TabId, label: t('dashboard.layoutEditor.tabInsert') },
        { id: 'design' as TabId, label: t('dashboard.layoutEditor.tabDesign') },
    ];

    return (
        <div className="sticky top-0 z-50 bg-card border-b border-border">
            {/* Top Bar - Back, Device Toggle (centered), Edit/Preview, Save */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                {/* Left: Back + Title */}
                <div className="flex items-center gap-4 flex-1">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm">{t('common.back')}</span>
                    </Link>
                    <h1 className="text-lg font-semibold text-foreground">
                        {t('dashboard.layoutEditor.title')}
                    </h1>
                </div>

                {/* Left Center: Undo/Redo */}
                <div className="flex items-center gap-1 mx-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={undo}
                        disabled={!canUndo || !editMode}
                        title="Undo (Ctrl+Z)"
                        className="h-8 w-8"
                    >
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={redo}
                        disabled={!canRedo || !editMode}
                        title="Redo (Ctrl+Y)"
                        className="h-8 w-8"
                    >
                        <Redo className="h-4 w-4" />
                    </Button>
                </div>

                {/* Center: Device Toggle */}
                <div className="flex items-center gap-1 bg-muted rounded-md p-1">
                    <button
                        onClick={() => setDevice('desktop')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${device === 'desktop'
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Monitor className="h-4 w-4" />
                        <span>{t('dashboard.layoutEditor.desktop')}</span>
                    </button>
                    <button
                        onClick={() => setDevice('mobile')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${device === 'mobile'
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Smartphone className="h-4 w-4" />
                        <span>{t('dashboard.layoutEditor.mobile')}</span>
                    </button>
                </div>

                {/* Right: Reset, Edit/Preview, Save */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                    {/* Reset Button */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                <RotateCcw className="h-4 w-4 mr-2" />
                                {t('common.reset') === 'common.reset' ? 'Reset' : t('common.reset')}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{t('dashboard.layoutEditor.resetTitle') === 'dashboard.layoutEditor.resetTitle' ? 'Reset Layout?' : t('dashboard.layoutEditor.resetTitle')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t('dashboard.layoutEditor.resetDescription') === 'dashboard.layoutEditor.resetDescription' ? 'This will remove all blocks from your portfolio. This action can be undone using the Undo button.' : t('dashboard.layoutEditor.resetDescription')}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t('common.cancel') === 'common.cancel' ? 'Cancel' : t('common.cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={resetLayout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    {t('common.reset') === 'common.reset' ? 'Reset' : t('common.reset')}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Edit/Preview Toggle */}
                    <button
                        onClick={() => setEditMode(!editMode)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${editMode
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            }`}
                    >
                        {editMode ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span>{editMode ? t('dashboard.layoutEditor.editing') : t('dashboard.layoutEditor.preview')}</span>
                    </button>

                    {/* Save Button */}
                    <Button onClick={handleSave} disabled={isSaving || !isDirty} size="sm">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        {t('common.save')}
                    </Button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 px-4 pt-1 bg-muted/30">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${activeTab === tab.id
                            ? 'bg-card text-foreground border-t border-x border-border -mb-px'
                            : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="px-4 py-3 min-h-[64px] bg-card">
                {/* Home Tab - Text Formatting OR Global Settings */}
                {activeTab === 'home' && (
                    <div className="flex items-center gap-4 flex-wrap">
                        {/* Always show Layout Settings */}
                        <div className="flex items-center gap-6">
                            <span className="text-xs font-medium text-foreground">{t('dashboard.layoutEditor.layoutSettings')}:</span>
                            <div className="flex items-center gap-3">
                                <label className="text-xs text-muted-foreground">{t('dashboard.layoutEditor.columns')}:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="24"
                                    value={cols}
                                    onChange={(e) => updateGridSettings({ cols: Math.max(1, Math.min(24, parseInt(e.target.value) || 12)) })}
                                    className="w-16 px-2 py-1 bg-input border border-border rounded text-xs text-foreground"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-xs text-muted-foreground">{t('dashboard.layoutEditor.rowHeight')}:</label>
                                <input
                                    type="number"
                                    min="20"
                                    max="500"
                                    value={rowHeight}
                                    onChange={(e) => updateGridSettings({ rowHeight: Math.max(20, Math.min(500, parseInt(e.target.value) || 60)) })}
                                    className="w-16 px-2 py-1 bg-input border border-border rounded text-xs text-foreground"
                                />
                            </div>
                        </div>

                        {/* Separator if text formatting options are shown */}
                        {isTextBlock && <div className="h-8 w-px bg-border hidden sm:block" />}

                        {/* Text Formatting Options */}
                        {isTextBlock && (
                            <>
                                {/* Font Size */}
                                <div className="flex items-center gap-2">
                                    <select
                                        value={textContent?.fontSize?.toString() || '16'}
                                        onChange={(e) => setFontSize(e.target.value)}
                                        className="px-2 py-1.5 bg-input border border-border rounded text-sm text-foreground w-20"
                                    >
                                        {fontSizes.map((size) => (
                                            <option key={size} value={size}>{size}px</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="h-8 w-px bg-border" />

                                {/* Text Formatting */}
                                <div className="flex items-center gap-1">
                                    <button
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={toggleBold}
                                        className={`p-2 rounded transition-colors ${textContent?.fontWeight === 'bold' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'}`}
                                    >
                                        <Bold className="h-4 w-4" />
                                    </button>
                                    <button
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={toggleItalic}
                                        className={`p-2 rounded transition-colors ${textContent?.fontStyle === 'italic' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'}`}
                                    >
                                        <Italic className="h-4 w-4" />
                                    </button>
                                    <button
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={toggleUnderline}
                                        className={`p-2 rounded transition-colors ${textContent?.textDecoration === 'underline' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'}`}
                                    >
                                        <Underline className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="h-8 w-px bg-border" />

                                {/* Text Alignment */}
                                <div className="flex items-center gap-1">
                                    <button
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => setAlignment('left')}
                                        className={`p-2 rounded transition-colors ${textContent?.textAlign === 'left' || !textContent?.textAlign ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'}`}
                                    >
                                        <AlignLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => setAlignment('center')}
                                        className={`p-2 rounded transition-colors ${textContent?.textAlign === 'center' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'}`}
                                    >
                                        <AlignCenter className="h-4 w-4" />
                                    </button>
                                    <button
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => setAlignment('right')}
                                        className={`p-2 rounded transition-colors ${textContent?.textAlign === 'right' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'}`}
                                    >
                                        <AlignRight className="h-4 w-4" />
                                    </button>
                                    <button
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => setAlignment('justify')}
                                        className={`p-2 rounded transition-colors ${textContent?.textAlign === 'justify' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'}`}
                                    >
                                        <AlignJustify className="h-4 w-4" />
                                    </button>
                                </div>
                            </>
                        )}

                        {!isTextBlock && (
                            <span className="text-sm text-muted-foreground ml-auto">
                                {t('dashboard.layoutEditor.selectTextBlock')}
                            </span>
                        )}
                    </div>
                )}

                {/* Insert Tab */}
                {activeTab === 'insert' && (
                    <div className="flex items-center gap-2">
                        {blockTypes.map(({ type, icon: Icon, labelKey }) => (
                            <button
                                key={type}
                                onClick={() => handleAddBlock(type)}
                                disabled={!editMode}
                                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-md transition-colors ${editMode
                                    ? 'hover:bg-muted text-foreground'
                                    : 'text-muted-foreground cursor-not-allowed opacity-50'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-xs">{t(`dashboard.layoutEditor.${labelKey}` as string)}</span>
                            </button>
                        ))}

                        {!editMode && (
                            <span className="text-sm text-muted-foreground ml-4">
                                {t('dashboard.layoutEditor.enableEditMode')}
                            </span>
                        )}
                    </div>
                )}

                {/* Design Tab */}
                {activeTab === 'design' && (
                    <div className="flex items-center gap-6">
                        {/* Theme Selector */}
                        <div className="flex items-center gap-3">
                            <Palette className="h-4 w-4 text-muted-foreground" />
                            <select
                                value={currentThemeId}
                                onChange={(e) => onThemeSelect(e.target.value as ThemeId)}
                                className="px-3 py-1.5 bg-input border border-border rounded text-sm text-foreground min-w-[160px]"
                            >
                                {PRESET_THEMES.map((theme) => (
                                    <option key={theme.id} value={theme.id}>
                                        {theme.name[language]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="h-8 w-px bg-border" />

                        {/* Theme Preview Swatches */}
                        <div className="flex items-center gap-2">
                            {PRESET_THEMES.map((themeOption) => (
                                <button
                                    key={themeOption.id}
                                    onClick={() => onThemeSelect(themeOption.id)}
                                    className={`w-6 h-6 rounded-full border-2 transition-all ${currentThemeId === themeOption.id
                                        ? 'border-primary ring-2 ring-primary/20'
                                        : 'border-border hover:border-muted-foreground'
                                        }`}
                                    style={{ backgroundColor: themeOption.colors.light.primary }}
                                    title={themeOption.name[language]}
                                />
                            ))}
                        </div>

                        {/* Custom Design Expander - Always visible */}
                        <div className="h-8 w-px bg-border" />
                        <button
                            onClick={() => setCustomExpanded(!customExpanded)}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                            {customExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            {t('dashboard.layoutEditor.customize')}
                        </button>
                    </div>
                )}
            </div>

            {/* Custom Design Panel (expanded) - Available for all themes */}
            {activeTab === 'design' && customExpanded && (
                <div className="px-4 py-3 bg-muted/30 border-t border-border space-y-4">
                    {/* Layout Grid Settings */}
                    <div className="flex items-center gap-6 pb-4 border-b border-border/50">
                        <span className="text-xs font-medium text-foreground">{t('dashboard.layoutEditor.layoutSettings')}:</span>
                        <div className="flex items-center gap-3">
                            <label className="text-xs text-muted-foreground">{t('dashboard.layoutEditor.columns')}:</label>
                            <input
                                type="number"
                                min="1"
                                max="24"
                                value={cols}
                                onChange={(e) => updateGridSettings({ cols: Math.max(1, Math.min(24, parseInt(e.target.value) || 12)) })}
                                className="w-16 px-2 py-1 bg-input border border-border rounded text-xs text-foreground"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-xs text-muted-foreground">{t('dashboard.layoutEditor.rowHeight')}:</label>
                            <input
                                type="number"
                                min="20"
                                max="500"
                                value={rowHeight}
                                onChange={(e) => updateGridSettings({ rowHeight: Math.max(20, Math.min(500, parseInt(e.target.value) || 60)) })}
                                className="w-16 px-2 py-1 bg-input border border-border rounded text-xs text-foreground"
                            />
                        </div>
                    </div>

                    {/* Font Dropdowns */}
                    <div className="flex items-center gap-6">
                        <span className="text-xs font-medium text-foreground">{t('dashboard.layoutEditor.fonts')}:</span>
                        <div className="flex items-center gap-3">
                            <label className="text-xs text-muted-foreground">{t('dashboard.layoutEditor.sans')}:</label>
                            <select className="px-2 py-1 bg-input border border-border rounded text-xs text-foreground">
                                {FONT_OPTIONS.filter(f => f.value.includes('sans') || f.value.includes('Inter') || f.value.includes('Roboto')).map((font) => (
                                    <option key={font.value} value={font.value}>{font.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-xs text-muted-foreground">{t('dashboard.layoutEditor.serif')}:</label>
                            <select className="px-2 py-1 bg-input border border-border rounded text-xs text-foreground">
                                {FONT_OPTIONS.filter(f => f.value.includes('serif') || f.value.includes('Playfair')).map((font) => (
                                    <option key={font.value} value={font.value}>{font.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-xs text-muted-foreground">{t('dashboard.layoutEditor.mono')}:</label>
                            <select className="px-2 py-1 bg-input border border-border rounded text-xs text-foreground">
                                {FONT_OPTIONS.filter(f => f.value.includes('mono') || f.value.includes('JetBrains')).map((font) => (
                                    <option key={font.value} value={font.value}>{font.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Color Fields */}
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="text-xs font-medium text-foreground">{t('dashboard.layoutEditor.colors')}:</span>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-muted-foreground">{t('dashboard.layoutEditor.primary')}:</label>
                            <input
                                type="color"
                                className="w-6 h-6 rounded border border-border cursor-pointer"
                                value={currentCustomColors.primary || '#000000'}
                                onChange={(e) => onCustomColorChange('primary', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-muted-foreground">{t('dashboard.layoutEditor.secondary')}:</label>
                            <input
                                type="color"
                                className="w-6 h-6 rounded border border-border cursor-pointer"
                                value={currentCustomColors.secondary || '#000000'}
                                onChange={(e) => onCustomColorChange('secondary', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-muted-foreground">{t('dashboard.layoutEditor.accent')}:</label>
                            <input
                                type="color"
                                className="w-6 h-6 rounded border border-border cursor-pointer"
                                value={currentCustomColors.accent || '#000000'}
                                onChange={(e) => onCustomColorChange('accent', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-muted-foreground">{t('dashboard.layoutEditor.background')}:</label>
                            <input
                                type="color"
                                className="w-6 h-6 rounded border border-border cursor-pointer"
                                value={currentCustomColors.background || '#000000'}
                                onChange={(e) => onCustomColorChange('background', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-muted-foreground">{t('dashboard.layoutEditor.foreground')}:</label>
                            <input
                                type="color"
                                className="w-6 h-6 rounded border border-border cursor-pointer"
                                value={currentCustomColors.foreground || '#000000'}
                                onChange={(e) => onCustomColorChange('foreground', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-muted-foreground">{t('dashboard.layoutEditor.card')}:</label>
                            <input
                                type="color"
                                className="w-6 h-6 rounded border border-border cursor-pointer"
                                value={currentCustomColors.card || '#000000'}
                                onChange={(e) => onCustomColorChange('card', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-muted-foreground">{t('dashboard.layoutEditor.muted')}:</label>
                            <input
                                type="color"
                                className="w-6 h-6 rounded border border-border cursor-pointer"
                                value={currentCustomColors.muted || '#000000'}
                                onChange={(e) => onCustomColorChange('muted', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-muted-foreground">{t('dashboard.layoutEditor.border')}:</label>
                            <input
                                type="color"
                                className="w-6 h-6 rounded border border-border cursor-pointer"
                                value={currentCustomColors.border || '#000000'}
                                onChange={(e) => onCustomColorChange('border', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
