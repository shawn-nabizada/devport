'use client';

import { useLanguage } from './context';
import { Translations, Language } from './types';
import { en } from './translations/en';
import { fr } from './translations/fr';

const translations: Record<Language, Translations> = { en, fr };

type TranslationKey = {
    [K in keyof Translations]: `${K}.${string & keyof Translations[K]}`;
}[keyof Translations];

export function useTranslation() {
    const { language, setLanguage } = useLanguage();

    const t = (key: TranslationKey): string => {
        const [section, name] = key.split('.') as [keyof Translations, string];
        const sectionTranslations = translations[language][section];
        return (sectionTranslations as Record<string, string>)[name] ?? key;
    };

    return { t, language, setLanguage };
}
