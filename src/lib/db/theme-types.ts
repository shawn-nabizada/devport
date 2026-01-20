import { ObjectId } from 'mongodb';

// ================================
// Theme System Types
// ================================

/**
 * Pre-defined theme identifiers
 */
export type ThemeId =
    | 'minimalist'
    | 'bold-innovator'
    | 'creative'
    | 'professional'
    | 'dark-mode'
    | 'custom';

/**
 * CSS variable-based color scheme
 */
export interface ThemeColors {
    // Primary colors
    primary: string;
    primaryForeground: string;

    // Secondary colors
    secondary: string;
    secondaryForeground: string;

    // Accent colors
    accent: string;
    accentForeground: string;

    // Background colors
    background: string;
    foreground: string;

    // Card colors
    card: string;
    cardForeground: string;

    // Border and muted
    border: string;
    muted: string;
    mutedForeground: string;

    // Destructive/Error
    destructive: string;
    destructiveForeground: string;
}

/**
 * Typography settings
 */
export interface ThemeTypography {
    fontFamily: string;
    headingFontFamily: string;
    baseFontSize: string;
    headingFontWeight: string;
    lineHeight: string;
}

/**
 * Spacing and border radius
 */
export interface ThemeSpacing {
    borderRadius: string;
    cardPadding: string;
    sectionSpacing: string;
}

/**
 * Complete theme configuration
 */
export interface ThemeConfig {
    id: ThemeId;
    name: {
        en: string;
        fr: string;
    };
    description: {
        en: string;
        fr: string;
    };
    colors: {
        light: ThemeColors;
        dark: ThemeColors;
    };
    typography: ThemeTypography;
    spacing: ThemeSpacing;
    preview?: string; // Preview image URL
}

/**
 * User's theme settings stored in database
 */
export interface UserThemeSettings {
    _id: ObjectId;
    userId: ObjectId;
    themeId: ThemeId;
    customColors?: Partial<ThemeColors>;
    customTypography?: Partial<ThemeTypography>;
    customSpacing?: Partial<ThemeSpacing>;
    updatedAt: Date;
}

// ================================
// Pre-designed Theme Definitions
// ================================

