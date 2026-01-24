'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';

interface Testimonial {
    _id: string;
    content: string;
    authorName: string;
    authorTitle?: string;
    authorCompany?: string;
    userId: string;
    createdAt: string;
}

export default function AdminTestimonialsPage() {
    const { t } = useTranslation();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const res = await fetch('/api/admin/testimonials');
            if (res.ok) {
                setTestimonials(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approved' | 'rejected') => {
        try {
            const res = await fetch(`/api/testimonials/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action }),
            });

            if (res.ok) {
                toast.success(action === 'approved' ? t('admin.testimonialApproved') : t('admin.testimonialRejected'));
                setTestimonials(testimonials.filter(t => t._id !== id));
            } else {
                toast.error(t('common.error'));
            }
        } catch {
            toast.error(t('common.error'));
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">{t('admin.testimonialsTitle')}</h1>
                <p className="text-muted-foreground">{t('admin.testimonialsDescription')}</p>
            </div>

            {testimonials.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border">
                    <p>{t('admin.noTestimonials')}</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map(testimonial => (
                        <Card key={testimonial._id}>
                            <CardHeader>
                                <CardTitle className="text-base">{testimonial.authorName}</CardTitle>
                                <CardDescription>{testimonial.authorTitle} {testimonial.authorCompany && `at ${testimonial.authorCompany}`}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <blockquote className="text-sm italic text-muted-foreground border-l-2 pl-3">
                                    &quot;{testimonial.content}&quot;
                                </blockquote>
                                <div className="text-xs text-muted-foreground">User ID: {testimonial.userId}</div>
                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handleAction(testimonial._id, 'rejected')} className="text-red-500 hover:text-red-600">
                                        <X className="h-4 w-4 mr-1" /> {t('admin.reject')}
                                    </Button>
                                    <Button size="sm" onClick={() => handleAction(testimonial._id, 'approved')} className="bg-green-600 hover:bg-green-700">
                                        <Check className="h-4 w-4 mr-1" /> {t('admin.approve')}
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
