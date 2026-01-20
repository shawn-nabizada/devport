'use client';

import { useTranslation } from '@/lib/i18n';
import { Language } from '@/lib/i18n';

export function LanguageToggle() {
    const { language, setLanguage } = useTranslation();

    const toggleLanguage = () => {
        const newLang: Language = language === 'en' ? 'fr' : 'en';
        setLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Switch to ${language === 'en' ? 'French' : 'English'}`}
        >
            <span
                className={
                    language === 'en' ? 'text-foreground' : 'text-muted-foreground'
                }
            >
                EN
            </span>
            <span className="text-muted-foreground">/</span>
            <span
                className={
                    language === 'fr' ? 'text-foreground' : 'text-muted-foreground'
                }
            >
                FR
            </span>
        </button>
    );
}
