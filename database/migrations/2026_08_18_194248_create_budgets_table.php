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
        Schema::create('budgets', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->restrictOnDelete();
            $table->foreignUlid('category_id')->constrained()->restrictOnDelete();
            $table->date('period_start');
            $table->bigInteger('amount');
            $table->timestamp('created_at');
            $table->timestamp('updated_at');

            $table->unique(['user_id', 'category_id', 'period_start']);
        });

        DB::statement('ALTER TABLE budgets ADD CONSTRAINT budgets_amount_positive_check CHECK (amount > 0)');
        DB::statement("ALTER TABLE budgets ADD CONSTRAINT budgets_period_start_first_day_check CHECK (period_start = DATE_TRUNC('month', period_start)::date)");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
