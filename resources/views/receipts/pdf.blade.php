<!doctype html>
<html lang="ro"><head><meta charset="utf-8"><style>@page{margin:22px}body{font-family:DejaVu Sans,sans-serif;font-size:10px;color:#172033}h1{text-align:center;font-size:17px;margin:0 0 3px}.subtitle{text-align:center;color:#64748b;margin-bottom:18px}.box{border:1px solid #cbd5e1;padding:12px;margin:10px 0}.row{margin:7px 0}.label{color:#64748b}.amount{text-align:center;font-size:22px;font-weight:bold;color:#135B44;margin:18px 0}.notice{margin-top:22px;border-top:1px solid #cbd5e1;padding-top:8px;font-size:8px;color:#64748b;text-align:center}</style></head><body>
<h1>DOVADĂ DE ÎNCASARE</h1><div class="subtitle">ElectroCRM - document intern</div>
<div class="box"><div class="row"><b>{{ $company->name }}</b></div>
@if($company->cui)
<div class="row"><span class="label">CUI:</span> {{ $company->cui }}</div>
@endif
<div class="row"><span class="label">Data încasării:</span> {{ $receipt->received_at->format('d.m.Y') }}</div><div class="row"><span class="label">Document:</span> {{ trim(($receipt->document_series ?? '') . ' ' . ($receipt->document_number ?? '')) ?: 'Încasare #' . $receipt->id }}</div><div class="row"><span class="label">Metodă:</span> {{ $receipt->payment_method }}</div>
@if($receipt->cash_register_number)
<div class="row"><span class="label">Casa de marcat:</span> {{ $receipt->cash_register_number }}</div>
@endif
</div>
<div class="box"><div class="row"><span class="label">Client:</span> {{ $receipt->client?->name ?? '—' }}</div>
@if($receipt->invoice)
<div class="row"><span class="label">Factură asociată:</span> {{ $receipt->invoice->number }}</div>
@endif
@if($receipt->notes)
<div class="row"><span class="label">Observații:</span> {{ $receipt->notes }}</div>
@endif
</div>
<div class="amount">{{ $receipt->is_return ? '-' : '' }}{{ number_format($receipt->amount, 2, ',', '.') }} RON</div>
<div class="notice">Acest PDF este o dovadă de încasare și nu înlocuiește bonul fiscal emis de aparatul de marcat electronic fiscal.</div>
</body></html>
