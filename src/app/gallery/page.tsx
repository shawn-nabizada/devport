'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n';
import { GalleryCard } from '@/components/gallery/gallery-card';
import { Search, Filter, Loader2, Users } from 'lucide-react';

interface Portfolio {
    userId: string;
    username: string;
    name: string;
    image?: string;
    headline: { en: string; fr: string };
    bio: { en: string; fr: string };
    location?: string;
    skills: Array<{ name: { en: string; fr: string }; proficiency: number }>;
    featuredAt?: string;
}

interface GalleryResponse {
    portfolios: Portfolio[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export default function GalleryPage() {
    const { t, language } = useTranslation();
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [skillFilter, setSkillFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchPortfolios = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.set('q', searchQuery);
            if (skillFilter) params.set('skills', skillFilter);
            params.set('page', page.toString());

            const res = await fetch(`/api/gallery?${params.toString()}`);
            if (res.ok) {
                const data: GalleryResponse = await res.json();
                setPortfolios(data.portfolios);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch portfolios:', error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, skillFilter, page]);

    useEffect(() => {
        fetchPortfolios();
    }, [fetchPortfolios]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchPortfolios();
    };

    const featuredPortfolios = portfolios.filter(p => p.featuredAt);
    const regularPortfolios = portfolios.filter(p => !p.featuredAt);

    return (
        <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
            {/* Hero */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
                        <Users className="h-4 w-4" />
                        {t('gallery.title')}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        {t('gallery.subtitle')}
                    </h1>

                    {/* Search and Filter */}
                    <form onSubmit={handleSearch} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('gallery.searchPlaceholder')}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={skillFilter}
                                onChange={(e) => setSkillFilter(e.target.value)}
                                placeholder={t('gallery.filterBySkills')}
                                className="w-full sm:w-48 pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
                        >
                            {t('common.search')}
                        </button>
                    </form>
                </div>
            </section>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 pb-16">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : portfolios.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            {t('gallery.noResults')}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Featured Section */}
                        {featuredPortfolios.length > 0 && (
                            <section className="mb-12">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="text-yellow-500">★</span>
                                    {t('gallery.featured')}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {featuredPortfolios.map((portfolio) => (
                                        <GalleryCard
                                            key={portfolio.userId}
                                            portfolio={portfolio}
                                            language={language}
                                            featured
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Regular Portfolios */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {regularPortfolios.map((portfolio) => (
                                <GalleryCard
                                    key={portfolio.userId}
                                    portfolio={portfolio}
                                    language={language}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-12">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {t('common.previous')}
                                </button>
                                <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {t('common.next')}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
