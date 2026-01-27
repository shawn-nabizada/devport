'use client';

import { useEffect } from 'react';
import { ErrorDisplay } from '@/components/error-display';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application error:', error);
    }, [error]);

    // Try to determine the error type from the message
    let statusCode = 500;
    const errorMessage = error.message?.toLowerCase() || '';

    if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
        statusCode = 401;
    } else if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
        statusCode = 403;
    } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        statusCode = 404;
    } else if (errorMessage.includes('bad request') || errorMessage.includes('400')) {
        statusCode = 400;
    }

    return (
        <ErrorDisplay
            statusCode={statusCode}
            reset={reset}
            description={process.env.NODE_ENV === 'development' ? error.message : undefined}
        />
    );
}
