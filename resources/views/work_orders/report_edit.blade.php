<!DOCTYPE html>
<html lang="ro">

<head>
    <meta charset="UTF-8">

    <title>
        {{ $defaultTitle }}
    </title>

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            background: #f1f5f9;
            color: #0f172a;
            font-family: DejaVu Sans, sans-serif;
        }

        .page {
            max-width: 1100px;
            margin: 35px auto;
            padding: 0 20px 50px;
        }

        .card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 18px;
            box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
            overflow: hidden;
        }

        .topbar {
            height: 6px;
            background: #2563eb;
        }

        .header {
            padding: 28px 32px;
            border-bottom: 1px solid #e2e8f0;
        }

        .header-table {
            width: 100%;
            display: table;
            table-layout: fixed;
        }

        .company {
            display: table-cell;
            width: 55%;
            vertical-align: top;
        }

        .license {
            display: table-cell;
            width: 45%;
            vertical-align: top;
            text-align: right;
        }

        .company-name {
            font-size: 25px;
            font-weight: 800;
            color: #0f172a;
        }

        .company-line {
            width: 42px;
            height: 4px;
            margin-top: 7px;
            background: #2563eb;
            border-radius: 3px;
        }

        .company-info {
            margin-top: 8px;
            color: #64748b;
            font-size: 11px;
            line-height: 1.7;
        }

        .license-box {
            display: inline-block;
            min-width: 260px;
            padding: 12px 15px;
            border-right: 4px solid #2563eb;
            background: #f8fafc;
            text-align: right;
        }

        .license-label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #64748b;
            font-weight: 800;
        }

        .license-name {
            margin-top: 4px;
            font-size: 15px;
            font-weight: 800;
        }

        .license-code {
            margin-top: 3px;
            color: #475569;
            font-size: 10px;
        }

        .license-description {
            margin-top: 6px;
            color: #64748b;
            font-size: 9px;
            line-height: 1.5;
        }

        .title-area {
            margin-top: 28px;
            padding: 20px 0 4px;
            border-top: 1px solid #e2e8f0;
        }

        .kicker {
            color: #2563eb;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 800;
        }

        h1 {
            margin: 7px 0 0;
            font-size: 28px;
            line-height: 1.2;
        }

        .subtitle {
            margin-top: 7px;
            color: #64748b;
            font-size: 12px;
        }

        .body {
            padding: 30px 32px;
        }

        .section {
            margin-bottom: 28px;
        }

        .section-title {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 13px;
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .6px;
            color: #334155;
        }

        .section-title::before {
            content: "";
            width: 5px;
            height: 18px;
            background: #2563eb;
            border-radius: 4px;
        }

        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }

        .grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
        }

        .field {
            margin-bottom: 0;
        }

        .field.full {
            grid-column: 1 / -1;
        }

        label {
            display: block;
            margin-bottom: 6px;
            color: #475569;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .4px;
        }

        input,
        textarea,
        select {
            width: 100%;
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            background: #ffffff;
            padding: 11px 12px;
            color: #0f172a;
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            outline: none;
        }

        textarea {
            min-height: 110px;
            resize: vertical;
            line-height: 1.55;
        }

        input:focus,
        textarea:focus,
        select:focus {
            border-color: #2563eb;
        }

        .info-box {
            padding: 14px 16px;
            border: 1px solid #dbeafe;
            background: #eff6ff;
            border-radius: 12px;
            color: #1e40af;
            font-size: 10px;
            line-height: 1.6;
        }

        .reception-box {
            border: 1px solid #cbd5e1;
            border-radius: 14px;
            padding: 18px;
            background: #f8fafc;
        }

        .result-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 5px;
        }

        .result-option {
            display: block;
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            background: white;
            padding: 12px;
            cursor: pointer;
        }

        .result-option input {
            width: auto;
            margin-right: 7px;
        }

        .result-option span {
            font-size: 10px;
            font-weight: 700;
        }

        .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }

        .signature-card {
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            padding: 15px;
            background: #ffffff;
        }

        .actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            padding: 22px 32px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
        }

        .button {
            display: inline-block;
            border: 0;
            border-radius: 10px;
            padding: 12px 20px;
            font-size: 11px;
            font-weight: 800;
            cursor: pointer;
            text-decoration: none;
        }

        .button-secondary {
            color: #334155;
            background: #e2e8f0;
        }

        .button-primary {
            color: white;
            background: #2563eb;
        }

        .reception-only {
            display: none;
        }

        @media print {
            body {
                background: white;
            }

            .page {
                margin: 0;
                max-width: none;
                padding: 0;
            }

            .actions {
                display: none;
            }

            .card {
                border: 0;
                box-shadow: none;
            }
        }

        @media (max-width: 800px) {
            .grid,
            .grid-3,
            .signatures,
            .result-grid {
                grid-template-columns: 1fr;
            }

            .header-table,
            .company,
            .license {
                display: block;
                width: 100%;
            }

            .license {
                margin-top: 18px;
            }

            .license-box {
                width: 100%;
            }
        }
    </style>
