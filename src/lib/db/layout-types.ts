import { ObjectId } from 'mongodb';

// ================================
// Grid Layout System
// ================================

/**
 * Block types available in the grid editor
 */
export type BlockType = 'text' | 'image' | 'skills' | 'social' | 'video';

/**
 * Text block content
 */
export interface TextBlockContent {
    variant: 'heading' | 'paragraph';
    text: {
        en: string;
        fr: string;
    };
}

/**
 * Image block content
 */
export interface ImageBlockContent {
    imageUrl: string;
    alt: {
        en: string;
        fr: string;
    };
    caption?: {
        en: string;
        fr: string;
    };
    fit: 'cover' | 'contain' | 'fill';
}

/**
 * Skills block content - displays user's skills as progress bars
 */
export interface SkillsBlockContent {
    skillIds: string[]; // References to skills collection
    showLabels: boolean;
    showPercentage: boolean;
    layout: 'vertical' | 'horizontal';
}

/**
 * Social links block content
 */
export interface SocialBlockContent {
    links: Array<{
        platform: 'linkedin' | 'github' | 'twitter' | 'website' | 'email';
        url: string;
        label?: string;
    }>;
    displayStyle: 'icons' | 'buttons' | 'cards';
}

/**
 * Video block content
 */
export interface VideoBlockContent {
    source: 'upload' | 'youtube' | 'vimeo';
    url: string;
    title?: {
        en: string;
        fr: string;
    };
    autoplay: boolean;
    muted: boolean;
}

/**
 * Union type for all block content types
 */
export type BlockContent =
    | { type: 'text'; data: TextBlockContent }
    | { type: 'image'; data: ImageBlockContent }
    | { type: 'skills'; data: SkillsBlockContent }
    | { type: 'social'; data: SocialBlockContent }
    | { type: 'video'; data: VideoBlockContent };

/**
 * A block in the grid layout
 */
export interface GridBlock {
    _id: ObjectId;
    userId: ObjectId;
    type: BlockType;
    content: BlockContent;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Layout item position in the grid (react-grid-layout format)
 */
export interface LayoutItem {
    i: string;      // Block ID
    x: number;      // Column position
    y: number;      // Row position
    w: number;      // Width in grid units
    h: number;      // Height in grid units
    minW?: number;  // Minimum width
    minH?: number;  // Minimum height
    maxW?: number;  // Maximum width
    maxH?: number;  // Maximum height
    static?: boolean; // If true, item is not draggable/resizable
}

/**
 * Device type for responsive layouts
 */
export type DeviceType = 'desktop' | 'mobile';

/**
 * Portfolio layout configuration
 */
export interface PortfolioLayout {
    _id: ObjectId;
    userId: ObjectId;
    device: DeviceType;
    layout: LayoutItem[];
    cols: number;           // Number of columns for this device
    rowHeight: number;      // Height of each row in pixels
    enabled: boolean;       // Whether custom layout is enabled
    updatedAt: Date;
}

/**
 * Default layout configurations
 */
export const DEFAULT_LAYOUT_CONFIG = {
    desktop: { cols: 12, rowHeight: 80 },
    mobile: { cols: 4, rowHeight: 60 },
} as const;
