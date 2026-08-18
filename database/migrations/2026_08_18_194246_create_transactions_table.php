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
        Schema::create('transactions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->restrictOnDelete();
            $table->enum('type', ['income', 'expense', 'transfer']);
            $table->bigInteger('amount');
            $table->date('transacted_on');
            $table->foreignUlid('account_id')->constrained('financial_accounts')->restrictOnDelete();
            $table->foreignUlid('destination_account_id')->nullable()->constrained('financial_accounts')->restrictOnDelete();
            $table->foreignUlid('category_id')->nullable()->constrained()->restrictOnDelete();
            $table->string('note', 500)->nullable();
            $table->enum('status', ['posted', 'voided']);
            $table->timestamp('voided_at')->nullable();
            $table->string('void_reason', 500)->nullable();
            $table->string('idempotency_key', 64)->nullable();
            $table->foreignUlid('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamp('created_at');
            $table->timestamp('updated_at');

            $table->index(['user_id', 'account_id', 'transacted_on']);
            $table->index('destination_account_id');
            $table->index(['user_id', 'category_id', 'transacted_on']);
            $table->unique(['user_id', 'idempotency_key']);
        });

        DB::statement('CREATE INDEX transactions_user_transacted_on_index ON transactions (user_id, transacted_on DESC)');
        DB::statement('ALTER TABLE transactions ADD CONSTRAINT transactions_amount_positive_check CHECK (amount > 0)');
        DB::statement("ALTER TABLE transactions ADD CONSTRAINT transactions_transfer_accounts_check CHECK (type <> 'transfer' OR (destination_account_id IS NOT NULL AND account_id <> destination_account_id))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
