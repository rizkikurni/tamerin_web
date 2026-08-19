<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

test('password settings screen can be rendered', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('password.edit'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page->component('settings/password'));
});

test('users can update their password', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('password.update'), [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])
        ->assertRedirect(route('password.edit'))
        ->assertSessionHas('status', 'password-updated');

    expect(Hash::check('new-password', $user->refresh()->password))->toBeTrue();
});

test('current password must be correct', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('password.update'), [
            'current_password' => 'wrong-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])
        ->assertInvalid(['current_password']);

    expect(Hash::check('password', $user->refresh()->password))->toBeTrue();
});
