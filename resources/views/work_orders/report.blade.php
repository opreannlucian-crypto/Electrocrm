<!DOCTYPE html>
<html lang="ro">

<head>

    <meta charset="UTF-8">

    <title>
        {{ $reportData['report_title'] ?? 'Proces-Verbal' }}
        {{ $reportData['work_order_number'] ?? $workOrder->number }}
    </title>

    <style>

        @page {
            margin: 22px 28px 28px 28px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: DejaVu Sans, sans-serif;
            font-size: 9.5px;
            color: #1e293b;
            background: #ffffff;
        }

        .page {
            width: 100%;
        }

        .topbar {
            height: 6px;
            background: #2563eb;
            margin-bottom: 12px;
        }

        .header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 13px;
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
            font-size: 19px;
            font-weight: bold;
            color: #0f172a;
            letter-spacing: .3px;
        }

        .company-accent {
            width: 34px;
            height: 3px;
            margin-top: 5px;
            background: #2563eb;
        }

        .company-info {
            margin-top: 6px;
            color: #64748b;
            font-size: 7px;
            line-height: 1.55;
        }

        .license-box {
            display: inline-block;
            min-width: 175px;
            max-width: 245px;
            padding: 8px 10px;
            border-right: 3px solid #2563eb;
            background: #f8fafc;
            text-align: right;
        }

        .license-label {
            font-size: 6.5px;
            text-transform: uppercase;
            letter-spacing: .8px;
            color: #64748b;
            font-weight: bold;
        }

        .license-name {
            margin-top: 3px;
            font-size: 11px;
            font-weight: bold;
            color: #0f172a;
        }

        .license-code {
            margin-top: 3px;
            font-size: 7px;
            color: #475569;
        }

        .license-description {
            margin-top: 5px;
            font-size: 6.5px;
            line-height: 1.45;
            color: #64748b;
        }

        .document-title {
            margin-top: 16px;
            font-size: 20px;
            line-height: 1.25;
            font-weight: bold;
            color: #0f172a;
            text-transform: uppercase;
        }

        .document-subtitle {
            margin-top: 4px;
            color: #475569;
            font-size: 9px;
        }

        .date-row {
            width: 100%;
            margin-top: 10px;
            padding: 8px 0;
            border-top: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
        }

        .date-left,
        .date-right {
            display: inline-block;
            vertical-align: middle;
        }

        .date-left {
            width: 70%;
        }

        .date-right {
            width: 28%;
            text-align: right;
        }

        .label {
            color: #64748b;
            font-size: 6.5px;
            text-transform: uppercase;
            letter-spacing: .6px;
            font-weight: bold;
        }

        .value {
            margin-top: 2px;
            color: #0f172a;
            font-size: 9px;
            font-weight: bold;
        }

        .section {
            margin-top: 15px;
        }

        .section-title {
            margin-bottom: 7px;
            font-size: 10px;
            color: #0f172a;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: .5px;
        }

        .section-title-line {
            height: 2px;
            width: 25px;
            background: #2563eb;
            margin-top: 3px;
        }

        .box {
            border: 1px solid #cbd5e1;
            background: #f8fafc;
            padding: 9px 10px;
        }

        .client-name {
            font-size: 12px;
            font-weight: bold;
            color: #0f172a;
        }

        .small-info {
            margin-top: 4px;
            color: #475569;
            font-size: 8px;
            line-height: 1.55;
        }

        .grid {
            width: 100%;
            display: table;
            table-layout: fixed;
        }

        .col {
            display: table-cell;
            vertical-align: top;
            padding-right: 8px;
        }

        .col:last-child {
            padding-right: 0;
        }

        .col-50 {
            width: 50%;
        }

        .col-33 {
            width: 33.333%;
        }

        .field {
            margin-bottom: 7px;
        }

        .field-label {
            color: #64748b;
            font-size: 6.5px;
            text-transform: uppercase;
            letter-spacing: .4px;
            font-weight: bold;
        }

        .field-value {
            margin-top: 2px;
            color: #0f172a;
            font-size: 8.5px;
            line-height: 1.45;
        }

        .text-box {
            border: 1px solid #cbd5e1;
            padding: 9px 10px;
            line-height: 1.55;
            white-space: pre-line;
            min-height: 38px;
        }

        .reception-result {
            margin-top: 5px;
            padding: 11px;
            border: 1px solid #94a3b8;
            background: #f8fafc;
            text-align: center;
            font-size: 11px;
            font-weight: bold;
            color: #0f172a;
        }

        .result-admis {
            border-color: #16a34a;
            background: #f0fdf4;
            color: #166534;
        }

        .result-obiectii {
            border-color: #ca8a04;
            background: #fefce8;
            color: #854d0e;
        }

        .result-respins {
            border-color: #dc2626;
            background: #fef2f2;
            color: #991b1b;
        }

        .commission-table {
            width: 100%;
            border-collapse: collapse;
        }

        .commission-table th {
            background: #0f172a;
            color: #ffffff;
            padding: 7px;
            text-align: left;
            font-size: 7px;
        }

        .commission-table td {
            border: 1px solid #cbd5e1;
            padding: 7px;
            vertical-align: top;
            font-size: 8px;
            min-height: 25px;
        }

        .photos {
            width: 100%;
            display: table;
            table-layout: fixed;
        }

        .photo-cell {
            display: table-cell;
            width: 33.333%;
            padding: 4px;
            vertical-align: top;
        }

        .photo-wrap {
            border: 1px solid #cbd5e1;
            padding: 4px;
            background: #ffffff;
        }

        .photo {
            width: 100%;
            height: 125px;
            object-fit: cover;
        }

        .photo-caption {
            padding: 4px 2px 1px;
            font-size: 6px;
            color: #64748b;
            line-height: 1.35;
        }

        .signature-table {
            width: 100%;
            display: table;
            table-layout: fixed;
            margin-top: 18px;
        }

        .signature {
            display: table-cell;
            width: 50%;
            padding-right: 14px;
            vertical-align: top;
        }

        .signature:last-child {
            padding-right: 0;
            padding-left: 14px;
        }

        .signature-box {
            border: 1px solid #cbd5e1;
            min-height: 80px;
            padding: 9px;
        }

        .signature-title {
            font-size: 7px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: bold;
        }

        .signature-name {
            margin-top: 8px;
            font-size: 9px;
            font-weight: bold;
        }

        .signature-line {
            margin-top: 27px;
            border-top: 1px solid #94a3b8;
            padding-top: 4px;
            font-size: 6px;
            color: #64748b;
        }

        .footer {
            margin-top: 20px;
            padding-top: 8px;
            border-top: 1px solid #cbd5e1;
            text-align: center;
            color: #94a3b8;
            font-size: 6.5px;
        }

        .page-break {
            page-break-before: always;
        }

    </style>

