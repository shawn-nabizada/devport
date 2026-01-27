'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import type { ProjectsBlockContent } from '@/lib/db/layout-types';
import { useTranslation } from '@/lib/i18n';
import { ExternalLink, Github } from 'lucide-react';

interface Project {
    _id: string;
    title: { en: string; fr: string };
    description: { en: string; fr: string };
    imageUrl?: string;
    projectUrl?: string;
    githubUrl?: string;
    technologies: string[];
    featured: boolean;
}

interface ProjectsBlockProps {
    data: ProjectsBlockContent;
}

export function ProjectsBlock({ data }: ProjectsBlockProps) {
    const { language } = useTranslation();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProjects() {
            try {
                const res = await fetch('/api/projects');
                if (res.ok) {
                    let allProjects: Project[] = await res.json();

                    // Filter featured only if specified
                    if (data.featuredOnly) {
                        allProjects = allProjects.filter((p) => p.featured);
                    }

                    // Filter to selected projects if specified
                    if (data.projectIds && data.projectIds.length > 0) {
                        allProjects = allProjects.filter((p) => data.projectIds.includes(p._id));
                    }

                    setProjects(allProjects.slice(0, 6)); // Limit display
                }
            } catch (error) {
                console.error('Failed to fetch projects:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchProjects();
    }, [data.projectIds, data.featuredOnly]);

    if (loading) {
        return (
            <div className="h-full p-4 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading projects...</div>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="h-full p-4 flex items-center justify-center">
                <p className="text-muted-foreground">No projects to display</p>
            </div>
        );
    }

    const layoutClass = data.layout === 'list'
        ? 'space-y-3'
        : 'grid grid-cols-1 sm:grid-cols-2 gap-3';

    return (
        <div className={`h-full p-4 overflow-auto ${layoutClass}`}>
            {projects.map((project) => (
                <div
                    key={project._id}
                    className="p-3 rounded-lg bg-secondary/30 border border-border hover:border-primary/50 transition-colors"
                >
                    {project.imageUrl && data.layout === 'grid' && (
                        <div className="aspect-video mb-2 rounded overflow-hidden bg-muted relative">
                            <Image
                                src={project.imageUrl}
                                alt={project.title[language] || project.title.en}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}
                    <h3 className="font-semibold text-foreground text-sm">
                        {project.title[language] || project.title.en}
                    </h3>
                    {data.showDescription && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {project.description[language] || project.description.en}
                        </p>
                    )}
                    {data.showTechnologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {project.technologies.slice(0, 4).map((tech) => (
                                <span
                                    key={tech}
                                    className="px-1.5 py-0.5 text-[10px] rounded bg-primary/10 text-primary"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-2 mt-2">
                        {project.projectUrl && (
                            <a
                                href={project.projectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        )}
                        {project.githubUrl && (
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <Github className="h-3.5 w-3.5" />
                            </a>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
