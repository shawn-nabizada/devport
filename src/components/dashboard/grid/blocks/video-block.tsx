'use client';

import React from 'react';
import type { VideoBlockContent } from '@/lib/db/layout-types';
import { useTranslation } from '@/lib/i18n';
import { Video } from 'lucide-react';

interface VideoBlockProps {
    data: VideoBlockContent;
}

function getEmbedUrl(source: VideoBlockContent['source'], url: string): string | null {
    if (source === 'upload') {
        return url;
    }

    if (source === 'youtube') {
        // Extract video ID from various YouTube URL formats
        const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (match) {
            return `https://www.youtube.com/embed/${match[1]}`;
        }
    }

    if (source === 'vimeo') {
        // Extract video ID from Vimeo URL
        const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        if (match) {
            return `https://player.vimeo.com/video/${match[1]}`;
        }
    }

    return url;
}

export function VideoBlock({ data }: VideoBlockProps) {
    const { language } = useTranslation();
    const title = data.title?.[language] || data.title?.en;

    if (!data.url) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-card/50 p-4">
                <Video className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No video set</p>
            </div>
        );
    }

    const embedUrl = getEmbedUrl(data.source, data.url);

    if (data.source === 'upload') {
        return (
            <div className="h-full flex flex-col bg-card/50">
                <div className="flex-1 relative">
                    <video
                        src={data.url}
                        className="w-full h-full object-cover"
                        autoPlay={data.autoplay}
                        muted={data.muted}
                        controls
                        playsInline
                    />
                </div>
                {title && (
                    <p className="text-sm font-medium text-foreground p-2 text-center">
                        {title}
                    </p>
                )}
            </div>
        );
    }

    // YouTube or Vimeo embed
    return (
        <div className="h-full flex flex-col bg-card/50">
            <div className="flex-1 relative">
                <iframe
                    src={embedUrl || ''}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={title || 'Video'}
                />
            </div>
            {title && (
                <p className="text-sm font-medium text-foreground p-2 text-center">
                    {title}
                </p>
            )}
        </div>
    );
}
