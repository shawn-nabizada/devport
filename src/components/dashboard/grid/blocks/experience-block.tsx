'use client';

import React, { useEffect, useState } from 'react';
import type { ExperienceBlockContent } from '@/lib/db/layout-types';
import { useTranslation } from '@/lib/i18n';
import { Briefcase } from 'lucide-react';

interface Experience {
    _id: string;
    company: string;
    position: { en: string; fr: string };
    description: { en: string; fr: string };
    location?: string;
    startDate: string;
    endDate?: string;
}

interface ExperienceBlockProps {
    data: ExperienceBlockContent;
}

function formatDate(dateStr: string, language: 'en' | 'fr'): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
        month: 'short',
        year: 'numeric',
    });
}

export function ExperienceBlock({ data }: ExperienceBlockProps) {
    const { language, t } = useTranslation();
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchExperiences() {
            try {
                const res = await fetch('/api/experience');
                if (res.ok) {
                    let allExperiences: Experience[] = await res.json();

                    // Filter to selected experiences if specified
                    if (data.experienceIds && data.experienceIds.length > 0) {
                        allExperiences = allExperiences.filter((e) =>
                            data.experienceIds.includes(e._id)
                        );
                    }

                    setExperiences(allExperiences.slice(0, 5));
                }
            } catch (error) {
                console.error('Failed to fetch experience:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchExperiences();
    }, [data.experienceIds]);

    if (loading) {
        return (
            <div className="h-full p-4 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading experience...</div>
            </div>
        );
    }

    if (experiences.length === 0) {
        return (
            <div className="h-full p-4 flex items-center justify-center">
                <p className="text-muted-foreground">No experience to display</p>
            </div>
        );
    }

    const isTimeline = data.layout === 'timeline';

    return (
        <div className="h-full p-4 overflow-auto">
            <div className={isTimeline ? 'relative pl-6 space-y-4' : 'space-y-3'}>
                {isTimeline && (
                    <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />
                )}
                {experiences.map((exp) => (
                    <div
                        key={exp._id}
                        className={`relative ${isTimeline ? '' : 'p-3 rounded-lg bg-secondary/30 border border-border'}`}
                    >
                        {isTimeline && (
                            <div className="absolute -left-[18px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                        )}
                        <div className="flex items-start gap-2">
                            {!isTimeline && (
                                <Briefcase className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground text-sm">
                                    {exp.position[language] || exp.position.en}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {exp.company}
                                    {exp.location && ` · ${exp.location}`}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {formatDate(exp.startDate, language)} –{' '}
                                    {exp.endDate ? formatDate(exp.endDate, language) : t('portfolio.currentPosition')}
                                </p>
                                {data.showDescription && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {exp.description[language] || exp.description.en}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
