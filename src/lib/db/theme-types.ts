/**
 * Portfolio Theme System
 * Complete CSS variable-based theming with 5 preset themes
 */

// ================================
// Theme Type Definitions
// ================================

export type ThemeId = 'tech' | 'amber' | 'latte' | 'retro' | 'sodapop' | 'custom';

export interface ThemeColors {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
    chart1: string;
    chart2: string;
    chart3: string;
    chart4: string;
    chart5: string;
    sidebar: string;
    sidebarForeground: string;
    sidebarPrimary: string;
    sidebarPrimaryForeground: string;
    sidebarAccent: string;
    sidebarAccentForeground: string;
    sidebarBorder: string;
    sidebarRing: string;
}

export interface ThemeFonts {
    sans: string;
    serif: string;
    mono: string;
}

export interface ThemeShadows {
    shadow2xs: string;
    shadowXs: string;
    shadowSm: string;
    shadow: string;
    shadowMd: string;
    shadowLg: string;
    shadowXl: string;
    shadow2xl: string;
}

export interface ThemeConfig {
    id: ThemeId;
    name: { en: string; fr: string };
    description: { en: string; fr: string };
    colors: {
        light: ThemeColors;
        dark: ThemeColors;
    };
    fonts: ThemeFonts;
    radius: string;
    shadows: {
        light: ThemeShadows;
        dark: ThemeShadows;
    };
}

/**
 * User's saved theme settings in the database
 */
export interface UserThemeSettings {
    userId: import('mongodb').ObjectId;
    themeId: ThemeId;
    customColors?: Partial<ThemeColors> | null;
    customTypography?: {
        fontFamily?: string;
        headingFontFamily?: string;
        baseFontSize?: string;
        headingFontWeight?: string;
        lineHeight?: string;
    } | null;
    customSpacing?: {
        borderRadius?: string;
        cardPadding?: string;
        sectionSpacing?: string;
    } | null;
    updatedAt?: Date;
}

// ================================
// Available Fonts for Custom Theme
// ================================

export const FONT_OPTIONS = [
    { value: 'Inter, sans-serif', label: 'Inter' },
    { value: 'Roboto, sans-serif', label: 'Roboto' },
    { value: 'Outfit, sans-serif', label: 'Outfit' },
    { value: 'DM Sans, system-ui, sans-serif', label: 'DM Sans' },
    { value: 'Source Sans Pro, system-ui, sans-serif', label: 'Source Sans Pro' },
    { value: 'Geist Mono, ui-monospace, monospace', label: 'Geist Mono' },
    { value: 'Playfair Display, serif', label: 'Playfair Display' },
    { value: 'Source Serif 4, serif', label: 'Source Serif 4' },
    { value: 'JetBrains Mono, monospace', label: 'JetBrains Mono' },
    { value: 'Fira Code, monospace', label: 'Fira Code' },
    { value: 'Space Mono, monospace', label: 'Space Mono' },
    { value: 'ui-sans-serif, system-ui, sans-serif', label: 'System Sans' },
    { value: 'ui-serif, Georgia, serif', label: 'System Serif' },
    { value: 'ui-monospace, monospace', label: 'System Mono' },
];

// ================================
// Preset Theme Definitions
// ================================

