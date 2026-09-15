<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Auth\RegisterUser;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterUserRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        $siteKey = config('services.turnstile.site_key');

        return Inertia::render('auth/register', [
            'turnstileSiteKey' => config('services.turnstile.enabled') && is_string($siteKey)
                ? $siteKey
                : null,
        ]);
    }

    public function store(RegisterUserRequest $request, RegisterUser $action): RedirectResponse
    {
        $user = $action->handle($request->registrationData());

        Auth::login($user);
        $request->session()->regenerate();

        return to_route('dashboard');
    }
}
