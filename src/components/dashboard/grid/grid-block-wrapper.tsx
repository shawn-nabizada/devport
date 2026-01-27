'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import {
    GridBlock,
    TextBlockContent,
    ImageBlockContent,
    SkillsBlockContent,
    VideoBlockContent,
    ProjectsBlockContent,
    ExperienceBlockContent,
    EducationBlockContent,
    HobbiesBlockContent,
    ResumeBlockContent
} from '@/lib/db/layout-types';

import { TextBlock } from './blocks/text-block';
import { ImageBlock } from './blocks/image-block';
import { SkillsBlock } from './blocks/skills-block';
import { VideoBlock } from './blocks/video-block';
import { ProjectsBlock } from './blocks/projects-block';
import { ExperienceBlock } from './blocks/experience-block';
import { EducationBlock } from './blocks/education-block';
import { HobbiesBlock } from './blocks/hobbies-block';
import { ResumeBlock } from './blocks/resume-block';

interface GridBlockWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
    block: GridBlock;
    isSelected: boolean;
    isEditMode: boolean;
    onRemove: (id: string) => void;
    onClick: () => void;
    // Props passed by react-grid-layout
    style?: React.CSSProperties;
    className?: string;
    onMouseDown?: React.MouseEventHandler;
    onMouseUp?: React.MouseEventHandler;
    onTouchEnd?: React.TouchEventHandler;
}

export const GridBlockWrapper = forwardRef<HTMLDivElement, GridBlockWrapperProps>(({
    block,
    isSelected,
    isEditMode,
    onRemove,
    onClick,
    style,
    className,
    onMouseDown,
    onMouseUp,
    onTouchEnd,
    children,
    ...props
}, ref) => {

    // Render the specific content based on block type
    const renderContent = () => {
        // Base props without data, we add data explicitly
        const baseProps = {
            blockId: block._id.toString(),
            isEditable: isEditMode
        };

        switch (block.type) {
            case 'text':
                return <TextBlock {...baseProps} data={block.content.data as TextBlockContent} />;
            case 'image':
                return <ImageBlock {...baseProps} data={block.content.data as ImageBlockContent} />;
            case 'skills':
                return <SkillsBlock {...baseProps} data={block.content.data as SkillsBlockContent} />;
            case 'video':
                return <VideoBlock {...baseProps} data={block.content.data as VideoBlockContent} />;
            case 'projects':
                return <ProjectsBlock {...baseProps} data={block.content.data as ProjectsBlockContent} />;
            case 'experience':
                return <ExperienceBlock {...baseProps} data={block.content.data as ExperienceBlockContent} />;
            case 'education':
                return <EducationBlock {...baseProps} data={block.content.data as EducationBlockContent} />;
            case 'hobbies':
                return <HobbiesBlock {...baseProps} data={block.content.data as HobbiesBlockContent} />;
            case 'resume':
                return <ResumeBlock {...baseProps} data={block.content.data as ResumeBlockContent} />;
            default:
                return <div>Unknown block type: {block.type}</div>;
        }
    };

    return (
        <div
            ref={ref}
            style={style}
            className={cn(
                "relative group h-full",
                className,
                isSelected && isEditMode && "z-10"
            )}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onTouchEnd={onTouchEnd}
            onClick={onClick}
            {...props}
        >
            <div className={cn(
                "h-full w-full overflow-hidden rounded-lg bg-card border transition-all duration-200",
                isSelected && isEditMode ? "border-primary ring-2 ring-primary/20 shadow-lg" : "border-border hover:border-primary/50"
            )}>
                {/* Remove Button - Only visible in edit mode */}
                {isEditMode && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(block._id.toString());
                        }}
                        className="absolute top-2 right-2 z-50 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}

                {/* Block Content */}
                <div className="h-full w-full">
                    {renderContent()}
                </div>

                {children}
                {/* Children usually contains resizing handles from react-grid-layout if any, 
                    though we typically use a custom handle or use RGL's default */}
            </div>
        </div>
    );
});

GridBlockWrapper.displayName = 'GridBlockWrapper';
