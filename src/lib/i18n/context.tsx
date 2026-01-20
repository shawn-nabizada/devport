'use client';

import {
    createContext,
    useContext,
    useSyncExternalStore,
    useCallback,
    ReactNode,
} from 'react';
import { Language } from './types';

const LANGUAGE_COOKIE = 'lang';
const DEFAULT_LANGUAGE: Language = 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
    undefined
);

function getCookie(name: string): string | undefined {
    if (typeof document === 'undefined') return undefined;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
}

function setCookie(name: string, value: string, days: number = 365) {
    if (typeof document === 'undefined') return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

// Store for language state with subscriber pattern
let listeners: Array<() => void> = [];
let currentLanguage: Language = DEFAULT_LANGUAGE;

function getLanguageSnapshot(): Language {
    return currentLanguage;
}

function getServerSnapshot(): Language {
    return DEFAULT_LANGUAGE;
}

function subscribeToLanguage(callback: () => void): () => void {
    listeners.push(callback);
    return () => {
        listeners = listeners.filter((l) => l !== callback);
    };
}

function updateLanguage(lang: Language) {
    currentLanguage = lang;
    setCookie(LANGUAGE_COOKIE, lang);
    listeners.forEach((l) => l());
}

// Initialize from cookie on client
if (typeof document !== 'undefined') {
    const saved = getCookie(LANGUAGE_COOKIE);
    if (saved === 'en' || saved === 'fr') {
        currentLanguage = saved;
    }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const language = useSyncExternalStore(
        subscribeToLanguage,
        getLanguageSnapshot,
        getServerSnapshot
    );

    const setLanguage = useCallback((lang: Language) => {
        updateLanguage(lang);
    }, []);

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage(): LanguageContextType {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
