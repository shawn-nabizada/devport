'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { ThemeConfig, ThemeId } from '@/lib/db/theme-types';
import { PRESET_THEMES, getThemeById } from '@/lib/db/theme-types';

interface ThemeContextValue {
    currentTheme: ThemeConfig;
    themeId: ThemeId;
    setThemeId: (id: ThemeId) => void;
    applyTheme: (theme: ThemeConfig) => void;
    saveTheme: () => Promise<void>;
    isSaving: boolean;
    themes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemeContext() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context;
}

interface ThemeProviderProps {
    children: ReactNode;
    initialThemeId?: ThemeId;
}

export function ThemeProvider({ children, initialThemeId = 'tech' }: ThemeProviderProps) {
    const [themeId, setThemeIdState] = useState<ThemeId>(initialThemeId);
    const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(
        getThemeById(initialThemeId) || PRESET_THEMES[0]
    );
    const [isSaving, setIsSaving] = useState(false);

    // Apply theme CSS variables to document
    const applyThemeCSSVariables = useCallback((theme: ThemeConfig) => {
        const root = document.documentElement;
        const isDark = root.classList.contains('dark');
        const colors = isDark ? theme.colors.dark : theme.colors.light;

        // Apply color variables
        Object.entries(colors).forEach(([key, value]) => {
            const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            root.style.setProperty(cssVarName, value);
        });

        // Apply font variables
        root.style.setProperty('--font-sans', theme.fonts.sans);
        root.style.setProperty('--font-serif', theme.fonts.serif);
        root.style.setProperty('--font-mono', theme.fonts.mono);

        // Apply radius
        root.style.setProperty('--radius', theme.radius);
    }, []);

    // Load font if needed
    const loadFonts = useCallback((theme: ThemeConfig) => {
        const fonts = new Set([theme.fonts.sans, theme.fonts.serif, theme.fonts.mono]);

        fonts.forEach(fontFamily => {
            const fontName = fontFamily.split(',')[0].trim();
            if (!['system-ui', 'sans-serif', 'serif', 'Inter'].includes(fontName)) {
                // Load from Google Fonts
                const link = document.createElement('link');
                link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@400;500;600;700&display=swap`;
                link.rel = 'stylesheet';
                if (!document.querySelector(`link[href="${link.href}"]`)) {
                    document.head.appendChild(link);
                }
            }
        });
    }, []);

    const setThemeId = useCallback((id: ThemeId) => {
        setThemeIdState(id);
        const theme = getThemeById(id);
        if (theme) {
            setCurrentTheme(theme);
            loadFonts(theme);
            applyThemeCSSVariables(theme);
        }
    }, [loadFonts, applyThemeCSSVariables]);

    const applyTheme = useCallback((theme: ThemeConfig) => {
        setCurrentTheme(theme);
        loadFonts(theme);
        applyThemeCSSVariables(theme);
    }, [loadFonts, applyThemeCSSVariables]);

    const saveTheme = useCallback(async () => {
        setIsSaving(true);
        try {
            await fetch('/api/theme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ themeId }),
            });
        } catch (error) {
            console.error('Failed to save theme:', error);
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, [themeId]);

    // Apply theme on mount and when dark mode changes
    useEffect(() => {
        applyThemeCSSVariables(currentTheme);

        // Watch for dark mode changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    applyThemeCSSVariables(currentTheme);
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => observer.disconnect();
    }, [currentTheme, applyThemeCSSVariables]);

    // Load fonts on mount
    useEffect(() => {
        loadFonts(currentTheme);
    }, [currentTheme, loadFonts]);

    const value: ThemeContextValue = {
        currentTheme,
        themeId,
        setThemeId,
        applyTheme,
        saveTheme,
        isSaving,
        themes: PRESET_THEMES,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
