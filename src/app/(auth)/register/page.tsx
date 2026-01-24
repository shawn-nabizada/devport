'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter';
import { Label } from '@/components/ui/label';
import { Check, X, Circle, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function RegisterPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Username Availability State
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const debouncedUsername = useDebounce(username, 500);

    // Check availability effect
    useEffect(() => {
        if (!debouncedUsername) {
            setUsernameAvailable(null);
            return;
        }

        // Skip check if invalid format
        if (!/^[a-z0-9_-]+$/.test(debouncedUsername)) {
            setUsernameAvailable(false);
            return;
        }

        async function checkAvailability() {
            setIsCheckingUsername(true);
            try {
                const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(debouncedUsername)}`);
                if (res.ok) {
                    const data = await res.json();
                    setUsernameAvailable(data.available);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsCheckingUsername(false);
            }
        }

        checkAvailability();
    }, [debouncedUsername]);

    const isPasswordValid =
        /.{8,}/.test(password) &&
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(password);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            username: username, // Use state
            password: password,
            confirmPassword: confirmPassword, // unused in body typically but checked here
        };

        if (password !== confirmPassword) {
            setError(t('auth.passwordsMismatch'));
            setIsLoading(false);
            return;
        }

        if (usernameAvailable === false) {
            setError(t('auth.usernameTaken') || 'Username is taken or invalid');
            setIsLoading(false);
            return;
        }

        if (!isPasswordValid) {
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || t('auth.registerError'));
            }

            // Redirect to verification page with email
            router.push(`/verify?email=${encodeURIComponent(data.email)}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('auth.registerError'));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">{t('auth.register')}</CardTitle>
                <CardDescription>
                    {t('auth.registerDescription')}
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
                        <Label htmlFor="name">{t('auth.name')}</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">{t('auth.email')}</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">{t('auth.username')}</Label>
                        <div className="relative flex items-center gap-2">
                            <span className="text-sm text-muted-foreground shrink-0">devport.com/</span>
                            <div className="relative w-full">
                                <Input
                                    id="username"
                                    name="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="johndoe"
                                    pattern="^[a-z0-9_\\-]+$"
                                    title={t('auth.usernameHelp')}
                                    required
                                    disabled={isLoading}
                                    className={usernameAvailable === true ? 'border-green-500 ring-green-500/20' : usernameAvailable === false ? 'border-destructive ring-destructive/20' : ''}
                                />
                                <div className="absolute right-3 top-2.5">
                                    {isCheckingUsername ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    ) : username && usernameAvailable === true ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : username && usernameAvailable === false ? (
                                        <X className="h-4 w-4 text-destructive" />
                                    ) : null}
                                </div>
                            </div>
                        </div>
                        {username && usernameAvailable === false && !isCheckingUsername && (
                            <p className="text-xs text-destructive">Username is taken or invalid</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">{t('auth.password')}</Label>
                        <PasswordInput
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        {password && <PasswordStrengthMeter password={password} />}

                        <div className="text-xs text-muted-foreground space-y-1 mt-2 p-3 bg-muted/50 rounded-md">
                            <p className="font-medium mb-1">{t('auth.passwordRequirements')}</p>

                            <div className="flex items-center gap-2">
                                {password.length >= 8 ? <Check className="h-3 w-3 text-green-500" /> : <Circle className="h-3 w-3 text-muted-foreground" />}
                                <span className={password.length >= 8 ? 'text-green-600' : ''}>{t('auth.reqMinLength')}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                {(/[a-z]/.test(password) && /[A-Z]/.test(password)) ? <Check className="h-3 w-3 text-green-500" /> : <Circle className="h-3 w-3 text-muted-foreground" />}
                                <span className={(/[a-z]/.test(password) && /[A-Z]/.test(password)) ? 'text-green-600' : ''}>{t('auth.reqLowerUpper')}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                {/[0-9]/.test(password) ? <Check className="h-3 w-3 text-green-500" /> : <Circle className="h-3 w-3 text-muted-foreground" />}
                                <span className={/[0-9]/.test(password) ? 'text-green-600' : ''}>{t('auth.reqNumber')}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? <Check className="h-3 w-3 text-green-500" /> : <Circle className="h-3 w-3 text-muted-foreground" />}
                                <span className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : ''}>{t('auth.reqSpecialChar')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                        <PasswordInput
                            id="confirmPassword"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        {confirmPassword && password !== confirmPassword && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                                <X className="h-3 w-3" /> {t('auth.passwordsMismatch')}
                            </p>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 mt-4">
                    <Button type="submit" className="w-full" disabled={isLoading || !isPasswordValid || password !== confirmPassword || usernameAvailable === false}>
                        {isLoading ? t('common.loading') : t('auth.register')}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        {t('auth.hasAccount')}{' '}
                        <Link href="/login" className="font-medium text-primary hover:underline">
                            {t('auth.login')}
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}