</head>

<body>

@php

    $reportType =
        $reportType
        ?? 'interventie';

    $isReception =
        $reportType === 'receptie';

    $license =
        $workOrder->license;

    $client =
        $workOrder->client;

    $employee =
        $workOrder->employee;

    $reportTitle =
        $reportData['report_title']
        ?? 'PROCES-VERBAL';

    $documentDate =
        !empty($reportData['document_date'])
            ? \Carbon\Carbon::parse(
                $reportData['document_date']
            )->format('d.m.Y')
            : now()->format('d.m.Y');

    $workOrderNumber =
        $reportData['work_order_number']
        ?? $workOrder->number
        ?? '-';

    $quoteNumber =
        $reportData['quote_number']
        ?? $latestQuote?->number
        ?? '-';

    $quoteTitle =
        $reportData['quote_title']
        ?? $latestQuote?->title
        ?? '';

    $clientName =
        $reportData['client_name']
        ?? $client?->name
        ?? '-';

    $clientCui =
        $reportData['client_cui']
        ?? $client?->cui
        ?? $client?->CUI
        ?? '';

    $clientAddress =
        $reportData['client_address']
        ?? $client?->address
        ?? $workOrder->address
        ?? '';

    $clientPhone =
        $reportData['client_phone']
        ?? $client?->phone
        ?? $workOrder->phone
        ?? '';

    $contactPerson =
        $reportData['contact_person']
        ?? $workOrder->contact_person
        ?? '';

    $technicianName =
        $reportData['technician_name']
        ?? $employee?->name
        ?? '';

    $technicianPosition =
        $reportData['technician_position']
        ?? $employee?->position
        ?? '';

    $workType =
        $reportData['work_type']
        ?? $workOrder->type
        ?? '';

    $scheduledDate =
        !empty($reportData['scheduled_date'])
            ? \Carbon\Carbon::parse(
                $reportData['scheduled_date']
            )->format('d.m.Y')
            : '';

    $scheduledTime =
        $reportData['scheduled_time']
        ?? $workOrder->scheduled_time
        ?? '';

    $workAddress =
        $reportData['work_address']
        ?? $workOrder->address
        ?? $clientAddress;

    $description =
        $reportData['description']
        ?? $workOrder->description
        ?? '';

    $workPerformed =
        $reportData['work_performed']
        ?? '';

    $conclusion =
        $reportData['conclusion']
        ?? '';

    $observations =
        $reportData['observations']
        ?? '';

    $commissionPresident =
        $reportData['commission_president']
        ?? '';

    $commissionMembers =
        $reportData['commission_members']
        ?? '';

    $beneficiaryRepresentative =
        $reportData['beneficiary_representative']
        ?? '';

    $contractorRepresentative =
        $reportData['contractor_representative']
        ?? $technicianName;

    $receptionResult =
        $reportData['reception_result']
        ?? 'admis';

    $deficiencies =
        $reportData['deficiencies']
        ?? '';

    $remediationDeadline =
        !empty($reportData['remediation_deadline'])
            ? \Carbon\Carbon::parse(
                $reportData['remediation_deadline']
            )->format('d.m.Y')
            : '';

    $commissionObservations =
        $reportData['commission_observations']
        ?? '';

    $providerSignature =
        $reportData['provider_signature_name']
        ?? $technicianName
        ?? '';

    $clientSignature =
        $reportData['client_signature_name']
        ?? $contactPerson
        ?? '';

    /*
    |--------------------------------------------------------------------------
    | Licenta
    |--------------------------------------------------------------------------
    */

    $licenseName =
        $license?->name
        ?? '';

    $licenseCode =
        $license?->code
        ?? '';

    $licenseDescription =
        $license?->description
        ?? '';

    /*
    |--------------------------------------------------------------------------
    | Rezultat receptie
    |--------------------------------------------------------------------------
    */

    $receptionLabel = match(
        $receptionResult
    ) {
        'admis' =>
            'RECEPTIA SE ADMITE',

        'admis_cu_obiectii' =>
            'RECEPTIA SE ADMITE CU OBIECTII',

        'respins' =>
            'RECEPTIA SE RESPINGE',

        default =>
            'RECEPTIA SE ADMITE',
    };

    $receptionClass = match(
        $receptionResult
    ) {
        'admis' =>
            'result-admis',

        'admis_cu_obiectii' =>
            'result-obiectii',

        'respins' =>
            'result-respins',

        default =>
            'result-admis',
    };

    /*
    |--------------------------------------------------------------------------
    | Fotografii
    |--------------------------------------------------------------------------
    */

    $photos =
        $workOrder->photos
            ?? collect();

    /*
    |--------------------------------------------------------------------------
    | Helper pentru fotografii
    |--------------------------------------------------------------------------
    */

    $photoSource = function ($photo) {

        if (
            !$photo ||
            !$photo->file
        ) {
            return null;
        }

        $relative =
            ltrim(
                $photo->file,
                '/'
            );

        $storagePath =
            storage_path(
                'app/public/' .
                $relative
            );

        if (
            file_exists(
                $storagePath
            )
        ) {
            $mime =
                mime_content_type(
                    $storagePath
                );

            $content =
                file_get_contents(
                    $storagePath
                );

            return
                'data:' .
                $mime .
                ';base64,' .
                base64_encode(
                    $content
                );
        }

        $publicPath =
            public_path(
                'storage/' .
                $relative
            );

        if (
            file_exists(
                $publicPath
            )
        ) {
            $mime =
                mime_content_type(
                    $publicPath
                );

            $content =
                file_get_contents(
                    $publicPath
                );

            return
                'data:' .
                $mime .
                ';base64,' .
                base64_encode(
                    $content
                );
        }

        return null;
    };

