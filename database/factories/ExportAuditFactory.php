<?php

namespace Database\Factories;

use App\Enums\ExportFormat;
use App\Enums\ExportReportType;
use App\Models\ExportAudit;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ExportAudit>
 */
class ExportAuditFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $reportType = fake()->randomElement(ExportReportType::cases());
        $format = fake()->randomElement(ExportFormat::cases());

        return [
            'user_id' => User::factory(),
            'report_type' => $reportType,
            'format' => $format,
            'filters_json' => [],
            'row_count' => fake()->numberBetween(0, 5_000),
            'file_name' => "{$reportType->value}.{$format->value}",
            'generated_at' => now(),
        ];
    }
}
