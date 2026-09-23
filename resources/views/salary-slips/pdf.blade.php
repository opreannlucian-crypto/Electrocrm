<!doctype html>
<html lang="ro">
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 13mm 12mm 15mm; }
        * { box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; color: #172033; font-size: 8.6px; line-height: 1.42; }
        h1, h2, h3, p { margin: 0; }
        .header { width: 100%; border-bottom: 3px solid #1d4ed8; padding: 0 0 10px; margin-bottom: 12px; }
        .header-table, .information, .summary, .details { width: 100%; border-collapse: collapse; }
        .header-table td { vertical-align: top; }
        .brand { color: #1d4ed8; font-size: 9px; font-weight: bold; letter-spacing: 1.15px; text-transform: uppercase; }
        h1 { margin-top: 3px; color: #0f172a; font-size: 19px; line-height: 1.15; }
        .subtitle { color: #64748b; margin-top: 4px; font-size: 8.2px; }
        .document-meta { width: 205px; border-collapse: collapse; border: 1px solid #bfdbfe; }
        .document-meta td { padding: 4px 6px; border-bottom: 1px solid #dbeafe; }
        .document-meta tr:last-child td { border-bottom: 0; }
        .document-meta .label { width: 70px; color: #475569; font-size: 7px; text-transform: uppercase; font-weight: bold; }
        .section-title { margin: 13px 0 6px; color: #1e3a8a; font-size: 8.2px; letter-spacing: .5px; text-transform: uppercase; }
        .information td { width: 50%; padding: 0 5px 0 0; vertical-align: top; }
        .information td + td { padding: 0 0 0 5px; }
        .card { min-height: 88px; border: 1px solid #cbd5e1; padding: 9px 10px; background: #ffffff; }
        .card-title { margin-bottom: 6px; color: #1e3a8a; font-size: 7.5px; font-weight: bold; letter-spacing: .5px; text-transform: uppercase; }
        .company-name, .employee-name { font-size: 11px; color: #0f172a; font-weight: bold; }
        .line-label { color: #64748b; }
        .period-strip { width: 100%; border-collapse: collapse; margin: 10px 0 0; background: #eff6ff; }
        .period-strip td { padding: 7px 9px; border-right: 1px solid #bfdbfe; }
        .period-strip td:last-child { border-right: 0; }
        .strip-label { color: #475569; font-size: 6.8px; font-weight: bold; letter-spacing: .35px; text-transform: uppercase; }
        .strip-value { color: #0f172a; font-size: 8.7px; font-weight: bold; }
        .details th { padding: 6px 5px; color: #1e3a8a; background: #dbeafe; border: 1px solid #bfdbfe; font-size: 7px; letter-spacing: .2px; text-align: left; text-transform: uppercase; }
        .details td { padding: 6px 5px; border: 1px solid #e2e8f0; vertical-align: top; }
        .details tr:nth-child(even) td { background: #f8fafc; }
        .amount { text-align: right !important; white-space: nowrap; }
        .center { text-align: center !important; }
        .positive { color: #047857; font-weight: bold; }
        .negative { color: #b91c1c; font-weight: bold; }
        .tax-table { width: 100%; border-collapse: collapse; }
        .tax-table td { padding: 5px 7px; border-bottom: 1px solid #e2e8f0; }
        .tax-table .last td { border-bottom: 0; }
        .summary { width: 46%; margin: 12px 0 0 auto; }
        .summary td { padding: 5px 8px; border-bottom: 1px solid #cbd5e1; }
        .summary .total td { background: #e2e8f0; font-weight: bold; }
        .summary .net td { padding: 10px 9px; color: #ffffff; background: #047857; border: 0; font-size: 10px; font-weight: bold; }
        .summary .net .amount { font-size: 14px; }
        .note { margin-top: 12px; padding: 8px 9px; color: #78350f; background: #fffbeb; border: 1px solid #fde68a; }
        .foot { margin-top: 14px; padding-top: 7px; color: #64748b; border-top: 1px solid #cbd5e1; font-size: 6.8px; }
        .page-number:after { content: counter(page); }
    </style>
</head>
<body>
    @php
        $money = fn ($value) => number_format((float) $value, 2, ',', '.') . ' RON';
        $number = fn ($value) => number_format((float) $value, 2, ',', '.');
        $labels = ['income' => 'Venit / adaos', 'benefit' => 'Beneficiu', 'medical_leave' => 'Concediu medical', 'deduction' => 'Reținere'];
        $companyAddress = collect([$company?->address, $company?->city, $company?->county, $company?->postal_code])->filter()->implode(', ');
        $companyContact = collect([$company?->email, $company?->phone])->filter()->implode(' · ');
        $companyBank = collect([$company?->bank, $company?->iban])->filter()->implode(' · ');
        $status = $salarySlip->status === 'finalized' ? 'FINALIZAT' : 'CIORNĂ — NECESITĂ VERIFICARE';
    @endphp

    <div class="header">
        <table class="header-table"><tr>
            <td>
                <div class="brand">{{ $company?->name ?: 'ElectroCRM' }}</div>
                <h1>FLUTURAȘ DE SALARIU</h1>
                <p class="subtitle">Document intern individual · Perioada salarială: <strong>{{ $salarySlip->period_label }}</strong></p>
            </td>
            <td style="width:220px; padding-left:12px">
                <table class="document-meta">
                    <tr><td class="label">Angajat</td><td><strong>{{ $salarySlip->employee?->name ?? '—' }}</strong></td></tr>
                    <tr><td class="label">Perioadă</td><td>{{ $salarySlip->period_start?->format('d.m.Y') }} – {{ $salarySlip->period_end?->format('d.m.Y') }}</td></tr>
                    <tr><td class="label">Status</td><td><strong>{{ $status }}</strong></td></tr>
                </table>
            </td>
        </tr></table>
    </div>

    <div class="section-title">Părțile documentului</div>
    <table class="information"><tr>
        <td><div class="card">
            <div class="card-title">Angajator</div>
            <div class="company-name">{{ $company?->name ?: 'Date firmă neconfigurate' }}</div>
            <div><span class="line-label">CUI:</span> {{ $company?->cui ?: '—' }}@if($company?->registration_number) <span class="line-label"> · Nr. Reg. Com.:</span> {{ $company->registration_number }}@endif</div>
            <div><span class="line-label">Sediu:</span> {{ $companyAddress ?: '—' }}</div>
            @if($companyContact)<div><span class="line-label">Contact:</span> {{ $companyContact }}</div>@endif
            @if($companyBank)<div><span class="line-label">Bancă / IBAN:</span> {{ $companyBank }}</div>@endif
        </div></td>
        <td><div class="card">
            <div class="card-title">Angajat</div>
            <div class="employee-name">{{ $salarySlip->employee?->name ?? '—' }}</div>
            <div><span class="line-label">Funcție:</span> {{ $salarySlip->employee?->position ?: '—' }}</div>
            <div><span class="line-label">Departament:</span> {{ $salarySlip->employee?->department ?: '—' }}</div>
            <div><span class="line-label">CNP:</span> {{ $salarySlip->employee?->cnp ?: '—' }}</div>
            <div><span class="line-label">Funcție de bază:</span> {{ $salarySlip->employee?->is_primary_job ? 'Da' : 'Nu' }} <span class="line-label"> · Persoane în întreținere:</span> {{ $salarySlip->calculation_snapshot['dependent_count'] ?? 0 }}</div>
        </div></td>
    </tr></table>

    <table class="period-strip"><tr>
        <td><div class="strip-label">Ore normă</div><div class="strip-value">{{ $number($salarySlip->scheduled_hours) }} h</div></td>
        <td><div class="strip-label">Ore lucrate</div><div class="strip-value">{{ $number($salarySlip->worked_hours) }} h</div></td>
        <td><div class="strip-label">Ore suplimentare</div><div class="strip-value">{{ $number($salarySlip->overtime_hours) }} h</div></td>
        <td><div class="strip-label">Concediu medical</div><div class="strip-value">{{ $number($salarySlip->medical_leave_days) }} zile</div></td>
        <td><div class="strip-label">Concediu de odihnă</div><div class="strip-value">{{ $number($salarySlip->annual_leave_days) }} zile</div></td>
        <td><div class="strip-label">Facilitate / regim</div><div class="strip-value">{{ $salarySlip->tax_facility_code ?: '—' }}</div></td>
    </tr></table>

    <div class="section-title">Venituri, beneficii și rețineri</div>
    <table class="details"><thead><tr>
        <th class="center" style="width:4%">Nr.</th><th style="width:28%">Componentă</th><th style="width:17%">Tip</th><th class="amount" style="width:11%">Cantitate</th><th class="amount" style="width:14%">Valoare unitară</th><th class="amount" style="width:16%">Total</th><th style="width:10%">Referință</th>
    </tr></thead><tbody>
        <tr><td class="center">1</td><td>Salariu brut de bază</td><td>Venit de bază</td><td class="amount">—</td><td class="amount">—</td><td class="amount positive">+ {{ $money($salarySlip->gross_base) }}</td><td>Contract / perioadă</td></tr>
        @foreach($salarySlip->items as $index => $item)
            <tr>
                <td class="center">{{ $index + 2 }}</td>
                <td>{{ $item->description }}</td>
                <td>{{ $labels[$item->category] ?? $item->category }}</td>
                <td class="amount">{{ $item->quantity !== null ? $number($item->quantity) : '—' }}</td>
                <td class="amount">{{ $item->rate !== null ? $money($item->rate) : '—' }}</td>
                <td class="amount {{ $item->category === 'deduction' ? 'negative' : 'positive' }}">{{ $item->category === 'deduction' ? '−' : '+' }} {{ $money($item->amount) }}</td>
                <td>{{ $item->code ?: ($item->support_source ?: '—') }}</td>
            </tr>
        @endforeach
    </tbody></table>

    <div class="section-title">Contribuții și impozit</div>
    <table class="details"><thead><tr><th>Element</th><th class="amount" style="width:20%">Bază de calcul</th><th class="amount" style="width:15%">Cotă</th><th class="amount" style="width:20%">Valoare</th></tr></thead><tbody>
        <tr><td>CAS</td><td class="amount">{{ $money($salarySlip->cas_base) }}</td><td class="amount">{{ $number($salarySlip->cas_rate) }}%</td><td class="amount negative">− {{ $money($salarySlip->cas_amount) }}</td></tr>
        <tr><td>CASS</td><td class="amount">{{ $money($salarySlip->cass_base) }}</td><td class="amount">{{ $number($salarySlip->cass_rate) }}%</td><td class="amount negative">− {{ $money($salarySlip->cass_amount) }}</td></tr>
        <tr><td>Deducere personală</td><td class="amount">—</td><td class="amount">—</td><td class="amount">{{ $money($salarySlip->personal_deduction) }}</td></tr>
        <tr><td>Impozit pe venit</td><td class="amount">{{ $money($salarySlip->income_tax_base) }}</td><td class="amount">{{ $number($salarySlip->income_tax_rate) }}%</td><td class="amount negative">− {{ $money($salarySlip->income_tax_amount) }}</td></tr>
        <tr><td>Alte rețineri</td><td class="amount">—</td><td class="amount">—</td><td class="amount negative">− {{ $money($salarySlip->other_deductions) }}</td></tr>
    </tbody></table>

    <table class="summary">
        <tr><td>Venit brut</td><td class="amount">{{ $money($salarySlip->gross_income) }}</td></tr>
        <tr><td>CAM angajator ({{ $number($salarySlip->employer_cam_rate) }}%)</td><td class="amount">{{ $money($salarySlip->employer_cam_amount) }}</td></tr>
        <tr class="total"><td>Cost total angajator</td><td class="amount">{{ $money($salarySlip->employer_total_cost) }}</td></tr>
        <tr class="net"><td>CÂȘTIG NET / NET DE PLATĂ</td><td class="amount">{{ $money($salarySlip->net_pay) }}</td></tr>
    </table>

    @if($salarySlip->notes)<div class="note"><strong>Observații de calcul:</strong><br>{{ $salarySlip->notes }}</div>@endif
    <div class="foot">Regula utilizată: {{ $salarySlip->calculation_snapshot['rule_name'] ?? '—' }}. Document intern individual · Pagina <span class="page-number"></span>. Verificarea fiscală, contabilă, statul de plată și Declarația D112 se efectuează în fluxul aprobat de contabilitate.</div>
</body>
</html>
