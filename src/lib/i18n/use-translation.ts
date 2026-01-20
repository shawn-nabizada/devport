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
        const parts = key.split('.');
        let result: unknown = translations[language];

        for (const part of parts) {
            if (result && typeof result === 'object' && part in result) {
                result = (result as Record<string, unknown>)[part];
            } else {
                return key; // Return key if path not found
            }
        }

        return typeof result === 'string' ? result : key;
    };

    return { t, language, setLanguage };
}
