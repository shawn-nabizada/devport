'use client';

import React from 'react';
import type { ImageBlockContent } from '@/lib/db/layout-types';
import { useTranslation } from '@/lib/i18n';
import { ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useGridContext } from '../grid-context';
import { UploadButton } from '@/lib/uploadthing';
import { toast } from 'sonner';

interface ImageBlockProps {
    data: ImageBlockContent;
    blockId: string;
}

export function ImageBlock({ data, blockId }: ImageBlockProps) {
    const { t, language } = useTranslation();
    const { editMode, updateBlock } = useGridContext();

    const altText = data.alt[language] || data.alt.en;
    const caption = data.caption?.[language] || data.caption?.en;

    const handleUploadComplete = (res: { url: string }[]) => {
        if (res && res[0]) {
            updateBlock(blockId, {
                type: 'image',
                data: {
                    ...data,
                    imageUrl: res[0].url,
                }
            });
            toast.success(t('dashboard.layoutEditor.uploadSuccess'));
        }
    };

    if (!data.imageUrl) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-card/50 p-4 border-2 border-dashed border-border rounded-lg">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-4">{t('dashboard.layoutEditor.noImageSet')}</p>
                {editMode && (
                    <div className="relative z-20">
                        <UploadButton
                            endpoint="imageUploader"
                            onClientUploadComplete={handleUploadComplete}
                            onUploadError={(error: Error) => {
                                toast.error(`${t('dashboard.layoutEditor.uploadFailed')}: ${error.message}`);
                            }}
                            appearance={{
                                button: "bg-primary text-primary-foreground hover:bg-primary/90 text-sm px-4 py-2 h-9",
                                allowedContent: "hidden"
                            }}
                            content={{
                                button: ({ isUploading }) => isUploading ? <Loader2 className="animate-spin h-4 w-4" /> : t('dashboard.layoutEditor.uploadImage')
                            }}
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-card/50 relative group">
            <div className="flex-1 relative min-h-[100px]">
                <Image
                    src={data.imageUrl}
                    alt={altText}
                    fill
                    className={`object-${data.fit}`}
                />

                {/* Overlay upload button when in edit mode */}
                {editMode && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                        <UploadButton
                            endpoint="imageUploader"
                            onClientUploadComplete={handleUploadComplete}
                            onUploadError={(error: Error) => {
                                toast.error(`${t('dashboard.layoutEditor.uploadFailed')}: ${error.message}`);
                            }}
                            appearance={{
                                button: "bg-white text-black hover:bg-white/90 text-sm px-4 py-2 h-9",
                                allowedContent: "hidden"
                            }}
                            content={{
                                button: ({ isUploading }) => isUploading ? <Loader2 className="animate-spin h-4 w-4" /> : t('dashboard.layoutEditor.replaceImage')
                            }}
                        />
                    </div>
                )}
            </div>
            {caption && (
                <p className="text-sm text-muted-foreground p-2 text-center">
                    {caption}
                </p>
            )}
        </div>
    );
}
