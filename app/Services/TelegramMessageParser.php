<?php

namespace App\Services;

use App\Enums\CategoryType;
use App\Enums\TransactionType;
use App\Models\Category;
use App\Models\FinancialAccount;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * @phpstan-type ParsedTelegramTransaction array{
 *     type: TransactionType,
 *     amount: int,
 *     note: string|null,
 *     account_id: string|null,
 *     destination_account_id: string|null,
 *     category_id: string|null
 * }
 * @phpstan-type ParsedTelegramReminder array{
 *     title: string,
 *     due_on: string|null
 * }
 */
final class TelegramMessageParser
{
    /**
     * Common Indonesian daily keywords mapped to standard category fragments.
     *
     * @var array<string, list<string>>
     */
    private const CATEGORY_KEYWORDS = [
        'makan' => ['warteg', 'makan', 'minum', 'kopi', 'sarapan', 'siang', 'malam', 'jajan', 'gofood', 'grabfood', 'shopeefood', 'resto', 'bakso', 'nasi', 'ayam', 'cemilan'],
        'transport' => ['bensin', 'pertalite', 'pertamax', 'parkir', 'tol', 'ojol', 'gojek', 'grab', 'kereta', 'krl', 'mrt', 'transjakarta', 'bus', 'taksi', 'servis'],
        'tagihan' => ['listrik', 'pln', 'pdam', 'air', 'wifi', 'internet', 'indihome', 'biznet', 'pulsa', 'kuota', 'paket data', 'kos', 'kontrakan', 'bpjs'],
        'belanja' => ['alfamart', 'indomaret', 'supermarket', 'belanja', 'tokopedia', 'shopee', 'lazada', 'sabun', 'kebutuhan'],
        'kesehatan' => ['obat', 'apotek', 'dokter', 'klinik', 'vitamin', 'rs'],
        'hiburan' => ['nonton', 'bioskop', 'netflix', 'spotify', 'game', 'nongkrong', 'liburan'],
        'gaji' => ['gaji', 'gajian', 'thr', 'upah', 'payroll'],
        'bonus' => ['bonus', 'komisi', 'insentif', 'hadiah', 'cashback'],
        'usaha' => ['freelance', 'proyek', 'jualan', 'omzet', 'dividen'],
    ];

    /**
     * @param  Collection<int, FinancialAccount>  $accounts
     * @param  Collection<int, Category>  $categories
     * @return ParsedTelegramTransaction|null
     */
    public function parseTransaction(
        string $rawText,
        Collection $accounts,
        Collection $categories,
        ?string $defaultAccountId = null,
    ): ?array {
        $text = trim(preg_replace('/\s+/', ' ', $rawText) ?? '');

        if ($text === '' || str_starts_with($text, '/')) {
            return null;
        }

        [$type, $body] = $this->extractTransactionType($text);
        [$amount, $remainingText] = $this->extractAmount($body);

        if ($amount === null || $amount <= 0) {
            return null;
        }

        if ($type === TransactionType::Transfer) {
            return $this->parseTransferDetails($amount, $remainingText, $accounts, $defaultAccountId);
        }

        [$accountId, $remainingAfterAccount] = $this->extractAccountMatch(
            $remainingText,
            $accounts,
            $defaultAccountId,
        );
        [$categoryId, $cleanNote] = $this->extractCategoryMatch(
            $remainingAfterAccount,
            $type,
            $categories,
        );

        return [
            'type' => $type,
            'amount' => $amount,
            'note' => $cleanNote !== '' ? Str::limit($cleanNote, 500, '') : null,
            'account_id' => $accountId,
            'destination_account_id' => null,
            'category_id' => $categoryId,
        ];
    }

