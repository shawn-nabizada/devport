'use client';

import React from 'react';
import Link from 'next/link';
import { useGridContext } from './grid-context';
import { useTranslation } from '@/lib/i18n';
import {
    ArrowLeft,
    Monitor,
    Smartphone,
    Edit3,
    Eye,
    Save,
    Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LayoutToolbar() {
    const {
        editMode,
        setEditMode,
        device,
        setDevice,
        saveLayout,
        isSaving,
        isDirty,
    } = useGridContext();
    const { t } = useTranslation();

    const handleSave = async () => {
        try {
            await saveLayout();
            // Auto-switch to preview mode after saving
            setEditMode(false);
        } catch (error) {
            console.error('Save failed:', error);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
            <div className="flex items-center justify-between">
                {/* Left: Back button */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span>{t('common.back')}</span>
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {t('dashboard.layoutEditor.title')}
                    </h1>
                </div>

                {/* Center: Device toggle */}
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                        onClick={() => setDevice('desktop')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${device === 'desktop'
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <Monitor className="h-4 w-4" />
                        <span className="text-sm font-medium">Desktop</span>
                    </button>
                    <button
                        onClick={() => setDevice('mobile')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${device === 'mobile'
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <Smartphone className="h-4 w-4" />
                        <span className="text-sm font-medium">Mobile</span>
                    </button>
                </div>

                {/* Right: Edit/Preview toggle + Save */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setEditMode(!editMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${editMode
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        {editMode ? (
                            <>
                                <Edit3 className="h-4 w-4" />
                                <span className="font-medium">{t('dashboard.layoutEditor.editing')}</span>
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4" />
                                <span className="font-medium">{t('dashboard.layoutEditor.preview')}</span>
                            </>
                        )}
                    </button>

                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !isDirty}
                        className="flex items-center gap-2"
                    >
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        <span>{t('common.save')}</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}
