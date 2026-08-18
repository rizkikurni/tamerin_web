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
        Schema::create('assets', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->restrictOnDelete();
            $table->string('name', 120);
            $table->enum('asset_type', ['vehicle', 'electronics', 'property', 'jewelry', 'other']);
            $table->date('acquired_on')->nullable();
            $table->bigInteger('acquisition_cost')->nullable();
            $table->bigInteger('current_value');
            $table->date('valued_on');
            $table->string('note', 500)->nullable();
            $table->enum('status', ['active', 'archived']);
            $table->timestamp('archived_at')->nullable();
            $table->timestamp('created_at');
            $table->timestamp('updated_at');

            $table->index(['user_id', 'status']);
        });

        DB::statement('ALTER TABLE assets ADD CONSTRAINT assets_acquisition_cost_non_negative_check CHECK (acquisition_cost IS NULL OR acquisition_cost >= 0)');
        DB::statement('ALTER TABLE assets ADD CONSTRAINT assets_current_value_non_negative_check CHECK (current_value >= 0)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
