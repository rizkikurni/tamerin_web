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
        Schema::create('investment_holdings', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->restrictOnDelete();
            $table->string('name', 120);
            $table->enum('instrument_type', ['stock', 'mutual_fund', 'crypto', 'bond', 'gold', 'other']);
            $table->bigInteger('acquisition_cost');
            $table->date('acquired_on');
            $table->decimal('units', 20, 8)->nullable();
            $table->enum('status', ['active', 'archived']);
            $table->date('last_valuation_at')->nullable()->index();
            $table->timestamp('archived_at')->nullable();
            $table->timestamp('created_at');
            $table->timestamp('updated_at');

            $table->index(['user_id', 'status']);
        });

        DB::statement('ALTER TABLE investment_holdings ADD CONSTRAINT investment_holdings_acquisition_cost_non_negative_check CHECK (acquisition_cost >= 0)');
        DB::statement('ALTER TABLE investment_holdings ADD CONSTRAINT investment_holdings_units_positive_check CHECK (units IS NULL OR units > 0)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('investment_holdings');
    }
};
