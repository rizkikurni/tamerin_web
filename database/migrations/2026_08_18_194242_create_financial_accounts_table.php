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
        Schema::create('financial_accounts', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->restrictOnDelete();
            $table->string('name', 80);
            $table->enum('type', ['cash', 'bank', 'e_wallet']);
            $table->bigInteger('opening_balance')->default(0);
            $table->date('opened_on');
            $table->enum('status', ['active', 'archived']);
            $table->timestamp('archived_at')->nullable();
            $table->timestamp('created_at');
            $table->timestamp('updated_at');

            $table->index(['user_id', 'status']);
        });

        DB::statement("CREATE UNIQUE INDEX financial_accounts_user_id_name_active_unique ON financial_accounts (user_id, name) WHERE status = 'active'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_accounts');
    }
};
