'use client';

import React from 'react';
import type { SocialBlockContent } from '@/lib/db/layout-types';
import { Linkedin, Github, Twitter, Globe, Mail } from 'lucide-react';

interface SocialBlockProps {
    data: SocialBlockContent;
}

const platformIcons = {
    linkedin: Linkedin,
    github: Github,
    twitter: Twitter,
    website: Globe,
    email: Mail,
};

const platformColors = {
    linkedin: 'hover:bg-blue-600',
    github: 'hover:bg-gray-800',
    twitter: 'hover:bg-sky-500',
    website: 'hover:bg-green-600',
    email: 'hover:bg-red-500',
};

export function SocialBlock({ data }: SocialBlockProps) {
    if (!data.links || data.links.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 p-4">
                <p className="text-gray-500">No social links configured</p>
            </div>
        );
    }

    const renderIcon = (link: typeof data.links[0]) => {
        const Icon = platformIcons[link.platform];
        return <Icon className="h-5 w-5" />;
    };

    if (data.displayStyle === 'icons') {
        return (
            <div className="h-full flex items-center justify-center gap-4 bg-white dark:bg-gray-800 p-4">
                {data.links.map((link, index) => (
                    <a
                        key={index}
                        href={link.platform === 'email' ? `mailto:${link.url}` : link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors hover:text-white ${platformColors[link.platform]}`}
                    >
                        {renderIcon(link)}
                    </a>
                ))}
            </div>
        );
    }

    if (data.displayStyle === 'buttons') {
        return (
            <div className="h-full flex flex-wrap items-center justify-center gap-2 bg-white dark:bg-gray-800 p-4">
                {data.links.map((link, index) => (
                    <a
                        key={index}
                        href={link.platform === 'email' ? `mailto:${link.url}` : link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors hover:text-white ${platformColors[link.platform]}`}
                    >
                        {renderIcon(link)}
                        <span className="text-sm font-medium">
                            {link.label || link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                        </span>
                    </a>
                ))}
            </div>
        );
    }

    // Cards style
    return (
        <div className="h-full grid grid-cols-2 gap-2 bg-white dark:bg-gray-800 p-4">
            {data.links.map((link, index) => (
                <a
                    key={index}
                    href={link.platform === 'email' ? `mailto:${link.url}` : link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 transition-colors hover:text-white ${platformColors[link.platform]}`}
                >
                    {renderIcon(link)}
                    <span className="text-xs font-medium mt-1">
                        {link.label || link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                    </span>
                </a>
            ))}
        </div>
    );
}
