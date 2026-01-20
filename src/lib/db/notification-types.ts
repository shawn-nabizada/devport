import { ObjectId } from 'mongodb';

// ================================
// Notification Preferences Types
// ================================

/**
 * User's notification preferences
 */
export interface NotificationPreferences {
    _id: ObjectId;
    userId: ObjectId;
    emailOnResumeDownload: boolean;
    emailOnContactMessage: boolean;
    emailOnTestimonial: boolean;
    emailDigest: 'none' | 'daily' | 'weekly';
    updatedAt: Date;
}

/**
 * Default notification preferences
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: Omit<NotificationPreferences, '_id' | 'userId' | 'updatedAt'> = {
    emailOnResumeDownload: true,
    emailOnContactMessage: true,
    emailOnTestimonial: true,
    emailDigest: 'weekly',
};
