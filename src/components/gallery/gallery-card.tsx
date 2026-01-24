'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ExternalLink, Star } from 'lucide-react';
import type { Language } from '@/lib/i18n/types';

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

interface GalleryCardProps {
    portfolio: Portfolio;
    language: Language;
    featured?: boolean;
}

export function GalleryCard({ portfolio, language, featured }: GalleryCardProps) {
    const headline = portfolio.headline[language] || portfolio.headline.en;

    return (
        <Link
            href={`/${portfolio.username}`}
            className={`
                group relative block rounded-2xl overflow-hidden bg-white dark:bg-gray-800 
                border border-gray-200 dark:border-gray-700 
                hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700
                transition-all duration-300 hover:-translate-y-1
                ${featured ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''}
            `}
        >
            {/* Featured Badge */}
            {featured && (
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-400 text-yellow-900 text-xs font-medium">
                    <Star className="h-3 w-3 fill-current" />
                    {featured ? 'Featured' : ''}
                </div>
            )}

            <div className="p-6">
                {/* Avatar & Name */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                        {portfolio.image ? (
                            <Image
                                src={portfolio.image}
                                alt={portfolio.name}
                                width={56}
                                height={56}
                                className="rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                                {portfolio.name?.charAt(0) || '?'}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {portfolio.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            @{portfolio.username}
                        </p>
                    </div>
                </div>

                {/* Headline */}
                <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2 mb-4 min-h-[40px]">
                    {headline}
                </p>

                {/* Location */}
                {portfolio.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{portfolio.location}</span>
                    </div>
                )}

                {/* Skills */}
                {portfolio.skills && portfolio.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {portfolio.skills.slice(0, 4).map((skill, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            >
                                {skill.name[language] || skill.name.en}
                            </span>
                        ))}
                        {portfolio.skills.length > 4 && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                +{portfolio.skills.length - 4}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* View Arrow */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
        </Link>
    );
}
