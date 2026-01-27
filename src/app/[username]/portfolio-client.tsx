'use client';

import { useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';
import { useTheme } from 'next-themes';
import { getThemeById, applyThemeToElement, ThemeId } from '@/lib/db/theme-types';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    MapPin, Linkedin, Github, Twitter, Globe, ExternalLink,
    Calendar, GraduationCap, Briefcase, Heart, ChevronRight, Download
} from 'lucide-react';
import { PublicGridRenderer } from '@/components/dashboard/grid/public-grid-renderer';
import { TestimonialsCarousel } from '@/components/portfolio/testimonials-carousel';
import { ContactSection } from '@/components/portfolio/contact-section';
import type { LayoutItem, GridBlock, DeviceType } from '@/lib/db/layout-types';

interface Portfolio {
    user: { name: string; username: string; image?: string };
    profile: {
        bio: { en: string; fr: string };
        headline: { en: string; fr: string };
        location?: string;
        socialLinks: { linkedin?: string; github?: string; twitter?: string; website?: string };
    };
    skills: Array<{ _id: string; name: { en: string; fr: string }; category?: string; proficiency: number }>;
    projects: Array<{ _id: string; title: { en: string; fr: string }; description: { en: string; fr: string }; technologies: string[]; projectUrl?: string; githubUrl?: string; featured: boolean }>;
    experience: Array<{ _id: string; company: string; position: { en: string; fr: string }; description: { en: string; fr: string }; location?: string; startDate: string; endDate?: string }>;
    education: Array<{ _id: string; institution: string; degree: { en: string; fr: string }; field: { en: string; fr: string }; startDate: string; endDate?: string }>;
    hobbies: Array<{ _id: string; name: { en: string; fr: string }; icon?: string }>;
    resumes: Array<{ _id: string; language: 'en' | 'fr'; fileName: string; fileUrl: string }>;
    testimonials: Array<{ _id: string; authorName: string; authorTitle?: string; authorCompany?: string; content: string }>;
    themeId?: ThemeId;
    customColors?: {
        primary?: string;
        secondary?: string;
        accent?: string;
        background?: string;
        foreground?: string;
        card?: string;
        muted?: string;
        border?: string;
    };
    layouts?: Array<{ device: DeviceType; layout: LayoutItem[] }>;
    blocks?: GridBlock[];
}

