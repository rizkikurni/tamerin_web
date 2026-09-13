<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="utf-8">
        <title>{{ $title }}</title>
        <style>
            @page { margin: 24px; }
            body { color: #172033; font-family: DejaVu Sans, sans-serif; font-size: 10px; }
            h1 { margin: 0 0 4px; font-size: 20px; }
            .meta { color: #64748b; margin-bottom: 18px; }
            .summary { margin-bottom: 18px; width: 100%; }
            .summary td { border: 1px solid #dbe3ef; padding: 8px; width: 25%; }
            .summary-label { color: #64748b; font-size: 9px; }
            .summary-value { font-size: 13px; margin-top: 3px; }
            .details { border-collapse: collapse; width: 100%; }
            .details th { background: #2563eb; color: #ffffff; padding: 8px; text-align: left; }
            .details td { border-bottom: 1px solid #e2e8f0; padding: 7px 8px; vertical-align: top; }
            .empty { color: #64748b; padding: 24px; text-align: center; }
            .footer { color: #94a3b8; font-size: 8px; margin-top: 14px; }
        </style>
    </head>
    <body>
        <h1>{{ $title }}</h1>
        <div class="meta">Periode {{ $period }} · Dibuat {{ $generatedAt }}</div>

        <table class="summary">
            @foreach (array_chunk($summaryRows, 4) as $summaryGroup)
                <tr>
                    @foreach ($summaryGroup as $summary)
                        <td>
                            <div class="summary-label">{{ $summary['label'] }}</div>
                            <div class="summary-value">{{ $summary['value'] }}</div>
                        </td>
                    @endforeach
                    @for ($emptyCell = count($summaryGroup); $emptyCell < 4; $emptyCell++)
                        <td></td>
                    @endfor
                </tr>
            @endforeach
        </table>

        <table class="details">
            <thead>
                <tr>
                    @foreach ($columns as $column)
                        <th>{{ $column['label'] }}</th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                @forelse ($rows as $row)
                    <tr>
                        @foreach ($columns as $column)
                            <td>{{ $row[$column['key']] }}</td>
                        @endforeach
                    </tr>
                @empty
                    <tr>
                        <td class="empty" colspan="{{ max(count($columns), 1) }}">
                            Tidak ada data sesuai filter.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <div class="footer">Dokumen dibuat otomatis oleh Tamerin.</div>
    </body>
</html>
