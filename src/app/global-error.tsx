'use client';

import Link from 'next/link';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 px-4">
                    <div className="max-w-md w-full">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-8 text-center">
                            {/* Icon */}
                            <div className="relative mx-auto w-20 h-20 mb-6">
                                <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30 rounded-full animate-pulse" />
                                <div className="absolute inset-2 bg-red-200 dark:bg-red-900/50 rounded-full" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Status Code */}
                            <div className="text-6xl font-bold text-slate-300 dark:text-slate-600 mb-2">
                                500
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                Something Went Wrong
                            </h1>

                            {/* Description */}
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                A critical error occurred. We apologize for the inconvenience.
                            </p>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={reset}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                >
                                    Try Again
                                </button>
                                <Link
                                    href="/"
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Go Home
                                </Link>
                            </div>

                            {/* Error digest for debugging */}
                            {error.digest && (
                                <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
                                    Error ID: {error.digest}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
