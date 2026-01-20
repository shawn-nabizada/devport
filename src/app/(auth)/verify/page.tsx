'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

function VerifyForm() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const code = formData.get('code') as string;

        try {
            const res = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || t('auth.verificationFailed'));
            }

            setSuccess(true);
            setTimeout(() => router.push('/login'), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('auth.verificationFailed'));
        } finally {
            setIsLoading(false);
        }
    }

    if (success) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold text-green-600">
                        ✓ {t('auth.emailVerified')}
                    </CardTitle>
                    <CardDescription>
                        {t('auth.redirectingLogin')}
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">{t('auth.verifyEmail')}</CardTitle>
                <CardDescription>
                    {t('auth.verificationCodeSent')} <strong>{email}</strong>
                </CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="code">{t('auth.verificationCode')}</Label>
                        <Input
                            id="code"
                            name="code"
                            placeholder="123456"
                            required
                            maxLength={6}
                            pattern="[0-9]{6}"
                            title="6-digit code"
                            disabled={isLoading}
                            className="text-center text-2xl tracking-widest"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 mt-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? t('common.loading') : t('auth.verifyEmail')}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        <Link href="/register" className="font-medium text-primary hover:underline">
                            ← {t('auth.backToRegister')}
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyForm />
        </Suspense>
    );
}
