'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
    password: string;
    className?: string;
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
    const getStrength = (pass: string) => {
        let score = 0;
        if (!pass) return 0;
        if (pass.length >= 8) score += 1;
        if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score += 1;
        return score;
    };

    const strength = getStrength(password);

    const getColor = (score: number) => {
        if (score === 0) return 'bg-border';
        if (score <= 1) return 'bg-red-500';
        if (score <= 2) return 'bg-orange-500';
        if (score <= 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const segments = 4;

    return (
        <div className={cn("flex gap-1 h-1.5 w-full mt-2 transition-all", className)}>
            {[...Array(segments)].map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "h-full flex-1 rounded-full transition-all duration-300",
                        i < strength ? getColor(strength) : "bg-muted"
                    )}
                />
            ))}
        </div>
    );
}
