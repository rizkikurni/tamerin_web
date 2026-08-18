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
        Schema::create('investment_valuations', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->restrictOnDelete();
            $table->foreignUlid('investment_holding_id')->constrained()->restrictOnDelete();
            $table->date('valued_on');
            $table->bigInteger('value');
            $table->string('note', 500)->nullable();
            $table->enum('status', ['active', 'voided']);
            $table->timestamp('created_at');
            $table->timestamp('updated_at');

            $table->index('user_id');
            $table->unique(['investment_holding_id', 'valued_on']);
        });

        DB::statement('ALTER TABLE investment_valuations ADD CONSTRAINT investment_valuations_value_non_negative_check CHECK (value >= 0)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('investment_valuations');
    }
};
