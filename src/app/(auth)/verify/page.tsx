'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
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

    // State
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Resend Timer State
    const [resendTimer, setResendTimer] = useState(30);
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    // Derived generic verify function
    async function verifyCode(codeToVerify: string) {
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: codeToVerify }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || t('auth.verificationFailed'));
            }

            setSuccess(true);
            setTimeout(() => router.push('/login'), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('auth.verificationFailed'));
            setIsLoading(false);
        }
    }

    async function navigateSubmit(e: React.FormEvent) {
        e.preventDefault();
        verifyCode(code);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
        setCode(val);
        if (val.length === 6) {
            verifyCode(val);
        }
    };

    async function handleResend() {
        if (resendTimer > 0) return;

        setIsResending(true);
        setResendMessage('');
        setError('');

        try {
            const res = await fetch('/api/auth/resend-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setResendTimer(60); // Reset to 60s
                setResendMessage(t('auth.codeResent') || 'Code sent!');
            } else {
                setError('Failed to resend');
            }
        } catch (err) {
            console.error(err);
            setError('Error resending code');
        } finally {
            setIsResending(false);
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
            <form onSubmit={navigateSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}
                    {resendMessage && (
                        <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
                            {resendMessage}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="code">{t('auth.verificationCode')}</Label>
                        <Input
                            id="code"
                            name="code"
                            value={code}
                            onChange={handleChange}
                            placeholder="123456"
                            required
                            maxLength={6}
                            pattern="[0-9]{6}"
                            title="6-digit code"
                            disabled={isLoading}
                            className="text-center text-2xl tracking-widest"
                            autoFocus
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 mt-4">
                    <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isLoading ? t('common.loading') : t('auth.verifyEmail')}
                    </Button>

                    <div className="text-center">
                        <Button
                            type="button"
                            variant="link"
                            className="text-sm text-muted-foreground"
                            onClick={handleResend}
                            disabled={resendTimer > 0 || isResending}
                        >
                            {isResending ? (
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            ) : null}
                            {resendTimer > 0
                                ? `${t('auth.resendCode') || 'Resend Code'} (${resendTimer}s)`
                                : (t('auth.resendCode') || 'Resend Code')
                            }
                        </Button>
                    </div>

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
    const { t } = useTranslation();
    return (
        <Suspense fallback={<div>{t('common.loading')}</div>}>
            <VerifyForm />
        </Suspense>
    );
}
