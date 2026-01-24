'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import {
    PRESET_THEMES,
    FONT_OPTIONS,
    ThemeId,
    getThemeById,
    applyThemeToPreview,
    getDefaultTheme,
} from '@/lib/db/theme-types';
import {
    ChevronDown,
    ChevronUp,
    Check,
    Loader2,
    Palette,
} from 'lucide-react';

interface ColorSectionProps {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

function ColorSection({ title, isOpen, onToggle, children }: ColorSectionProps) {
    return (
        <div className="border border-border rounded-lg overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-3 py-2 bg-secondary/50 hover:bg-secondary transition-colors"
            >
                <span className="text-sm font-medium text-foreground">{title}</span>
                {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
            </button>
            {isOpen && (
                <div className="p-3 space-y-3 bg-card">
                    {children}
                </div>
            )}
        </div>
    );
}

interface ColorInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
    // Convert OKLCH to hex for display (simplified - just show OKLCH)
    const displayValue = value.startsWith('oklch') ? value : value;

    return (
        <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{label}</label>
            <div className="flex items-center gap-2">
                <div
                    className="w-8 h-8 rounded border border-border flex-shrink-0"
                    style={{ backgroundColor: value }}
                />
                <input
                    type="text"
                    value={displayValue}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 px-2 py-1 text-xs bg-input border border-border rounded text-foreground"
                    placeholder="oklch(0.5 0.2 270)"
                />
            </div>
        </div>
    );
}

interface ThemeEditorProps {
    className?: string;
}

export function ThemeEditor({ className = '' }: ThemeEditorProps) {
    const { t, language } = useTranslation();
    const [currentThemeId, setCurrentThemeId] = useState<ThemeId>('tech');
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Collapsible sections state
    const [openSections, setOpenSections] = useState<Set<string>>(new Set(['primary']));

    // Custom fonts state
    const [customFonts, setCustomFonts] = useState({
        sans: 'Inter, sans-serif',
        serif: 'Playfair Display, serif',
        mono: 'JetBrains Mono, monospace',
    });

    // Load theme on mount
    useEffect(() => {
        async function loadTheme() {
            try {
                const res = await fetch('/api/theme');
                if (res.ok) {
                    const data = await res.json();
                    if (data.themeId) {
                        setCurrentThemeId(data.themeId);
                        setIsCustomMode(data.themeId === 'custom');
                        const theme = getThemeById(data.themeId);
                        if (theme) {
                            const isDark = document.documentElement.classList.contains('dark');
                            applyThemeToPreview(theme, isDark);
                        }
                    }
                }
            } catch {
                // Use default
            }
        }
        loadTheme();
    }, []);

    const toggleSection = (section: string) => {
        setOpenSections(prev => {
            const next = new Set(prev);
            if (next.has(section)) {
                next.delete(section);
            } else {
                next.add(section);
            }
            return next;
        });
    };

    const handleThemeSelect = async (themeId: ThemeId) => {
        if (themeId === 'custom') {
            setIsCustomMode(true);
            setCurrentThemeId('custom');
            return;
        }

        const theme = getThemeById(themeId);
        if (!theme) return;

        setCurrentThemeId(themeId);
        setIsCustomMode(false);

        // Apply theme to preview only (not whole page)
        const isDark = document.documentElement.classList.contains('dark');
        applyThemeToPreview(theme, isDark);

        // Save theme
        setIsSaving(true);
        try {
            await fetch('/api/theme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ themeId }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to save theme:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFontChange = (type: 'sans' | 'serif' | 'mono', value: string) => {
        setCustomFonts(prev => ({ ...prev, [type]: value }));
        // Apply font to preview element only
        const previewElement = document.getElementById('portfolio-preview');
        if (previewElement) {
            previewElement.style.setProperty(`--font-${type}`, value);
        }
    };

    const currentTheme = getThemeById(currentThemeId) || getDefaultTheme();

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header */}
            <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">
                    {t('dashboard.themes.title')}
                </h2>
                {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {saved && <Check className="h-4 w-4 text-green-500" />}
            </div>

            {/* Theme Preset Dropdown */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                    {t('dashboard.themes.preset')}
                </label>
                <select
                    value={currentThemeId}
                    onChange={(e) => handleThemeSelect(e.target.value as ThemeId)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    {PRESET_THEMES.map((theme) => (
                        <option key={theme.id} value={theme.id}>
                            {theme.name[language]} - {theme.description[language]}
                        </option>
                    ))}
                    <option value="custom">Custom</option>
                </select>
            </div>

            {/* Theme Preview Cards */}
            <div className="grid grid-cols-5 gap-2">
                {PRESET_THEMES.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => handleThemeSelect(theme.id)}
                        className={`relative p-1 rounded-lg border-2 transition-all ${currentThemeId === theme.id
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-border hover:border-muted-foreground'
                            }`}
                        title={theme.name[language]}
                    >
                        <div
                            className="h-8 rounded-md relative overflow-hidden"
                            style={{ backgroundColor: theme.colors.light.background }}
                        >
                            <div
                                className="absolute top-1 left-1 w-4 h-1 rounded-full"
                                style={{ backgroundColor: theme.colors.light.primary }}
                            />
                            <div
                                className="absolute top-3 left-1 w-3 h-0.5 rounded"
                                style={{ backgroundColor: theme.colors.light.foreground }}
                            />
                            {currentThemeId === theme.id && (
                                <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="h-2 w-2 text-primary-foreground" />
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Custom Theme Editor (only shown in custom mode) */}
            {isCustomMode && (
                <div className="space-y-3 pt-2 border-t border-border">
                    {/* Font Dropdowns */}
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                                Sans Font
                            </label>
                            <select
                                value={customFonts.sans}
                                onChange={(e) => handleFontChange('sans', e.target.value)}
                                className="w-full px-2 py-1.5 bg-input border border-border rounded text-sm text-foreground"
                            >
                                {FONT_OPTIONS.filter(f => f.value.includes('sans') || f.value.includes('Inter') || f.value.includes('Roboto') || f.value.includes('Outfit') || f.value.includes('DM Sans') || f.value.includes('Source Sans')).map((font) => (
                                    <option key={font.value} value={font.value}>
                                        {font.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                                Serif Font
                            </label>
                            <select
                                value={customFonts.serif}
                                onChange={(e) => handleFontChange('serif', e.target.value)}
                                className="w-full px-2 py-1.5 bg-input border border-border rounded text-sm text-foreground"
                            >
                                {FONT_OPTIONS.filter(f => f.value.includes('serif') || f.value.includes('Playfair') || f.value.includes('Source Serif')).map((font) => (
                                    <option key={font.value} value={font.value}>
                                        {font.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                                Mono Font
                            </label>
                            <select
                                value={customFonts.mono}
                                onChange={(e) => handleFontChange('mono', e.target.value)}
                                className="w-full px-2 py-1.5 bg-input border border-border rounded text-sm text-foreground"
                            >
                                {FONT_OPTIONS.filter(f => f.value.includes('mono') || f.value.includes('JetBrains') || f.value.includes('Fira') || f.value.includes('Space Mono') || f.value.includes('Geist')).map((font) => (
                                    <option key={font.value} value={font.value}>
                                        {font.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Color Sections */}
                    <ColorSection
                        title="Primary Colors"
                        isOpen={openSections.has('primary')}
                        onToggle={() => toggleSection('primary')}
                    >
                        <ColorInput
                            label="Primary"
                            value={currentTheme.colors.light.primary}
                            onChange={() => { }}
                        />
                        <ColorInput
                            label="Primary Foreground"
                            value={currentTheme.colors.light.primaryForeground}
                            onChange={() => { }}
                        />
                    </ColorSection>

                    <ColorSection
                        title="Secondary Colors"
                        isOpen={openSections.has('secondary')}
                        onToggle={() => toggleSection('secondary')}
                    >
                        <ColorInput
                            label="Secondary"
                            value={currentTheme.colors.light.secondary}
                            onChange={() => { }}
                        />
                        <ColorInput
                            label="Secondary Foreground"
                            value={currentTheme.colors.light.secondaryForeground}
                            onChange={() => { }}
                        />
                    </ColorSection>

                    <ColorSection
                        title="Accent Colors"
                        isOpen={openSections.has('accent')}
                        onToggle={() => toggleSection('accent')}
                    >
                        <ColorInput
                            label="Accent"
                            value={currentTheme.colors.light.accent}
                            onChange={() => { }}
                        />
                        <ColorInput
                            label="Accent Foreground"
                            value={currentTheme.colors.light.accentForeground}
                            onChange={() => { }}
                        />
                    </ColorSection>

                    <ColorSection
                        title="Base Colors"
                        isOpen={openSections.has('base')}
                        onToggle={() => toggleSection('base')}
                    >
                        <ColorInput
                            label="Background"
                            value={currentTheme.colors.light.background}
                            onChange={() => { }}
                        />
                        <ColorInput
                            label="Foreground"
                            value={currentTheme.colors.light.foreground}
                            onChange={() => { }}
                        />
                    </ColorSection>

                    <ColorSection
                        title="Card Colors"
                        isOpen={openSections.has('card')}
                        onToggle={() => toggleSection('card')}
                    >
                        <ColorInput
                            label="Card"
                            value={currentTheme.colors.light.card}
                            onChange={() => { }}
                        />
                        <ColorInput
                            label="Card Foreground"
                            value={currentTheme.colors.light.cardForeground}
                            onChange={() => { }}
                        />
                    </ColorSection>

                    <ColorSection
                        title="Muted Colors"
                        isOpen={openSections.has('muted')}
                        onToggle={() => toggleSection('muted')}
                    >
                        <ColorInput
                            label="Muted"
                            value={currentTheme.colors.light.muted}
                            onChange={() => { }}
                        />
                        <ColorInput
                            label="Muted Foreground"
                            value={currentTheme.colors.light.mutedForeground}
                            onChange={() => { }}
                        />
                    </ColorSection>

                    <ColorSection
                        title="Destructive Colors"
                        isOpen={openSections.has('destructive')}
                        onToggle={() => toggleSection('destructive')}
                    >
                        <ColorInput
                            label="Destructive"
                            value={currentTheme.colors.light.destructive}
                            onChange={() => { }}
                        />
                        <ColorInput
                            label="Destructive Foreground"
                            value={currentTheme.colors.light.destructiveForeground}
                            onChange={() => { }}
                        />
                    </ColorSection>
                </div>
            )}
        </div>
    );
}
