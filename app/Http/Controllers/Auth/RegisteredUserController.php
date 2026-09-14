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
        return Inertia::render('auth/register');
    }

    public function store(RegisterUserRequest $request, RegisterUser $action): RedirectResponse
    {
        $user = $action->handle($request->registrationData());

        Auth::login($user);
        $request->session()->regenerate();

        return to_route('dashboard');
    }
}
