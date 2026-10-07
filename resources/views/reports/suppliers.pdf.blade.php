<!doctype html>
<html lang="ro">
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 24px; }
        body { font-family: DejaVu Sans, sans-serif; color: #0f172a; font-size: 9px; }
        h1 { color: #1769d1; font-size: 20px; margin: 0 0 5px; }
        .muted { color: #64748b; margin: 0 0 16px; }
        .summary { width: 100%; border-collapse: collapse; margin: 0 0 18px; }
        .summary td { width: 33.33%; border: 1px solid #dbe3ec; padding: 10px; }
        .label { display: block; color: #64748b; font-size: 8px; margin-bottom: 4px; }
        .value { font-size: 13px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1769d1; color: #fff; padding: 7px 6px; text-align: left; }
        td { border: 1px solid #dbe3ec; padding: 6px; }
        .number { text-align: right; white-space: nowrap; }
        .footer { position: fixed; bottom: -8px; left: 0; right: 0; color: #64748b; font-size: 8px; text-align: center; }
    </style>
</head>
<body>
    <h1>Raport sold furnizori</h1>
    <p class="muted">Recepții minus plăți către furnizori. Generat la {{ now()->format('d.m.Y H:i') }}.</p>
    <table class="summary"><tr>
        <td><span class="label">Total recepționat</span><span class="value">{{ number_format($totals['received_total'], 2, ',', '.') }} RON</span></td>
        <td><span class="label">Total plătit</span><span class="value">{{ number_format($totals['paid_total'], 2, ',', '.') }} RON</span></td>
        <td><span class="label">Sold de plată</span><span class="value">{{ number_format($totals['balance'], 2, ',', '.') }} RON</span></td>
    </tr></table>
    <table>
        <thead><tr><th>Furnizor</th><th>CUI</th><th class="number">Recepții</th><th class="number">Total recepționat</th><th class="number">Total plătit</th><th class="number">Sold</th></tr></thead>
        <tbody>@forelse($suppliers as $supplier)<tr><td>{{ $supplier['name'] }}</td><td>{{ $supplier['cui'] ?: '—' }}</td><td class="number">{{ $supplier['receptions_count'] }}</td><td class="number">{{ number_format($supplier['received_total'], 2, ',', '.') }}</td><td class="number">{{ number_format($supplier['paid_total'], 2, ',', '.') }}</td><td class="number">{{ number_format($supplier['balance'], 2, ',', '.') }}</td></tr>@empty<tr><td colspan="6" style="text-align:center">Nu există furnizori pentru filtrul ales.</td></tr>@endforelse</tbody>
    </table>
    <div class="footer">ElectroCRM · Raport sold furnizori</div>
</body>
</html>