export const PRESET_THEMES: ThemeConfig[] = [
    {
        id: 'minimalist',
        name: { en: 'The Minimalist', fr: 'Le Minimaliste' },
        description: { en: 'Clean, simple, and elegant', fr: 'Épuré, simple et élégant' },
        colors: {
            light: {
                primary: '220 14% 10%',
                primaryForeground: '0 0% 100%',
                secondary: '220 13% 91%',
                secondaryForeground: '220 14% 10%',
                accent: '220 13% 95%',
                accentForeground: '220 14% 10%',
                background: '0 0% 100%',
                foreground: '220 14% 10%',
                card: '0 0% 100%',
                cardForeground: '220 14% 10%',
                border: '220 13% 91%',
                muted: '220 13% 91%',
                mutedForeground: '220 9% 46%',
                destructive: '0 84% 60%',
                destructiveForeground: '0 0% 100%',
            },
            dark: {
                primary: '0 0% 98%',
                primaryForeground: '220 14% 10%',
                secondary: '220 14% 15%',
                secondaryForeground: '0 0% 98%',
                accent: '220 14% 20%',
                accentForeground: '0 0% 98%',
                background: '220 14% 4%',
                foreground: '0 0% 98%',
                card: '220 14% 8%',
                cardForeground: '0 0% 98%',
                border: '220 14% 15%',
                muted: '220 14% 15%',
                mutedForeground: '220 9% 60%',
                destructive: '0 62% 50%',
                destructiveForeground: '0 0% 100%',
            },
        },
        typography: {
            fontFamily: 'Inter, system-ui, sans-serif',
            headingFontFamily: 'Inter, system-ui, sans-serif',
            baseFontSize: '16px',
            headingFontWeight: '600',
            lineHeight: '1.6',
        },
        spacing: {
            borderRadius: '0.5rem',
            cardPadding: '1.5rem',
            sectionSpacing: '4rem',
        },
    },
    {
        id: 'bold-innovator',
        name: { en: 'The Bold Innovator', fr: "L'Innovateur Audacieux" },
        description: { en: 'Vibrant colors, modern feel', fr: 'Couleurs vives, sensation moderne' },
        colors: {
            light: {
                primary: '262 83% 58%',
                primaryForeground: '0 0% 100%',
                secondary: '280 65% 95%',
                secondaryForeground: '262 83% 38%',
                accent: '330 81% 60%',
                accentForeground: '0 0% 100%',
                background: '0 0% 100%',
                foreground: '262 83% 15%',
                card: '0 0% 100%',
                cardForeground: '262 83% 15%',
                border: '280 65% 90%',
                muted: '280 65% 95%',
                mutedForeground: '262 30% 45%',
                destructive: '0 84% 60%',
                destructiveForeground: '0 0% 100%',
            },
            dark: {
                primary: '262 83% 68%',
                primaryForeground: '0 0% 100%',
                secondary: '262 40% 15%',
                secondaryForeground: '262 83% 80%',
                accent: '330 81% 65%',
                accentForeground: '0 0% 100%',
                background: '262 40% 6%',
                foreground: '0 0% 98%',
                card: '262 40% 10%',
                cardForeground: '0 0% 98%',
                border: '262 40% 20%',
                muted: '262 40% 15%',
                mutedForeground: '262 20% 60%',
                destructive: '0 62% 50%',
                destructiveForeground: '0 0% 100%',
            },
        },
        typography: {
            fontFamily: 'Outfit, system-ui, sans-serif',
            headingFontFamily: 'Outfit, system-ui, sans-serif',
            baseFontSize: '16px',
            headingFontWeight: '700',
            lineHeight: '1.5',
        },
        spacing: {
            borderRadius: '1rem',
            cardPadding: '2rem',
            sectionSpacing: '5rem',
        },
    },
    {
        id: 'creative',
        name: { en: 'The Creative', fr: 'Le Créatif' },
        description: { en: 'Artistic and expressive', fr: 'Artistique et expressif' },
        colors: {
            light: {
                primary: '340 82% 52%',
                primaryForeground: '0 0% 100%',
                secondary: '45 93% 95%',
                secondaryForeground: '340 82% 35%',
                accent: '200 95% 50%',
                accentForeground: '0 0% 100%',
                background: '45 30% 98%',
                foreground: '340 30% 15%',
                card: '0 0% 100%',
                cardForeground: '340 30% 15%',
                border: '45 30% 88%',
                muted: '45 30% 92%',
                mutedForeground: '340 15% 45%',
                destructive: '0 84% 60%',
                destructiveForeground: '0 0% 100%',
            },
            dark: {
                primary: '340 82% 62%',
                primaryForeground: '0 0% 100%',
                secondary: '340 30% 15%',
                secondaryForeground: '340 82% 75%',
                accent: '200 95% 60%',
                accentForeground: '0 0% 100%',
                background: '340 20% 6%',
                foreground: '0 0% 98%',
                card: '340 20% 10%',
                cardForeground: '0 0% 98%',
                border: '340 20% 18%',
                muted: '340 20% 15%',
                mutedForeground: '340 10% 60%',
                destructive: '0 62% 50%',
                destructiveForeground: '0 0% 100%',
            },
        },
        typography: {
            fontFamily: 'DM Sans, system-ui, sans-serif',
            headingFontFamily: 'Playfair Display, serif',
            baseFontSize: '17px',
            headingFontWeight: '600',
            lineHeight: '1.7',
        },
        spacing: {
            borderRadius: '0.75rem',
            cardPadding: '1.75rem',
            sectionSpacing: '4.5rem',
        },
    },
    {
        id: 'professional',
        name: { en: 'The Professional', fr: 'Le Professionnel' },
        description: { en: 'Corporate and trustworthy', fr: 'Corporatif et fiable' },
        colors: {
            light: {
                primary: '221 83% 53%',
                primaryForeground: '0 0% 100%',
                secondary: '214 32% 91%',
                secondaryForeground: '221 83% 35%',
                accent: '167 72% 40%',
                accentForeground: '0 0% 100%',
                background: '0 0% 100%',
                foreground: '221 39% 11%',
                card: '0 0% 100%',
                cardForeground: '221 39% 11%',
                border: '214 32% 91%',
                muted: '214 32% 96%',
                mutedForeground: '221 10% 45%',
                destructive: '0 84% 60%',
                destructiveForeground: '0 0% 100%',
            },
            dark: {
                primary: '217 91% 60%',
                primaryForeground: '0 0% 100%',
                secondary: '217 32% 17%',
                secondaryForeground: '217 91% 75%',
                accent: '167 72% 50%',
                accentForeground: '0 0% 100%',
                background: '222 47% 4%',
                foreground: '0 0% 98%',
                card: '222 47% 8%',
                cardForeground: '0 0% 98%',
                border: '217 32% 17%',
                muted: '217 32% 17%',
                mutedForeground: '217 15% 60%',
                destructive: '0 62% 50%',
                destructiveForeground: '0 0% 100%',
            },
        },
        typography: {
            fontFamily: 'Source Sans Pro, system-ui, sans-serif',
            headingFontFamily: 'Source Sans Pro, system-ui, sans-serif',
            baseFontSize: '16px',
            headingFontWeight: '600',
            lineHeight: '1.6',
        },
        spacing: {
            borderRadius: '0.375rem',
            cardPadding: '1.5rem',
            sectionSpacing: '3.5rem',
        },
    },
    {
        id: 'dark-mode',
        name: { en: 'Dark Mode', fr: 'Mode Sombre' },
        description: { en: 'Sleek and modern dark theme', fr: 'Thème sombre élégant et moderne' },
        colors: {
            light: {
                primary: '210 40% 96%',
                primaryForeground: '222 47% 11%',
                secondary: '210 40% 96%',
                secondaryForeground: '222 47% 11%',
                accent: '210 40% 96%',
                accentForeground: '222 47% 11%',
                background: '0 0% 100%',
                foreground: '222 47% 11%',
                card: '0 0% 100%',
                cardForeground: '222 47% 11%',
                border: '214 32% 91%',
                muted: '210 40% 96%',
                mutedForeground: '215 16% 47%',
                destructive: '0 84% 60%',
                destructiveForeground: '0 0% 100%',
            },
            dark: {
                primary: '210 40% 98%',
                primaryForeground: '222 47% 11%',
                secondary: '217 32% 17%',
                secondaryForeground: '210 40% 98%',
                accent: '217 32% 17%',
                accentForeground: '210 40% 98%',
                background: '222 84% 5%',
                foreground: '210 40% 98%',
                card: '222 84% 8%',
                cardForeground: '210 40% 98%',
                border: '217 32% 17%',
                muted: '217 32% 17%',
                mutedForeground: '215 20% 65%',
                destructive: '0 62% 50%',
                destructiveForeground: '0 0% 100%',
            },
        },
        typography: {
            fontFamily: 'Inter, system-ui, sans-serif',
            headingFontFamily: 'Inter, system-ui, sans-serif',
            baseFontSize: '16px',
            headingFontWeight: '600',
            lineHeight: '1.6',
        },
        spacing: {
            borderRadius: '0.5rem',
            cardPadding: '1.5rem',
            sectionSpacing: '4rem',
        },
    },
];

/**
 * Get theme by ID
 */
export function getThemeById(id: ThemeId): ThemeConfig | undefined {
    return PRESET_THEMES.find(theme => theme.id === id);
}

/**
 * Generate CSS variables from theme colors
 */
export function generateThemeCSSVariables(colors: ThemeColors): string {
    return Object.entries(colors)
        .map(([key, value]) => {
            const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `--${cssVarName}: ${value};`;
        })
        .join('\n');
}
