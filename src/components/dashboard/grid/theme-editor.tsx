'use client';

import React from 'react';
import { Palette } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { PRESET_THEMES, ThemeId } from '@/lib/db/theme-types';
import { toast } from 'sonner';

export function ThemeEditor() {
    const { t, language } = useTranslation();

    const handleThemeSelect = async (themeId: ThemeId) => {
        try {
            await fetch('/api/theme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ themeId }),
            });
            toast.success('Theme updated');
            // In a real app, we'd trigger a reload or context update here
            // For now, we rely on the fact that this saves to DB
            window.location.reload(); // Brute force sync for now as we don't have shared theme context yet
        } catch (error) {
            console.error('Failed to save theme:', error);
            toast.error('Failed to update theme');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t('dashboard.layoutEditor.theme')}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {PRESET_THEMES.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => handleThemeSelect(theme.id)}
                        className="flex flex-col items-center gap-1 p-2 rounded border border-border hover:bg-muted transition-colors text-xs"
                    >
                        <div
                            className="w-full h-8 rounded"
                            style={{ backgroundColor: theme.colors.light.primary }}
                        />
                        <span className="truncate w-full text-center">{theme.name[language]}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
