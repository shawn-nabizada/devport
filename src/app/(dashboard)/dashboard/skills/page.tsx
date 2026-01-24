'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Skill {
    _id: string;
    name: { en: string; fr: string };
    category: string | null;
    proficiency: number;
    order: number;
}

export default function SkillsPage() {
    const { t, language } = useTranslation();
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
    const [formData, setFormData] = useState({
        nameEn: '',
        nameFr: '',
        category: '',
        proficiency: 50,
    });

    useEffect(() => {
        fetchSkills();
    }, []);

    async function fetchSkills() {
        try {
            const res = await fetch('/api/skills');
            if (res.ok) {
                const data = await res.json();
                setSkills(data);
            }
        } catch (error) {
            console.error('Error fetching skills:', error);
        } finally {
            setIsLoading(false);
        }
    }

    function openCreateDialog() {
        setEditingSkill(null);
        setFormData({ nameEn: '', nameFr: '', category: '', proficiency: 50 });
        setIsDialogOpen(true);
    }

    function openEditDialog(skill: Skill) {
        setEditingSkill(skill);
        setFormData({
            nameEn: skill.name.en,
            nameFr: skill.name.fr,
            category: skill.category || '',
            proficiency: skill.proficiency,
        });
        setIsDialogOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const payload = {
            name: { en: formData.nameEn, fr: formData.nameFr },
            category: formData.category || null,
            proficiency: formData.proficiency,
        };

        try {
            if (editingSkill) {
                await fetch(`/api/skills/${editingSkill._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            } else {
                await fetch('/api/skills', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }
            setIsDialogOpen(false);
            fetchSkills();
        } catch (error) {
            console.error('Error saving skill:', error);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm(t('skills.deleteConfirm'))) return;
        try {
            await fetch(`/api/skills/${id}`, { method: 'DELETE' });
            fetchSkills();
        } catch (error) {
            console.error('Error deleting skill:', error);
        }
    }

    if (isLoading) {
        return <div className="text-muted-foreground">{t('common.loading')}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{t('nav.skills')}</h1>
                    <p className="text-muted-foreground">
                        {t('skills.description')}
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('skills.addSkill')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingSkill ? t('skills.editSkill') : t('skills.addSkill')}
                                </DialogTitle>
                                <DialogDescription>
                                    {t('skills.dialogDescription')}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nameEn">{t('skills.nameEnglish')}</Label>
                                        <Input
                                            id="nameEn"
                                            value={formData.nameEn}
                                            onChange={(e) =>
                                                setFormData({ ...formData, nameEn: e.target.value })
                                            }
                                            placeholder={t('skills.placeholderName')}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nameFr">{t('skills.nameFrench')}</Label>
                                        <Input
                                            id="nameFr"
                                            value={formData.nameFr}
                                            onChange={(e) =>
                                                setFormData({ ...formData, nameFr: e.target.value })
                                            }
                                            placeholder={t('skills.placeholderName')}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">{t('skills.categoryOptional')}</Label>
                                    <Input
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) =>
                                            setFormData({ ...formData, category: e.target.value })
                                        }
                                        placeholder={t('skills.placeholderCategory')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="proficiency">
                                        {t('skills.proficiency')}: {formData.proficiency}%
                                    </Label>
                                    <input
                                        type="range"
                                        id="proficiency"
                                        min="0"
                                        max="100"
                                        value={formData.proficiency}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                proficiency: parseInt(e.target.value),
                                            })
                                        }
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">
                                    {editingSkill ? t('common.update') : t('common.create')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {skills.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground">{t('skills.noSkills')}</p>
                        <Button variant="link" onClick={openCreateDialog}>
                            {t('skills.addFirstSkill')}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {skills.map((skill) => (
                        <Card key={skill._id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">
                                            {skill.name[language]}
                                        </CardTitle>
                                        {skill.category && (
                                            <CardDescription>{skill.category}</CardDescription>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditDialog(skill)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(skill._id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t('skills.proficiency')}</span>
                                        <span>{skill.proficiency}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary transition-all"
                                            style={{ width: `${skill.proficiency}%` }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
