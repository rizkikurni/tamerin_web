<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class SeoController extends Controller
{
    public function robots(): Response
    {
        return response()
            ->view('seo.robots', [
                'sitemapUrl' => route('seo.sitemap'),
            ])
            ->header('Content-Type', 'text/plain; charset=UTF-8');
    }

    public function sitemap(): Response
    {
        return response()
            ->view('seo.sitemap', [
                'homeUrl' => route('home'),
            ])
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }
}
