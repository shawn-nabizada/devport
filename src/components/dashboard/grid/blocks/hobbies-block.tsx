'use client';

import React, { useEffect, useState } from 'react';
import type { HobbiesBlockContent } from '@/lib/db/layout-types';
import { useTranslation } from '@/lib/i18n';
import { Heart } from 'lucide-react';

interface Hobby {
    en: string;
    fr: string;
}

interface UserProfile {
    hobbies: Hobby[];
}

interface HobbiesBlockProps {
    data: HobbiesBlockContent;
}

export function HobbiesBlock({ data }: HobbiesBlockProps) {
    const { language } = useTranslation();
    const [hobbies, setHobbies] = useState<Hobby[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHobbies() {
            try {
                const res = await fetch('/api/profile');
                if (res.ok) {
                    const profile: UserProfile = await res.json();
                    setHobbies(profile.hobbies || []);
                }
            } catch (error) {
                console.error('Failed to fetch hobbies:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchHobbies();
    }, []);

    if (loading) {
        return (
            <div className="h-full p-4 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading hobbies...</div>
            </div>
        );
    }

    if (hobbies.length === 0) {
        return (
            <div className="h-full p-4 flex items-center justify-center">
                <p className="text-muted-foreground">No hobbies to display</p>
            </div>
        );
    }

    const renderTags = () => (
        <div className="flex flex-wrap gap-2">
            {hobbies.map((hobby, idx) => (
                <span
                    key={idx}
                    className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                    {hobby[language] || hobby.en}
                </span>
            ))}
        </div>
    );

    const renderList = () => (
        <ul className="space-y-2">
            {hobbies.map((hobby, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-foreground">
                    <Heart className="h-3.5 w-3.5 text-primary shrink-0" />
                    {hobby[language] || hobby.en}
                </li>
            ))}
        </ul>
    );

    const renderGrid = () => (
        <div className="grid grid-cols-2 gap-2">
            {hobbies.map((hobby, idx) => (
                <div
                    key={idx}
                    className="p-2 rounded-lg bg-secondary/30 border border-border text-center"
                >
                    <Heart className="h-4 w-4 text-primary mx-auto mb-1" />
                    <span className="text-xs text-foreground">
                        {hobby[language] || hobby.en}
                    </span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="h-full p-4 overflow-auto">
            {data.layout === 'tags' && renderTags()}
            {data.layout === 'list' && renderList()}
            {data.layout === 'grid' && renderGrid()}
        </div>
    );
}
