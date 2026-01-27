'use client';

import React, { useState, useRef } from 'react';
import type { TextBlockContent } from '@/lib/db/layout-types';
import { useGridContext } from '../grid-context';
import { useTranslation } from '@/lib/i18n';

interface TextBlockProps {
    data: TextBlockContent;
    blockId: string;
}

export function TextBlock({ data, blockId }: TextBlockProps) {
    const { t, language } = useTranslation();
    const { editMode, updateBlock, blocks } = useGridContext();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(data.text[language] || data.text.en);
    const inputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const text = data.text[language] || data.text.en;

    // Update local state when language changes (Adjusting state during render)
    const [prevLang, setPrevLang] = useState(language);
    const [prevText, setPrevText] = useState(data.text);

    if (prevLang !== language || prevText !== data.text) {
        setPrevLang(language);
        setPrevText(data.text);
        setEditText(data.text[language] || data.text.en);
    }


    const handleSave = () => {
        const block = blocks.find(b => b._id.toString() === blockId);
        if (block && block.content.type === 'text') {
            updateBlock(blockId, {
                type: 'text',
                data: {
                    ...block.content.data,
                    text: {
                        ...block.content.data.text,
                        [language]: editText,
                    },
                },
            });
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && data.variant === 'heading') {
            e.preventDefault();
            handleSave();
        }
        // For paragraph, Shift+Enter allows new lines, Enter alone saves
        if (e.key === 'Enter' && !e.shiftKey && data.variant === 'paragraph') {
            e.preventDefault();
            handleSave();
        }
        // Escape cancels editing without saving
        if (e.key === 'Escape') {
            setEditText(data.text[language] || data.text.en);
            setIsEditing(false);
        }
    };

    const handleBlur = () => {
        handleSave();
    };

    const startEditing = () => {
        if (editMode) {
            setIsEditing(true);
            // Focus the input after state updates
            setTimeout(() => {
                if (data.variant === 'heading') {
                    inputRef.current?.focus();
                    inputRef.current?.select();
                } else {
                    textareaRef.current?.focus();
                }
            }, 0);
        }
    };

    // Build inline styles from data
    const textStyles: React.CSSProperties = {
        fontSize: data.fontSize ? `${data.fontSize}px` : undefined,
        fontWeight: data.fontWeight || undefined,
        fontStyle: data.fontStyle || undefined,
        textDecoration: data.textDecoration || undefined,
        textAlign: data.textAlign || undefined,
    };

    if (editMode && isEditing) {
        return (
            <div className="h-full p-4 bg-card/50">
                {data.variant === 'heading' ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="w-full border-b-2 border-primary outline-none bg-transparent text-foreground"
                        style={{
                            ...textStyles,
                            fontSize: textStyles.fontSize || '1.5rem',
                            fontWeight: textStyles.fontWeight || 'bold',
                        }}
                    />
                ) : (
                    <textarea
                        ref={textareaRef}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="w-full h-full resize-none border border-primary rounded p-2 outline-none bg-transparent text-foreground"
                        placeholder={t('dashboard.layoutEditor.textPlaceholder')}
                        style={textStyles}
                    />
                )}
            </div>
        );
    }

    return (
        <div
            className="h-full p-4 bg-card/50 cursor-text"
            onClick={startEditing}
        >
            {data.variant === 'heading' ? (
                <h2
                    className="text-foreground"
                    style={{
                        ...textStyles,
                        fontSize: textStyles.fontSize || '1.5rem',
                        fontWeight: textStyles.fontWeight || 'bold',
                    }}
                >
                    {text}
                </h2>
            ) : (
                <p
                    className="text-foreground whitespace-pre-wrap"
                    style={textStyles}
                >
                    {text}
                </p>
            )}
            {editMode && (
                <p className="text-xs text-gray-400 mt-2">{t('dashboard.layoutEditor.clickToEdit')}</p>
            )}
        </div>
    );
}

