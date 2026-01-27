'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Linkedin, Github, Twitter, Globe, Bell, Download, Trash2, AlertTriangle } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';


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

interface NotificationPrefs {
    emailOnResumeDownload: boolean;
    emailOnContactMessage: boolean;
    emailOnTestimonial: boolean;
    emailDigest: 'none' | 'daily' | 'weekly';
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
    const [notifications, setNotifications] = useState<NotificationPrefs>({
        emailOnResumeDownload: true,
        emailOnContactMessage: true,
        emailOnTestimonial: true,
        emailDigest: 'weekly',
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        fetchProfile();
        fetchNotifications();
    }, []);

    async function fetchProfile() {
        try {
            const res = await fetch('/api/profile');
            if (res.ok) setProfile(await res.json());
        } finally { setIsLoading(false); }
    }

    async function fetchNotifications() {
        try {
            const res = await fetch('/api/notifications/preferences');
            if (res.ok) setNotifications(await res.json());
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSaving(true);
        setSaved(false);
        try {
            await Promise.all([
                fetch('/api/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(profile),
                }),
                fetch('/api/notifications/preferences', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(notifications),
                }),
            ]);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } finally { setIsSaving(false); }
    }

    const handleExport = () => {
        window.location.href = '/api/export';
    };

    const handleDeleteAccount = async () => {
        try {
            const res = await fetch('/api/profile', {
                method: 'DELETE',
            });
            if (res.ok) {
                await signOut({ callbackUrl: '/login' });
            } else {
                toast.error(t('dashboard.deleteFailed') || 'Failed to delete account');
            }
        } catch {
            toast.error(t('common.error') || 'An error occurred');
        } finally {
            setDeleteDialogOpen(false);
        }
    };

    if (isLoading) return <div className="text-muted-foreground">{t('common.loading')}</div>;

    return (
        <div className="space-y-6 max-w-3xl pb-10">
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

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            {t('notifications.title')}
                        </CardTitle>
                        <CardDescription>{t('notifications.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifications.emailOnResumeDownload}
                                onChange={(e) => setNotifications({ ...notifications, emailOnResumeDownload: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm">{t('notifications.onResumeDownload')}</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifications.emailOnContactMessage}
                                onChange={(e) => setNotifications({ ...notifications, emailOnContactMessage: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm">{t('notifications.onContactMessage')}</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifications.emailOnTestimonial}
                                onChange={(e) => setNotifications({ ...notifications, emailOnTestimonial: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm">{t('notifications.onTestimonial')}</span>
                        </label>
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

            {/* Data Management */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboard.dataManagement') || 'Data Management'}</CardTitle>
                    <CardDescription>{t('dashboard.dataDescription') || 'Download a copy of your data or manage your account.'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">{t('dashboard.exportData') || 'Export Data'}</h4>
                            <p className="text-sm text-muted-foreground">{t('dashboard.exportDescription') || 'Download all your portfolio data in JSON format.'}</p>
                        </div>
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" />
                            {t('dashboard.export') || 'Export'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        {t('dashboard.dangerZone') || 'Danger Zone'}
                    </CardTitle>
                    <CardDescription>
                        {t('dashboard.dangerZoneDescription') || 'Irreversible actions.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">{t('dashboard.deleteAccount') || 'Delete Account'}</h4>
                            <p className="text-sm text-muted-foreground">{t('dashboard.deleteDescription') || 'Permanently delete your account and all data.'}</p>
                        </div>
                        <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('dashboard.delete') || 'Delete'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title={t('dashboard.deleteAccount') || 'Delete Account'}
                description={t('dashboard.deleteConfirmDescription') || 'This will permanently delete your account and all data. This action cannot be undone.'}
                confirmLabel={t('dashboard.delete') || 'Delete'}
                cancelLabel={t('common.cancel') || 'Cancel'}
                variant="destructive"
                onConfirm={handleDeleteAccount}
                confirmationText="DELETE"
                confirmationPlaceholder="Type DELETE to confirm"
            />
        </div>
    );
}
