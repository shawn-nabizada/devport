'use client';

import React, { useEffect, useState } from 'react';
import type { SkillsBlockContent } from '@/lib/db/layout-types';
import { useTranslation } from '@/lib/i18n';

interface Skill {
    _id: string;
    name: { en: string; fr: string };
    proficiency: number;
    category?: string;
}

interface SkillsBlockProps {
    data: SkillsBlockContent;
}

export function SkillsBlock({ data }: SkillsBlockProps) {
    const { language } = useTranslation();
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSkills() {
            try {
                const res = await fetch('/api/skills');
                if (res.ok) {
                    const allSkills = await res.json();
                    // Filter to only show selected skills, or show all if none selected
                    if (data.skillIds && data.skillIds.length > 0) {
                        setSkills(allSkills.filter((s: Skill) => data.skillIds.includes(s._id)));
                    } else {
                        setSkills(allSkills.slice(0, 6)); // Default to first 6
                    }
                }
            } catch (error) {
                console.error('Failed to fetch skills:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchSkills();
    }, [data.skillIds]);

    if (loading) {
        return (
            <div className="h-full p-4 bg-card/50 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading skills...</div>
            </div>
        );
    }

    if (skills.length === 0) {
        return (
            <div className="h-full p-4 bg-card/50 flex items-center justify-center">
                <p className="text-muted-foreground">No skills to display</p>
            </div>
        );
    }

    return (
        <div className={`h-full p-4 bg-card/50 overflow-auto ${data.layout === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-3'}`}>
            {skills.map((skill) => (
                <div
                    key={skill._id}
                    className={data.layout === 'horizontal' ? 'flex-1 min-w-[150px]' : 'w-full'}
                >
                    <div className="flex justify-between items-center mb-1">
                        {data.showLabels && (
                            <span className="text-sm font-medium text-foreground">
                                {skill.name[language] || skill.name.en}
                            </span>
                        )}
                        {data.showPercentage && (
                            <span className="text-xs text-muted-foreground">
                                {skill.proficiency}%
                            </span>
                        )}
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2.5">
                        <div
                            className="bg-primary h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${skill.proficiency}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