    /**
     * @return ParsedTelegramReminder|null
     */
    public function parseReminder(string $rawText, CarbonInterface $today): ?array
    {
        $body = trim((string) preg_replace('/^\/ingat(?:@\S+)?\s*/i', '', trim($rawText)));

        if ($body === '') {
            return null;
        }

        $dueOn = null;
        $baseDate = Carbon::parse($today)->startOfDay();

        if (preg_match('/^hari\s+ini\b\s*(.*)$/iu', $body, $matches) === 1) {
            $dueOn = $baseDate->toDateString();
            $body = trim($matches[1]);
        } elseif (preg_match('/^besok\b\s*(.*)$/iu', $body, $matches) === 1) {
            $dueOn = $baseDate->copy()->addDay()->toDateString();
            $body = trim($matches[1]);
        } elseif (preg_match('/^lusa\b\s*(.*)$/iu', $body, $matches) === 1) {
            $dueOn = $baseDate->copy()->addDays(2)->toDateString();
            $body = trim($matches[1]);
        } elseif (preg_match('/^(\d{4}-\d{2}-\d{2})\b\s*(.*)$/u', $body, $matches) === 1) {
            try {
                $dueOn = Carbon::createFromFormat('Y-m-d', $matches[1])?->toDateString();
                $body = trim($matches[2]);
            } catch (\Throwable) {
                $dueOn = null;
            }
        }

        if ($body === '') {
            return null;
        }

        return [
            'title' => Str::limit($body, 160, ''),
            'due_on' => $dueOn,
        ];
    }

    public function parseAmountToken(string $token): ?int
    {
        $cleaned = Str::lower(trim($token));
        $cleaned = (string) preg_replace('/^rp\.?\s*/i', '', $cleaned);

        if ($cleaned === '') {
            return null;
        }

        if (preg_match('/^(\d+(?:[.,]\d+)?)\s*(rb|ribu|k|jt|juta|m)$/i', $cleaned, $matches) === 1) {
            $number = (float) str_replace(',', '.', $matches[1]);
            $unit = Str::lower($matches[2]);

            $multiplier = match ($unit) {
                'rb', 'ribu', 'k' => 1_000,
                'jt', 'juta', 'm' => 1_000_000,
                default => 1,
            };

            $value = (int) round($number * $multiplier);

            return $value > 0 ? $value : null;
        }

        if (preg_match('/^\d{1,3}(?:[.,]\d{3})+$/', $cleaned) === 1) {
            $digitsOnly = (string) preg_replace('/\D/', '', $cleaned);
            $value = (int) $digitsOnly;

            return $value > 0 ? $value : null;
        }

        if (preg_match('/^\d+$/', $cleaned) === 1) {
            $value = (int) $cleaned;

            return $value > 0 ? $value : null;
        }

        return null;
    }

    /**
     * @return array{0: TransactionType, 1: string}
     */
    private function extractTransactionType(string $text): array
    {
        if (preg_match('/^(?:tf|transfer|pindah)\b\s*(.*)$/iu', $text, $matches) === 1) {
            return [TransactionType::Transfer, trim($matches[1])];
        }

        if (preg_match('/^(?:\+|masuk|pemasukan|terima|gajian)\b\s*(.*)$/iu', $text, $matches) === 1) {
            return [TransactionType::Income, trim($matches[1])];
        }

        if (preg_match('/^\+\s*(.+)$/u', $text, $matches) === 1) {
            return [TransactionType::Income, trim($matches[1])];
        }

        if (preg_match('/^(?:keluar|pengeluaran|beli|bayar)\b\s*(.*)$/iu', $text, $matches) === 1) {
            return [TransactionType::Expense, trim($matches[1])];
        }

        if (preg_match('/^-\s*(.+)$/u', $text, $matches) === 1) {
            return [TransactionType::Expense, trim($matches[1])];
        }

        return [TransactionType::Expense, $text];
    }

    /**
     * @return array{0: int|null, 1: string}
     */
    private function extractAmount(string $body): array
    {
        $normalized = (string) preg_replace('/^rp\.?\s+/i', 'rp', trim($body));
        $tokens = preg_split('/\s+/', $normalized) ?: [];

        foreach ($tokens as $index => $token) {
            $parsed = $this->parseAmountToken($token);

            if ($parsed !== null) {
                unset($tokens[$index]);

                return [$parsed, trim(implode(' ', $tokens))];
            }
        }

        return [null, $body];
    }