@endphp


<div class="page">

    <div class="topbar"></div>

    {{-- ============================================================
         ANTET
    ============================================================= --}}

    <div class="header">

        <div class="header-table">

            <div class="company">

                <div class="company-name">
                    ELECTRODEP SRL
                </div>

                <div class="company-accent"></div>

                <div class="company-info">
                    Str. Alexe Turcas, nr. 21,
                    Vintu de Jos, jud. Alba<br>

                    CUI RO23457886
                    &nbsp;•&nbsp;
                    J2008000314013<br>

                    0744 288 590
                    &nbsp;•&nbsp;
                    electrodep@yahoo.com
                </div>

            </div>

            <div class="license">

                @if($license)

                    <div class="license-box">

                        <div class="license-label">
                            Licenta / autorizatie
                        </div>

                        <div class="license-name">
                            {{ $licenseName }}
                        </div>

                        @if($licenseCode)

                            <div class="license-code">
                                Cod:
                                {{ $licenseCode }}
                            </div>

                        @endif

                        @if($licenseDescription)

                            <div class="license-description">
                                {{ $licenseDescription }}
                            </div>

                        @endif

                    </div>

                @endif

            </div>

        </div>


        <div class="document-title">
            {{ $reportTitle }}
        </div>

        @if($quoteTitle)

            <div class="document-subtitle">
                {{ $quoteTitle }}
            </div>

        @elseif($workType)

            <div class="document-subtitle">
                {{ $workType }}
            </div>

        @endif

    </div>


    {{-- ============================================================
         DATA + NUMERE
    ============================================================= --}}

    <div class="date-row">

        <div class="date-left">

            <div class="label">
                Lucrare
            </div>

            <div class="value">
                {{ $workOrderNumber }}
            </div>

        </div>

        <div class="date-right">

            <div class="label">
                Data
            </div>

            <div class="value">
                {{ $documentDate }}
            </div>

        </div>

    </div>


    {{-- ============================================================
         BENEFICIAR
    ============================================================= --}}

    <div class="section">

        <div class="section-title">
            Beneficiar / institutie
            <div class="section-title-line"></div>
        </div>

        <div class="box">

            <div class="client-name">
                {{ $clientName }}
            </div>

            <div class="small-info">

                @if($clientCui)
                    CUI:
                    {{ $clientCui }}
                    &nbsp;&nbsp;
                @endif

                @if($clientPhone)
                    Telefon:
                    {{ $clientPhone }}
                @endif

                @if($clientAddress)
                    <br>
                    Adresa:
                    {{ $clientAddress }}
                @endif

                @if($contactPerson)
                    <br>
                    Persoana de contact:
                    {{ $contactPerson }}
                @endif

            </div>

        </div>

    </div>


    {{-- ============================================================
         DATE LUCRARE
    ============================================================= --}}

    <div class="section">

        <div class="section-title">
            Date lucrare
            <div class="section-title-line"></div>
        </div>

        <div class="box">

            <div class="grid">

                <div class="col col-33">

                    <div class="field">

                        <div class="field-label">
                            Tip lucrare
                        </div>

                        <div class="field-value">
                            {{ $workType ?: '-' }}
                        </div>

                    </div>

                </div>

                <div class="col col-33">

                    <div class="field">

                        <div class="field-label">
                            Oferta / deviz
                        </div>

                        <div class="field-value">
                            {{ $quoteNumber ?: '-' }}
                        </div>

                    </div>

                </div>

                <div class="col col-33">

                    <div class="field">

                        <div class="field-label">
                            Adresa lucrarii
                        </div>

                        <div class="field-value">
                            {{ $workAddress ?: '-' }}
                        </div>

                    </div>

                </div>

            </div>


            <div class="grid">

                <div class="col col-50">

                    <div class="field">

                        <div class="field-label">
                            Data programata
                        </div>

                        <div class="field-value">
                            {{ $scheduledDate ?: '-' }}
                        </div>

                    </div>

                </div>

                <div class="col col-50">

                    <div class="field">

                        <div class="field-label">
                            Ora
                        </div>

                        <div class="field-value">
                            {{ $scheduledTime ?: '-' }}
                        </div>

                    </div>

                </div>

            </div>

        </div>

    </div>


    {{-- ============================================================
         RESPONSABIL
    ============================================================= --}}

    <div class="section">

        <div class="section-title">
            Responsabil executie
            <div class="section-title-line"></div>
        </div>

        <div class="box">

            <div class="grid">

                <div class="col col-50">

                    <div class="field">

                        <div class="field-label">
                            Tehnician / responsabil
                        </div>

                        <div class="field-value">
                            {{ $technicianName ?: '-' }}
                        </div>

                    </div>

                </div>

                <div class="col col-50">

                    <div class="field">

                        <div class="field-label">
                            Functie
                        </div>

                        <div class="field-value">
                            {{ $technicianPosition ?: '-' }}
                        </div>

                    </div>

                </div>

            </div>

        </div>

    </div>


    {{-- ============================================================
         OBIECT
    ============================================================= --}}

    @if($description)

        <div class="section">

            <div class="section-title">
                Obiectul / descrierea lucrarii
                <div class="section-title-line"></div>
            </div>

            <div class="text-box">
                {{ $description }}
            </div>

        </div>

    @endif


    {{-- ============================================================
         LUCRARI EXECUTATE
    ============================================================= --}}

    @if($workPerformed)

        <div class="section">

            <div class="section-title">
                Lucrari executate / interventie
                <div class="section-title-line"></div>
            </div>

            <div class="text-box">
                {{ $workPerformed }}
            </div>

        </div>

    @endif


    {{-- ============================================================
         COMISIE RECEPTIE
    ============================================================= --}}

    @if($isReception)

        <div class="section">

            <div class="section-title">
                Comisia de receptie
                <div class="section-title-line"></div>
            </div>

            <table class="commission-table">

                <thead>

                    <tr>

                        <th style="width: 26%;">
                            Calitate
                        </th>

                        <th>
                            Nume si prenume
                        </th>

                    </tr>

                </thead>

                <tbody>

                    <tr>

                        <td>
                            Presedinte comisie
                        </td>

                        <td>
                            {{ $commissionPresident ?: '........................................................' }}
                        </td>

                    </tr>

                    <tr>

                        <td>
                            Reprezentant beneficiar
                        </td>

                        <td>
                            {{ $beneficiaryRepresentative ?: '........................................................' }}
                        </td>

                    </tr>

                    <tr>

                        <td>
                            Reprezentant executant
                        </td>

                        <td>
                            {{ $contractorRepresentative ?: '........................................................' }}
                        </td>

                    </tr>

                    @if($commissionMembers)

                        <tr>

                            <td>
                                Membrii comisiei
                            </td>

                            <td style="white-space: pre-line;">
                                {{ $commissionMembers }}
                            </td>

                        </tr>

                    @endif

                </tbody>

            </table>

        </div>


        {{-- REZULTAT --}}

        <div class="section">

            <div class="section-title">
                Hotararea comisiei
                <div class="section-title-line"></div>
            </div>

            <div class="reception-result {{ $receptionClass }}">
                {{ $receptionLabel }}
            </div>

        </div>


        {{-- OBIECTII --}}

        @if(
            $deficiencies ||
            $commissionObservations ||
            $remediationDeadline
        )

            <div class="section">

                <div class="section-title">
                    Constatari si obiectii
                    <div class="section-title-line"></div>
                </div>

                <div class="box">

                    @if($deficiencies)

                        <div class="field">

                            <div class="field-label">
                                Neconformitati / obiectii
                            </div>

                            <div
                                class="field-value"
                                style="white-space: pre-line;"
                            >
                                {{ $deficiencies }}
                            </div>

                        </div>

                    @endif

                    @if($commissionObservations)

                        <div class="field">

                            <div class="field-label">
                                Observatiile comisiei
                            </div>

                            <div
                                class="field-value"
                                style="white-space: pre-line;"
                            >
                                {{ $commissionObservations }}
                            </div>

                        </div>

                    @endif

                    @if($remediationDeadline)

                        <div class="field">

                            <div class="field-label">
                                Termen de remediere
                            </div>

                            <div class="field-value">
                                {{ $remediationDeadline }}
                            </div>

                        </div>

                    @endif

                </div>

            </div>

        @endif

    @endif


    {{-- ============================================================
         CONCLUZII
    ============================================================= --}}

    @if($conclusion)

        <div class="section">

            <div class="section-title">
                Concluzii
                <div class="section-title-line"></div>
            </div>

            <div class="text-box">
                {{ $conclusion }}
            </div>

        </div>

    @endif


    {{-- ============================================================
         OBSERVATII
    ============================================================= --}}

    @if($observations)

        <div class="section">

            <div class="section-title">
                Observatii
                <div class="section-title-line"></div>
            </div>

            <div class="text-box">
                {{ $observations }}
            </div>

        </div>

    @endif


    {{-- ============================================================
         FOTOGRAFII
    ============================================================= --}}

    @if($photos->count())

        <div class="page-break"></div>

        <div class="section">

            <div class="section-title">
                Fotografii ale lucrarii
                <div class="section-title-line"></div>
            </div>

            @php
                $validPhotos = [];

                foreach ($photos as $photo) {

                    $source =
                        $photoSource($photo);

                    if ($source) {

                        $validPhotos[] = [
                            'photo' =>
                                $photo,

                            'source' =>
                                $source,
                        ];
                    }
                }
            @endphp

            @if(count($validPhotos))

                @foreach(
                    array_chunk(
                        $validPhotos,
                        3
                    )
                    as $photoRow
                )

                    <div class="photos">

                        @foreach($photoRow as $item)

                            <div class="photo-cell">

                                <div class="photo-wrap">

                                    <img
                                        src="{{ $item['source'] }}"
                                        class="photo"
                                    >

                                    <div class="photo-caption">

                                        @if($item['photo']->type === 'before')
                                            INAINTE DE LUCRARE
                                        @elseif($item['photo']->type === 'after')
                                            DUPA LUCRARE
                                        @else
                                            IN TIMPUL LUCRARII
                                        @endif

                                        @if($item['photo']->original_name)
                                            —
                                            {{ $item['photo']->original_name }}
                                        @endif

                                    </div>

                                </div>

                            </div>

                        @endforeach

                        @if(count($photoRow) < 3)

                            @for(
                                $i = count($photoRow);
                                $i < 3;
                                $i++
                            )

                                <div class="photo-cell"></div>

                            @endfor

                        @endif

                    </div>

                @endforeach

            @endif

        </div>

    @endif


    {{-- ============================================================
         SEMNATURI
    ============================================================= --}}

    <div class="section">

        <div class="section-title">
            Semnaturi
            <div class="section-title-line"></div>
        </div>

        <div class="signature-table">

            <div class="signature">

                <div class="signature-box">

                    <div class="signature-title">
                        Reprezentant executant
                    </div>

                    <div class="signature-name">
                        {{ $providerSignature ?: '........................................................' }}
                    </div>

                    <div class="signature-line">
                        Nume, semnatura si stampila
                    </div>

                </div>

            </div>

            <div class="signature">

                <div class="signature-box">

                    <div class="signature-title">
                        Reprezentant beneficiar
                    </div>

                    <div class="signature-name">
                        {{ $clientSignature ?: '........................................................' }}
                    </div>

                    <div class="signature-line">
                        Nume, semnatura si stampila
                    </div>

                </div>

            </div>

        </div>


        @if($isReception)

            <div class="signature-table">

                <div class="signature">

                    <div class="signature-box">

                        <div class="signature-title">
                            Presedinte comisie
                        </div>

                        <div class="signature-name">
                            {{ $commissionPresident ?: '........................................................' }}
                        </div>

                        <div class="signature-line">
                            Semnatura
                        </div>

                    </div>

                </div>

                <div class="signature">

                    <div class="signature-box">

                        <div class="signature-title">
                            Membrii comisiei
                        </div>

                        <div
                            class="signature-name"
                            style="white-space: pre-line;"
                        >
                            {{ $commissionMembers ?: '........................................................' }}
                        </div>

                        <div class="signature-line">
                            Semnaturi
                        </div>

                    </div>

                </div>

            </div>

        @endif

    </div>


    {{-- ============================================================
         FOOTER
    ============================================================= --}}

    <div class="footer">

        ELECTRODEP SRL
        &nbsp;•&nbsp;
        Proces-verbal
        &nbsp;•&nbsp;
        Lucrare {{ $workOrderNumber }}
        &nbsp;•&nbsp;
        {{ $documentDate }}

    </div>

</div>

</body>

</html>