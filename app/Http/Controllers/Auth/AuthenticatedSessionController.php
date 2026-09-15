<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Auth\AuthenticateUser;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        $siteKey = config('services.turnstile.site_key');

        return Inertia::render('auth/login', [
            'turnstileSiteKey' => config('services.turnstile.enabled') && is_string($siteKey)
                ? $siteKey
                : null,
        ]);
    }

    public function store(LoginRequest $request, AuthenticateUser $action): RedirectResponse
    {
        $action->handle(
            $request->credentials(),
            $request->boolean('remember'),
            $request->throttleKey(),
        );
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return to_route('login');
    }
}
