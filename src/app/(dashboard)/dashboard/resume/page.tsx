'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadDropzone } from '@/lib/uploadthing';
import { FileText, Trash2, Download, Upload, BarChart3, TrendingUp, Calendar } from 'lucide-react';

interface Resume {
    _id: string;
    language: 'en' | 'fr';
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
    downloadCount?: number;
}

interface DownloadStats {
    total: number;
    thisWeek: number;
    thisMonth: number;
    byLanguage: Record<string, number>;
    daily: Array<{ date: string; count: number }>;
    recent: Array<{ language: string; userAgent: string; downloadedAt: string }>;
}

export default function ResumePage() {
    const { t, language } = useTranslation();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [stats, setStats] = useState<DownloadStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadingLang, setUploadingLang] = useState<'en' | 'fr' | null>(null);

    useEffect(() => {
        fetchResumes();
        fetchStats();
    }, []);

    async function fetchResumes() {
        try {
            const res = await fetch('/api/resume');
            if (res.ok) setResumes(await res.json());
        } finally { setIsLoading(false); }
    }

    async function fetchStats() {
        try {
            const res = await fetch('/api/stats/downloads');
            if (res.ok) setStats(await res.json());
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }

    async function saveResume(lang: 'en' | 'fr', fileName: string, fileUrl: string, fileSize: number) {
        await fetch('/api/resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language: lang, fileName, fileUrl, fileSize }),
        });
        fetchResumes();
        setUploadingLang(null);
    }

    async function deleteResume(lang: 'en' | 'fr') {
        if (!confirm(t('resume.deleteConfirm'))) return;
        await fetch(`/api/resume?language=${lang}`, { method: 'DELETE' });
        fetchResumes();
    }

    const enResume = resumes.find(r => r.language === 'en');
    const frResume = resumes.find(r => r.language === 'fr');

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (date: string) => new Date(date).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    if (isLoading) return <div className="text-muted-foreground">{t('common.loading')}</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">{t('nav.resume')}</h1>
                <p className="text-muted-foreground">{t('resume.description')}</p>
            </div>

            {/* Download Statistics */}
            {stats && stats.total > 0 && (
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-primary/10 p-2">
                                    <Download className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                    <p className="text-sm text-muted-foreground">Total Downloads</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-green-500/10 p-2">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.thisWeek}</p>
                                    <p className="text-sm text-muted-foreground">This Week</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-blue-500/10 p-2">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.thisMonth}</p>
                                    <p className="text-sm text-muted-foreground">This Month</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Download by Language */}
            {stats && (stats.byLanguage.en || stats.byLanguage.fr) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Downloads by Language
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-8">
                            <div className="flex items-center gap-3">
                                <span className="rounded bg-blue-500/10 px-2 py-1 text-sm font-medium text-blue-600">EN</span>
                                <span className="text-2xl font-bold">{stats.byLanguage.en || 0}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="rounded bg-purple-500/10 px-2 py-1 text-sm font-medium text-purple-600">FR</span>
                                <span className="text-2xl font-bold">{stats.byLanguage.fr || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recent Downloads */}
            {stats && stats.recent.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Downloads</CardTitle>
                        <CardDescription>Last 10 resume downloads</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {stats.recent.map((download, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                                    <div className="flex items-center gap-3">
                                        <span className={`rounded px-2 py-0.5 text-xs font-medium ${download.language === 'en' ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'}`}>
                                            {download.language.toUpperCase()}
                                        </span>
                                        <span className="text-sm text-muted-foreground truncate max-w-xs">
                                            {download.userAgent.includes('Mobile') ? '📱 Mobile' : '💻 Desktop'}
                                        </span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">{formatDate(download.downloadedAt)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* English Resume */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="rounded bg-primary/10 px-2 py-0.5 text-sm text-primary">EN</span>
                            {t('resume.englishResume')}
                        </CardTitle>
                        <CardDescription>{t('resume.uploadEnglishDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {enResume ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                    <FileText className="h-8 w-8 text-primary" />
                                    <div className="flex-1">
                                        <p className="font-medium truncate">{enResume.fileName}</p>
                                        <p className="text-sm text-muted-foreground">{formatSize(enResume.fileSize)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={enResume.fileUrl} target="_blank"><Download className="mr-2 h-4 w-4" />{t('common.preview')}</a>
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setUploadingLang('en')}>
                                        <Upload className="mr-2 h-4 w-4" />{t('common.replace')}
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => deleteResume('en')}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        ) : uploadingLang === 'en' ? (
                            <UploadDropzone
                                endpoint="resumeUploader"
                                onClientUploadComplete={(res) => {
                                    if (res[0]) saveResume('en', res[0].name, res[0].ufsUrl, res[0].size);
                                }}
                                onUploadError={(error) => alert(`Upload failed: ${error.message}`)}
                            />
                        ) : (
                            <Button onClick={() => setUploadingLang('en')} className="w-full">
                                <Upload className="mr-2 h-4 w-4" />{t('resume.uploadEnglish')}
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* French Resume */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="rounded bg-primary/10 px-2 py-0.5 text-sm text-primary">FR</span>
                            {t('resume.frenchResume')}
                        </CardTitle>
                        <CardDescription>{t('resume.uploadFrenchDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {frResume ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                    <FileText className="h-8 w-8 text-primary" />
                                    <div className="flex-1">
                                        <p className="font-medium truncate">{frResume.fileName}</p>
                                        <p className="text-sm text-muted-foreground">{formatSize(frResume.fileSize)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={frResume.fileUrl} target="_blank"><Download className="mr-2 h-4 w-4" />{t('common.preview')}</a>
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setUploadingLang('fr')}>
                                        <Upload className="mr-2 h-4 w-4" />{t('common.replace')}
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => deleteResume('fr')}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        ) : uploadingLang === 'fr' ? (
                            <UploadDropzone
                                endpoint="resumeUploader"
                                onClientUploadComplete={(res) => {
                                    if (res[0]) saveResume('fr', res[0].name, res[0].ufsUrl, res[0].size);
                                }}
                                onUploadError={(error) => alert(`Upload failed: ${error.message}`)}
                            />
                        ) : (
                            <Button onClick={() => setUploadingLang('fr')} className="w-full">
                                <Upload className="mr-2 h-4 w-4" />{t('resume.uploadFrench')}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
