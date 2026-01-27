'use client';

import React, { useEffect, useState } from 'react';
import type { EducationBlockContent } from '@/lib/db/layout-types';
import { useTranslation } from '@/lib/i18n';
import { GraduationCap } from 'lucide-react';

interface Education {
    _id: string;
    institution: string;
    degree: { en: string; fr: string };
    field: { en: string; fr: string };
    location?: string;
    startDate: string;
    endDate?: string;
}

interface EducationBlockProps {
    data: EducationBlockContent;
}

function formatDate(dateStr: string, language: 'en' | 'fr'): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
        month: 'short',
        year: 'numeric',
    });
}

export function EducationBlock({ data }: EducationBlockProps) {
    const { language, t } = useTranslation();
    const [education, setEducation] = useState<Education[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEducation() {
            try {
                const res = await fetch('/api/education');
                if (res.ok) {
                    let allEducation: Education[] = await res.json();

                    // Filter to selected education if specified
                    if (data.educationIds && data.educationIds.length > 0) {
                        allEducation = allEducation.filter((e) =>
                            data.educationIds.includes(e._id)
                        );
                    }

                    setEducation(allEducation.slice(0, 5));
                }
            } catch (error) {
                console.error('Failed to fetch education:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchEducation();
    }, [data.educationIds]);

    if (loading) {
        return (
            <div className="h-full p-4 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading education...</div>
            </div>
        );
    }

    if (education.length === 0) {
        return (
            <div className="h-full p-4 flex items-center justify-center">
                <p className="text-muted-foreground">No education to display</p>
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
                {education.map((edu) => (
                    <div
                        key={edu._id}
                        className={`relative ${isTimeline ? '' : 'p-3 rounded-lg bg-secondary/30 border border-border'}`}
                    >
                        {isTimeline && (
                            <div className="absolute -left-[18px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                        )}
                        <div className="flex items-start gap-2">
                            {!isTimeline && (
                                <GraduationCap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground text-sm">
                                    {edu.degree[language] || edu.degree.en}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {edu.institution}
                                    {edu.location && ` · ${edu.location}`}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {edu.field[language] || edu.field.en}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                    {formatDate(edu.startDate, language)} –{' '}
                                    {edu.endDate ? formatDate(edu.endDate, language) : t('education.currentlyStudying')}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
