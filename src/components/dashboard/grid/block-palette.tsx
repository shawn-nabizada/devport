'use client';

import React, { useState, useEffect } from 'react';
import { useGridContext } from './grid-context';
import { useTranslation } from '@/lib/i18n';
import { PRESET_THEMES, ThemeConfig, ThemeId, getThemeById } from '@/lib/db/theme-types';
import {
    Type,
    Image,
    BarChart3,
    Share2,
    Video,
    Plus,
    Palette,
    Check,
    Loader2,
} from 'lucide-react';
import type { BlockType, GridBlock, BlockContent } from '@/lib/db/layout-types';

const blockTypes: { type: BlockType; icon: React.ElementType; label: string }[] = [
    { type: 'text', icon: Type, label: 'Text' },
    { type: 'image', icon: Image, label: 'Image' },
    { type: 'skills', icon: BarChart3, label: 'Skills' },
    { type: 'social', icon: Share2, label: 'Social' },
    { type: 'video', icon: Video, label: 'Video' },
];

function getDefaultContent(type: BlockType): BlockContent {
    switch (type) {
        case 'text':
            return {
                type: 'text',
                data: {
                    variant: 'paragraph',
                    text: { en: 'New text block', fr: 'Nouveau bloc de texte' },
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
        case 'social':
            return {
                type: 'social',
                data: {
                    links: [],
                    displayStyle: 'icons',
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
    }
}

function ThemeMiniCard({
    theme,
    isSelected,
    onSelect,
    language
}: {
    theme: ThemeConfig;
    isSelected: boolean;
    onSelect: () => void;
    language: 'en' | 'fr';
}) {
    return (
        <button
            onClick={onSelect}
            className={`
                w-full p-2 rounded-lg border-2 transition-all text-left
                ${isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
            `}
        >
            {/* Mini theme preview */}
            <div
                className="h-8 rounded mb-1.5 relative overflow-hidden"
                style={{ background: `hsl(${theme.colors.light.background})` }}
            >
                <div
                    className="absolute top-1 left-1 w-8 h-1.5 rounded-full"
                    style={{ background: `hsl(${theme.colors.light.primary})` }}
                />
                <div
                    className="absolute top-3.5 left-1 w-5 h-1 rounded"
                    style={{ background: `hsl(${theme.colors.light.foreground})` }}
                />
                <div
                    className="absolute top-5.5 left-1 w-6 h-1 rounded"
                    style={{ background: `hsl(${theme.colors.light.muted})` }}
                />
                {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                )}
            </div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                {theme.name[language]}
            </p>
        </button>
    );
}

export function BlockPalette() {
    const { editMode, addBlock } = useGridContext();
    const { t, language } = useTranslation();

    // Theme state
    const [currentThemeId, setCurrentThemeId] = useState<ThemeId>('minimalist');
    const [isSavingTheme, setIsSavingTheme] = useState(false);
    const [themeSaved, setThemeSaved] = useState(false);

    // Load current theme on mount
    useEffect(() => {
        async function loadTheme() {
            try {
                const res = await fetch('/api/theme');
                if (res.ok) {
                    const data = await res.json();
                    setCurrentThemeId(data.themeId || 'minimalist');
                }
            } catch {
                // Use default
            }
        }
        loadTheme();
    }, []);

    // Apply theme CSS variables
    const applyTheme = (theme: ThemeConfig) => {
        const root = document.documentElement;
        const isDark = root.classList.contains('dark');
        const colors = isDark ? theme.colors.dark : theme.colors.light;

        Object.entries(colors).forEach(([key, value]) => {
            const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            root.style.setProperty(cssVarName, value);
        });

        root.style.setProperty('--font-family', theme.typography.fontFamily);
        root.style.setProperty('--heading-font-family', theme.typography.headingFontFamily);
        root.style.setProperty('--radius', theme.spacing.borderRadius);
    };

    const handleThemeSelect = async (themeId: ThemeId) => {
        const theme = getThemeById(themeId);
        if (!theme) return;

        setCurrentThemeId(themeId);
        applyTheme(theme);

        // Auto-save theme
        setIsSavingTheme(true);
        try {
            await fetch('/api/theme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ themeId }),
            });
            setThemeSaved(true);
            setTimeout(() => setThemeSaved(false), 2000);
        } catch (error) {
            console.error('Failed to save theme:', error);
        } finally {
            setIsSavingTheme(false);
        }
    };

    const handleAddBlock = async (type: BlockType) => {
        if (!editMode) return;

        try {
            const content = getDefaultContent(type);

            const res = await fetch('/api/blocks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, content: content.data }),
            });

            if (res.ok) {
                const newBlock = await res.json();
                addBlock(newBlock as GridBlock);
            }
        } catch (error) {
            console.error('Failed to create block:', error);
        }
    };

    return (
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            {/* Blocks Section */}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t('dashboard.layoutEditor.blocks')}
            </h2>

            {!editMode && (
                <p className="text-sm text-gray-500 mb-4">
                    {t('dashboard.layoutEditor.enableEditMode')}
                </p>
            )}

            <div className="space-y-2 mb-6">
                {blockTypes.map(({ type, icon: Icon, label }) => (
                    <button
                        key={type}
                        onClick={() => handleAddBlock(type)}
                        disabled={!editMode}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm
                            ${editMode
                                ? 'bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                            }
                        `}
                    >
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{label}</span>
                        {editMode && <Plus className="h-3 w-3 ml-auto opacity-50" />}
                    </button>
                ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

            {/* Themes Section */}
            <div className="flex items-center gap-2 mb-3">
                <Palette className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('dashboard.themes.title')}
                </h2>
                {isSavingTheme && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                {themeSaved && <Check className="h-4 w-4 text-green-500" />}
            </div>

            <div className="grid grid-cols-2 gap-2">
                {PRESET_THEMES.map((theme) => (
                    <ThemeMiniCard
                        key={theme.id}
                        theme={theme}
                        isSelected={currentThemeId === theme.id}
                        onSelect={() => handleThemeSelect(theme.id)}
                        language={language}
                    />
                ))}
            </div>
        </aside>
    );
}

