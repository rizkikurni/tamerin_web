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
        Schema::create('savings_contributions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->restrictOnDelete();
            $table->foreignUlid('savings_goal_id')->constrained()->restrictOnDelete();
            $table->foreignUlid('account_id')->nullable()->constrained('financial_accounts')->restrictOnDelete();
            $table->bigInteger('amount');
            $table->date('contributed_on');
            $table->string('note', 500)->nullable();
            $table->enum('status', ['active', 'voided']);
            $table->timestamp('voided_at')->nullable();
            $table->string('void_reason', 500)->nullable();
            $table->timestamp('created_at');
            $table->timestamp('updated_at');

            $table->index('user_id');
            $table->index(['savings_goal_id', 'contributed_on']);
        });

        DB::statement('ALTER TABLE savings_contributions ADD CONSTRAINT savings_contributions_amount_positive_check CHECK (amount > 0)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('savings_contributions');
    }
};
