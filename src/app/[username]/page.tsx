import type { Metadata } from 'next';
import { getPortfolio } from '@/lib/portfolio-service';
import { PortfolioClientView } from './portfolio-client';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params;
    const portfolio = await getPortfolio(username);

    if (!portfolio) {
        return { title: 'Not Found - DevPort' };
    }

    const name = portfolio.user.name || username;
    const headline = portfolio.profile.headline.en || 'Portfolio';

    return {
        title: `${name} | ${headline}`,
        description: portfolio.profile.bio.en?.substring(0, 160) || `Check out ${name}'s portfolio on DevPort.`,
        openGraph: {
            title: `${name} - DevPort Portfolio`,
            description: portfolio.profile.headline.en,
            images: portfolio.user.image ? [portfolio.user.image] : [],
        },
    };
}

export default async function PortfolioPage({ params }: Props) {
    const { username } = await params;
    const portfolio = await getPortfolio(username);

    if (!portfolio) {
        notFound();
    }

    return <PortfolioClientView portfolio={portfolio} />;
}
