'use client';

import React, { useEffect, useState } from 'react';
import type { ResumeBlockContent } from '@/lib/db/layout-types';
import { useTranslation } from '@/lib/i18n';
import { FileText, Download } from 'lucide-react';

interface Resume {
    _id: string;
    language: 'en' | 'fr';
    fileName: string;
    fileUrl: string;
}

interface ResumeBlockProps {
    data: ResumeBlockContent;
}

export function ResumeBlock({ data }: ResumeBlockProps) {
    const { t, language: currentLang } = useTranslation();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchResumes() {
            try {
                const res = await fetch('/api/resume');
                if (res.ok) {
                    const allResumes: Resume[] = await res.json();
                    setResumes(allResumes);
                }
            } catch (error) {
                console.error('Failed to fetch resumes:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchResumes();
    }, []);

    if (loading) {
        return (
            <div className="h-full p-4 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading resumes...</div>
            </div>
        );
    }

    // Filter resumes based on settings
    const displayResumes = data.showBothLanguages
        ? resumes
        : resumes.filter((r) => r.language === currentLang);

    if (displayResumes.length === 0) {
        return (
            <div className="h-full p-4 flex items-center justify-center">
                <p className="text-muted-foreground">No resume available</p>
            </div>
        );
    }

    const handleDownload = (resume: Resume) => {
        window.open(resume.fileUrl, '_blank');
    };

    const getLanguageLabel = (lang: 'en' | 'fr') => {
        return lang === 'en' ? t('common.english') : t('common.french');
    };

    const renderButtons = () => (
        <div className="flex flex-wrap gap-2 justify-center">
            {displayResumes.map((resume) => (
                <button
                    key={resume._id}
                    onClick={() => handleDownload(resume)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                    <Download className="h-4 w-4" />
                    {data.showBothLanguages
                        ? `${t('portfolio.downloadResume')} (${getLanguageLabel(resume.language)})`
                        : t('portfolio.downloadResume')}
                </button>
            ))}
        </div>
    );

    const renderCards = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayResumes.map((resume) => (
                <button
                    key={resume._id}
                    onClick={() => handleDownload(resume)}
                    className="p-4 rounded-lg bg-secondary/30 border border-border hover:border-primary/50 transition-colors text-left group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">
                                {resume.fileName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {getLanguageLabel(resume.language)}
                            </p>
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                </button>
            ))}
        </div>
    );

    return (
        <div className="h-full p-4 flex items-center justify-center overflow-auto">
            {data.displayStyle === 'buttons' ? renderButtons() : renderCards()}
        </div>
    );
}
