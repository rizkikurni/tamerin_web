<?php

namespace Database\Seeders;

use App\Models\TelegramConnection;
use Illuminate\Database\Seeder;

class TelegramConnectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (TelegramConnection::query()->exists()) {
            return;
        }

        TelegramConnection::factory()->create();
    }
}
