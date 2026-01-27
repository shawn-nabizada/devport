import { ObjectId } from 'mongodb';

// ================================
// Analytics Types
// ================================

/**
 * Types of analytics events
 */
export type AnalyticsEventType =
    | 'page_view'
    | 'project_click'
    | 'resume_download'
    | 'contact_submit'
    | 'testimonial_submit'
    | 'social_click';

/**
 * Single analytics event
 */
export interface AnalyticsEvent {
    _id: ObjectId;
    userId: ObjectId;           // Portfolio owner
    eventType: AnalyticsEventType;
    metadata: {
        projectId?: string;     // For project_click events
        resumeLanguage?: 'en' | 'fr'; // For resume_download
        socialPlatform?: string; // For social_click
        page?: string;          // For page_view
        referrer?: string;      // Where visitor came from
        userAgent?: string;     // Browser info
    };
    visitorId?: string;         // Anonymous visitor tracking (cookie-based)
    ipHash?: string;            // Hashed IP for unique visitor count
    country?: string;           // Geolocation (from IP)
    createdAt: Date;
}

/**
 * Aggregated daily stats for faster querying
 */
export interface DailyAnalytics {
    _id: ObjectId;
    userId: ObjectId;
    date: Date;                 // Normalized to start of day
    pageViews: number;
    uniqueVisitors: number;
    projectClicks: Record<string, number>; // projectId -> count
    resumeDownloads: {
        en: number;
        fr: number;
    };
    contactSubmissions: number;
    testimonialSubmissions: number;
    socialClicks: Record<string, number>; // platform -> count
    topReferrers: Record<string, number>; // referrer -> count
    locations: Record<string, number>; // country -> count
}

/**
 * User's analytics summary (cached for dashboard)
 */
export interface AnalyticsSummary {
    _id: ObjectId;
    userId: ObjectId;
    totalPageViews: number;
    totalUniqueVisitors: number;
    totalResumeDownloads: number;
    totalContactSubmissions: number;
    topProjects: Array<{
        projectId: string;
        projectTitle: string;
        clicks: number;
    }>;
    last30DaysViews: number;
    last7DaysViews: number;
    updatedAt: Date;
}

/**
 * Create a normalized date (start of day in UTC)
 */
export function normalizeDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setUTCHours(0, 0, 0, 0);
    return normalized;
}

/**
 * Hash an IP address for privacy
 */
export function hashIP(ip: string, salt: string): string {
    // Simple hash - in production use crypto
    let hash = 0;
    const str = ip + salt;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}