export const PRESET_THEMES: ThemeConfig[] = [
    // Tech Theme (Default - Purple/Violet)
    {
        id: 'tech',
        name: { en: 'Tech', fr: 'Tech' },
        description: { en: 'Modern purple tech vibes', fr: 'Ambiance tech violette moderne' },
        colors: {
            light: {
                background: 'oklch(1.0000 0 0)',
                foreground: 'oklch(0.3588 0.1354 278.6973)',
                card: 'oklch(1.0000 0 0)',
                cardForeground: 'oklch(0.3588 0.1354 278.6973)',
                popover: 'oklch(1.0000 0 0)',
                popoverForeground: 'oklch(0.3588 0.1354 278.6973)',
                primary: 'oklch(0.6056 0.2189 292.7172)',
                primaryForeground: 'oklch(1.0000 0 0)',
                secondary: 'oklch(0.9618 0.0202 295.1913)',
                secondaryForeground: 'oklch(0.4568 0.2146 277.0229)',
                muted: 'oklch(0.9691 0.0161 293.7558)',
                mutedForeground: 'oklch(0.5413 0.2466 293.0090)',
                accent: 'oklch(0.9319 0.0316 255.5855)',
                accentForeground: 'oklch(0.4244 0.1809 265.6377)',
                destructive: 'oklch(0.6368 0.2078 25.3313)',
                destructiveForeground: 'oklch(1.0000 0 0)',
                border: 'oklch(0.9299 0.0334 272.7879)',
                input: 'oklch(0.9299 0.0334 272.7879)',
                ring: 'oklch(0.6056 0.2189 292.7172)',
                chart1: 'oklch(0.6056 0.2189 292.7172)',
                chart2: 'oklch(0.5413 0.2466 293.0090)',
                chart3: 'oklch(0.4907 0.2412 292.5809)',
                chart4: 'oklch(0.4320 0.2106 292.7591)',
                chart5: 'oklch(0.3796 0.1783 293.7446)',
                sidebar: 'oklch(0.9691 0.0161 293.7558)',
                sidebarForeground: 'oklch(0.3588 0.1354 278.6973)',
                sidebarPrimary: 'oklch(0.6056 0.2189 292.7172)',
                sidebarPrimaryForeground: 'oklch(1.0000 0 0)',
                sidebarAccent: 'oklch(0.9319 0.0316 255.5855)',
                sidebarAccentForeground: 'oklch(0.4244 0.1809 265.6377)',
                sidebarBorder: 'oklch(0.9299 0.0334 272.7879)',
                sidebarRing: 'oklch(0.6056 0.2189 292.7172)',
            },
            dark: {
                background: 'oklch(0.2077 0.0398 265.7549)',
                foreground: 'oklch(0.9299 0.0334 272.7879)',
                card: 'oklch(0.2573 0.0861 281.2883)',
                cardForeground: 'oklch(0.9299 0.0334 272.7879)',
                popover: 'oklch(0.2573 0.0861 281.2883)',
                popoverForeground: 'oklch(0.9299 0.0334 272.7879)',
                primary: 'oklch(0.6056 0.2189 292.7172)',
                primaryForeground: 'oklch(1.0000 0 0)',
                secondary: 'oklch(0.2573 0.0861 281.2883)',
                secondaryForeground: 'oklch(0.9299 0.0334 272.7879)',
                muted: 'oklch(0.2329 0.0919 279.1398)',
                mutedForeground: 'oklch(0.8112 0.1013 293.5712)',
                accent: 'oklch(0.4568 0.2146 277.0229)',
                accentForeground: 'oklch(0.9299 0.0334 272.7879)',
                destructive: 'oklch(0.6368 0.2078 25.3313)',
                destructiveForeground: 'oklch(1.0000 0 0)',
                border: 'oklch(0.2827 0.1351 291.0894)',
                input: 'oklch(0.2827 0.1351 291.0894)',
                ring: 'oklch(0.6056 0.2189 292.7172)',
                chart1: 'oklch(0.7090 0.1592 293.5412)',
                chart2: 'oklch(0.6056 0.2189 292.7172)',
                chart3: 'oklch(0.5413 0.2466 293.0090)',
                chart4: 'oklch(0.4907 0.2412 292.5809)',
                chart5: 'oklch(0.4320 0.2106 292.7591)',
                sidebar: 'oklch(0.2077 0.0398 265.7549)',
                sidebarForeground: 'oklch(0.9299 0.0334 272.7879)',
                sidebarPrimary: 'oklch(0.6056 0.2189 292.7172)',
                sidebarPrimaryForeground: 'oklch(1.0000 0 0)',
                sidebarAccent: 'oklch(0.4568 0.2146 277.0229)',
                sidebarAccentForeground: 'oklch(0.9299 0.0334 272.7879)',
                sidebarBorder: 'oklch(0.2827 0.1351 291.0894)',
                sidebarRing: 'oklch(0.6056 0.2189 292.7172)',
            },
        },
        fonts: {
            sans: 'Roboto, sans-serif',
            serif: 'Playfair Display, serif',
            mono: 'Fira Code, monospace',
        },
        radius: '0.625rem',
        shadows: {
            light: {
                shadow2xs: '2px 2px 4px 0px hsl(255 86% 66% / 0.10)',
                shadowXs: '2px 2px 4px 0px hsl(255 86% 66% / 0.10)',
                shadowSm: '2px 2px 4px 0px hsl(255 86% 66% / 0.20), 2px 1px 2px -1px hsl(255 86% 66% / 0.20)',
                shadow: '2px 2px 4px 0px hsl(255 86% 66% / 0.20), 2px 1px 2px -1px hsl(255 86% 66% / 0.20)',
                shadowMd: '2px 2px 4px 0px hsl(255 86% 66% / 0.20), 2px 2px 4px -1px hsl(255 86% 66% / 0.20)',
                shadowLg: '2px 2px 4px 0px hsl(255 86% 66% / 0.20), 2px 4px 6px -1px hsl(255 86% 66% / 0.20)',
                shadowXl: '2px 2px 4px 0px hsl(255 86% 66% / 0.20), 2px 8px 10px -1px hsl(255 86% 66% / 0.20)',
                shadow2xl: '2px 2px 4px 0px hsl(255 86% 66% / 0.50)',
            },
            dark: {
                shadow2xs: '2px 2px 4px 0px hsl(255 86% 66% / 0.10)',
                shadowXs: '2px 2px 4px 0px hsl(255 86% 66% / 0.10)',
                shadowSm: '2px 2px 4px 0px hsl(255 86% 66% / 0.20), 2px 1px 2px -1px hsl(255 86% 66% / 0.20)',
                shadow: '2px 2px 4px 0px hsl(255 86% 66% / 0.20), 2px 1px 2px -1px hsl(255 86% 66% / 0.20)',
                shadowMd: '2px 2px 4px 0px hsl(255 86% 66% / 0.20), 2px 2px 4px -1px hsl(255 86% 66% / 0.20)',
                shadowLg: '2px 2px 4px 0px hsl(255 86% 66% / 0.20), 2px 4px 6px -1px hsl(255 86% 66% / 0.20)',
                shadowXl: '2px 2px 4px 0px hsl(255 86% 66% / 0.20), 2px 8px 10px -1px hsl(255 86% 66% / 0.20)',
                shadow2xl: '2px 2px 4px 0px hsl(255 86% 66% / 0.50)',
            },
        },
    },

    // Amber Theme (Warm amber tones)
    {
        id: 'amber',
        name: { en: 'Amber', fr: 'Ambre' },
        description: { en: 'Warm amber and gold tones', fr: 'Tons ambre et or chaleureux' },
        colors: {
            light: {
                background: 'oklch(1.0000 0 0)',
                foreground: 'oklch(0.2686 0 0)',
                card: 'oklch(1.0000 0 0)',
                cardForeground: 'oklch(0.2686 0 0)',
                popover: 'oklch(1.0000 0 0)',
                popoverForeground: 'oklch(0.2686 0 0)',
                primary: 'oklch(0.7686 0.1647 70.0804)',
                primaryForeground: 'oklch(0 0 0)',
                secondary: 'oklch(0.9670 0.0029 264.5419)',
                secondaryForeground: 'oklch(0.4461 0.0263 256.8018)',
                muted: 'oklch(0.9846 0.0017 247.8389)',
                mutedForeground: 'oklch(0.5510 0.0234 264.3637)',
                accent: 'oklch(0.9869 0.0214 95.2774)',
                accentForeground: 'oklch(0.4732 0.1247 46.2007)',
                destructive: 'oklch(0.6368 0.2078 25.3313)',
                destructiveForeground: 'oklch(1.0000 0 0)',
                border: 'oklch(0.9276 0.0058 264.5313)',
                input: 'oklch(0.9276 0.0058 264.5313)',
                ring: 'oklch(0.7686 0.1647 70.0804)',
                chart1: 'oklch(0.7686 0.1647 70.0804)',
                chart2: 'oklch(0.6658 0.1574 58.3183)',
                chart3: 'oklch(0.5553 0.1455 48.9975)',
                chart4: 'oklch(0.4732 0.1247 46.2007)',
                chart5: 'oklch(0.4137 0.1054 45.9038)',
                sidebar: 'oklch(0.9846 0.0017 247.8389)',
                sidebarForeground: 'oklch(0.2686 0 0)',
                sidebarPrimary: 'oklch(0.7686 0.1647 70.0804)',
                sidebarPrimaryForeground: 'oklch(1.0000 0 0)',
                sidebarAccent: 'oklch(0.9869 0.0214 95.2774)',
                sidebarAccentForeground: 'oklch(0.4732 0.1247 46.2007)',
                sidebarBorder: 'oklch(0.9276 0.0058 264.5313)',
                sidebarRing: 'oklch(0.7686 0.1647 70.0804)',
            },
            dark: {
                background: 'oklch(0.2046 0 0)',
                foreground: 'oklch(0.9219 0 0)',
                card: 'oklch(0.2686 0 0)',
                cardForeground: 'oklch(0.9219 0 0)',
                popover: 'oklch(0.2686 0 0)',
                popoverForeground: 'oklch(0.9219 0 0)',
                primary: 'oklch(0.7686 0.1647 70.0804)',
                primaryForeground: 'oklch(0 0 0)',
                secondary: 'oklch(0.2686 0 0)',
                secondaryForeground: 'oklch(0.9219 0 0)',
                muted: 'oklch(0.2393 0 0)',
                mutedForeground: 'oklch(0.7155 0 0)',
                accent: 'oklch(0.4732 0.1247 46.2007)',
                accentForeground: 'oklch(0.9243 0.1151 95.7459)',
                destructive: 'oklch(0.6368 0.2078 25.3313)',
                destructiveForeground: 'oklch(1.0000 0 0)',
                border: 'oklch(0.3715 0 0)',
                input: 'oklch(0.3715 0 0)',
                ring: 'oklch(0.7686 0.1647 70.0804)',
                chart1: 'oklch(0.8369 0.1644 84.4286)',
                chart2: 'oklch(0.6658 0.1574 58.3183)',
                chart3: 'oklch(0.4732 0.1247 46.2007)',
                chart4: 'oklch(0.5553 0.1455 48.9975)',
                chart5: 'oklch(0.4732 0.1247 46.2007)',
                sidebar: 'oklch(0.1684 0 0)',
                sidebarForeground: 'oklch(0.9219 0 0)',
                sidebarPrimary: 'oklch(0.7686 0.1647 70.0804)',
                sidebarPrimaryForeground: 'oklch(1.0000 0 0)',
                sidebarAccent: 'oklch(0.4732 0.1247 46.2007)',
                sidebarAccentForeground: 'oklch(0.9243 0.1151 95.7459)',
                sidebarBorder: 'oklch(0.3715 0 0)',
                sidebarRing: 'oklch(0.7686 0.1647 70.0804)',
            },
        },
        fonts: {
            sans: 'Inter, sans-serif',
            serif: 'Source Serif 4, serif',
            mono: 'JetBrains Mono, monospace',
        },
        radius: '0.375rem',
        shadows: {
            light: {
                shadow2xs: '0px 4px 8px -1px hsl(0 0% 0% / 0.05)',
                shadowXs: '0px 4px 8px -1px hsl(0 0% 0% / 0.05)',
                shadowSm: '0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 1px 2px -2px hsl(0 0% 0% / 0.10)',
                shadow: '0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 1px 2px -2px hsl(0 0% 0% / 0.10)',
                shadowMd: '0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 2px 4px -2px hsl(0 0% 0% / 0.10)',
                shadowLg: '0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 4px 6px -2px hsl(0 0% 0% / 0.10)',
                shadowXl: '0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 8px 10px -2px hsl(0 0% 0% / 0.10)',
                shadow2xl: '0px 4px 8px -1px hsl(0 0% 0% / 0.25)',
            },
            dark: {
                shadow2xs: '0px 4px 8px -1px hsl(0 0% 0% / 0.05)',
                shadowXs: '0px 4px 8px -1px hsl(0 0% 0% / 0.05)',
                shadowSm: '0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 1px 2px -2px hsl(0 0% 0% / 0.10)',
                shadow: '0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 1px 2px -2px hsl(0 0% 0% / 0.10)',
                shadowMd: '0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 2px 4px -2px hsl(0 0% 0% / 0.10)',
                shadowLg: '0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 4px 6px -2px hsl(0 0% 0% / 0.10)',
                shadowXl: '0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 8px 10px -2px hsl(0 0% 0% / 0.10)',
                shadow2xl: '0px 4px 8px -1px hsl(0 0% 0% / 0.25)',
            },
        },
    },

    // Latte Theme (Coffee/neutral tones)
    {
        id: 'latte',
        name: { en: 'Latte', fr: 'Latte' },
        description: { en: 'Warm coffee and cream tones', fr: 'Tons café crème chaleureux' },
        colors: {
            light: {
                background: 'oklch(0.9821 0 0)',
                foreground: 'oklch(0.2435 0 0)',
                card: 'oklch(0.9911 0 0)',
                cardForeground: 'oklch(0.2435 0 0)',
                popover: 'oklch(0.9911 0 0)',
                popoverForeground: 'oklch(0.2435 0 0)',
                primary: 'oklch(0.4341 0.0392 41.9938)',
                primaryForeground: 'oklch(1.0000 0 0)',
                secondary: 'oklch(0.9200 0.0651 74.3695)',
                secondaryForeground: 'oklch(0.3499 0.0685 40.8288)',
                muted: 'oklch(0.9521 0 0)',
                mutedForeground: 'oklch(0.5032 0 0)',
                accent: 'oklch(0.9310 0 0)',
                accentForeground: 'oklch(0.2435 0 0)',
                destructive: 'oklch(0.6271 0.1936 33.3390)',
                destructiveForeground: 'oklch(1.0000 0 0)',
                border: 'oklch(0.8822 0 0)',
                input: 'oklch(0.8822 0 0)',
                ring: 'oklch(0.4341 0.0392 41.9938)',
                chart1: 'oklch(0.4341 0.0392 41.9938)',
                chart2: 'oklch(0.9200 0.0651 74.3695)',
                chart3: 'oklch(0.9310 0 0)',
                chart4: 'oklch(0.9367 0.0523 75.5009)',
                chart5: 'oklch(0.4338 0.0437 41.6746)',
                sidebar: 'oklch(0.9881 0 0)',
                sidebarForeground: 'oklch(0.2645 0 0)',
                sidebarPrimary: 'oklch(0.3250 0 0)',
                sidebarPrimaryForeground: 'oklch(0.9881 0 0)',
                sidebarAccent: 'oklch(0.9761 0 0)',
                sidebarAccentForeground: 'oklch(0.3250 0 0)',
                sidebarBorder: 'oklch(0.9401 0 0)',
                sidebarRing: 'oklch(0.7731 0 0)',
            },
            dark: {
                background: 'oklch(0.1776 0 0)',
                foreground: 'oklch(0.9491 0 0)',
                card: 'oklch(0.2134 0 0)',
                cardForeground: 'oklch(0.9491 0 0)',
                popover: 'oklch(0.2134 0 0)',
                popoverForeground: 'oklch(0.9491 0 0)',
                primary: 'oklch(0.9247 0.0524 66.1732)',
                primaryForeground: 'oklch(0.2029 0.0240 200.1962)',
                secondary: 'oklch(0.3163 0.0190 63.6992)',
                secondaryForeground: 'oklch(0.9247 0.0524 66.1732)',
                muted: 'oklch(0.2520 0 0)',
                mutedForeground: 'oklch(0.7699 0 0)',
                accent: 'oklch(0.2850 0 0)',
                accentForeground: 'oklch(0.9491 0 0)',
                destructive: 'oklch(0.6271 0.1936 33.3390)',
                destructiveForeground: 'oklch(1.0000 0 0)',
                border: 'oklch(0.2351 0.0115 91.7467)',
                input: 'oklch(0.4017 0 0)',
                ring: 'oklch(0.9247 0.0524 66.1732)',
                chart1: 'oklch(0.9247 0.0524 66.1732)',
                chart2: 'oklch(0.3163 0.0190 63.6992)',
                chart3: 'oklch(0.2850 0 0)',
                chart4: 'oklch(0.3481 0.0219 67.0001)',
                chart5: 'oklch(0.9245 0.0533 67.0855)',
                sidebar: 'oklch(0.2103 0.0059 285.8852)',
                sidebarForeground: 'oklch(0.9674 0.0013 286.3752)',
                sidebarPrimary: 'oklch(0.4882 0.2172 264.3763)',
                sidebarPrimaryForeground: 'oklch(1.0000 0 0)',
                sidebarAccent: 'oklch(0.2739 0.0055 286.0326)',
                sidebarAccentForeground: 'oklch(0.9674 0.0013 286.3752)',
                sidebarBorder: 'oklch(0.2739 0.0055 286.0326)',
                sidebarRing: 'oklch(0.8711 0.0055 286.2860)',
            },
        },
        fonts: {
            sans: 'ui-sans-serif, system-ui, sans-serif',
            serif: 'ui-serif, Georgia, serif',
            mono: 'ui-monospace, monospace',
        },
        radius: '0.5rem',
        shadows: {
            light: {
                shadow2xs: '0 1px 3px 0px hsl(0 0% 0% / 0.05)',
                shadowXs: '0 1px 3px 0px hsl(0 0% 0% / 0.05)',
                shadowSm: '0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)',
                shadow: '0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)',
                shadowMd: '0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10)',
                shadowLg: '0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10)',
                shadowXl: '0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10)',
                shadow2xl: '0 1px 3px 0px hsl(0 0% 0% / 0.25)',
            },
            dark: {
                shadow2xs: '0 1px 3px 0px hsl(0 0% 0% / 0.05)',
                shadowXs: '0 1px 3px 0px hsl(0 0% 0% / 0.05)',
                shadowSm: '0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)',
                shadow: '0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)',
                shadowMd: '0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10)',
                shadowLg: '0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10)',
                shadowXl: '0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10)',
                shadow2xl: '0 1px 3px 0px hsl(0 0% 0% / 0.25)',
            },
        },
    },

    // Retro Theme (Vintage colors)
    {
        id: 'retro',
        name: { en: 'Retro', fr: 'Rétro' },
        description: { en: 'Vintage retro color palette', fr: 'Palette de couleurs vintage rétro' },
        colors: {
            light: {
                background: 'oklch(0.9735 0.0261 90.0953)',
                foreground: 'oklch(0.3092 0.0518 219.6516)',
                card: 'oklch(0.9306 0.0260 92.4020)',
                cardForeground: 'oklch(0.3092 0.0518 219.6516)',
                popover: 'oklch(0.9306 0.0260 92.4020)',
                popoverForeground: 'oklch(0.3092 0.0518 219.6516)',
                primary: 'oklch(0.5924 0.2025 355.8943)',
                primaryForeground: 'oklch(1.0000 0 0)',
                secondary: 'oklch(0.6437 0.1019 187.3840)',
                secondaryForeground: 'oklch(1.0000 0 0)',
                muted: 'oklch(0.6979 0.0159 196.7940)',
                mutedForeground: 'oklch(0.3092 0.0518 219.6516)',
                accent: 'oklch(0.5808 0.1732 39.5003)',
                accentForeground: 'oklch(1.0000 0 0)',
                destructive: 'oklch(0.5863 0.2064 27.1172)',
                destructiveForeground: 'oklch(1.0000 0 0)',
                border: 'oklch(0.6537 0.0197 205.2618)',
                input: 'oklch(0.6537 0.0197 205.2618)',
                ring: 'oklch(0.5924 0.2025 355.8943)',
                chart1: 'oklch(0.6149 0.1394 244.9273)',
                chart2: 'oklch(0.6437 0.1019 187.3840)',
                chart3: 'oklch(0.5924 0.2025 355.8943)',
                chart4: 'oklch(0.5808 0.1732 39.5003)',
                chart5: 'oklch(0.5863 0.2064 27.1172)',
                sidebar: 'oklch(0.9735 0.0261 90.0953)',
                sidebarForeground: 'oklch(0.3092 0.0518 219.6516)',
                sidebarPrimary: 'oklch(0.5924 0.2025 355.8943)',
                sidebarPrimaryForeground: 'oklch(1.0000 0 0)',
                sidebarAccent: 'oklch(0.6437 0.1019 187.3840)',
                sidebarAccentForeground: 'oklch(1.0000 0 0)',
                sidebarBorder: 'oklch(0.6537 0.0197 205.2618)',
                sidebarRing: 'oklch(0.5924 0.2025 355.8943)',
            },
            dark: {
                background: 'oklch(0.2673 0.0486 219.8169)',
                foreground: 'oklch(0.6979 0.0159 196.7940)',
                card: 'oklch(0.3092 0.0518 219.6516)',
                cardForeground: 'oklch(0.6979 0.0159 196.7940)',
                popover: 'oklch(0.3092 0.0518 219.6516)',
                popoverForeground: 'oklch(0.6979 0.0159 196.7940)',
                primary: 'oklch(0.5924 0.2025 355.8943)',
                primaryForeground: 'oklch(1.0000 0 0)',
                secondary: 'oklch(0.6437 0.1019 187.3840)',
                secondaryForeground: 'oklch(1.0000 0 0)',
                muted: 'oklch(0.5230 0.0283 219.1365)',
                mutedForeground: 'oklch(0.6979 0.0159 196.7940)',
                accent: 'oklch(0.5808 0.1732 39.5003)',
                accentForeground: 'oklch(1.0000 0 0)',
                destructive: 'oklch(0.5863 0.2064 27.1172)',
                destructiveForeground: 'oklch(1.0000 0 0)',
                border: 'oklch(0.5230 0.0283 219.1365)',
                input: 'oklch(0.5230 0.0283 219.1365)',
                ring: 'oklch(0.5924 0.2025 355.8943)',
                chart1: 'oklch(0.6149 0.1394 244.9273)',
                chart2: 'oklch(0.6437 0.1019 187.3840)',
                chart3: 'oklch(0.5924 0.2025 355.8943)',
                chart4: 'oklch(0.5808 0.1732 39.5003)',
                chart5: 'oklch(0.5863 0.2064 27.1172)',
                sidebar: 'oklch(0.2673 0.0486 219.8169)',
                sidebarForeground: 'oklch(0.6979 0.0159 196.7940)',
                sidebarPrimary: 'oklch(0.5924 0.2025 355.8943)',
                sidebarPrimaryForeground: 'oklch(1.0000 0 0)',
                sidebarAccent: 'oklch(0.6437 0.1019 187.3840)',
                sidebarAccentForeground: 'oklch(1.0000 0 0)',
                sidebarBorder: 'oklch(0.5230 0.0283 219.1365)',
                sidebarRing: 'oklch(0.5924 0.2025 355.8943)',
            },
        },
        fonts: {
            sans: 'Outfit, sans-serif',
            serif: 'ui-serif, Georgia, serif',
            mono: 'Space Mono, monospace',
        },
        radius: '0.25rem',
        shadows: {
            light: {
                shadow2xs: '2px 2px 4px 0px hsl(196 83% 10% / 0.07)',
                shadowXs: '2px 2px 4px 0px hsl(196 83% 10% / 0.07)',
                shadowSm: '2px 2px 4px 0px hsl(196 83% 10% / 0.15), 2px 1px 2px -1px hsl(196 83% 10% / 0.15)',
                shadow: '2px 2px 4px 0px hsl(196 83% 10% / 0.15), 2px 1px 2px -1px hsl(196 83% 10% / 0.15)',
                shadowMd: '2px 2px 4px 0px hsl(196 83% 10% / 0.15), 2px 2px 4px -1px hsl(196 83% 10% / 0.15)',
                shadowLg: '2px 2px 4px 0px hsl(196 83% 10% / 0.15), 2px 4px 6px -1px hsl(196 83% 10% / 0.15)',
                shadowXl: '2px 2px 4px 0px hsl(196 83% 10% / 0.15), 2px 8px 10px -1px hsl(196 83% 10% / 0.15)',
                shadow2xl: '2px 2px 4px 0px hsl(196 83% 10% / 0.38)',
            },
            dark: {
                shadow2xs: '2px 2px 4px 0px hsl(196 83% 10% / 0.07)',
                shadowXs: '2px 2px 4px 0px hsl(196 83% 10% / 0.07)',
                shadowSm: '2px 2px 4px 0px hsl(196 83% 10% / 0.15), 2px 1px 2px -1px hsl(196 83% 10% / 0.15)',
                shadow: '2px 2px 4px 0px hsl(196 83% 10% / 0.15), 2px 1px 2px -1px hsl(196 83% 10% / 0.15)',
                shadowMd: '2px 2px 4px 0px hsl(196 83% 10% / 0.15), 2px 2px 4px -1px hsl(196 83% 10% / 0.15)',
                shadowLg: '2px 2px 4px 0px hsl(196 83% 10% / 0.15), 2px 4px 6px -1px hsl(196 83% 10% / 0.15)',
                shadowXl: '2px 2px 4px 0px hsl(196 83% 10% / 0.15), 2px 8px 10px -1px hsl(196 83% 10% / 0.15)',
                shadow2xl: '2px 2px 4px 0px hsl(196 83% 10% / 0.38)',
            },
        },
    },

    // SodaPop Theme (Modern minimal with orange/teal)
    {
        id: 'sodapop',
        name: { en: 'SodaPop', fr: 'SodaPop' },
        description: { en: 'Fresh modern minimal', fr: 'Moderne minimaliste frais' },
        colors: {
            light: {
                background: 'oklch(1.0000 0 0)',
                foreground: 'oklch(0.2101 0.0318 264.6645)',
                card: 'oklch(1.0000 0 0)',
                cardForeground: 'oklch(0.2101 0.0318 264.6645)',
                popover: 'oklch(1.0000 0 0)',
                popoverForeground: 'oklch(0.2101 0.0318 264.6645)',
                primary: 'oklch(0.6716 0.1368 48.5130)',
                primaryForeground: 'oklch(1.0000 0 0)',
                secondary: 'oklch(0.5360 0.0398 196.0280)',
                secondaryForeground: 'oklch(1.0000 0 0)',
                muted: 'oklch(0.9670 0.0029 264.5419)',
                mutedForeground: 'oklch(0.5510 0.0234 264.3637)',
                accent: 'oklch(0.9491 0 0)',
                accentForeground: 'oklch(0.2101 0.0318 264.6645)',
                destructive: 'oklch(0.6368 0.2078 25.3313)',
                destructiveForeground: 'oklch(0.9851 0 0)',
                border: 'oklch(0.9276 0.0058 264.5313)',
                input: 'oklch(0.9276 0.0058 264.5313)',
                ring: 'oklch(0.6716 0.1368 48.5130)',
                chart1: 'oklch(0.5940 0.0443 196.0233)',
                chart2: 'oklch(0.7214 0.1337 49.9802)',
                chart3: 'oklch(0.8721 0.0864 68.5474)',
                chart4: 'oklch(0.6268 0 0)',
                chart5: 'oklch(0.6830 0 0)',
                sidebar: 'oklch(0.9670 0.0029 264.5419)',
                sidebarForeground: 'oklch(0.2101 0.0318 264.6645)',
                sidebarPrimary: 'oklch(0.6716 0.1368 48.5130)',
                sidebarPrimaryForeground: 'oklch(1.0000 0 0)',
                sidebarAccent: 'oklch(1.0000 0 0)',
                sidebarAccentForeground: 'oklch(0.2101 0.0318 264.6645)',
                sidebarBorder: 'oklch(0.9276 0.0058 264.5313)',
                sidebarRing: 'oklch(0.6716 0.1368 48.5130)',
            },
            dark: {
                background: 'oklch(0.1797 0.0043 308.1928)',
                foreground: 'oklch(0.8109 0 0)',
                card: 'oklch(0.1822 0 0)',
                cardForeground: 'oklch(0.8109 0 0)',
                popover: 'oklch(0.1797 0.0043 308.1928)',
                popoverForeground: 'oklch(0.8109 0 0)',
                primary: 'oklch(0.7214 0.1337 49.9802)',
                primaryForeground: 'oklch(0.1797 0.0043 308.1928)',
                secondary: 'oklch(0.5940 0.0443 196.0233)',
                secondaryForeground: 'oklch(0.1797 0.0043 308.1928)',
                muted: 'oklch(0.2520 0 0)',
                mutedForeground: 'oklch(0.6268 0 0)',
                accent: 'oklch(0.3211 0 0)',
                accentForeground: 'oklch(0.8109 0 0)',
                destructive: 'oklch(0.5940 0.0443 196.0233)',
                destructiveForeground: 'oklch(0.1797 0.0043 308.1928)',
                border: 'oklch(0.2520 0 0)',
                input: 'oklch(0.2520 0 0)',
                ring: 'oklch(0.7214 0.1337 49.9802)',
                chart1: 'oklch(0.5940 0.0443 196.0233)',
                chart2: 'oklch(0.7214 0.1337 49.9802)',
                chart3: 'oklch(0.8721 0.0864 68.5474)',
                chart4: 'oklch(0.6268 0 0)',
                chart5: 'oklch(0.6830 0 0)',
                sidebar: 'oklch(0.1822 0 0)',
                sidebarForeground: 'oklch(0.8109 0 0)',
                sidebarPrimary: 'oklch(0.7214 0.1337 49.9802)',
                sidebarPrimaryForeground: 'oklch(0.1797 0.0043 308.1928)',
                sidebarAccent: 'oklch(0.3211 0 0)',
                sidebarAccentForeground: 'oklch(0.8109 0 0)',
                sidebarBorder: 'oklch(0.2520 0 0)',
                sidebarRing: 'oklch(0.7214 0.1337 49.9802)',
            },
        },
        fonts: {
            sans: 'Geist Mono, ui-monospace, monospace',
            serif: 'serif',
            mono: 'JetBrains Mono, monospace',
        },
        radius: '0.75rem',
        shadows: {
            light: {
                shadow2xs: '0px 1px 4px 0px hsl(0 0% 0% / 0.03)',
                shadowXs: '0px 1px 4px 0px hsl(0 0% 0% / 0.03)',
                shadowSm: '0px 1px 4px 0px hsl(0 0% 0% / 0.05), 0px 1px 2px -1px hsl(0 0% 0% / 0.05)',
                shadow: '0px 1px 4px 0px hsl(0 0% 0% / 0.05), 0px 1px 2px -1px hsl(0 0% 0% / 0.05)',
                shadowMd: '0px 1px 4px 0px hsl(0 0% 0% / 0.05), 0px 2px 4px -1px hsl(0 0% 0% / 0.05)',
                shadowLg: '0px 1px 4px 0px hsl(0 0% 0% / 0.05), 0px 4px 6px -1px hsl(0 0% 0% / 0.05)',
                shadowXl: '0px 1px 4px 0px hsl(0 0% 0% / 0.05), 0px 8px 10px -1px hsl(0 0% 0% / 0.05)',
                shadow2xl: '0px 1px 4px 0px hsl(0 0% 0% / 0.13)',
            },
            dark: {
                shadow2xs: '0px 1px 4px 0px hsl(0 0% 0% / 0.03)',
                shadowXs: '0px 1px 4px 0px hsl(0 0% 0% / 0.03)',
                shadowSm: '0px 1px 4px 0px hsl(0 0% 0% / 0.05), 0px 1px 2px -1px hsl(0 0% 0% / 0.05)',
                shadow: '0px 1px 4px 0px hsl(0 0% 0% / 0.05), 0px 1px 2px -1px hsl(0 0% 0% / 0.05)',
                shadowMd: '0px 1px 4px 0px hsl(0 0% 0% / 0.05), 0px 2px 4px -1px hsl(0 0% 0% / 0.05)',
                shadowLg: '0px 1px 4px 0px hsl(0 0% 0% / 0.05), 0px 4px 6px -1px hsl(0 0% 0% / 0.05)',
                shadowXl: '0px 1px 4px 0px hsl(0 0% 0% / 0.05), 0px 8px 10px -1px hsl(0 0% 0% / 0.05)',
                shadow2xl: '0px 1px 4px 0px hsl(0 0% 0% / 0.13)',
            },
        },
    },
];

