'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Heart } from 'lucide-react';

interface Hobby {
    _id: string;
    name: { en: string; fr: string };
    icon: string | null;
}

export default function HobbiesPage() {
    const { t, language } = useTranslation();
    const [hobbies, setHobbies] = useState<Hobby[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingHobby, setEditingHobby] = useState<Hobby | null>(null);
    const [formData, setFormData] = useState({ nameEn: '', nameFr: '', icon: '' });

    useEffect(() => { fetchHobbies(); }, []);

    async function fetchHobbies() {
        try {
            const res = await fetch('/api/hobbies');
            if (res.ok) setHobbies(await res.json());
        } finally { setIsLoading(false); }
    }

    function openCreateDialog() {
        setEditingHobby(null);
        setFormData({ nameEn: '', nameFr: '', icon: '' });
        setIsDialogOpen(true);
    }

    function openEditDialog(hobby: Hobby) {
        setEditingHobby(hobby);
        setFormData({ nameEn: hobby.name.en, nameFr: hobby.name.fr, icon: hobby.icon || '' });
        setIsDialogOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const payload = { name: { en: formData.nameEn, fr: formData.nameFr }, icon: formData.icon || null };
        const url = editingHobby ? `/api/hobbies/${editingHobby._id}` : '/api/hobbies';
        await fetch(url, { method: editingHobby ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        setIsDialogOpen(false);
        fetchHobbies();
    }

    async function handleDelete(id: string) {
        if (!confirm(t('hobbies.deleteConfirm'))) return;
        await fetch(`/api/hobbies/${id}`, { method: 'DELETE' });
        fetchHobbies();
    }

    if (isLoading) return <div className="text-muted-foreground">{t('common.loading')}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{t('nav.hobbies')}</h1>
                    <p className="text-muted-foreground">{t('hobbies.description')}</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('hobbies.addHobby')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{editingHobby ? t('hobbies.editHobby') : t('hobbies.addHobby')}</DialogTitle>
                                <DialogDescription>{t('hobbies.dialogDescription')}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>{t('hobbies.nameEnglish')}</Label>
                                        <Input value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} placeholder={t('hobbies.namePlaceholderEn')} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('hobbies.nameFrench')}</Label>
                                        <Input value={formData.nameFr} onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })} placeholder={t('hobbies.namePlaceholderFr')} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('hobbies.emojiIcon')}</Label>
                                    <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="📸" maxLength={4} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">{editingHobby ? t('common.update') : t('common.create')}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {hobbies.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground">{t('hobbies.noHobbies')}</p>
                        <Button variant="link" onClick={openCreateDialog}>{t('hobbies.addFirstHobby')}</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="flex flex-wrap gap-3">
                    {hobbies.map((hobby) => (
                        <Card key={hobby._id} className="group relative">
                            <CardContent className="flex items-center gap-2 py-3 px-4">
                                <span className="text-xl">{hobby.icon || <Heart className="h-4 w-4" />}</span>
                                <span>{hobby.name[language]}</span>
                                <div className="ml-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditDialog(hobby)}><Pencil className="h-3 w-3" /></Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(hobby._id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
