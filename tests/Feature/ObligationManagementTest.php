<?php

use App\Enums\ObligationKind;
use App\Enums\ObligationStatus;
use App\Models\Obligation;
use App\Models\ObligationSettlement;
use App\Models\User;
use Illuminate\Support\Collection;
use Inertia\Testing\AssertableInertia as Assert;

test('obligation routes require authentication', function () {
    $obligation = Obligation::factory()->create();

    $this->get(route('obligations.index'))->assertRedirect(route('login'));
    $this->get(route('obligations.create'))->assertRedirect(route('login'));
    $this->get(route('obligations.show', $obligation))->assertRedirect(route('login'));
    $this->post(route('obligations.store'))->assertRedirect(route('login'));
    $this->patch(route('obligations.update', $obligation))->assertRedirect(route('login'));
    $this->patch(route('obligations.archive', $obligation))->assertRedirect(route('login'));
});

test('obligation index is owner scoped and supports kind status due and search filters', function () {
    $this->travelTo('2026-08-27');

    $user = User::factory()->create();
    $debt = Obligation::factory()->for($user)->create([
        'counterparty_name' => 'Koperasi Karyawan',
        'kind' => ObligationKind::Debt,
        'original_amount' => 2_000_000,
        'outstanding_amount' => 1_500_000,
        'due_on' => '2026-08-30',
    ]);
    Obligation::factory()->receivable()->for($user)->create([
        'counterparty_name' => 'Rekan Bisnis',
        'original_amount' => 2_500_000,
        'outstanding_amount' => 2_000_000,
        'due_on' => '2026-08-26',
    ]);
    Obligation::factory()->settled()->for($user)->create();
    $otherObligation = Obligation::factory()->create();

    $this->actingAs($user)
        ->get(route('obligations.index', [
            'kind' => 'debt',
            'status' => 'open',
            'due_filter' => 'due_soon',
            'search' => 'Koperasi',
        ]))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('obligations/index')
            ->where('filters.kind', 'debt')
            ->where('filters.status', 'open')
            ->where('filters.due_filter', 'due_soon')
            ->where('filters.search', 'Koperasi')
            ->has('obligations.data', 1)
            ->where('obligations.data.0.id', $debt->id)
            ->where('obligations.data.0.paid_amount', 500_000)
            ->where('obligations.data.0.progress_percentage', 25)
            ->where('summary.totalDebt', 1_500_000)
            ->where('summary.totalReceivable', 2_000_000)
            ->where('summary.dueSoonCount', 1)
            ->where('summary.overdueCount', 1)
            ->where('obligations.data', fn (Collection $items): bool => $items->doesntContain('id', $otherObligation->id)));
});

test('users can create an obligation', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('obligations.store'), [
            'kind' => ObligationKind::Receivable->value,
            'counterparty_name' => 'PT Contoh',
            'original_amount' => 8_000_000,
            'started_on' => '2026-08-01',
            'due_on' => '2026-09-01',
            'note' => 'Termin pertama',
        ])
        ->assertRedirect();

    $obligation = Obligation::query()->sole();

    expect($obligation)
        ->user_id->toBe($user->id)
        ->kind->toBe(ObligationKind::Receivable)
        ->original_amount->toBe(8_000_000)
        ->outstanding_amount->toBe(8_000_000)
        ->status->toBe(ObligationStatus::Open)
        ->settled_at->toBeNull();
});

test('updating a partially paid obligation preserves the paid amount', function () {
    $user = User::factory()->create();
    $obligation = Obligation::factory()->for($user)->create([
        'original_amount' => 10_000_000,
        'outstanding_amount' => 7_000_000,
    ]);

    $this->actingAs($user)
        ->patch(route('obligations.update', $obligation), [
            'kind' => ObligationKind::Debt->value,
            'counterparty_name' => 'Bank Diperbarui',
            'original_amount' => 8_000_000,
            'started_on' => '2026-01-01',
            'due_on' => null,
            'note' => null,
        ])
        ->assertRedirect(route('obligations.show', $obligation));

    expect($obligation->refresh())
        ->counterparty_name->toBe('Bank Diperbarui')
        ->original_amount->toBe(8_000_000)
        ->outstanding_amount->toBe(5_000_000);
});

test('partially paid obligations reject kind changes and amounts below payments', function (array $overrides, array $errors) {
    $user = User::factory()->create();
    $obligation = Obligation::factory()->for($user)->create([
        'original_amount' => 10_000_000,
        'outstanding_amount' => 7_000_000,
    ]);
    $payload = [
        'kind' => ObligationKind::Debt->value,
        'counterparty_name' => 'Bank',
        'original_amount' => 10_000_000,
        'started_on' => '2026-01-01',
        'due_on' => null,
        'note' => null,
        ...$overrides,
    ];

    $this->actingAs($user)
        ->patch(route('obligations.update', $obligation), $payload)
        ->assertInvalid($errors);
})->with([
    'kind change' => [['kind' => ObligationKind::Receivable->value], ['kind']],
    'amount below paid total' => [['original_amount' => 2_999_999], ['original_amount']],
]);

test('obligation input is validated', function (array $overrides, array $errors) {
    $payload = [
        'kind' => ObligationKind::Debt->value,
        'counterparty_name' => 'Bank',
        'original_amount' => 1_000_000,
        'started_on' => '2026-08-01',
        'due_on' => null,
        'note' => null,
        ...$overrides,
    ];

    $this->actingAs(User::factory()->create())
        ->post(route('obligations.store'), $payload)
        ->assertInvalid($errors);
})->with([
    'non positive amount' => [['original_amount' => 0], ['original_amount']],
    'invalid kind' => [['kind' => 'loan'], ['kind']],
    'due before start' => [['due_on' => '2026-07-31'], ['due_on']],
    'long counterparty' => [['counterparty_name' => str_repeat('a', 121)], ['counterparty_name']],
]);

test('users cannot access another users obligation', function () {
    $user = User::factory()->create();
    $obligation = Obligation::factory()->create();

    $this->actingAs($user)->get(route('obligations.show', $obligation))->assertForbidden();
    $this->actingAs($user)->get(route('obligations.edit', $obligation))->assertForbidden();
    $this->actingAs($user)->patch(route('obligations.archive', $obligation))->assertForbidden();
});

test('only settled obligations can be archived and settlement history is preserved', function () {
    $user = User::factory()->create();
    $openObligation = Obligation::factory()->for($user)->create();
    $settledObligation = Obligation::factory()->settled()->for($user)->create();
    $settlement = ObligationSettlement::factory()->for($user)->create([
        'obligation_id' => $settledObligation->id,
    ]);

    $this->actingAs($user)
        ->patch(route('obligations.archive', $openObligation))
        ->assertForbidden();

    $this->actingAs($user)
        ->patch(route('obligations.archive', $settledObligation))
        ->assertRedirect(route('obligations.index'));

    expect($settledObligation->refresh())
        ->status->toBe(ObligationStatus::Archived)
        ->archived_at->not->toBeNull()
        ->and($settlement->refresh()->obligation_id)->toBe($settledObligation->id);
});
