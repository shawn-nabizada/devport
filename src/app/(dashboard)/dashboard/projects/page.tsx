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
import { Plus, Pencil, Trash2, ExternalLink, Github } from 'lucide-react';

interface Project {
    _id: string;
    title: { en: string; fr: string };
    description: { en: string; fr: string };
    imageUrl: string | null;
    projectUrl: string | null;
    githubUrl: string | null;
    technologies: string[];
    featured: boolean;
}

export default function ProjectsPage() {
    const { t, language } = useTranslation();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [formData, setFormData] = useState({
        titleEn: '',
        titleFr: '',
        descriptionEn: '',
        descriptionFr: '',
        imageUrl: '',
        projectUrl: '',
        githubUrl: '',
        technologies: '',
        featured: false,
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    async function fetchProjects() {
        try {
            const res = await fetch('/api/projects');
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setIsLoading(false);
        }
    }

    function openCreateDialog() {
        setEditingProject(null);
        setFormData({
            titleEn: '',
            titleFr: '',
            descriptionEn: '',
            descriptionFr: '',
            imageUrl: '',
            projectUrl: '',
            githubUrl: '',
            technologies: '',
            featured: false,
        });
        setIsDialogOpen(true);
    }

    function openEditDialog(project: Project) {
        setEditingProject(project);
        setFormData({
            titleEn: project.title.en,
            titleFr: project.title.fr,
            descriptionEn: project.description.en,
            descriptionFr: project.description.fr,
            imageUrl: project.imageUrl || '',
            projectUrl: project.projectUrl || '',
            githubUrl: project.githubUrl || '',
            technologies: project.technologies.join(', '),
            featured: project.featured,
        });
        setIsDialogOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const payload = {
            title: { en: formData.titleEn, fr: formData.titleFr },
            description: { en: formData.descriptionEn, fr: formData.descriptionFr },
            imageUrl: formData.imageUrl || null,
            projectUrl: formData.projectUrl || null,
            githubUrl: formData.githubUrl || null,
            technologies: formData.technologies
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
            featured: formData.featured,
        };

        try {
            if (editingProject) {
                await fetch(`/api/projects/${editingProject._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            } else {
                await fetch('/api/projects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }
            setIsDialogOpen(false);
            fetchProjects();
        } catch (error) {
            console.error('Error saving project:', error);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm(t('projects.deleteConfirm'))) return;
        try {
            await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            fetchProjects();
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    }

    if (isLoading) {
        return <div className="text-muted-foreground">{t('common.loading')}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{t('nav.projects')}</h1>
                    <p className="text-muted-foreground">
                        {t('projects.description')}
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('projects.addProject')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingProject ? t('projects.editProject') : t('projects.addProject')}
                                </DialogTitle>
                                <DialogDescription>
                                    {t('projects.dialogDescription')}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="titleEn">{t('projects.titleEnglish')}</Label>
                                        <Input
                                            id="titleEn"
                                            value={formData.titleEn}
                                            onChange={(e) =>
                                                setFormData({ ...formData, titleEn: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="titleFr">{t('projects.titleFrench')}</Label>
                                        <Input
                                            id="titleFr"
                                            value={formData.titleFr}
                                            onChange={(e) =>
                                                setFormData({ ...formData, titleFr: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="descriptionEn">{t('projects.descriptionEnglish')}</Label>
                                        <textarea
                                            id="descriptionEn"
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            rows={3}
                                            value={formData.descriptionEn}
                                            onChange={(e) =>
                                                setFormData({ ...formData, descriptionEn: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="descriptionFr">{t('projects.descriptionFrench')}</Label>
                                        <textarea
                                            id="descriptionFr"
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            rows={3}
                                            value={formData.descriptionFr}
                                            onChange={(e) =>
                                                setFormData({ ...formData, descriptionFr: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="technologies">{t('projects.technologies')}</Label>
                                    <Input
                                        id="technologies"
                                        value={formData.technologies}
                                        onChange={(e) =>
                                            setFormData({ ...formData, technologies: e.target.value })
                                        }
                                        placeholder="React, Node.js, MongoDB"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="projectUrl">{t('projects.projectUrl')}</Label>
                                        <Input
                                            id="projectUrl"
                                            type="url"
                                            value={formData.projectUrl}
                                            onChange={(e) =>
                                                setFormData({ ...formData, projectUrl: e.target.value })
                                            }
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="githubUrl">{t('projects.githubUrl')}</Label>
                                        <Input
                                            id="githubUrl"
                                            type="url"
                                            value={formData.githubUrl}
                                            onChange={(e) =>
                                                setFormData({ ...formData, githubUrl: e.target.value })
                                            }
                                            placeholder="https://github.com/..."
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="featured"
                                        checked={formData.featured}
                                        onChange={(e) =>
                                            setFormData({ ...formData, featured: e.target.checked })
                                        }
                                    />
                                    <Label htmlFor="featured">{t('projects.featuredProject')}</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">
                                    {editingProject ? t('common.update') : t('common.create')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {projects.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground">{t('projects.noProjects')}</p>
                        <Button variant="link" onClick={openCreateDialog}>
                            {t('projects.addFirstProject')}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {projects.map((project) => (
                        <Card key={project._id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {project.title[language]}
                                            {project.featured && (
                                                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                                    {t('common.featured')}
                                                </span>
                                            )}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            {project.description[language].slice(0, 100)}...
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditDialog(project)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(project._id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1">
                                    {project.technologies.map((tech) => (
                                        <span
                                            key={tech}
                                            className="rounded bg-muted px-2 py-0.5 text-xs"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-4 flex gap-2">
                                    {project.projectUrl && (
                                        <a
                                            href={project.projectUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            {t('common.demo')}
                                        </a>
                                    )}
                                    {project.githubUrl && (
                                        <a
                                            href={project.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                                        >
                                            <Github className="h-3 w-3" />
                                            {t('common.code')}
                                        </a>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
