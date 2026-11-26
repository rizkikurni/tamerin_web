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
        Schema::create('telegram_connections', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('telegram_chat_id', 64)->nullable()->unique();
            $table->string('telegram_user_id', 64)->nullable();
            $table->string('telegram_username', 64)->nullable();
            $table->string('telegram_first_name', 120)->nullable();
            $table->foreignUlid('default_account_id')
                ->nullable()
                ->index()
                ->constrained('financial_accounts')
                ->nullOnDelete();
            $table->string('link_token_hash', 64)->nullable()->index();
            $table->timestamp('link_token_expires_at')->nullable();
            $table->json('pending_draft')->nullable();
            $table->boolean('daily_reminder_enabled')->default(true);
            $table->date('last_daily_reminder_sent_on')->nullable();
            $table->bigInteger('last_update_id')->nullable();
            $table->timestamp('linked_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('telegram_connections');
    }
};
