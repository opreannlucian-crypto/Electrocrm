<!doctype html>
<html lang="ro">
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 22px 24px; }
        body { font-family: DejaVu Sans, sans-serif; color: #0f172a; font-size: 9px; }
        h1 { color: #135b44; font-size: 20px; margin: 0 0 6px; }
        .muted { color: #64748b; margin: 0 0 16px; }
        .summary { width: 100%; border-collapse: collapse; margin: 14px 0 20px; }
        .summary td { width: 16.66%; border: 1px solid #cbd5e1; padding: 9px; vertical-align: top; }
        .summary .label { color: #64748b; display: block; margin-bottom: 5px; font-size: 8px; }
        .summary .value { color: #0f172a; font-size: 12px; font-weight: bold; }
        h2 { font-size: 12px; color: #135b44; margin: 18px 0 7px; }
        table.data { width: 100%; border-collapse: collapse; }
        table.data th { background: #135b44; color: white; padding: 6px; text-align: left; font-size: 8px; }
        table.data td { border: 1px solid #dbe3ec; padding: 5px; vertical-align: top; }
        .number { text-align: right; white-space: nowrap; }
        .center { text-align: center; }
        .overdue { color: #991b1b; font-weight: bold; }
        .footer { position: fixed; bottom: -6px; left: 0; right: 0; color: #64748b; font-size: 8px; text-align: center; }
    </style>
</head>
<body>
    <h1>Raport facturi și încasări</h1>
    <p class="muted">Perioada: {{ \Carbon\Carbon::parse($filters['date_from'])->format('d.m.Y') }} – {{ \Carbon\Carbon::parse($filters['date_to'])->format('d.m.Y') }}. Valorile sunt în RON.</p>

    <table class="summary">
        <tr>
            <td><span class="label">Facturat</span><span class="value">{{ number_format($summary['invoiced_total'], 2, ',', '.') }} RON</span></td>
            <td><span class="label">TVA colectată</span><span class="value">{{ number_format($summary['vat_total'], 2, ',', '.') }} RON</span></td>
            <td><span class="label">Încasat</span><span class="value">{{ number_format($summary['collected_total'], 2, ',', '.') }} RON</span></td>
            <td><span class="label">Sold de încasat</span><span class="value">{{ number_format($summary['outstanding_total'], 2, ',', '.') }} RON</span></td>
            <td><span class="label">Restant</span><span class="value overdue">{{ number_format($summary['overdue_total'], 2, ',', '.') }} RON</span></td>
            <td><span class="label">Facturi restante</span><span class="value overdue">{{ $summary['overdue_count'] }}</span></td>
        </tr>
    </table>

    <h2>Facturi din perioada selectată</h2>
    <table class="data">
        <thead>
            <tr>
                <th>Factura</th>
                <th>Emisă</th>
                <th>Scadență</th>
                <th>Client</th>
                <th>Status</th>
                <th class="number">Total</th>
                <th class="number">Încasat</th>
                <th class="number">Sold</th>
                <th class="center">Restantă</th>
            </tr>
        </thead>
        <tbody>
            @forelse($rows as $row)
                <tr>
                    <td>{{ $row['number'] }}</td>
                    <td>{{ $row['issue_date'] ? \Carbon\Carbon::parse($row['issue_date'])->format('d.m.Y') : '—' }}</td>
                    <td>{{ $row['due_date'] ? \Carbon\Carbon::parse($row['due_date'])->format('d.m.Y') : '—' }}</td>
                    <td>{{ $row['client_name'] }}</td>
                    <td>{{ $row['status_label'] }}</td>
                    <td class="number">{{ number_format($row['total'], 2, ',', '.') }}</td>
                    <td class="number">{{ number_format($row['paid_amount'], 2, ',', '.') }}</td>
                    <td class="number">{{ number_format($row['balance'], 2, ',', '.') }}</td>
                    <td class="center {{ $row['is_overdue'] ? 'overdue' : '' }}">{{ $row['is_overdue'] ? 'DA' : 'Nu' }}</td>
                </tr>
            @empty
                <tr><td colspan="9" class="center">Nu există facturi pentru filtrele selectate.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">ElectroCRM · Raport operațional de facturi · Generat la {{ now()->format('d.m.Y H:i') }}</div>
</body>
</html>