</head>

<body>

@php
    $isReception = $reportType === 'receptie';

    $client = $workOrder->client;
    $employee = $workOrder->employee;
    $license = $workOrder->license;

    $documentDate = now()->format('Y-m-d');

    $clientName =
        $client->name
        ?? '';

    $clientCui =
        $client->cui
        ?? $client->CUI
        ?? '';

    $clientAddress =
        $client->address
        ?? $workOrder->address
        ?? '';

    $clientPhone =
        $client->phone
        ?? $workOrder->phone
        ?? '';

    $technicianName =
        $employee->name
        ?? '';

    $technicianPosition =
        $employee->position
        ?? '';

    $workAddress =
        $workOrder->address
        ?? $clientAddress
        ?? '';

    $quoteNumber =
        $latestQuote->number
        ?? '';

    $quoteTitle =
        $latestQuote->title
        ?? '';

    $licenseName =
        $license->name
        ?? '';

    $licenseCode =
        $license->code
        ?? '';

    $licenseDescription =
        $license->description
        ?? '';

    $defaultDescription =
        $workOrder->description
        ?? '';

    $defaultWorkPerformed =
        $workOrder->description
        ?? '';

    $defaultConclusion =
        $isReception
            ? 'Comisia constata ca lucrarile au fost executate si decide asupra receptiei acestora conform celor consemnate in prezentul proces-verbal.'
            : '';

    $defaultReceptionResult =
        'admis';
@endphp

