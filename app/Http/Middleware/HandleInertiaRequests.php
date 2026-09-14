<?php

namespace App\Http\Middleware;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'seo' => [
                'siteName' => config('seo.site_name'),
                'description' => config('seo.description'),
                'homeUrl' => route('home'),
                'locale' => config('seo.locale'),
                'language' => config('seo.language'),
            ],
            'auth' => [
                'user' => function () use ($request): ?array {
                    $user = $request->user();

                    if (! $user instanceof User) {
                        return null;
                    }

                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'email_verified_at' => $user->email_verified_at?->toISOString(),
                    ];
                },
            ],
            'flash' => [
                'status' => fn (): ?string => session('status'),
            ],
            'theme' => function () use ($request): ?array {
                $user = $request->user();

                if (! $user instanceof User) {
                    return null;
                }

                $preference = $user->preference;

                if (! $preference) {
                    return null;
                }

                $hasCustom = $preference->primary_hex || $preference->secondary_hex || $preference->accent_hex;

                return [
                    'mode' => $preference->theme_mode->value,
                    'preset' => $preference->theme_preset->value,
                    'customColors' => $hasCustom ? [
                        'primary' => $preference->primary_hex ?? '#806CEB',
                        'secondary' => $preference->secondary_hex ?? '#A58AF4',
                        'accent' => $preference->accent_hex ?? '#D38CF0',
                    ] : null,
                ];
            },
        ];
    }
}
