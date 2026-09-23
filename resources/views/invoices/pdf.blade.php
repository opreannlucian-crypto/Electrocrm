<!doctype html>
<html lang="ro">
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 28px 28px 34px; }
        * { box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; color: #172033; font-size: 9px; line-height: 1.35; }
        h1, h2, p { margin: 0; }
        .document-header { width: 100%; border-bottom: 2px solid #1d4ed8; padding-bottom: 12px; }
        .document-header td { vertical-align: top; }
        .title { font-size: 24px; font-weight: bold; color: #1d4ed8; letter-spacing: .3px; }
        .subtitle { margin-top: 4px; color: #64748b; font-size: 9px; }
        .document-meta { text-align: right; font-size: 9px; line-height: 1.6; }
        .document-meta strong { color: #0f172a; }
        .section-title { margin: 16px 0 6px; color: #1e3a8a; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: .25px; }
        .identity { width: 100%; border-collapse: separate; border-spacing: 7px 0; margin-left: -7px; }
        .identity td { width: 50%; vertical-align: top; }
        .card { min-height: 100px; padding: 9px 10px; border: 1px solid #cbd5e1; background: #f8fafc; }
        .card-label { margin-bottom: 5px; color: #1e3a8a; font-size: 10px; font-weight: bold; text-transform: uppercase; }
        .card-name { margin-bottom: 4px; font-size: 11px; font-weight: bold; }
        .muted { color: #64748b; }
        .invoice-table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 8px; }
        .invoice-table th { padding: 6px 4px; border: 1px solid #94a3b8; background: #e2e8f0; color: #0f172a; text-align: center; vertical-align: middle; font-size: 7px; }
        .invoice-table td { padding: 6px 4px; border: 1px solid #cbd5e1; vertical-align: top; }
        .invoice-table .right { text-align: right; }
        .invoice-table .center { text-align: center; }
        .summary { width: 41%; margin-left: auto; margin-top: 10px; border-collapse: collapse; font-size: 9px; }
        .summary td { padding: 4px 6px; border-bottom: 1px solid #cbd5e1; }
        .summary .total td { border-top: 2px solid #1d4ed8; border-bottom: 0; color: #0f172a; font-size: 12px; font-weight: bold; }
        .notes { margin-top: 16px; padding: 10px; border: 1px solid #94a3b8; min-height: 58px; background: #fffbeb; }
        .notes-title { margin-bottom: 5px; color: #92400e; font-size: 10px; font-weight: bold; text-transform: uppercase; }
        .dispatch { width: 100%; border-collapse: collapse; margin-top: 6px; }
        .dispatch td { width: 33.33%; padding: 7px 8px; border: 1px solid #cbd5e1; vertical-align: top; }
        .dispatch-label { display: block; color: #64748b; font-size: 7px; text-transform: uppercase; }
        .dispatch-value { display: block; margin-top: 2px; font-size: 9px; font-weight: bold; }
        .footer { margin-top: 18px; padding-top: 8px; border-top: 1px solid #cbd5e1; color: #64748b; font-size: 8px; }
    </style>
</head>
<body>
@php
    $seller = $invoice->seller_snapshot ?: [];
    $buyer = $invoice->buyer_snapshot ?: [];
    $documentLabel = $invoice->document_type === 'proforma' ? 'FACTURĂ PROFORMĂ' : 'FACTURĂ';
    preg_match('/(\d+)$/', (string) $invoice->number, $numberMatches);
    $currentNumber = $numberMatches[1] ?? $invoice->number;
@endphp

<table class="document-header">
    <tr>
        <td>
            <h1 class="title">{{ $documentLabel }}</h1>
            <p class="subtitle">Document comercial</p>
        </td>
        <td class="document-meta">
            <strong>Seria:</strong> {{ $invoice->series ?: '-' }}<br>
            <strong>Nr. {{ $invoice->document_type === 'proforma' ? 'proformă' : 'factură' }}:</strong> {{ $invoice->number }}<br>
            <strong>Nr. curent:</strong> {{ $currentNumber }}<br>
            <strong>Data emiterii:</strong> {{ $invoice->issue_date?->format('d.m.Y') ?: '-' }}<br>
            <strong>Data scadenței:</strong> {{ $invoice->due_date?->format('d.m.Y') ?: '-' }}
        </td>
    </tr>
</table>

<p class="section-title">Părțile documentului</p>
<table class="identity">
    <tr>
        <td>
            <div class="card">
                <p class="card-label">Emitent</p>
                <p class="card-name">{{ data_get($seller, 'name', 'Emitent neconfigurat') }}</p>
                <p><strong>CUI:</strong> {{ data_get($seller, 'cui', '-') }}</p>
                <p><strong>Nr. Reg. Com.:</strong> {{ data_get($seller, 'registration_number', '-') }}</p>
                <p><strong>Sediu:</strong> {{ data_get($seller, 'address', '-') }}</p>
                <p><strong>Banca:</strong> {{ data_get($seller, 'bank', '-') }}</p>
                <p><strong>IBAN:</strong> {{ data_get($seller, 'iban', '-') }}</p>
                <p><strong>Contact:</strong> {{ data_get($seller, 'email', '-') }} {{ data_get($seller, 'phone') ? '· '.data_get($seller, 'phone') : '' }}</p>
            </div>
        </td>
        <td>
            <div class="card">
                <p class="card-label">Client</p>
                <p class="card-name">{{ data_get($buyer, 'name', $invoice->client?->name ?? 'Client neconfigurat') }}</p>
                <p><strong>CUI:</strong> {{ data_get($buyer, 'cui', $invoice->client?->cui ?: '-') }}</p>
                <p><strong>Adresă:</strong> {{ trim(collect([data_get($buyer, 'address', $invoice->client?->address), data_get($buyer, 'city', $invoice->client?->city)])->filter()->implode(', ')) ?: '-' }}</p>
                <p><strong>E-mail:</strong> {{ data_get($buyer, 'email', $invoice->client?->email ?: '-') }}</p>
                <p><strong>Telefon:</strong> {{ data_get($buyer, 'phone', $invoice->client?->phone ?: '-') }}</p>
                <p><strong>Statut TVA:</strong> {{ data_get($buyer, 'tva_status') === 'neplatitor_tva' ? 'Neplătitor TVA' : 'Plătitor TVA' }}</p>
            </div>
        </td>
    </tr>
</table>

<p class="section-title">Poziții {{ $invoice->document_type === 'proforma' ? 'factură proformă' : 'factură' }}</p>
<table class="invoice-table">
    <thead>
        <tr>
            <th style="width:4%">Nr.<br>crt.</th>
            <th style="width:27%">Denumire serviciu / produs</th>
            <th style="width:7%">U.M.</th>
            <th style="width:8%">Cantitate</th>
            <th style="width:7%">Cota<br>TVA</th>
            <th style="width:12%">Preț fără<br>TVA</th>
            <th style="width:12%">Valoare fără<br>TVA</th>
            <th style="width:11%">Valoare<br>TVA</th>
            <th style="width:12%">Valoare<br>totală</th>
        </tr>
    </thead>
    <tbody>
        @foreach($invoice->items as $index => $item)
            <tr>
                <td class="center">{{ $index + 1 }}</td>
                <td>{{ $item->name }}</td>
                <td class="center">{{ $item->unit }}</td>
                <td class="right">{{ number_format($item->quantity, 2, ',', '.') }}</td>
                <td class="center">{{ number_format($item->vat_rate, 2, ',', '.') }}%</td>
                <td class="right">{{ number_format($item->unit_price, 2, ',', '.') }}</td>
                <td class="right">{{ number_format($item->net_amount, 2, ',', '.') }}</td>
                <td class="right">{{ number_format($item->vat_amount, 2, ',', '.') }}</td>
                <td class="right"><strong>{{ number_format($item->gross_amount, 2, ',', '.') }}</strong></td>
            </tr>
        @endforeach
    </tbody>
</table>

<table class="summary">
    <tr><td>Subtotal fără TVA</td><td class="right"><strong>{{ number_format($invoice->subtotal, 2, ',', '.') }} RON</strong></td></tr>
    @if((float) $invoice->discount > 0)
        <tr><td>Reducere generală ({{ number_format($invoice->discount, 2, ',', '.') }}%)</td><td class="right">− {{ number_format((float) $invoice->subtotal * (float) $invoice->discount / 100, 2, ',', '.') }} RON</td></tr>
    @endif
    @if((float) $invoice->fixed_discount > 0)
        <tr><td>Reducere fixă fără TVA</td><td class="right">− {{ number_format((float) $invoice->fixed_discount, 2, ',', '.') }} RON</td></tr>
    @endif
    <tr><td>Valoare TVA</td><td class="right"><strong>{{ number_format($invoice->vat_total, 2, ',', '.') }} RON</strong></td></tr>
    <tr class="total"><td>TOTAL DE PLATĂ</td><td class="right">{{ number_format($invoice->total, 2, ',', '.') }} RON</td></tr>
</table>

<div class="notes">
    <p class="notes-title">Observații / Mențiuni</p>
    <p>{{ $invoice->notes ?: '—' }}</p>
</div>

<p class="section-title">Date privind emiterea și expediția</p>
<table class="dispatch">
    <tr>
        <td><span class="dispatch-label">Persoana care a emis factura</span><span class="dispatch-value">{{ $invoice->issuer_name ?: '—' }}</span></td>
        <td><span class="dispatch-label">{{ $invoice->issuer_identifier_type ?: 'CNP / CI' }}</span><span class="dispatch-value">{{ $invoice->issuer_identifier ?: '—' }}</span></td>
        <td><span class="dispatch-label">Delegat</span><span class="dispatch-value">{{ $invoice->delegate_name ?: '—' }}</span></td>
    </tr>
    <tr>
        <td><span class="dispatch-label">Nr. document însoțitor</span><span class="dispatch-value">{{ $invoice->accompanying_document_number ?: '—' }}</span></td>
        <td><span class="dispatch-label">Auto / nr. auto</span><span class="dispatch-value">{{ $invoice->vehicle_number ?: '—' }}</span></td>
        <td><span class="dispatch-label">Nr. lucrare / proiect</span><span class="dispatch-value">{{ $invoice->work_order_number ?: $invoice->workOrder?->number ?: '—' }}</span></td>
    </tr>
    <tr>
        <td><span class="dispatch-label">Data livrării</span><span class="dispatch-value">{{ $invoice->delivery_date?->format('d.m.Y') ?: '—' }}</span></td>
        <td><span class="dispatch-label">Data încasării</span><span class="dispatch-value">{{ $invoice->collection_date?->format('d.m.Y') ?: '—' }}</span></td>
        <td><span class="dispatch-label">Semnătură emitent / delegat</span><span class="dispatch-value">&nbsp;</span></td>
    </tr>
</table>

@if(data_get($seller, 'footer'))
    <p class="footer">{{ data_get($seller, 'footer') }}</p>
@endif
</body>
</html>
