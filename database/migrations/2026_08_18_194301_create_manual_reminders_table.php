<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('manual_reminders', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->restrictOnDelete();
            $table->string('title', 160);
            $table->date('due_on')->nullable();
            $table->string('note', 500)->nullable();
            $table->enum('status', ['active', 'dismissed', 'done']);
            $table->timestamp('created_at');
            $table->timestamp('updated_at');

            $table->index(['user_id', 'status', 'due_on']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('manual_reminders');
    }
};
