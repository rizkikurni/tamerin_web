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
        Schema::create('categories', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->restrictOnDelete();
            $table->string('name', 60);
            $table->enum('type', ['income', 'expense']);
            $table->string('color_token', 40)->nullable();
            $table->string('icon', 40)->nullable();
            $table->boolean('is_system')->default(false);
            $table->timestamp('archived_at')->nullable();
            $table->timestamp('created_at');
            $table->timestamp('updated_at');

            $table->index('user_id');
            $table->unique(['user_id', 'type', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
