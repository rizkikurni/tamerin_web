<?php

namespace App\Http\Controllers\Settings;

use App\Actions\Settings\UpdatePassword;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdatePasswordRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('settings/password');
    }

    public function update(UpdatePasswordRequest $request, UpdatePassword $action): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $action->handle($user, $request->newPassword());

        return to_route('password.edit')->with('status', 'password-updated');
    }
}
