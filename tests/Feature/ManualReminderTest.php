<?php

use App\Enums\ManualReminderStatus;
use App\Enums\ObligationStatus;
use App\Models\ManualReminder;
use App\Models\Obligation;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;

test('manual reminder routes require authentication and permanent deletion is unavailable', function () {
    $reminder = ManualReminder::factory()->create();

    $this->get(route('reminders.index'))->assertRedirect(route('home'));
    $this->post(route('reminders.store'))->assertRedirect(route('home'));
    $this->patch(route('reminders.update', $reminder))->assertRedirect(route('home'));
    $this->patch(route('reminders.complete', $reminder))->assertRedirect(route('home'));
    $this->patch(route('reminders.dismiss', $reminder))->assertRedirect(route('home'));

    expect(Route::has('reminders.destroy'))->toBeFalse();
});

test('user only sees owned reminders with filters groups and summary', function () {
    $this->travelTo('2026-08-27 10:00:00');

    $user = User::factory()->create();
    ManualReminder::factory()->for($user)->create([
        'title' => 'Bayar listrik rumah',
        'due_on' => '2026-08-26',
    ]);
    ManualReminder::factory()->for($user)->create([
        'title' => 'Telepon bank',
        'due_on' => '2026-08-27',
    ]);
    ManualReminder::factory()->for($user)->create([
        'title' => 'Perpanjang deposito',
        'due_on' => '2026-09-02',
    ]);
    ManualReminder::factory()->for($user)->create([
        'title' => 'Catatan tanpa tanggal',
        'due_on' => null,
    ]);
    ManualReminder::factory()->done()->for($user)->create([
        'title' => 'Sudah selesai',
        'updated_at' => '2026-08-20 12:00:00',
    ]);
    ManualReminder::factory()->create([
        'title' => 'Rahasia pengguna lain',
        'due_on' => '2026-08-25',
    ]);

    $this->actingAs($user)
        ->get(route('reminders.index', [
            'status' => ManualReminderStatus::Active->value,
            'due_filter' => 'overdue',
            'search' => 'listrik',
        ]))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reminders/index')
            ->has('manualReminders.data', 1)
            ->where('manualReminders.data.0.title', 'Bayar listrik rumah')
            ->where('manualReminders.data.0.group', 'overdue')
            ->where('summary.activeCount', 4)
            ->where('summary.dueTodayCount', 1)
            ->where('summary.overdueCount', 1)
            ->where('summary.completedThisMonthCount', 1)
            ->where('filters.status', 'active')
            ->where('filters.due_filter', 'overdue')
            ->where('filters.search', 'listrik'));
});

test('user can create and update an active manual reminder', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('reminders.store'), [
            'title' => '  Bayar tagihan internet  ',
            'due_on' => '2026-09-10',
            'note' => '  Gunakan akun bank utama  ',
        ])
        ->assertRedirect(route('reminders.index'))
        ->assertSessionHas('status', 'manual-reminder-created');

    $reminder = ManualReminder::query()->whereBelongsTo($user)->sole();

    expect($reminder)
        ->title->toBe('Bayar tagihan internet')
        ->note->toBe('Gunakan akun bank utama')
        ->status->toBe(ManualReminderStatus::Active);

    $this->actingAs($user)
        ->patch(route('reminders.update', $reminder), [
            'title' => 'Bayar internet kantor',
            'due_on' => null,
            'note' => null,
        ])
        ->assertRedirect(route('reminders.index'))
        ->assertSessionHas('status', 'manual-reminder-updated');

    expect($reminder->refresh())
        ->title->toBe('Bayar internet kantor')
        ->due_on->toBeNull()
        ->note->toBeNull();
});

test('manual reminder input is validated', function (array $payload, string $field) {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('reminders.store'), $payload)
        ->assertInvalid([$field]);
})->with([
    'title required' => [['title' => '', 'due_on' => null, 'note' => null], 'title'],
    'title max' => [['title' => str_repeat('a', 161), 'due_on' => null, 'note' => null], 'title'],
    'date format' => [['title' => 'Valid', 'due_on' => 'besok', 'note' => null], 'due_on'],
    'note max' => [['title' => 'Valid', 'due_on' => null, 'note' => str_repeat('a', 501)], 'note'],
]);

test('user cannot update or transition another users reminder', function () {
    $user = User::factory()->create();
    $reminder = ManualReminder::factory()->create();

    $this->actingAs($user)
        ->patch(route('reminders.update', $reminder), [
            'title' => 'Tidak boleh',
            'due_on' => null,
            'note' => null,
        ])
        ->assertForbidden();
    $this->actingAs($user)
        ->patch(route('reminders.complete', $reminder))
        ->assertForbidden();
    $this->actingAs($user)
        ->patch(route('reminders.dismiss', $reminder))
        ->assertForbidden();
});

test('active reminder can be completed or dismissed only once', function () {
    $user = User::factory()->create();
    $completed = ManualReminder::factory()->for($user)->create();
    $dismissed = ManualReminder::factory()->for($user)->create();

    $this->actingAs($user)
        ->patch(route('reminders.complete', $completed))
        ->assertRedirect(route('reminders.index'))
        ->assertSessionHas('status', 'manual-reminder-completed');
    $this->actingAs($user)
        ->patch(route('reminders.dismiss', $dismissed))
        ->assertRedirect(route('reminders.index'))
        ->assertSessionHas('status', 'manual-reminder-dismissed');

    expect($completed->refresh()->status)->toBe(ManualReminderStatus::Done)
        ->and($dismissed->refresh()->status)->toBe(ManualReminderStatus::Dismissed);

    $this->actingAs($user)
        ->patch(route('reminders.dismiss', $completed))
        ->assertForbidden();
    $this->actingAs($user)
        ->patch(route('reminders.complete', $dismissed))
        ->assertForbidden();
});

test('system reminder disappears automatically when its source is resolved', function () {
    $this->travelTo('2026-08-27 10:00:00');

    $user = User::factory()->create();
    $obligation = Obligation::factory()->for($user)->create([
        'counterparty_name' => 'Bank Contoh',
        'due_on' => '2026-08-29',
        'status' => ObligationStatus::Open,
    ]);

    $this->actingAs($user)
        ->get(route('reminders.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('systemReminders', 1)
            ->where('systemReminders.0.id', "obligation:{$obligation->id}"));

    $obligation->update([
        'outstanding_amount' => 0,
        'status' => ObligationStatus::Settled,
        'settled_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('reminders.index'))
        ->assertInertia(fn (Assert $page) => $page->has('systemReminders', 0));
});
