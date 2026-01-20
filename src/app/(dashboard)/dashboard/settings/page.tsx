'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Linkedin, Github, Twitter, Globe } from 'lucide-react';

interface Profile {
    bio: { en: string; fr: string };
    headline: { en: string; fr: string };
    location: string | null;
    avatarUrl: string | null;
    socialLinks: {
        linkedin?: string;
        github?: string;
        twitter?: string;
        website?: string;
    };
}

export default function SettingsPage() {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [profile, setProfile] = useState<Profile>({
        bio: { en: '', fr: '' },
        headline: { en: '', fr: '' },
        location: null,
        avatarUrl: null,
        socialLinks: {},
    });

    useEffect(() => { fetchProfile(); }, []);

    async function fetchProfile() {
        try {
            const res = await fetch('/api/profile');
            if (res.ok) setProfile(await res.json());
        } finally { setIsLoading(false); }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSaving(true);
        setSaved(false);
        try {
            await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } finally { setIsSaving(false); }
    }

    if (isLoading) return <div className="text-muted-foreground">{t('common.loading')}</div>;

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-3xl font-bold">{t('dashboard.settings')}</h1>
                <p className="text-muted-foreground">{t('dashboard.manageProfile')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('dashboard.profile')}</CardTitle>
                        <CardDescription>{t('dashboard.profileInfo')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Headline ({t('common.english')})</Label>
                                <Input value={profile.headline.en} onChange={(e) => setProfile({ ...profile, headline: { ...profile.headline, en: e.target.value } })} placeholder="Full-Stack Developer" />
                            </div>
                            <div className="space-y-2">
                                <Label>Headline ({t('common.french')})</Label>
                                <Input value={profile.headline.fr} onChange={(e) => setProfile({ ...profile, headline: { ...profile.headline, fr: e.target.value } })} placeholder="Développeur Full-Stack" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Bio ({t('common.english')})</Label>
                                <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={4} value={profile.bio.en} onChange={(e) => setProfile({ ...profile, bio: { ...profile.bio, en: e.target.value } })} placeholder="Tell visitors about yourself..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Bio ({t('common.french')})</Label>
                                <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={4} value={profile.bio.fr} onChange={(e) => setProfile({ ...profile, bio: { ...profile.bio, fr: e.target.value } })} placeholder="Parlez de vous aux visiteurs..." />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('experience.location')}</Label>
                            <Input value={profile.location || ''} onChange={(e) => setProfile({ ...profile, location: e.target.value || null })} placeholder="Montreal, Canada" />
                        </div>
                    </CardContent>
                </Card>

                {/* Social Links */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('dashboard.socialLinks')}</CardTitle>
                        <CardDescription>{t('dashboard.socialLinksDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"><Linkedin className="h-4 w-4" />LinkedIn</Label>
                                <Input value={profile.socialLinks.linkedin || ''} onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, linkedin: e.target.value || undefined } })} placeholder="https://linkedin.com/in/username" />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"><Github className="h-4 w-4" />GitHub</Label>
                                <Input value={profile.socialLinks.github || ''} onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, github: e.target.value || undefined } })} placeholder="https://github.com/username" />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"><Twitter className="h-4 w-4" />Twitter/X</Label>
                                <Input value={profile.socialLinks.twitter || ''} onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, twitter: e.target.value || undefined } })} placeholder="https://twitter.com/username" />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"><Globe className="h-4 w-4" />Website</Label>
                                <Input value={profile.socialLinks.website || ''} onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, website: e.target.value || undefined } })} placeholder="https://yourwebsite.com" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center gap-4">
                    <Button type="submit" disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? t('common.saving') : t('dashboard.saveChanges')}
                    </Button>
                    {saved && <span className="text-sm text-green-600">✓ {t('common.saved')}</span>}
                </div>
            </form>
        </div>
    );
}