export function PortfolioClientView({ portfolio }: { portfolio: Portfolio }) {
    const { t, language } = useTranslation();
    const { resolvedTheme } = useTheme();
    // Removed local contact state as it's now in ContactSection
    const portfolioRef = useRef<HTMLDivElement>(null);
    const username = portfolio.user.username;

    // Apply user's portfolio theme and sync with site dark mode
    useEffect(() => {
        if (portfolio?.themeId && portfolioRef.current) {
            const theme = getThemeById(portfolio.themeId);
            if (theme) {
                applyThemeToElement(portfolioRef.current, theme, resolvedTheme === 'dark');
            }

            // Apply custom color overrides if any
            if (portfolio.customColors) {
                Object.entries(portfolio.customColors).forEach(([name, value]) => {
                    if (value && portfolioRef.current) {
                        portfolioRef.current.style.setProperty(`--${name}`, value);
                    }
                });
            }
        }
    }, [portfolio?.themeId, portfolio?.customColors, resolvedTheme]);

    // Removed handleContact function as it's now in ContactSection

    const formatDate = (date: string) => new Date(date).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-US', { year: 'numeric', month: 'short' });

    const { user, profile, skills, projects, experience, education, hobbies, resumes, testimonials, layouts, blocks } = portfolio;

    return (
        <div ref={portfolioRef} className="min-h-[calc(100vh-56px)] bg-background">
            {/* Hero */}
            <section className="py-16 border-b">
                <div className="container mx-auto px-4 text-center">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 text-4xl font-bold text-primary">
                        {user.image ? <Image src={user.image} alt={user.name} width={96} height={96} className="w-full h-full rounded-full object-cover" /> : (user.name?.charAt(0) || 'U')}
                    </div>
                    <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
                    <p className="text-xl text-muted-foreground mb-4">{profile.headline[language] || profile.headline.en}</p>
                    {profile.location && <p className="flex items-center justify-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" />{profile.location}</p>}
                    <div className="flex justify-center gap-4 mt-6">
                        {profile.socialLinks.linkedin && <a href={profile.socialLinks.linkedin} target="_blank" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-5 w-5" /></a>}
                        {profile.socialLinks.github && <a href={profile.socialLinks.github} target="_blank" className="text-muted-foreground hover:text-foreground"><Github className="h-5 w-5" /></a>}
                        {profile.socialLinks.twitter && <a href={profile.socialLinks.twitter} target="_blank" className="text-muted-foreground hover:text-foreground"><Twitter className="h-5 w-5" /></a>}
                        {profile.socialLinks.website && <a href={profile.socialLinks.website} target="_blank" className="text-muted-foreground hover:text-foreground"><Globe className="h-5 w-5" /></a>}
                    </div>
                    {(profile.bio[language] || profile.bio.en) && <p className="max-w-2xl mx-auto mt-6 text-muted-foreground">{profile.bio[language] || profile.bio.en}</p>}
                </div>
            </section>

            {/* Custom Grid Layout or Static Sections */}
            {layouts && layouts.length > 0 && blocks && blocks.length > 0 ? (
                <div className="container mx-auto px-4 py-8">
                    <PublicGridRenderer layouts={layouts} blocks={blocks} />
                </div>
            ) : (
                <div className="container mx-auto px-4 py-12 space-y-16">
                    {/* Skills */}
                    {skills.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><ChevronRight className="h-6 w-6 text-primary" />{t('nav.skills')}</h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {skills.map(skill => (
                                    <div key={skill._id} className="p-4 border rounded-lg">
                                        <div className="flex justify-between mb-2"><span className="font-medium">{skill.name[language] || skill.name.en}</span><span className="text-muted-foreground">{skill.proficiency}%</span></div>
                                        <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${skill.proficiency}%` }} /></div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects */}
                    {projects.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><ChevronRight className="h-6 w-6 text-primary" />{t('nav.projects')}</h2>
                            <div className="grid gap-6 sm:grid-cols-2">
                                {projects.map(project => (
                                    <Card key={project._id}>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">{project.title[language] || project.title.en}{project.featured && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{t('common.featured')}</span>}</CardTitle>
                                            <CardDescription>{project.description[language] || project.description.en}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-1 mb-4">{project.technologies.map(tech => <span key={tech} className="text-xs bg-muted px-2 py-0.5 rounded">{tech}</span>)}</div>
                                            <div className="flex gap-3">
                                                {project.projectUrl && <a href={project.projectUrl} target="_blank" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ExternalLink className="h-3 w-3" />{t('common.demo')}</a>}
                                                {project.githubUrl && <a href={project.githubUrl} target="_blank" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><Github className="h-3 w-3" />{t('common.code')}</a>}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Briefcase className="h-6 w-6 text-primary" />{t('nav.experience')}</h2>
                            <div className="space-y-4">
                                {experience.map(exp => (
                                    <div key={exp._id} className="border-l-2 border-primary pl-4 py-2">
                                        <div className="font-semibold">{exp.position[language] || exp.position.en}</div>
                                        <div className="text-muted-foreground">{exp.company}</div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="h-3 w-3" />{formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : t('portfolio.currentPosition')}</div>
                                        {(exp.description[language] || exp.description.en) && <p className="mt-2 text-sm">{exp.description[language] || exp.description.en}</p>}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><GraduationCap className="h-6 w-6 text-primary" />{t('nav.education')}</h2>
                            <div className="space-y-4">
                                {education.map(edu => (
                                    <div key={edu._id} className="border-l-2 border-primary pl-4 py-2">
                                        <div className="font-semibold">{edu.degree[language] || edu.degree.en}</div>
                                        <div className="text-muted-foreground">{edu.field[language] || edu.field.en} • {edu.institution}</div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="h-3 w-3" />{formatDate(edu.startDate)} — {edu.endDate ? formatDate(edu.endDate) : t('portfolio.currentPosition')}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Hobbies */}
                    {hobbies.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Heart className="h-6 w-6 text-primary" />{t('nav.hobbies')}</h2>
                            <div className="flex flex-wrap gap-3">
                                {hobbies.map(h => <span key={h._id} className="inline-flex items-center gap-1 bg-muted px-4 py-2 rounded-full">{h.icon || '❤️'} {h.name[language] || h.name.en}</span>)}
                            </div>
                        </section>
                    )}

                    {/* Resume Download */}
                    {resumes.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Download className="h-6 w-6 text-primary" />{t('nav.resume')}</h2>
                            <div className="flex gap-4">
                                {resumes.map(resume => (
                                    <Button key={resume._id} variant={resume.language === language ? 'default' : 'outline'} asChild>
                                        <a href={`/api/download/${username}/${resume.language}`} target="_blank">
                                            <Download className="mr-2 h-4 w-4" />
                                            {resume.language === 'en' ? t('portfolio.englishCV') : t('portfolio.frenchCV')}
                                        </a>
                                    </Button>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}

            {/* Global Sections (Always Visible) */}

            {/* Testimonials */}
            {testimonials.length > 0 && (
                <TestimonialsCarousel testimonials={testimonials} />
            )}

            {/* Contact Form */}
            <ContactSection username={username} />

            {/* Footer */}
            <footer className="border-t py-8 text-center">
                {/* Social Links */}

                <p className="text-sm text-muted-foreground">
                    {t('portfolio.builtWith')} <Link href="/" className="font-medium text-foreground hover:underline">DevPort</Link>
                </p>
            </footer>
        </div>
    );
}
