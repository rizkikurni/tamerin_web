<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read UserPreference|null $preference
 */
#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasUlids, Notifiable;

    /** @return HasOne<UserPreference, $this> */
    public function preference(): HasOne
    {
        return $this->hasOne(UserPreference::class);
    }

    /** @return HasMany<FinancialAccount, $this> */
    public function financialAccounts(): HasMany
    {
        return $this->hasMany(FinancialAccount::class);
    }

    /** @return HasMany<Category, $this> */
    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    /** @return HasMany<Transaction, $this> */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /** @return HasMany<Transaction, $this> */
    public function createdTransactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'created_by');
    }

    /** @return HasMany<Budget, $this> */
    public function budgets(): HasMany
    {
        return $this->hasMany(Budget::class);
    }

    /** @return HasMany<SavingsGoal, $this> */
    public function savingsGoals(): HasMany
    {
        return $this->hasMany(SavingsGoal::class);
    }

    /** @return HasMany<SavingsContribution, $this> */
    public function savingsContributions(): HasMany
    {
        return $this->hasMany(SavingsContribution::class);
    }

    /** @return HasMany<InvestmentHolding, $this> */
    public function investmentHoldings(): HasMany
    {
        return $this->hasMany(InvestmentHolding::class);
    }

    /** @return HasMany<InvestmentValuation, $this> */
    public function investmentValuations(): HasMany
    {
        return $this->hasMany(InvestmentValuation::class);
    }

    /** @return HasMany<Asset, $this> */
    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class);
    }

    /** @return HasMany<Obligation, $this> */
    public function obligations(): HasMany
    {
        return $this->hasMany(Obligation::class);
    }

    /** @return HasMany<ObligationSettlement, $this> */
    public function obligationSettlements(): HasMany
    {
        return $this->hasMany(ObligationSettlement::class);
    }

    /** @return HasMany<ManualReminder, $this> */
    public function manualReminders(): HasMany
    {
        return $this->hasMany(ManualReminder::class);
    }

    /** @return HasMany<ExportAudit, $this> */
    public function exportAudits(): HasMany
    {
        return $this->hasMany(ExportAudit::class);
    }

    /** @return HasMany<AuditEvent, $this> */
    public function auditEvents(): HasMany
    {
        return $this->hasMany(AuditEvent::class);
    }

    /** @return HasMany<AuditEvent, $this> */
    public function performedAuditEvents(): HasMany
    {
        return $this->hasMany(AuditEvent::class, 'actor_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
