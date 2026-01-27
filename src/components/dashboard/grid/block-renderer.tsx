'use client';

import React from 'react';
import { GridBlock } from '@/lib/db/layout-types';
import { GridBlockWrapper } from './grid-block-wrapper';

interface BlockRendererProps {
    block: GridBlock;
    className?: string;
}

export function BlockRenderer({ block, className }: BlockRendererProps) {
    return (
        <div className={className} style={{ width: '100%', height: '100%', minHeight: '200px' }}>
            <GridBlockWrapper
                block={block}
                isSelected={false}
                isEditMode={false}
                onRemove={() => { }}
                onClick={() => { }}
                className="h-full"
            />
        </div>
    );
}
