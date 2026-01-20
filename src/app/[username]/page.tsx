'use client';

import { useState, useEffect, use } from 'react';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    MapPin, Mail, Linkedin, Github, Twitter, Globe, ExternalLink,
    Calendar, GraduationCap, Briefcase, Heart, ChevronRight, Send, Download, Quote
} from 'lucide-react';

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
}

export default function PortfolioPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = use(params);
    const { t, language } = useTranslation();
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        fetch(`/api/portfolio/${username}`)
            .then(res => res.ok ? res.json() : Promise.reject('Not found'))
            .then(setPortfolio)
            .catch(() => setError('Portfolio not found'))
            .finally(() => setIsLoading(false));
    }, [username]);

    async function handleContact(e: React.FormEvent) {
        e.preventDefault();
        setSending(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, senderName: contactForm.name, senderEmail: contactForm.email, subject: contactForm.subject, message: contactForm.message }),
            });
            if (res.ok) {
                setSent(true);
                setContactForm({ name: '', email: '', subject: '', message: '' });
            }
        } finally { setSending(false); }
    }

    const formatDate = (date: string) => new Date(date).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-US', { year: 'numeric', month: 'short' });

    if (isLoading) return <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">{t('common.loading')}</div>;
    if (error || !portfolio) return <div className="min-h-[calc(100vh-56px)] flex items-center justify-center text-muted-foreground">{error || 'Not found'}</div>;

    const { user, profile, skills, projects, experience, education, hobbies, resumes, testimonials } = portfolio;

    return (
        <div className="min-h-[calc(100vh-56px)] bg-background">
            {/* Hero */}
            <section className="py-16 border-b">
                <div className="container mx-auto px-4 text-center">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 text-4xl font-bold text-primary">
                        {user.name?.charAt(0) || 'U'}
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

                {/* Testimonials */}
                {testimonials.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Quote className="h-6 w-6 text-primary" />{t('nav.testimonials')}</h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            {testimonials.map(testimonial => (
                                <Card key={testimonial._id}>
                                    <CardContent className="pt-6">
                                        <blockquote className="text-muted-foreground italic">&ldquo;{testimonial.content}&rdquo;</blockquote>
                                        <div className="mt-4 font-medium">{testimonial.authorName}</div>
                                        {(testimonial.authorTitle || testimonial.authorCompany) && (
                                            <div className="text-sm text-muted-foreground">{testimonial.authorTitle}{testimonial.authorTitle && testimonial.authorCompany ? ' at ' : ''}{testimonial.authorCompany}</div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                {/* Contact Form */}
                <section id="contact">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Mail className="h-6 w-6 text-primary" />{t('nav.contact')}</h2>
                    {sent ? (
                        <Card><CardContent className="py-12 text-center"><p className="text-green-600 font-medium">✓ {t('contact.success')}</p></CardContent></Card>
                    ) : (
                        <Card>
                            <CardContent className="pt-6">
                                <form onSubmit={handleContact} className="space-y-4 max-w-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>{t('contact.name')}</Label><Input value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} required /></div>
                                        <div className="space-y-2"><Label>{t('contact.email')}</Label><Input type="email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} required /></div>
                                    </div>
                                    <div className="space-y-2"><Label>{t('contact.subject')}</Label><Input value={contactForm.subject} onChange={e => setContactForm({ ...contactForm, subject: e.target.value })} /></div>
                                    <div className="space-y-2"><Label>{t('contact.message')}</Label><textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={4} value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} required /></div>
                                    <Button type="submit" disabled={sending}><Send className="mr-2 h-4 w-4" />{sending ? t('common.sending') : t('contact.send')}</Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </section>
            </div>

            {/* Footer */}
            <footer className="border-t py-8 text-center text-sm text-muted-foreground">
                {t('portfolio.builtWith')} <Link href="/" className="font-medium text-foreground hover:underline">DevPort</Link>
            </footer>
        </div>
    );
}
