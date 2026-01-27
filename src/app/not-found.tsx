import { ErrorDisplay } from '@/components/error-display';

export default function NotFound() {
    return <ErrorDisplay statusCode={404} />;
}
