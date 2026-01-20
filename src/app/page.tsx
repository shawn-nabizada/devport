'use client';

import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col bg-background">
      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            DevPort
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('portfolio.viewResume')} • {t('nav.projects')} •{' '}
            {t('nav.experience')}
          </p>
          <p className="text-lg text-muted-foreground/80">
            {t('home.tagline')} — {t('home.subtitle')}
          </p>

          <div className="flex flex-col items-center gap-4 pt-6 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="w-full rounded-md bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
            >
              {t('auth.register')}
            </Link>
            <Link
              href="/login"
              className="w-full rounded-md border border-border px-8 py-3 text-base font-semibold text-foreground transition-colors hover:bg-accent sm:w-auto"
            >
              {t('auth.login')}
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4 text-center text-sm text-muted-foreground">
        {t('home.copyright')}
      </footer>
    </div>
  );
}

