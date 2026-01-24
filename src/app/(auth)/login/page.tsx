'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

function LoginForm() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);

        try {
            const result = await signIn('credentials', {
                email: formData.get('email') as string,
                password: formData.get('password') as string,
                redirect: false,
            });

            if (result?.error) {
                setError(t('auth.loginError'));
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch {
            setError(t('auth.loginError'));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">{t('auth.login')}</CardTitle>
                <CardDescription>
                    {t('auth.loginDescription')}
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
                        <Label htmlFor="email">{t('auth.email')}</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            required
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">{t('auth.password')}</Label>
                            <Link
                                href="/forgot-password"
                                className="text-sm text-muted-foreground hover:text-primary"
                            >
                                {t('auth.forgotPassword')}
                            </Link>
                        </div>
                        <PasswordInput
                            id="password"
                            name="password"
                            required
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 mt-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? t('common.loading') : t('auth.login')}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        {t('auth.noAccount')}{' '}
                        <Link href="/register" className="font-medium text-primary hover:underline">
                            {t('auth.register')}
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}

export default function LoginPage() {
    const { t } = useTranslation();
    return (
        <Suspense fallback={<div>{t('common.loading')}</div>}>
            <LoginForm />
        </Suspense>
    );
}
