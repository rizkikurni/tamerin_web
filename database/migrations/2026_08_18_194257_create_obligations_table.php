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
        Schema::create('obligations', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->restrictOnDelete();
            $table->enum('kind', ['debt', 'receivable']);
            $table->string('counterparty_name', 120);
            $table->bigInteger('original_amount');
            $table->bigInteger('outstanding_amount');
            $table->date('started_on');
            $table->date('due_on')->nullable()->index();
            $table->enum('status', ['open', 'settled', 'archived']);
            $table->timestamp('settled_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->string('note', 500)->nullable();
            $table->timestamp('created_at');
            $table->timestamp('updated_at');

            $table->index(['user_id', 'kind', 'status', 'due_on']);
        });

        DB::statement('ALTER TABLE obligations ADD CONSTRAINT obligations_original_amount_positive_check CHECK (original_amount > 0)');
        DB::statement('ALTER TABLE obligations ADD CONSTRAINT obligations_outstanding_amount_range_check CHECK (outstanding_amount >= 0 AND outstanding_amount <= original_amount)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('obligations');
    }
};
