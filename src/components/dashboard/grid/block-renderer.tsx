'use client';

import React from 'react';
import type { GridBlock } from '@/lib/db/layout-types';
import { useGridContext } from './grid-context';
import { TextBlock } from './blocks/text-block';
import { ImageBlock } from './blocks/image-block';
import { SkillsBlock } from './blocks/skills-block';
import { SocialBlock } from './blocks/social-block';
import { VideoBlock } from './blocks/video-block';
import { Trash2, GripVertical } from 'lucide-react';

interface BlockRendererProps {
    block: GridBlock;
}

export function BlockRenderer({ block }: BlockRendererProps) {
    const { editMode, selectedBlockId, setSelectedBlockId, removeBlock } = useGridContext();
    const isSelected = selectedBlockId === block._id.toString();

    const handleSelect = () => {
        if (editMode) {
            setSelectedBlockId(block._id.toString());
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this block?')) {
            removeBlock(block._id.toString());
        }
    };

    const renderBlockContent = () => {
        switch (block.content.type) {
            case 'text':
                return <TextBlock data={block.content.data} blockId={block._id.toString()} />;
            case 'image':
                return <ImageBlock data={block.content.data} blockId={block._id.toString()} />;
            case 'skills':
                return <SkillsBlock data={block.content.data} blockId={block._id.toString()} />;
            case 'social':
                return <SocialBlock data={block.content.data} blockId={block._id.toString()} />;
            case 'video':
                return <VideoBlock data={block.content.data} blockId={block._id.toString()} />;
            default:
                return <div className="p-4 text-gray-500">Unknown block type</div>;
        }
    };

    return (
        <div
            onClick={handleSelect}
            className={`
                relative h-full w-full rounded-lg overflow-hidden
                ${editMode ? 'cursor-pointer' : ''}
                ${isSelected ? 'ring-2 ring-blue-500' : ''}
                ${editMode ? 'hover:ring-2 hover:ring-blue-300' : ''}
            `}
        >
            {editMode && (
                <>
                    {/* Drag handle */}
                    <div className="absolute top-2 left-2 z-10 cursor-move p-1 bg-white/80 rounded shadow-sm">
                        <GripVertical className="h-4 w-4 text-gray-500" />
                    </div>

                    {/* Delete button */}
                    <button
                        onClick={handleDelete}
                        className="absolute top-2 right-2 z-10 p-1 bg-red-500 hover:bg-red-600 text-white rounded shadow-sm transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </>
            )}

            <div className="h-full w-full">
                {renderBlockContent()}
            </div>
        </div>
    );
}
