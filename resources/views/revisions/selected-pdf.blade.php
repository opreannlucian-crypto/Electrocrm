<!doctype html>
<html lang="ro">
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 24px 26px; }
        body { font-family: DejaVu Sans, sans-serif; color: #0f172a; font-size: 10px; }
        h1 { margin: 0; color: #0f3d56; font-size: 21px; }
        .sub { margin: 5px 0 18px; color: #64748b; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #0f3d56; color: white; font-size: 9px; padding: 8px 6px; text-align: left; }
        td { border: 1px solid #dbe3ec; padding: 7px 6px; vertical-align: top; }
        .center { text-align: center; }
        .overdue { color: #b91c1c; font-weight: bold; }
        .soon { color: #a16207; font-weight: bold; }
        .footer { position: fixed; bottom: -8px; left: 0; right: 0; text-align: center; color: #64748b; font-size: 8px; }
    </style>
</head>
<body>
    <h1>Raport revizii</h1>
    <p class="sub">Revizii selectate · Generat la {{ now()->format('d.m.Y H:i') }}</p>
    <table>
        <thead><tr><th>Client</th><th>Tip</th><th>Periodicitate</th><th>Ultima revizie</th><th>Următoarea revizie</th><th>Stare</th></tr></thead>
        <tbody>
            @foreach($revisions as $revision)
                @php
                    $next = $revision->next_revision_date;
                    $status = !$next ? 'La cerere' : ($next->isPast() ? 'Depășită' : ($next->diffInDays(now()) <= 30 ? 'În următoarele 30 zile' : 'Programată'));
                    $statusClass = !$next ? '' : ($next->isPast() ? 'overdue' : ($next->diffInDays(now()) <= 30 ? 'soon' : ''));
                @endphp
                <tr>
                    <td>{{ $revision->client?->name ?: '—' }}</td>
                    <td>{{ $revision->type === \App\Models\ClientRevision::TYPE_FIRE ? 'Incendiu' : 'Efracție' }}</td>
                    <td>{{ match($revision->period) { 'trimestriala' => 'Trimestrială', 'semestriala' => 'Semestrială', 'anuala' => 'Anuală', default => 'La cerere' } }}</td>
                    <td class="center">{{ $revision->last_revision_date?->format('d.m.Y') ?: '—' }}</td>
                    <td class="center">{{ $next?->format('d.m.Y') ?: 'La cerere' }}</td>
                    <td class="{{ $statusClass }}">{{ $status }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    <div class="footer">ElectroCRM · Raport operațional revizii</div>
</body>
</html>
