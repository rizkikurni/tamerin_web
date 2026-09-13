<?php

namespace App\Actions\Reports;

use InvalidArgumentException;

final readonly class GeneratedReportFile
{
    public function __construct(
        public string $contents,
        public string $mimeType,
        public string $fileName,
        public int $rowCount,
    ) {
        if ($contents === '') {
            throw new InvalidArgumentException('Generated report contents cannot be empty.');
        }
    }
}