<div class="page">

    <form
        method="POST"
        action="{{ route('work_orders.report', $workOrder) }}"
        target="_blank"
    >

        @csrf

        <input
            type="hidden"
            name="report_type"
            value="{{ $reportType }}"
        >

        <div class="card">

            <div class="topbar"></div>

            <div class="header">

                <div class="header-table">

                    <div class="company">

                        <div class="company-name">
                            ELECTRODEP SRL
                        </div>

                        <div class="company-line"></div>

                        <div class="company-info">
                            Str. Alexe Turcas, nr. 21<br>
                            Vintu de Jos, jud. Alba<br>
                            CUI RO23457886 &nbsp;•&nbsp; J2008000314013<br>
                            0744 288 590 &nbsp;•&nbsp; electrodep@yahoo.com
                        </div>

                    </div>

                    <div class="license">

                        <div class="license-box">

                            <div class="license-label">
                                Licenta / autorizatie
                            </div>

                            @if($license)

                                <div class="license-name">
                                    {{ $licenseName }}
                                </div>

                                @if($licenseCode)
                                    <div class="license-code">
                                        Cod: {{ $licenseCode }}
                                    </div>
                                @endif

                                @if($licenseDescription)
                                    <div class="license-description">
                                        {{ $licenseDescription }}
                                    </div>
                                @endif

                            @else

                                <div class="license-name">
                                    -
                                </div>

                            @endif

                        </div>

                    </div>

                </div>

                <div class="title-area">

                    <div class="kicker">
                        Document de executie / receptie
                    </div>

                    <h1>
                        {{ $defaultTitle }}
                    </h1>

                    @if($quoteTitle)
                        <div class="subtitle">
                            {{ $quoteTitle }}
                        </div>
                    @elseif($workOrder->type)
                        <div class="subtitle">
                            {{ $workOrder->type }}
                        </div>
                    @endif

                </div>

            </div>

            <div class="body">

                <div class="section">

                    <div class="section-title">
                        Date document si lucrare
                    </div>

                    <div class="grid-3">

                        <div class="field">
                            <label>Data documentului</label>

                            <input
                                type="date"
                                name="document_date"
                                value="{{ $documentDate }}"
                                required
                            >
                        </div>

                        <div class="field">
                            <label>Numar lucrare</label>

                            <input
                                type="text"
                                name="work_order_number"
                                value="{{ $workOrder->number }}"
                            >
                        </div>

                        <div class="field">
                            <label>Oferta / deviz asociat</label>

                            <input
                                type="text"
                                name="quote_number"
                                value="{{ $quoteNumber }}"
                            >
                        </div>

                        <div class="field full">
                            <label>Titlu oferta / deviz</label>

                            <input
                                type="text"
                                name="quote_title"
                                value="{{ $quoteTitle }}"
                            >
                        </div>

                        <div class="field full">
                            <label>Titlu proces-verbal</label>

                            <input
                                type="text"
                                name="report_title"
                                value="{{ $defaultTitle }}"
                                required
                            >
                        </div>

                    </div>

                </div>


                <div class="section">

                    <div class="section-title">
                        Beneficiar / institutie
                    </div>

                    <div class="grid">

                        <div class="field">
                            <label>Denumire beneficiar / institutie</label>

                            <input
                                type="text"
                                name="client_name"
                                value="{{ $clientName }}"
                                required
                            >
                        </div>

                        <div class="field">
                            <label>CUI</label>

                            <input
                                type="text"
                                name="client_cui"
                                value="{{ $clientCui }}"
                            >
                        </div>

                        <div class="field full">
                            <label>Adresa beneficiar</label>

                            <input
                                type="text"
                                name="client_address"
                                value="{{ $clientAddress }}"
                            >
                        </div>

                        <div class="field">
                            <label>Telefon</label>

                            <input
                                type="text"
                                name="client_phone"
                                value="{{ $clientPhone }}"
                            >
                        </div>

                        <div class="field">
                            <label>Persoana de contact</label>

                            <input
                                type="text"
                                name="contact_person"
                                value="{{ $workOrder->contact_person ?? '' }}"
                            >
                        </div>

                    </div>

                </div>


                <div class="section">

                    <div class="section-title">
                        Date lucrare
                    </div>

                    <div class="grid">

                        <div class="field">
                            <label>Tip lucrare</label>

                            <input
                                type="text"
                                name="work_type"
                                value="{{ $workOrder->type ?? '' }}"
                            >
                        </div>

                        <div class="field">
                            <label>Adresa lucrarii</label>

                            <input
                                type="text"
                                name="work_address"
                                value="{{ $workAddress }}"
                            >
                        </div>

                        <div class="field">
                            <label>Data programata</label>

                            <input
                                type="date"
                                name="scheduled_date"
                                value="{{ $workOrder->scheduled_date ? \Carbon\Carbon::parse($workOrder->scheduled_date)->format('Y-m-d') : '' }}"
                            >
                        </div>

                        <div class="field">
                            <label>Ora</label>

                            <input
                                type="text"
                                name="scheduled_time"
                                value="{{ $workOrder->scheduled_time ?? '' }}"
                            >
                        </div>

                    </div>

                </div>


                <div class="section">

                    <div class="section-title">
                        Responsabil executie
                    </div>

                    <div class="grid">

                        <div class="field">
                            <label>Tehnician / responsabil</label>

                            <input
                                type="text"
                                name="technician_name"
                                value="{{ $technicianName }}"
                            >
                        </div>

                        <div class="field">
                            <label>Functie</label>

                            <input
                                type="text"
                                name="technician_position"
                                value="{{ $technicianPosition }}"
                            >
                        </div>

                    </div>

                </div>


                @if($isReception)

                    <div class="section">

                        <div class="section-title">
                            Comisia de receptie
                        </div>

                        <div class="info-box">
                            Comisia de receptie consemneaza prin prezentul document
                            verificarea lucrarilor executate, constatarile efectuate
                            si hotararea privind receptia lucrarii.
                        </div>

                        <div style="height: 15px;"></div>

                        <div class="reception-box">

                            <div class="grid">

                                <div class="field">
                                    <label>Presedinte comisie</label>

                                    <input
                                        type="text"
                                        name="commission_president"
                                        value=""
                                    >
                                </div>

                                <div class="field">
                                    <label>Reprezentant beneficiar</label>

                                    <input
                                        type="text"
                                        name="beneficiary_representative"
                                        value=""
                                    >
                                </div>

                                <div class="field">
                                    <label>Reprezentant executant</label>

                                    <input
                                        type="text"
                                        name="contractor_representative"
                                        value="{{ $technicianName }}"
                                    >
                                </div>

                                <div class="field">
                                    <label>Termen remediere, daca este cazul</label>

                                    <input
                                        type="date"
                                        name="remediation_deadline"
                                        value=""
                                    >
                                </div>

                                <div class="field full">
                                    <label>Membrii comisiei</label>

                                    <textarea
                                        name="commission_members"
                                        style="min-height: 90px;"
                                    ></textarea>
                                </div>

                            </div>

                            <div style="height: 18px;"></div>

                            <label>Rezultatul receptiei</label>

                            <div class="result-grid">

                                <label class="result-option">
                                    <input
                                        type="radio"
                                        name="reception_result"
                                        value="admis"
                                        checked
                                    >
                                    <span>
                                        Receptia se admite
                                    </span>
                                </label>

                                <label class="result-option">
                                    <input
                                        type="radio"
                                        name="reception_result"
                                        value="admis_cu_obiectii"
                                    >
                                    <span>
                                        Se admite cu obiectii
                                    </span>
                                </label>

                                <label class="result-option">
                                    <input
                                        type="radio"
                                        name="reception_result"
                                        value="respins"
                                    >
                                    <span>
                                        Receptia se respinge
                                    </span>
                                </label>

                            </div>

                        </div>

                    </div>

                @endif


                <div class="section">

                    <div class="section-title">
                        Obiectul si descrierea lucrarii
                    </div>

                    <div class="grid">

                        <div class="field full">

                            <label>
                                Obiectul / descrierea lucrarii
                            </label>

                            <textarea
                                name="description"
                            >{{ $defaultDescription }}</textarea>

                        </div>

                        <div class="field full">

                            <label>
                                Lucrari executate / interventie
                            </label>

                            <textarea
                                name="work_performed"
                            >{{ $defaultWorkPerformed }}</textarea>

                        </div>

                    </div>

                </div>


                @if($isReception)

                    <div class="section">

                        <div class="section-title">
                            Constatarile comisiei
                        </div>

                        <div class="grid">

                            <div class="field full">

                                <label>
                                    Neconformitati / obiectii
                                </label>

                                <textarea
                                    name="deficiencies"
                                ></textarea>

                            </div>

                            <div class="field full">

                                <label>
                                    Observatiile comisiei
                                </label>

                                <textarea
                                    name="commission_observations"
                                ></textarea>

                            </div>

                        </div>

                    </div>

                @endif


                <div class="section">

                    <div class="section-title">
                        Concluzii si observatii
                    </div>

                    <div class="grid">

                        <div class="field full">

                            <label>
                                Concluzii
                            </label>

                            <textarea
                                name="conclusion"
                            >{{ $defaultConclusion }}</textarea>

                        </div>

                        <div class="field full">

                            <label>
                                Observatii
                            </label>

                            <textarea
                                name="observations"
                            >{{ $workOrder->notes ?? '' }}</textarea>

                        </div>

                    </div>

                </div>


                <div class="section">

                    <div class="section-title">
                        Semnaturi
                    </div>

                    <div class="signatures">

                        <div class="signature-card">

                            <label>
                                Reprezentant executant
                            </label>

                            <input
                                type="text"
                                name="provider_signature_name"
                                value="{{ $technicianName }}"
                            >

                        </div>

                        <div class="signature-card">

                            <label>
                                Reprezentant beneficiar
                            </label>

                            <input
                                type="text"
                                name="client_signature_name"
                                value="{{ $workOrder->contact_person ?? '' }}"
                            >

                        </div>

                    </div>

                </div>


                <div class="info-box">

                    Fotografii atasate lucrarii vor fi incluse automat in
                    procesul-verbal, daca exista.

                </div>

            </div>

            <div class="actions">

                <a
                    href="{{ route('work_orders.show', $workOrder) }}"
                    class="button button-secondary"
                >
                    Inapoi la lucrare
                </a>

                <button
                    type="submit"
                    class="button button-primary"
                >
                    Genereaza PDF
                </button>

            </div>

        </div>

    </form>

</div>

</body>

</html>