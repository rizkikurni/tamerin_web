<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('profile screen can be rendered', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('profile.edit'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/profile')
            ->where('user.id', $user->id));
});

test('users can update their profile', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
        ])
        ->assertRedirect(route('profile.edit'))
        ->assertSessionHas('status', 'profile-updated');

    expect($user->refresh())
        ->name->toBe('Updated Name')
        ->email->toBe('updated@example.com')
        ->email_verified_at->toBeNull();
});

test('profile email must be unique', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $otherUser->email,
        ])
        ->assertInvalid(['email']);
});

test('submitted user ids cannot update another profile', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'user_id' => $otherUser->id,
            'name' => 'Current User',
            'email' => $user->email,
        ])
        ->assertRedirect(route('profile.edit'));

    expect($user->refresh()->name)->toBe('Current User')
        ->and($otherUser->refresh()->name)->not->toBe('Current User');
});
