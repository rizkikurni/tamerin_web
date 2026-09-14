@php
    $isLandingPage = request()->routeIs('home');
    $seoSiteName = config('seo.site_name');
    $seoTitle = config('seo.title').' - '.$seoSiteName;
    $seoDescription = config('seo.description');
    $seoHomeUrl = route('home');
    $seoRobots = $isLandingPage
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow, noarchive';
    $structuredData = json_encode([
        '@context' => 'https://schema.org',
        '@type' => 'WebApplication',
        'name' => $seoSiteName,
        'url' => $seoHomeUrl,
        'description' => $seoDescription,
        'applicationCategory' => 'FinanceApplication',
        'operatingSystem' => 'Web',
        'inLanguage' => config('seo.language'),
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
@endphp

<!DOCTYPE html>
<html lang="{{ config('seo.language') }}" @class(['dark' => data_get($page, 'props.theme.mode') === 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="application-name" content="{{ $seoSiteName }}">
        <meta name="theme-color" content="#806ceb">

        <link rel="icon" href="/favicon.svg?v=3" type="image/svg+xml">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ $isLandingPage ? $seoTitle : $seoSiteName }}</title>
            <meta data-inertia="description" name="description" content="{{ $seoDescription }}">
            <meta data-inertia="robots" name="robots" content="{{ $seoRobots }}">

            @if ($isLandingPage)
                <link data-inertia="canonical" rel="canonical" href="{{ $seoHomeUrl }}">
                <meta data-inertia="og:type" property="og:type" content="website">
                <meta data-inertia="og:locale" property="og:locale" content="{{ config('seo.locale') }}">
                <meta data-inertia="og:site_name" property="og:site_name" content="{{ $seoSiteName }}">
                <meta data-inertia="og:title" property="og:title" content="{{ $seoTitle }}">
                <meta data-inertia="og:description" property="og:description" content="{{ $seoDescription }}">
                <meta data-inertia="og:url" property="og:url" content="{{ $seoHomeUrl }}">
                <meta data-inertia="twitter:card" name="twitter:card" content="summary">
                <meta data-inertia="twitter:title" name="twitter:title" content="{{ $seoTitle }}">
                <meta data-inertia="twitter:description" name="twitter:description" content="{{ $seoDescription }}">
                <script data-inertia="structured-data" type="application/ld+json">{!! $structuredData !!}</script>
            @endif
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
