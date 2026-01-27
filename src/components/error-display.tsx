'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import {
    AlertCircle,
    Lock,
    ShieldX,
    FileQuestion,
    ServerCrash,
    WifiOff,
    Clock,
    Home,
    ArrowLeft
} from 'lucide-react';

const errorIcons: Record<number, React.ElementType> = {
    400: AlertCircle,
    401: Lock,
    403: ShieldX,
    404: FileQuestion,
    500: ServerCrash,
    502: WifiOff,
    503: Clock,
};

interface ErrorDisplayProps {
    statusCode?: number;
    title?: string;
    description?: string;
    showHomeButton?: boolean;
    showBackButton?: boolean;
    reset?: () => void;
}

export function ErrorDisplay({
    statusCode = 500,
    title,
    description,
    showHomeButton = true,
    showBackButton = true,
    reset,
}: ErrorDisplayProps) {
    const router = useRouter();
    const { t } = useTranslation();

    const Icon = errorIcons[statusCode] || errorIcons[500];
    const errorKey = statusCode as 400 | 401 | 403 | 404 | 500 | 502 | 503;

    // Get translations for error messages
    const errorTitle = title || t(`errors.${errorKey}.title`) || 'Error';
    const errorDescription = description || t(`errors.${errorKey}.description`) || 'An error occurred';
    const errorSuggestion = t(`errors.${errorKey}.suggestion`) || '';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4">
            <div className="max-w-md w-full">
                {/* Error Card */}
                <div className="bg-card border border-border rounded-2xl shadow-xl p-8 text-center">
                    {/* Icon with animated background */}
                    <div className="relative mx-auto w-20 h-20 mb-6">
                        <div className="absolute inset-0 bg-destructive/10 rounded-full animate-pulse" />
                        <div className="absolute inset-2 bg-destructive/20 rounded-full" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Icon className="w-10 h-10 text-destructive" />
                        </div>
                    </div>

                    {/* Status Code */}
                    <div className="text-6xl font-bold text-muted-foreground/30 mb-2">
                        {statusCode}
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                        {errorTitle}
                    </h1>

                    {/* Description */}
                    <p className="text-muted-foreground mb-2">
                        {errorDescription}
                    </p>

                    {/* Suggestion */}
                    {errorSuggestion && (
                        <p className="text-sm text-muted-foreground/70 mb-6">
                            {errorSuggestion}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {showBackButton && (
                            <button
                                onClick={() => router.back()}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground hover:bg-accent transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                {t('errors.goBack')}
                            </button>
                        )}

                        {showHomeButton && (
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                {t('errors.goHome')}
                            </Link>
                        )}

                        {reset && (
                            <button
                                onClick={reset}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                                {t('errors.tryAgain')}
                            </button>
                        )}
                    </div>

                    {/* Login link for 401 */}
                    {statusCode === 401 && (
                        <div className="mt-6 pt-6 border-t border-border">
                            <Link
                                href="/login"
                                className="text-primary hover:underline font-medium"
                            >
                                {t('errors.signInPrompt')} →
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                    {t('errors.needHelp')}{' '}
                    <Link href="/contact" className="text-primary hover:underline">
                        {t('errors.contactSupport')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
