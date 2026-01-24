'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, MapPin, Calendar } from 'lucide-react';

interface Experience {
    _id: string;
    company: string;
    position: { en: string; fr: string };
    description: { en: string; fr: string };
    location: string | null;
    startDate: string;
    endDate: string | null;
}

export default function ExperiencePage() {
    const { t, language } = useTranslation();
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingExp, setEditingExp] = useState<Experience | null>(null);
    const [formData, setFormData] = useState({
        company: '', positionEn: '', positionFr: '', descriptionEn: '', descriptionFr: '',
        location: '', startDate: '', endDate: '', isCurrent: false,
    });

    useEffect(() => { fetchExperiences(); }, []);

    async function fetchExperiences() {
        try {
            const res = await fetch('/api/experience');
            if (res.ok) setExperiences(await res.json());
        } finally { setIsLoading(false); }
    }

    function openCreateDialog() {
        setEditingExp(null);
        setFormData({ company: '', positionEn: '', positionFr: '', descriptionEn: '', descriptionFr: '', location: '', startDate: '', endDate: '', isCurrent: false });
        setIsDialogOpen(true);
    }

    function openEditDialog(exp: Experience) {
        setEditingExp(exp);
        setFormData({
            company: exp.company, positionEn: exp.position.en, positionFr: exp.position.fr,
            descriptionEn: exp.description.en, descriptionFr: exp.description.fr, location: exp.location || '',
            startDate: exp.startDate.split('T')[0], endDate: exp.endDate?.split('T')[0] || '', isCurrent: !exp.endDate,
        });
        setIsDialogOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const payload = {
            company: formData.company, position: { en: formData.positionEn, fr: formData.positionFr },
            description: { en: formData.descriptionEn, fr: formData.descriptionFr }, location: formData.location || null,
            startDate: formData.startDate, endDate: formData.isCurrent ? null : formData.endDate || null,
        };
        const url = editingExp ? `/api/experience/${editingExp._id}` : '/api/experience';
        await fetch(url, { method: editingExp ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        setIsDialogOpen(false);
        fetchExperiences();
    }

    async function handleDelete(id: string) {
        if (!confirm(t('experience.deleteConfirm'))) return;
        await fetch(`/api/experience/${id}`, { method: 'DELETE' });
        fetchExperiences();
    }

    const formatDate = (date: string) => new Date(date).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-US', { year: 'numeric', month: 'short' });

    if (isLoading) return <div className="text-muted-foreground">{t('common.loading')}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{t('nav.experience')}</h1>
                    <p className="text-muted-foreground">{t('experience.description')}</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('experience.addExperience')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{editingExp ? t('experience.editExperience') : t('experience.addExperience')}</DialogTitle>
                                <DialogDescription>{t('experience.dialogDescription')}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>{t('experience.company')}</Label>
                                    <Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>{t('experience.positionEnglish')}</Label>
                                        <Input value={formData.positionEn} onChange={(e) => setFormData({ ...formData, positionEn: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('experience.positionFrench')}</Label>
                                        <Input value={formData.positionFr} onChange={(e) => setFormData({ ...formData, positionFr: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>{t('experience.descriptionEnglish')}</Label>
                                        <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={3} value={formData.descriptionEn} onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('experience.descriptionFrench')}</Label>
                                        <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={3} value={formData.descriptionFr} onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('experience.location')}</Label>
                                    <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder={t('experience.locationPlaceholder')} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>{t('experience.startDate')}</Label>
                                        <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('experience.endDate')}</Label>
                                        <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} disabled={formData.isCurrent} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="current" checked={formData.isCurrent} onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked, endDate: '' })} />
                                    <Label htmlFor="current">{t('experience.currentlyWorking')}</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">{editingExp ? t('common.update') : t('common.create')}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {experiences.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground">{t('experience.noExperience')}</p>
                        <Button variant="link" onClick={openCreateDialog}>{t('experience.addFirstExperience')}</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {experiences.map((exp) => (
                        <Card key={exp._id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle>{exp.position[language]}</CardTitle>
                                        <CardDescription className="font-medium">{exp.company}</CardDescription>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(exp)}><Pencil className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(exp._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : t('portfolio.currentPosition')}</span>
                                    {exp.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{exp.location}</span>}
                                </div>
                                {exp.description[language] && <p className="text-sm">{exp.description[language]}</p>}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
