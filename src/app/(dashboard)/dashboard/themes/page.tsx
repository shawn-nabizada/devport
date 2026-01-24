'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { ThemeProvider, useThemeContext } from '@/lib/theme/theme-context';
import { ThemeConfig, ThemeId } from '@/lib/db/theme-types';
import { Check, Palette, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ThemeCard({ theme, isSelected, onSelect }: {
    theme: ThemeConfig;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const { language } = useTranslation();

    return (
        <button
            onClick={onSelect}
            className={`
                relative group rounded-xl overflow-hidden border-2 transition-all duration-300
                ${isSelected
                    ? 'border-blue-500 ring-4 ring-blue-500/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
            `}
        >
            {/* Theme Preview */}
            <div className="aspect-video p-4 relative" style={{
                background: `hsl(${theme.colors.light.background})`,
            }}>
                {/* Header mock */}
                <div className="w-full h-3 rounded-full mb-2" style={{
                    background: `hsl(${theme.colors.light.primary})`,
                }} />

                {/* Content mock */}
                <div className="space-y-2">
                    <div className="w-1/2 h-2 rounded" style={{
                        background: `hsl(${theme.colors.light.foreground})`,
                    }} />
                    <div className="w-3/4 h-2 rounded" style={{
                        background: `hsl(${theme.colors.light.muted})`,
                    }} />
                    <div className="w-2/3 h-2 rounded" style={{
                        background: `hsl(${theme.colors.light.muted})`,
                    }} />
                </div>

                {/* Accent blocks */}
                <div className="absolute bottom-4 right-4 flex gap-1">
                    <div className="w-6 h-6 rounded" style={{
                        background: `hsl(${theme.colors.light.primary})`,
                    }} />
                    <div className="w-6 h-6 rounded" style={{
                        background: `hsl(${theme.colors.light.accent})`,
                    }} />
                </div>

                {/* Selected checkmark */}
                {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                    </div>
                )}
            </div>

            {/* Theme Info */}
            <div className="p-4 bg-white dark:bg-gray-800 text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                    {theme.name[language]}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {theme.description[language]}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {theme.fonts.sans.split(',')[0]}
                </p>
            </div>
        </button>
    );
}

function ThemeSelectorContent() {
    const { t } = useTranslation();
    const { themeId, setThemeId, saveTheme, isSaving, themes } = useThemeContext();
    const [selectedTheme, setSelectedTheme] = useState<ThemeId>(themeId);
    const [saved, setSaved] = useState(false);

    const handleSelect = (id: ThemeId) => {
        setSelectedTheme(id);
        setThemeId(id);
    };

    const handleSave = async () => {
        try {
            await saveTheme();
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Palette className="h-8 w-8 text-blue-500" />
                        {t('dashboard.themes.title')}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {t('dashboard.themes.description')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {saved && (
                        <span className="text-sm text-green-600 flex items-center gap-1">
                            <Check className="h-4 w-4" />
                            {t('common.saved')}
                        </span>
                    )}
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        {t('common.save')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {themes.map((theme) => (
                    <ThemeCard
                        key={theme.id}
                        theme={theme}
                        isSelected={selectedTheme === theme.id}
                        onSelect={() => handleSelect(theme.id)}
                    />
                ))}
            </div>

            {/* Preview Note */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300">
                <p>
                    <strong>{t('dashboard.themes.previewNote')}:</strong> {t('dashboard.themes.previewDescription')}
                </p>
            </div>
        </div>
    );
}

export default function ThemesPage() {
    const { data: session, status } = useSession();
    const { t } = useTranslation();
    const [initialTheme, setInitialTheme] = useState<ThemeId>('tech');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login');
        }
    }, [status]);

    useEffect(() => {
        async function loadTheme() {
            try {
                const res = await fetch('/api/theme');
                if (res.ok) {
                    const data = await res.json();
                    setInitialTheme(data.themeId);
                }
            } finally {
                setLoading(false);
            }
        }
        if (session) {
            loadTheme();
        }
    }, [session]);

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse text-gray-500">{t('common.loading')}</div>
            </div>
        );
    }

    return (
        <ThemeProvider initialThemeId={initialTheme}>
            <ThemeSelectorContent />
        </ThemeProvider>
    );
}
