<?php

use App\Enums\ThemeMode;
use App\Enums\ThemePreset;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Testing\AssertableInertia as Assert;

test('registration screen can be rendered', function () {
    $this->get(route('register'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page->component('auth/register'));
});

test('registration validation messages are shown in Indonesian', function () {
    $this->post(route('register.store'), [
        'password' => 'pendek',
        'password_confirmation' => 'pendek',
    ])->assertSessionHasErrors([
        'name' => 'Nama wajib diisi.',
        'email' => 'Email wajib diisi.',
        'password' => 'Kata sandi minimal 8 karakter.',
    ]);

    $this->post(route('register.store'), [
        'name' => 'Rizki Tamerin',
        'password' => 'password',
        'password_confirmation' => 'berbeda',
    ])->assertSessionHasErrors([
        'email' => 'Email wajib diisi.',
        'password' => 'Konfirmasi kata sandi tidak cocok.',
    ]);
});

test('strong password validation messages are shown in Indonesian', function (string $password, string $message) {
    Password::defaults(fn (): Password => Password::min(12)
        ->mixedCase()
        ->letters()
        ->numbers()
        ->symbols());

    $this->post(route('register.store'), [
        'name' => 'Rizki Tamerin',
        'password' => $password,
        'password_confirmation' => $password,
    ])->assertSessionHasErrors(['password' => $message]);
})->with([
    'huruf besar dan kecil' => ['abcdefghijkl', 'Kata sandi harus mengandung huruf besar dan huruf kecil.'],
    'angka' => ['Abcdefghijk!', 'Kata sandi harus mengandung minimal satu angka.'],
    'simbol' => ['Abcdefghijk1', 'Kata sandi harus mengandung minimal satu simbol.'],
]);

test('new users can register with default preferences', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Rizki Tamerin',
        'email' => 'rizki@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect(route('dashboard'));
    $this->assertAuthenticated();

    $user = User::query()->where('email', 'rizki@example.com')->firstOrFail();

    expect($user->name)->toBe('Rizki Tamerin')
        ->and(Hash::check('password', $user->password))->toBeTrue()
        ->and($user->preference)->not->toBeNull()
        ->and($user->preference?->theme_mode)->toBe(ThemeMode::System)
        ->and($user->preference?->theme_preset)->toBe(ThemePreset::Violet)
        ->and($user->preference?->timezone)->toBe('Asia/Jakarta');
});

test('registration validates unique email and password confirmation', function () {
    User::factory()->create(['email' => 'rizki@example.com']);

    $this->post(route('register.store'), [
        'name' => 'Rizki Tamerin',
        'email' => 'rizki@example.com',
        'password' => 'password',
        'password_confirmation' => 'different-password',
    ])->assertInvalid(['email', 'password']);

    $this->assertGuest();
});

test('registration attempts are rate limited', function () {
    foreach (range(1, 3) as $attempt) {
        $this->post(route('register.store'), [
            'name' => 'Rizki Tamerin',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertInvalid(['email']);
    }

    $this->post(route('register.store'), [
        'name' => 'Rizki Tamerin',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertTooManyRequests();
});

test('registration attempts are also rate limited per hour', function () {
    foreach (range(1, 10) as $attempt) {
        $this->post(route('register.store'), [
            'name' => 'Rizki Tamerin',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertInvalid(['email']);

        $this->travel(61)->seconds();
    }

    $this->post(route('register.store'), [
        'name' => 'Rizki Tamerin',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertTooManyRequests();
});
