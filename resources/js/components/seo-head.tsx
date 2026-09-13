import { Head, usePage } from '@inertiajs/react';

interface SeoHeadProps {
    title: string;
    description?: string;
    index?: boolean;
}

export default function SeoHead({
    title,
    description,
    index = false,
}: SeoHeadProps) {
    const { seo } = usePage().props;
    const resolvedDescription = description ?? seo.description;
    const fullTitle = `${title} - ${seo.siteName}`;
    const robots = index
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow, noarchive';
    const structuredData = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: seo.siteName,
        url: seo.homeUrl,
        description: resolvedDescription,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        inLanguage: seo.language,
    }).replaceAll('<', '\\u003c');

    return (
        <Head title={title}>
            <meta
                head-key="description"
                name="description"
                content={resolvedDescription}
            />
            <meta head-key="robots" name="robots" content={robots} />

            {index && (
                <>
                    <link
                        head-key="canonical"
                        rel="canonical"
                        href={seo.homeUrl}
                    />
                    <meta
                        head-key="og:type"
                        property="og:type"
                        content="website"
                    />
                    <meta
                        head-key="og:locale"
                        property="og:locale"
                        content={seo.locale}
                    />
                    <meta
                        head-key="og:site_name"
                        property="og:site_name"
                        content={seo.siteName}
                    />
                    <meta
                        head-key="og:title"
                        property="og:title"
                        content={fullTitle}
                    />
                    <meta
                        head-key="og:description"
                        property="og:description"
                        content={resolvedDescription}
                    />
                    <meta
                        head-key="og:url"
                        property="og:url"
                        content={seo.homeUrl}
                    />
                    <meta
                        head-key="twitter:card"
                        name="twitter:card"
                        content="summary"
                    />
                    <meta
                        head-key="twitter:title"
                        name="twitter:title"
                        content={fullTitle}
                    />
                    <meta
                        head-key="twitter:description"
                        name="twitter:description"
                        content={resolvedDescription}
                    />
                    <script
                        head-key="structured-data"
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: structuredData }}
                    />
                </>
            )}
        </Head>
    );
}
