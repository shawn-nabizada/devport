'use client';

import React from 'react';
import { useGridContext } from './grid-context';
import { useTranslation } from '@/lib/i18n';
import { ThemeEditor } from './theme-editor';
import {
    Type,
    Image,
    BarChart3,
    Video,
    FolderKanban,
    Briefcase,
    GraduationCap,
    Heart,
    FileText,
    Plus,
} from 'lucide-react';
import type { BlockType, GridBlock, BlockContent } from '@/lib/db/layout-types';

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

export function BlockPalette() {
    const { editMode, addBlock } = useGridContext();
    const { t } = useTranslation();

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
        <aside className="w-64 bg-card border-r border-border p-4 overflow-y-auto">
            {/* Blocks Section */}
            <h2 className="text-lg font-semibold text-foreground mb-3">
                {t('dashboard.layoutEditor.blocks')}
            </h2>

            {!editMode && (
                <p className="text-sm text-muted-foreground mb-4">
                    {t('dashboard.layoutEditor.enableEditMode')}
                </p>
            )}

            <div className="space-y-2 mb-6">
                {blockTypes.map(({ type, icon: Icon, labelKey }) => (
                    <button
                        key={type}
                        onClick={() => handleAddBlock(type)}
                        disabled={!editMode}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm
                            ${editMode
                                ? 'bg-secondary/50 hover:bg-primary/10 text-foreground hover:text-primary'
                                : 'bg-muted text-muted-foreground cursor-not-allowed'
                            }
                        `}
                    >
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{t(`dashboard.layoutEditor.${labelKey}` as string)}</span>
                        {editMode && <Plus className="h-3 w-3 ml-auto opacity-50" />}
                    </button>
                ))}
            </div>

            {/* Divider */}
            <div className="border-t border-border my-4" />

            {/* Theme Editor */}
            <ThemeEditor />
        </aside>
    );
}
