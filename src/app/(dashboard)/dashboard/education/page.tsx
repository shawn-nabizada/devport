'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, MapPin, Calendar, GraduationCap } from 'lucide-react';

interface Education {
    _id: string;
    institution: string;
    degree: { en: string; fr: string };
    field: { en: string; fr: string };
    location: string | null;
    startDate: string;
    endDate: string | null;
}

export default function EducationPage() {
    const { t, language } = useTranslation();
    const [education, setEducation] = useState<Education[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEdu, setEditingEdu] = useState<Education | null>(null);
    const [formData, setFormData] = useState({
        institution: '', degreeEn: '', degreeFr: '', fieldEn: '', fieldFr: '',
        location: '', startDate: '', endDate: '', isCurrent: false,
    });

    useEffect(() => { fetchEducation(); }, []);

    async function fetchEducation() {
        try {
            const res = await fetch('/api/education');
            if (res.ok) setEducation(await res.json());
        } finally { setIsLoading(false); }
    }

    function openCreateDialog() {
        setEditingEdu(null);
        setFormData({ institution: '', degreeEn: '', degreeFr: '', fieldEn: '', fieldFr: '', location: '', startDate: '', endDate: '', isCurrent: false });
        setIsDialogOpen(true);
    }

    function openEditDialog(edu: Education) {
        setEditingEdu(edu);
        setFormData({
            institution: edu.institution, degreeEn: edu.degree.en, degreeFr: edu.degree.fr,
            fieldEn: edu.field.en, fieldFr: edu.field.fr, location: edu.location || '',
            startDate: edu.startDate.split('T')[0], endDate: edu.endDate?.split('T')[0] || '', isCurrent: !edu.endDate,
        });
        setIsDialogOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const payload = {
            institution: formData.institution, degree: { en: formData.degreeEn, fr: formData.degreeFr },
            field: { en: formData.fieldEn, fr: formData.fieldFr }, location: formData.location || null,
            startDate: formData.startDate, endDate: formData.isCurrent ? null : formData.endDate || null,
        };
        const url = editingEdu ? `/api/education/${editingEdu._id}` : '/api/education';
        await fetch(url, { method: editingEdu ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        setIsDialogOpen(false);
        fetchEducation();
    }

    async function handleDelete(id: string) {
        if (!confirm(t('education.deleteConfirm'))) return;
        await fetch(`/api/education/${id}`, { method: 'DELETE' });
        fetchEducation();
    }

    const formatDate = (date: string) => new Date(date).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-US', { year: 'numeric', month: 'short' });

    if (isLoading) return <div className="text-muted-foreground">{t('common.loading')}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{t('nav.education')}</h1>
                    <p className="text-muted-foreground">{t('education.description')}</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('education.addEducation')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{editingEdu ? t('education.editEducation') : t('education.addEducation')}</DialogTitle>
                                <DialogDescription>{t('education.dialogDescription')}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>{t('education.institution')}</Label>
                                    <Input value={formData.institution} onChange={(e) => setFormData({ ...formData, institution: e.target.value })} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>{t('education.degreeEnglish')}</Label>
                                        <Input value={formData.degreeEn} onChange={(e) => setFormData({ ...formData, degreeEn: e.target.value })} placeholder={t('education.degreePlaceholderEn')} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('education.degreeFrench')}</Label>
                                        <Input value={formData.degreeFr} onChange={(e) => setFormData({ ...formData, degreeFr: e.target.value })} placeholder={t('education.degreePlaceholderFr')} required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>{t('education.fieldEnglish')}</Label>
                                        <Input value={formData.fieldEn} onChange={(e) => setFormData({ ...formData, fieldEn: e.target.value })} placeholder={t('education.fieldPlaceholderEn')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('education.fieldFrench')}</Label>
                                        <Input value={formData.fieldFr} onChange={(e) => setFormData({ ...formData, fieldFr: e.target.value })} placeholder={t('education.fieldPlaceholderFr')} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('education.location')}</Label>
                                    <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder={t('education.locationPlaceholder')} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>{t('education.startDate')}</Label>
                                        <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('education.endDate')}</Label>
                                        <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} disabled={formData.isCurrent} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="current" checked={formData.isCurrent} onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked, endDate: '' })} />
                                    <Label htmlFor="current">{t('education.currentlyStudying')}</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">{editingEdu ? t('common.update') : t('common.create')}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {education.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground">{t('education.noEducation')}</p>
                        <Button variant="link" onClick={openCreateDialog}>{t('education.addFirstEducation')}</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {education.map((edu) => (
                        <Card key={edu._id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-full bg-primary/10 p-2"><GraduationCap className="h-5 w-5 text-primary" /></div>
                                        <div>
                                            <CardTitle>{edu.degree[language]}</CardTitle>
                                            <CardDescription>{edu.field[language] && <span>{edu.field[language]} • </span>}{edu.institution}</CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(edu)}><Pencil className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(edu._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(edu.startDate)} — {edu.endDate ? formatDate(edu.endDate) : t('portfolio.currentPosition')}</span>
                                    {edu.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{edu.location}</span>}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
