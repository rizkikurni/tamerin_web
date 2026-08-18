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
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->enum('theme_mode', ['system', 'light', 'dark']);
            $table->enum('theme_preset', ['ocean', 'forest', 'violet', 'custom']);
            $table->string('primary_hex', 7)->nullable();
            $table->string('secondary_hex', 7)->nullable();
            $table->string('accent_hex', 7)->nullable();
            $table->string('timezone', 64)->default('Asia/Jakarta');
            $table->timestamp('created_at');
            $table->timestamp('updated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
    }
};
