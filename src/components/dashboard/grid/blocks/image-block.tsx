'use client';

import React from 'react';
import type { ImageBlockContent } from '@/lib/db/layout-types';
import { useTranslation } from '@/lib/i18n';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageBlockProps {
    data: ImageBlockContent;
}

export function ImageBlock({ data }: ImageBlockProps) {
    const { language } = useTranslation();

    const altText = data.alt[language] || data.alt.en;
    const caption = data.caption?.[language] || data.caption?.en;

    if (!data.imageUrl) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 p-4">
                <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No image set</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800">
            <div className="flex-1 relative">
                <Image
                    src={data.imageUrl}
                    alt={altText}
                    fill
                    className={`object-${data.fit}`}
                />
            </div>
            {caption && (
                <p className="text-sm text-gray-600 dark:text-gray-400 p-2 text-center">
                    {caption}
                </p>
            )}
        </div>
    );
}
