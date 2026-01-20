'use client';

import { useEffect, useCallback } from 'react';

interface TrackingOptions {
    userId: string;
}

/**
 * Hook to track analytics events on portfolio pages
 */
export function useAnalyticsTracking({ userId }: TrackingOptions) {
    // Track page view on mount
    useEffect(() => {
        trackEvent(userId, 'page_view', { page: window.location.pathname });
    }, [userId]);

    // Track project click
    const trackProjectClick = useCallback((projectId: string) => {
        trackEvent(userId, 'project_click', { projectId });
    }, [userId]);

    // Track resume download
    const trackResumeDownload = useCallback((language: 'en' | 'fr') => {
        trackEvent(userId, 'resume_download', { resumeLanguage: language });
    }, [userId]);

    // Track contact form submission
    const trackContactSubmit = useCallback(() => {
        trackEvent(userId, 'contact_submit', {});
    }, [userId]);

    // Track social link click
    const trackSocialClick = useCallback((platform: string) => {
        trackEvent(userId, 'social_click', { socialPlatform: platform });
    }, [userId]);

    return {
        trackProjectClick,
        trackResumeDownload,
        trackContactSubmit,
        trackSocialClick,
    };
}

/**
 * Send tracking event to API
 */
async function trackEvent(
    userId: string,
    eventType: string,
    metadata: Record<string, unknown>
) {
    try {
        await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, eventType, metadata }),
        });
    } catch (error) {
        // Silently fail - analytics shouldn't break the page
        console.debug('Analytics tracking failed:', error);
    }
}
