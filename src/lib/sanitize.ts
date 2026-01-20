/**
 * Input sanitization utilities for XSS prevention
 */

// HTML entities to escape
const HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
};

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Strip all HTML tags from a string
 */
export function stripHtml(str: string): string {
    if (typeof str !== 'string') return '';
    return str.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize a string by stripping HTML and trimming whitespace
 */
export function sanitizeString(str: string, maxLength?: number): string {
    if (typeof str !== 'string') return '';
    let sanitized = stripHtml(str).trim();
    if (maxLength && sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }
    return sanitized;
}

/**
 * Validate and sanitize an email address
 */
export function sanitizeEmail(email: string): string | null {
    if (typeof email !== 'string') return null;
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return null;
    if (trimmed.length > 254) return null; // RFC 5321 limit
    return trimmed;
}

/**
 * Validate and sanitize a URL
 */
export function sanitizeUrl(url: string): string | null {
    if (typeof url !== 'string' || !url.trim()) return null;
    const trimmed = url.trim();

    try {
        const parsed = new URL(trimmed);
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return null;
        }
        return parsed.href;
    } catch {
        return null;
    }
}

/**
 * Sanitize a username (alphanumeric, hyphens, underscores only)
 */
export function sanitizeUsername(username: string): string | null {
    if (typeof username !== 'string') return null;
    const trimmed = username.trim().toLowerCase();
    if (!/^[a-z0-9_-]+$/.test(trimmed)) return null;
    if (trimmed.length < 3 || trimmed.length > 30) return null;
    return trimmed;
}

/**
 * Sanitize an object's string properties recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            result[key] = sanitizeString(value);
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            result[key] = sanitizeObject(value as Record<string, unknown>);
        } else if (Array.isArray(value)) {
            result[key] = value.map(item =>
                typeof item === 'string' ? sanitizeString(item) : item
            );
        } else {
            result[key] = value;
        }
    }

    return result as T;
}