// ================================
// Helper Functions
// ================================

export function getThemeById(id: ThemeId): ThemeConfig | undefined {
    return PRESET_THEMES.find(theme => theme.id === id);
}

export function getDefaultTheme(): ThemeConfig {
    return PRESET_THEMES[0]; // Tech theme
}

/**
 * Convert camelCase to kebab-case for CSS variable names
 */
function toKebabCase(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Apply a theme's CSS variables to a specific container element (for scoped theming)
 * This allows portfolio themes to be applied only to the portfolio area, not the whole site
 */
export function applyThemeToElement(element: HTMLElement, theme: ThemeConfig, isDark: boolean): void {
    const colors = isDark ? theme.colors.dark : theme.colors.light;
    const shadows = isDark ? theme.shadows.dark : theme.shadows.light;

    // Apply color variables
    Object.entries(colors).forEach(([key, value]) => {
        const cssVarName = `--${toKebabCase(key)}`;
        element.style.setProperty(cssVarName, value);
    });

    // Apply font variables
    element.style.setProperty('--font-sans', theme.fonts.sans);
    element.style.setProperty('--font-serif', theme.fonts.serif);
    element.style.setProperty('--font-mono', theme.fonts.mono);

    // Apply radius
    element.style.setProperty('--radius', theme.radius);

    // Apply shadow variables
    element.style.setProperty('--shadow-2xs', shadows.shadow2xs);
    element.style.setProperty('--shadow-xs', shadows.shadowXs);
    element.style.setProperty('--shadow-sm', shadows.shadowSm);
    element.style.setProperty('--shadow', shadows.shadow);
    element.style.setProperty('--shadow-md', shadows.shadowMd);
    element.style.setProperty('--shadow-lg', shadows.shadowLg);
    element.style.setProperty('--shadow-xl', shadows.shadowXl);
    element.style.setProperty('--shadow-2xl', shadows.shadow2xl);
}

/**
 * Apply theme to the portfolio preview container (used in layout editor)
 */
export function applyThemeToPreview(theme: ThemeConfig, isDark: boolean): void {
    const previewElement = document.getElementById('portfolio-preview');
    if (previewElement) {
        applyThemeToElement(previewElement, theme, isDark);
    }
}

/**
 * Generate inline CSS style object for portfolio theming (for SSR-safe approach)
 */
export function getThemeStyleVariables(theme: ThemeConfig, isDark: boolean): Record<string, string> {
    const colors = isDark ? theme.colors.dark : theme.colors.light;
    const shadows = isDark ? theme.shadows.dark : theme.shadows.light;

    const styles: Record<string, string> = {};

    // Apply color variables
    Object.entries(colors).forEach(([key, value]) => {
        const cssVarName = `--${toKebabCase(key)}`;
        styles[cssVarName] = value;
    });

    // Apply font variables
    styles['--font-sans'] = theme.fonts.sans;
    styles['--font-serif'] = theme.fonts.serif;
    styles['--font-mono'] = theme.fonts.mono;

    // Apply radius
    styles['--radius'] = theme.radius;

    // Apply shadow variables
    styles['--shadow-2xs'] = shadows.shadow2xs;
    styles['--shadow-xs'] = shadows.shadowXs;
    styles['--shadow-sm'] = shadows.shadowSm;
    styles['--shadow'] = shadows.shadow;
    styles['--shadow-md'] = shadows.shadowMd;
    styles['--shadow-lg'] = shadows.shadowLg;
    styles['--shadow-xl'] = shadows.shadowXl;
    styles['--shadow-2xl'] = shadows.shadow2xl;

    return styles;
}
