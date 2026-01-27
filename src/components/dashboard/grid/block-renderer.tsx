'use client';

import React, { memo } from 'react';
import type { GridBlock } from '@/lib/db/layout-types';
import { useGridContext } from './grid-context';
import { TextBlock } from './blocks/text-block';
import { ImageBlock } from './blocks/image-block';
import { SkillsBlock } from './blocks/skills-block';
import { VideoBlock } from './blocks/video-block';
import { ProjectsBlock } from './blocks/projects-block';
import { ExperienceBlock } from './blocks/experience-block';
import { EducationBlock } from './blocks/education-block';
import { HobbiesBlock } from './blocks/hobbies-block';
import { ResumeBlock } from './blocks/resume-block';
import { Trash2, GripVertical } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
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

interface BlockRendererProps {
    block: GridBlock;
    onInteract?: (blockId: string) => void;
}

function BlockRendererComponent({ block, onInteract }: BlockRendererProps) {
    const { editMode, selectedBlockId, setSelectedBlockId, removeBlock, saveCheckpoint } = useGridContext();
    const isSelected = selectedBlockId === block._id.toString();

    const handleSelect = () => {
        if (editMode) {
            setSelectedBlockId(block._id.toString());
        } else if (onInteract) {
            onInteract(block._id.toString());
        }
    };

    const handleDelete = () => {
        saveCheckpoint(); // Checkpoint before delete
        removeBlock(block._id.toString());
    };

    const renderBlockContent = () => {
        switch (block.content.type) {
            case 'text':
                return <TextBlock data={block.content.data} blockId={block._id.toString()} />;
            case 'image':
                return <ImageBlock data={block.content.data} blockId={block._id.toString()} />;
            case 'skills':
                return <SkillsBlock data={block.content.data} />;
            case 'video':
                return <VideoBlock data={block.content.data} />;
            case 'projects':
                return <ProjectsBlock data={block.content.data} />;
            case 'experience':
                return <ExperienceBlock data={block.content.data} />;
            case 'education':
                return <EducationBlock data={block.content.data} />;
            case 'hobbies':
                return <HobbiesBlock data={block.content.data} />;
            case 'resume':
                return <ResumeBlock data={block.content.data} />;
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

                    {/* Delete button with alert dialog */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button
                                onClick={(e) => e.stopPropagation()}
                                className="absolute top-2 right-2 z-10 p-1 bg-red-500 hover:bg-red-600 text-white rounded shadow-sm transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Block?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete this block? This action cannot be undone unless you use the undo button immediately.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            )}

            <div className="h-full w-full">
                <ErrorBoundary>
                    {renderBlockContent()}
                </ErrorBoundary>
            </div>
        </div>
    );
}

export const BlockRenderer = memo(BlockRendererComponent);
