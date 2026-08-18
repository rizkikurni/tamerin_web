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
        Schema::create('export_audits', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->restrictOnDelete();
            $table->enum('report_type', [
                'transactions',
                'cash_flow',
                'budgets',
                'savings',
                'investments',
                'net_worth',
                'obligations',
            ]);
            $table->enum('format', ['pdf', 'xlsx']);
            $table->jsonb('filters_json');
            $table->integer('row_count');
            $table->string('file_name');
            $table->timestamp('generated_at');

            $table->index(['user_id', 'generated_at']);
        });

        DB::statement('ALTER TABLE export_audits ADD CONSTRAINT export_audits_row_count_non_negative_check CHECK (row_count >= 0)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('export_audits');
    }
};
