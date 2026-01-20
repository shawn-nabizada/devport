'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Trash2, Clock, CheckCircle, XCircle, Quote } from 'lucide-react';

interface Testimonial {
    _id: string;
    authorName: string;
    authorEmail: string;
    authorTitle: string | null;
    authorCompany: string | null;
    content: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export default function TestimonialsPage() {
    const { t, language } = useTranslation();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    useEffect(() => { fetchTestimonials(); }, []);

    async function fetchTestimonials() {
        try {
            const res = await fetch('/api/testimonials');
            if (res.ok) setTestimonials(await res.json());
        } finally { setIsLoading(false); }
    }

    async function updateStatus(id: string, status: 'approved' | 'rejected') {
        await fetch(`/api/testimonials/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        setTestimonials(testimonials.map(item => item._id === id ? { ...item, status } : item));
    }

    async function handleDelete(id: string) {
        if (!confirm(t('common.confirmDelete'))) return;
        await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
        setTestimonials(testimonials.filter(item => item._id !== id));
    }

    const formatDate = (date: string) => new Date(date).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    const filtered = filter === 'all' ? testimonials : testimonials.filter(item => item.status === filter);
    const pendingCount = testimonials.filter(item => item.status === 'pending').length;

    if (isLoading) return <div className="text-muted-foreground">{t('common.loading')}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{t('nav.testimonials')}</h1>
                    <p className="text-muted-foreground">
                        {pendingCount > 0 ? `${pendingCount} ${t('testimonial.pendingReview')}` : t('testimonial.manageDescription')}
                    </p>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
                {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                    <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
                        {f === 'all' && t('common.all')}
                        {f === 'pending' && <><Clock className="mr-1 h-3 w-3" />{t('common.pending')}</>}
                        {f === 'approved' && <><CheckCircle className="mr-1 h-3 w-3" />{t('common.approved')}</>}
                        {f === 'rejected' && <><XCircle className="mr-1 h-3 w-3" />{t('common.rejected')}</>}
                    </Button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Quote className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">{t('testimonial.noTestimonials')}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filtered.map((testimonial) => (
                        <Card key={testimonial._id} className={testimonial.status === 'pending' ? 'border-yellow-500/50' : ''}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{testimonial.authorName}</CardTitle>
                                        <CardDescription>
                                            {testimonial.authorTitle && testimonial.authorCompany
                                                ? `${testimonial.authorTitle} at ${testimonial.authorCompany}`
                                                : testimonial.authorTitle || testimonial.authorCompany || testimonial.authorEmail}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`rounded px-2 py-0.5 text-xs ${testimonial.status === 'approved' ? 'bg-green-500/10 text-green-600' :
                                            testimonial.status === 'rejected' ? 'bg-red-500/10 text-red-600' :
                                                'bg-yellow-500/10 text-yellow-600'
                                            }`}>
                                            {testimonial.status === 'approved' ? t('common.approved') :
                                                testimonial.status === 'rejected' ? t('common.rejected') : t('common.pending')}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{formatDate(testimonial.createdAt)}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <blockquote className="border-l-2 border-primary pl-4 italic text-muted-foreground">
                                    &ldquo;{testimonial.content}&rdquo;
                                </blockquote>
                                <div className="flex gap-2 mt-4">
                                    {testimonial.status !== 'approved' && (
                                        <Button size="sm" variant="outline" onClick={() => updateStatus(testimonial._id, 'approved')}>
                                            <Check className="mr-1 h-3 w-3" />{t('testimonial.approve')}
                                        </Button>
                                    )}
                                    {testimonial.status !== 'rejected' && (
                                        <Button size="sm" variant="outline" onClick={() => updateStatus(testimonial._id, 'rejected')}>
                                            <X className="mr-1 h-3 w-3" />{t('testimonial.reject')}
                                        </Button>
                                    )}
                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(testimonial._id)}>
                                        <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
