<?php

use App\Enums\InvestmentValuationStatus;
use App\Models\AuditEvent;
use App\Models\InvestmentHolding;
use App\Models\InvestmentValuation;
use App\Models\User;

test('recording a valuation updates last valuation date and stores an audit event', function () {
    $user = User::factory()->create();
    $holding = InvestmentHolding::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('investments.valuations.store', $holding), [
            'valued_on' => '2026-08-27',
            'value' => 15_500_000,
            'note' => 'Harga penutupan pasar',
        ], ['X-Request-ID' => 'request-record-valuation'])
        ->assertRedirect(route('investments.show', $holding));

    $valuation = InvestmentValuation::query()->sole();
    $auditEvent = AuditEvent::query()->sole();

    expect($valuation)
        ->user_id->toBe($user->id)
        ->investment_holding_id->toBe($holding->id)
        ->status->toBe(InvestmentValuationStatus::Active)
        ->value->toBe(15_500_000)
        ->and($holding->refresh()->last_valuation_at?->toDateString())->toBe('2026-08-27')
        ->and($auditEvent->action)->toBe('investment_valuation.recorded')
        ->and($auditEvent->auditable_type)->toBe(InvestmentValuation::class)
        ->and($auditEvent->auditable_id)->toBe($valuation->id)
        ->and($auditEvent->new_values['value'])->toBe(15_500_000)
        ->and($auditEvent->request_id)->toBe('request-record-valuation');
});

test('last valuation date always follows the latest active valuation after void', function () {
    $user = User::factory()->create();
    $holding = InvestmentHolding::factory()->for($user)->create(['last_valuation_at' => '2026-08-20']);
    $olderValuation = InvestmentValuation::factory()->for($user)->create([
        'investment_holding_id' => $holding->id,
        'valued_on' => '2026-08-10',
    ]);
    $latestValuation = InvestmentValuation::factory()->for($user)->create([
        'investment_holding_id' => $holding->id,
        'valued_on' => '2026-08-20',
    ]);

    $this->actingAs($user)
        ->patch(route('investment-valuations.void', $latestValuation))
        ->assertRedirect(route('investments.show', $holding));

    expect($latestValuation->refresh()->status)->toBe(InvestmentValuationStatus::Voided)
        ->and($olderValuation->refresh()->status)->toBe(InvestmentValuationStatus::Active)
        ->and($holding->refresh()->last_valuation_at?->toDateString())->toBe('2026-08-10');

    $this->actingAs($user)
        ->patch(route('investment-valuations.void', $olderValuation))
        ->assertRedirect(route('investments.show', $holding));

    expect($holding->refresh()->last_valuation_at)->toBeNull();
});

test('a holding only accepts one valuation for each date including voided history', function () {
    $user = User::factory()->create();
    $holding = InvestmentHolding::factory()->for($user)->create();
    InvestmentValuation::factory()->voided()->for($user)->create([
        'investment_holding_id' => $holding->id,
        'valued_on' => '2026-08-27',
    ]);

    $this->actingAs($user)
        ->post(route('investments.valuations.store', $holding), [
            'valued_on' => '2026-08-27',
            'value' => 10_000_000,
            'note' => null,
        ])
        ->assertInvalid(['valued_on']);

    expect(InvestmentValuation::query()->count())->toBe(1);
});

test('valuation value cannot be negative', function () {
    $user = User::factory()->create();
    $holding = InvestmentHolding::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('investments.valuations.store', $holding), [
            'valued_on' => '2026-08-27',
            'value' => -1,
            'note' => null,
        ])
        ->assertInvalid(['value']);
});

test('archived holdings reject valuation and users cannot void another users valuation', function () {
    $user = User::factory()->create();
    $archivedHolding = InvestmentHolding::factory()->archived()->for($user)->create();
    $otherValuation = InvestmentValuation::factory()->create();

    $this->actingAs($user)
        ->post(route('investments.valuations.store', $archivedHolding), [
            'valued_on' => '2026-08-27',
            'value' => 10_000_000,
            'note' => null,
        ])
        ->assertForbidden();

    $this->actingAs($user)
        ->patch(route('investment-valuations.void', $otherValuation))
        ->assertForbidden();
});
