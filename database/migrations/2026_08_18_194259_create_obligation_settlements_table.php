<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('obligation_settlements', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->restrictOnDelete();
            $table->foreignUlid('obligation_id')->constrained()->restrictOnDelete();
            $table->foreignUlid('account_id')->constrained('financial_accounts')->restrictOnDelete();
            $table->foreignUlid('transaction_id')->unique()->constrained()->restrictOnDelete();
            $table->bigInteger('amount');
            $table->date('settled_on');
            $table->string('note', 500)->nullable();
            $table->string('idempotency_key', 64)->nullable();
            $table->timestamp('created_at');
            $table->timestamp('updated_at');

            $table->index('user_id');
            $table->index(['obligation_id', 'settled_on']);
            $table->unique(['user_id', 'idempotency_key']);
        });

        DB::statement('ALTER TABLE obligation_settlements ADD CONSTRAINT obligation_settlements_amount_positive_check CHECK (amount > 0)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('obligation_settlements');
    }
};
