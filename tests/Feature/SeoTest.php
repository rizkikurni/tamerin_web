<?php

use App\Models\User;

test('landing page renders indexable metadata in the initial document', function () {
    $this->get(route('home'))
        ->assertSuccessful()
        ->assertSee('<html lang="id-ID"', false)
        ->assertSee('<title>Kelola Keuangan dengan Lebih Tenang - Tamerin</title>', false)
        ->assertSee('name="description"', false)
        ->assertSee('content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"', false)
        ->assertSee('rel="canonical" href="'.route('home').'"', false)
        ->assertSee('property="og:title"', false)
        ->assertSee('name="twitter:card" content="summary"', false)
        ->assertSee('type="application/ld+json"', false)
        ->assertSee('"applicationCategory":"FinanceApplication"', false);
});

test('authentication pages are excluded from search indexing', function () {
    $this->get(route('login'))
        ->assertSuccessful()
        ->assertSee('content="noindex, nofollow, noarchive"', false)
        ->assertDontSee('rel="canonical"', false);
});

test('authenticated application pages are excluded from search indexing', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertSuccessful()
        ->assertSee('content="noindex, nofollow, noarchive"', false)
        ->assertDontSee('rel="canonical"', false);
});

test('robots document allows the landing page and references the sitemap', function () {
    $this->get(route('seo.robots'))
        ->assertSuccessful()
        ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
        ->assertSee("User-agent: *\nAllow: /", false)
        ->assertSee('Disallow: /dashboard', false)
        ->assertSee('Sitemap: '.route('seo.sitemap'), false);
});

test('sitemap contains only the public landing page', function () {
    $response = $this->get(route('seo.sitemap'));

    $response
        ->assertSuccessful()
        ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
        ->assertSee('<loc>'.route('home').'</loc>', false);

    expect(mb_substr_count($response->getContent(), '<url>'))->toBe(1);
});
