<?php

use App\Enums\ThemeMode;
use App\Enums\ThemePreset;
use App\Models\User;
use App\Models\UserPreference;
use Inertia\Testing\AssertableInertia as Assert;

test('preference settings screen can be rendered', function () {
    $user = User::factory()->create();
    $preference = UserPreference::factory()->for($user)->create([
        'theme_mode' => ThemeMode::Dark,
        'theme_preset' => ThemePreset::Forest,
    ]);

    $this->actingAs($user)
        ->get(route('preferences.edit'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/preferences')
            ->where('preferences.theme_mode', $preference->theme_mode->value)
            ->where('preferences.theme_preset', $preference->theme_preset->value));
});

test('users can update only their own preferences', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $otherPreference = UserPreference::factory()->for($otherUser)->create();

    $this->actingAs($user)
        ->patch(route('preferences.update'), [
            'user_id' => $otherUser->id,
            'theme_mode' => ThemeMode::Dark->value,
            'theme_preset' => ThemePreset::Custom->value,
            'primary_hex' => '#112233',
            'secondary_hex' => '#445566',
            'accent_hex' => '#778899',
            'timezone' => 'Asia/Jakarta',
        ])
        ->assertRedirect(route('preferences.edit'))
        ->assertSessionHas('status', 'preferences-updated');

    $preference = $user->preference()->firstOrFail();

    expect($preference->theme_mode)->toBe(ThemeMode::Dark)
        ->and($preference->theme_preset)->toBe(ThemePreset::Custom)
        ->and($preference->primary_hex)->toBe('#112233')
        ->and($otherPreference->fresh()?->theme_mode)->toBe($otherPreference->theme_mode);
});

test('preference values must be valid', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('preferences.update'), [
            'theme_mode' => 'invalid',
            'theme_preset' => 'invalid',
            'primary_hex' => 'not-a-color',
            'secondary_hex' => null,
            'accent_hex' => null,
            'timezone' => 'Invalid/Timezone',
        ])
        ->assertInvalid([
            'theme_mode',
            'theme_preset',
            'primary_hex',
            'timezone',
        ]);

    expect($user->preference)->toBeNull();
});