    /**
     * @param  Collection<int, FinancialAccount>  $accounts
     * @return ParsedTelegramTransaction
     */
    private function parseTransferDetails(
        int $amount,
        string $remainingText,
        Collection $accounts,
        ?string $defaultAccountId,
    ): array {
        $originId = null;
        $destinationId = null;
        $note = $remainingText;

        if (preg_match_all('/@([\p{L}\p{N}_-]+)/u', $note, $tagMatches) >= 1) {
            foreach ($tagMatches[1] as $index => $tag) {
                $matched = $this->findAccountByHint($accounts, $tag);

                if ($matched !== null) {
                    if ($originId === null) {
                        $originId = $matched->id;
                    } elseif ($destinationId === null && $matched->id !== $originId) {
                        $destinationId = $matched->id;
                    }

                    $note = trim(str_replace($tagMatches[0][$index], '', $note));
                }
            }
        }

        if (($originId === null || $destinationId === null) &&
            preg_match('/^(.+?)\s+(?:ke|->|to)\s+(.+)$/iu', $note, $splitMatches) === 1) {
            $leftAccount = $this->findAccountByHint($accounts, trim($splitMatches[1]));

            if ($leftAccount !== null) {
                $originId ??= $leftAccount->id;
                $rightWords = preg_split('/\s+/', trim($splitMatches[2])) ?: [];
                $matchedRight = null;
                $consumedCount = 0;

                for ($length = min(3, count($rightWords)); $length >= 1; $length--) {
                    $candidate = implode(' ', array_slice($rightWords, 0, $length));
                    $found = $this->findAccountByHint($accounts, $candidate);

                    if ($found !== null && $found->id !== $originId) {
                        $matchedRight = $found;
                        $consumedCount = $length;
                        break;
                    }
                }

                if ($matchedRight !== null) {
                    $destinationId ??= $matchedRight->id;
                    $note = trim(implode(' ', array_slice($rightWords, $consumedCount)));
                }
            }
        }

        if ($originId === null && $destinationId === null) {
            $words = preg_split('/\s+/', trim($note)) ?: [];

            if (count($words) >= 2) {
                $firstAccount = $this->findAccountByHint($accounts, $words[0]);
                $secondAccount = $this->findAccountByHint($accounts, $words[1]);

                if ($firstAccount !== null && $secondAccount !== null && $firstAccount->id !== $secondAccount->id) {
                    $originId = $firstAccount->id;
                    $destinationId = $secondAccount->id;
                    $note = trim(implode(' ', array_slice($words, 2)));
                }
            }
        }

        if ($originId === null && $defaultAccountId !== null && $accounts->contains('id', $defaultAccountId)) {
            $originId = $defaultAccountId;
        }

        $cleanNote = trim((string) preg_replace('/\s+/', ' ', $note));

        return [
            'type' => TransactionType::Transfer,
            'amount' => $amount,
            'note' => $cleanNote !== '' ? Str::limit($cleanNote, 500, '') : null,
            'account_id' => $originId,
            'destination_account_id' => $destinationId,
            'category_id' => null,
        ];
    }

    /**
     * @param  Collection<int, FinancialAccount>  $accounts
     * @return array{0: string|null, 1: string}
     */
    private function extractAccountMatch(
        string $text,
        Collection $accounts,
        ?string $defaultAccountId,
    ): array {
        if (preg_match('/@([\p{L}\p{N}_-]+)/u', $text, $matches) === 1) {
            $matched = $this->findAccountByHint($accounts, $matches[1]);
            $cleaned = trim((string) preg_replace('/\s+/', ' ', str_replace($matches[0], '', $text)));

            if ($matched !== null) {
                return [$matched->id, $cleaned];
            }
        }

        $words = preg_split('/\s+/', trim($text)) ?: [];

        if (count($words) >= 2) {
            $lastWord = (string) end($words);
            $matchedLast = $this->findExactAccountByWord($accounts, $lastWord);

            if ($matchedLast !== null) {
                array_pop($words);

                return [$matchedLast->id, trim(implode(' ', $words))];
            }
        }

        if ($defaultAccountId !== null && $accounts->contains('id', $defaultAccountId)) {
            return [$defaultAccountId, $text];
        }

        if ($accounts->count() === 1) {
            /** @var FinancialAccount $singleAccount */
            $singleAccount = $accounts->first();

            return [$singleAccount->id, $text];
        }

        return [null, $text];
    }

