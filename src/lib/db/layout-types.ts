import { ObjectId } from 'mongodb';

// ================================
// Grid Layout System
// ================================

/**
 * Block types available in the grid editor
 */
export type BlockType = 'text' | 'image' | 'skills' | 'video' | 'projects' | 'experience' | 'education' | 'hobbies' | 'resume';

/**
 * Text block content with formatting options
 */
export interface TextBlockContent {
    variant: 'heading' | 'paragraph';
    text: {
        en: string;
        fr: string;
    };
    // Text formatting options
    fontSize?: number;          // Font size in pixels
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline';
    textAlign?: 'left' | 'center' | 'right' | 'justify';
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
 * Projects block content - displays user's projects
 */
export interface ProjectsBlockContent {
    projectIds: string[]; // References to projects collection, empty = show all
    layout: 'grid' | 'list' | 'carousel';
    showDescription: boolean;
    showTechnologies: boolean;
    featuredOnly: boolean;
}

/**
 * Experience block content - displays work experience
 */
export interface ExperienceBlockContent {
    experienceIds: string[]; // References to experience collection, empty = show all
    layout: 'timeline' | 'cards';
    showDescription: boolean;
}

/**
 * Education block content - displays education history
 */
export interface EducationBlockContent {
    educationIds: string[]; // References to education collection, empty = show all
    layout: 'timeline' | 'cards';
    showDescription: boolean;
}

/**
 * Hobbies block content - displays user's hobbies
 */
export interface HobbiesBlockContent {
    layout: 'tags' | 'list' | 'grid';
}

/**
 * Resume block content - displays resume download buttons
 */
export interface ResumeBlockContent {
    displayStyle: 'buttons' | 'cards';
    showBothLanguages: boolean;
}

/**
 * Union type for all block content types
 */
export type BlockContent =
    | { type: 'text'; data: TextBlockContent }
    | { type: 'image'; data: ImageBlockContent }
    | { type: 'skills'; data: SkillsBlockContent }
    | { type: 'video'; data: VideoBlockContent }
    | { type: 'projects'; data: ProjectsBlockContent }
    | { type: 'experience'; data: ExperienceBlockContent }
    | { type: 'education'; data: EducationBlockContent }
    | { type: 'hobbies'; data: HobbiesBlockContent }
    | { type: 'resume'; data: ResumeBlockContent };

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