    /**
     * @param  Collection<int, Category>  $categories
     * @return array{0: string|null, 1: string}
     */
    private function extractCategoryMatch(
        string $text,
        TransactionType $type,
        Collection $categories,
    ): array {
        $expectedType = $type === TransactionType::Income
            ? CategoryType::Income
            : CategoryType::Expense;

        $eligibleCategories = $categories
            ->filter(fn (Category $category): bool => $category->type === $expectedType)
            ->values();

        if (preg_match('/#([\p{L}\p{N}_-]+)/u', $text, $matches) === 1) {
            $matched = $this->findCategoryByHint($eligibleCategories, $matches[1]);
            $cleaned = trim((string) preg_replace('/\s+/', ' ', str_replace($matches[0], '', $text)));

            if ($matched !== null) {
                return [$matched->id, $cleaned];
            }

            return [$this->fallbackSingleCategory($eligibleCategories), $cleaned];
        }

        $lowerText = Str::lower($text);

        foreach ($eligibleCategories as $category) {
            if (Str::contains($lowerText, Str::lower($category->name))) {
                return [$category->id, $text];
            }
        }

        foreach (self::CATEGORY_KEYWORDS as $categoryFragment => $keywords) {
            foreach ($keywords as $keyword) {
                if (preg_match('/\b'.preg_quote($keyword, '/').'\b/iu', $lowerText) === 1) {
                    $matched = $this->findCategoryByHint($eligibleCategories, $categoryFragment);

                    if ($matched !== null) {
                        return [$matched->id, $text];
                    }
                }
            }
        }

        return [$this->fallbackSingleCategory($eligibleCategories), $text];
    }

    /**
     * @param  Collection<int, FinancialAccount>  $accounts
     */
    private function findAccountByHint(Collection $accounts, string $hint): ?FinancialAccount
    {
        $normalized = Str::lower(trim(str_replace(['_', '-'], ' ', $hint)));

        if ($normalized === '') {
            return null;
        }

        /** @var FinancialAccount|null $exact */
        $exact = $accounts->first(
            fn (FinancialAccount $account): bool => Str::lower($account->name) === $normalized,
        );

        if ($exact !== null) {
            return $exact;
        }

        /** @var FinancialAccount|null $partial */
        $partial = $accounts->first(
            fn (FinancialAccount $account): bool => Str::contains(Str::lower($account->name), $normalized),
        );

        return $partial;
    }

    /**
     * @param  Collection<int, FinancialAccount>  $accounts
     */
    private function findExactAccountByWord(Collection $accounts, string $word): ?FinancialAccount
    {
        $normalized = Str::lower(trim($word));

        if (mb_strlen($normalized) < 2) {
            return null;
        }

        /** @var FinancialAccount|null $matched */
        $matched = $accounts->first(
            fn (FinancialAccount $account): bool => Str::lower($account->name) === $normalized,
        );

        return $matched;
    }

    /**
     * @param  Collection<int, Category>  $categories
     */
    private function findCategoryByHint(Collection $categories, string $hint): ?Category
    {
        $normalized = Str::lower(trim(str_replace(['_', '-'], ' ', $hint)));

        if ($normalized === '') {
            return null;
        }

        /** @var Category|null $exact */
        $exact = $categories->first(
            fn (Category $category): bool => Str::lower($category->name) === $normalized,
        );

        if ($exact !== null) {
            return $exact;
        }

        /** @var Category|null $partial */
        $partial = $categories->first(
            fn (Category $category): bool => Str::contains(Str::lower($category->name), $normalized),
        );

        return $partial;
    }

    /**
     * @param  Collection<int, Category>  $categories
     */
    private function fallbackSingleCategory(Collection $categories): ?string
    {
        if ($categories->count() === 1) {
            /** @var Category $single */
            $single = $categories->first();

            return $single->id;
        }

        return null;
    }
}
