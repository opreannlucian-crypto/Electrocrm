<!DOCTYPE html>
<html lang="ro">

<head>

    <meta charset="UTF-8">

    <title>
        Proces-verbal {{ $freeReport->number }}
    </title>

    <style>

        @page {
            margin: 20px 24px 24px 24px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: DejaVu Sans, sans-serif;
            font-size: 9px;
            color: #1e293b;
            background: #ffffff;
        }

        .page {
            width: 100%;
        }

        .topbar {
            width: 100%;
            height: 6px;
            background: #2563eb;
            margin-bottom: 12px;
        }

        /* ============================================================
           ANTET
        ============================================================ */

        .header {
            width: 100%;
            padding-bottom: 10px;
            border-bottom: 1px solid #d9e1ea;
        }

        .header-table {
            width: 100%;
            display: table;
            table-layout: fixed;
        }

        .header-company {
            display: table-cell;
            width: 43%;
            vertical-align: middle;
        }

        .header-iso {
            display: table-cell;
            width: 22%;
            vertical-align: middle;
            text-align: center;
        }

        .header-license {
            display: table-cell;
            width: 35%;
            vertical-align: middle;
            text-align: right;
        }

        .company-name {
            color: #334155;
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 0.7px;
        }

        .company-accent {
            width: 32px;
            height: 3px;
            background: #2563eb;
            margin-top: 5px;
        }

        .company-data {
            margin-top: 5px;
            color: #64748b;
            font-size: 6.5px;
            line-height: 1.5;
        }

        /* ============================================================
           ISO
        ============================================================ */

        .iso-wrap {
            display: inline-block;
            padding: 5px 8px;
            border: 1px solid #d9e1ea;
            background: #fafcff;
            text-align: center;
        }

        .iso-image {
            display: block;
            max-width: 72px;
            max-height: 54px;
            margin: 0 auto;
        }

        .iso-fallback {
            width: 68px;
            height: 50px;
            border: 2px solid #2563eb;
            color: #2563eb;
            padding-top: 11px;
            font-size: 8px;
            font-weight: bold;
            line-height: 1.1;
            margin: 0 auto;
        }

        .iso-caption {
            margin-top: 3px;
            font-size: 5.3px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.35px;
        }

        /* ============================================================
           LICENTA - DOAR IN ANTET
        ============================================================ */

        .license-wrap {
            display: inline-block;
            min-width: 150px;
            max-width: 220px;
            padding: 8px 10px;
            background: #f8fafc;
            border-left: 3px solid #2563eb;
            text-align: right;
        }

        .license-label {
            font-size: 5.8px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            font-weight: bold;
        }

        .license-name {
            margin-top: 4px;
            font-size: 8px;
            color: #0f172a;
            font-weight: bold;
        }

        .license-code {
            margin-top: 3px;
            font-size: 6.4px;
            color: #64748b;
        }

        .license-description {
            margin-top: 5px;
            color: #475569;
            font-size: 6px;
            line-height: 1.45;
        }

        /* ============================================================
           TITLU
        ============================================================ */

        .title-area {
            width: 100%;
            text-align: center;
            padding: 14px 10px 10px 10px;
        }

        .document-kicker {
            font-size: 6px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: bold;
        }

        .document-title {
            margin-top: 3px;
            font-size: 23px;
            line-height: 1.15;
            color: #0f172a;
            font-weight: bold;
            letter-spacing: 0.6px;
        }

        .document-subtitle {
            margin-top: 5px;
            font-size: 9px;
            color: #64748b;
            font-weight: bold;
        }

        /* ============================================================
           DOCUMENT
        ============================================================ */

        .hero {
            width: 100%;
            display: table;
            table-layout: fixed;
            margin-top: 3px;
        }

        .hero-left {
            display: table-cell;
            width: 67%;
            vertical-align: middle;
            background: #0f172a;
            padding: 12px 14px;
        }

        .hero-right {
            display: table-cell;
            width: 33%;
            vertical-align: middle;
            background: #2563eb;
            padding: 12px 14px;
            text-align: right;
        }

        .hero-label {
            font-size: 5.8px;
            color: #93c5fd;
            text-transform: uppercase;
            letter-spacing: 0.7px;
            font-weight: bold;
        }

        .hero-number {
            margin-top: 3px;
            font-size: 12px;
            color: #ffffff;
            font-weight: bold;
        }

        .hero-small {
            margin-top: 3px;
            color: #cbd5e1;
            font-size: 6.5px;
        }

        .hero-date-label {
            font-size: 5.8px;
            color: #dbeafe;
            text-transform: uppercase;
            letter-spacing: 0.7px;
            font-weight: bold;
        }

        .hero-date {
            margin-top: 3px;
            font-size: 11px;
            color: #ffffff;
            font-weight: bold;
        }

        /* ============================================================
           CLIENT
        ============================================================ */

        .client-row {
            width: 100%;
            margin-top: 12px;
            display: table;
            table-layout: fixed;
        }

        .client-card {
            display: table-cell;
            width: 68%;
            vertical-align: top;
            padding: 11px 13px;
            border: 1px solid #d9e1ea;
        }

        .client-label {
            font-size: 5.8px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            font-weight: bold;
        }

        .client-name {
            margin-top: 4px;
            font-size: 13px;
            color: #0f172a;
            font-weight: bold;
        }

        .client-data {
            margin-top: 4px;
            color: #64748b;
            font-size: 6.8px;
            line-height: 1.55;
        }

        .reference-cell {
            display: table-cell;
            width: 32%;
            padding-left: 8px;
            vertical-align: top;
        }

        .reference-box {
            background: #f8fafc;
            border: 1px solid #d9e1ea;
            padding: 11px;
        }

        .reference-label {
            font-size: 5.7px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: bold;
        }

        .reference-value {
            margin-top: 3px;
            font-size: 7.8px;
            color: #0f172a;
            font-weight: bold;
        }

        .reference-gap {
            height: 7px;
        }

        /* ============================================================
           SECTIUNI
        ============================================================ */

        .section {
            margin-top: 14px;
        }

        .section-heading {
            width: 100%;
            display: table;
            table-layout: fixed;
            margin-bottom: 5px;
        }

        .section-title {
            display: table-cell;
            width: 70%;
            vertical-align: middle;
            color: #0f172a;
            font-size: 7.8px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.55px;
        }

        .section-caption {
            display: table-cell;
            width: 30%;
            vertical-align: middle;
            text-align: right;
            color: #94a3b8;
            font-size: 5.5px;
            text-transform: uppercase;
            letter-spacing: 0.35px;
        }

        .line {
            width: 100%;
            height: 2px;
            background: #0f172a;
            margin-bottom: 6px;
        }

        .line-blue {
            background: #2563eb;
        }

        .line-green {
            background: #059669;
        }

        /* ============================================================
           CONTINUT
        ============================================================ */

        .content-box {
            width: 100%;
            padding: 11px 12px;
            border: 1px solid #d9e1ea;
            background: #ffffff;
            color: #334155;
            font-size: 7.5px;
            line-height: 1.65;
            white-space: pre-line;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        .content-box.dark {
            background: #f8fafc;
        }

        /* ============================================================
           SEMNATURI
        ============================================================ */

        .signatures {
            width: 100%;
            display: table;
            table-layout: fixed;
            margin-top: 18px;
            page-break-inside: avoid;
        }

        .signature-cell {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }

        .signature-cell.left {
            padding-right: 8px;
        }

        .signature-cell.right {
            padding-left: 8px;
        }

        .signature-box {
            min-height: 115px;
            border: 1px solid #d9e1ea;
            padding: 11px 12px;
            background: #ffffff;
        }

        .signature-title {
            color: #0f172a;
            font-size: 7.5px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .signature-line {
            margin-top: 54px;
            border-top: 1px solid #64748b;
        }

        .signature-name {
            margin-top: 7px;
            color: #0f172a;
            font-size: 7.5px;
            font-weight: bold;
            text-align: center;
        }

        .signature-position {
            margin-top: 3px;
            color: #64748b;
            font-size: 6.5px;
            text-align: center;
        }

        /* ============================================================
           FOOTER
        ============================================================ */

        .footer {
            margin-top: 17px;
            padding-top: 7px;
            border-top: 1px solid #d9e1ea;
            width: 100%;
            display: table;
            color: #94a3b8;
            font-size: 5.6px;
        }

        .footer-left {
            display: table-cell;
            width: 50%;
            text-align: left;
        }

        .footer-right {
            display: table-cell;
            width: 50%;
            text-align: right;
        }

    </style>

</head>

<body>

@php

    $documentDate =
        $freeReport->document_date
            ? \Carbon\Carbon::parse(
                $freeReport->document_date
            )->format('d.m.Y')
            : '-';

    $isoPath =
        public_path(
            'images/iso9001.png'
        );

    $referenceType = null;
    $referenceNumber = null;

    if ($freeReport->workOrder) {

        $referenceType =
            'Lucrare';

        $referenceNumber =
            $freeReport->workOrder->number;

    } elseif ($freeReport->quote) {

        $referenceType =
            $freeReport->quote->type === 'deviz'
                ? 'Deviz'
                : 'Oferta';

        $referenceNumber =
            $freeReport->quote->number;

    }

@endphp


<div class="page">

    <div class="topbar"></div>


    {{-- ============================================================
         ANTET
    ============================================================= --}}

    <div class="header">

        <div class="header-table">

            <div class="header-company">

                <div class="company-name">
                    ELECTRODEP SRL
                </div>

                <div class="company-accent"></div>

                <div class="company-data">
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


            <div class="header-iso">

                <div class="iso-wrap">

                    @if(
                        file_exists(
                            $isoPath
                        )
                    )

                        <img
                            src="{{ $isoPath }}"
                            class="iso-image"
                        >

                    @else

                        <div class="iso-fallback">
                            ISO<br>
                            9001
                        </div>

                    @endif

                    <div class="iso-caption">
                        Sistem de management al calitatii
                    </div>

                </div>

            </div>


            {{-- LICENTA DOAR AICI, SUS DREAPTA --}}

            <div class="header-license">

                @if(
                    $freeReport->license_name
                )

                    <div class="license-wrap">

                        <div class="license-label">
                            Licenta / autorizatie
                        </div>

                        <div class="license-name">
                            {{ $freeReport->license_name }}
                        </div>

                        @if(
                            $freeReport->license &&
                            $freeReport->license->code
                        )

                            <div class="license-code">
                                Cod:
                                {{ $freeReport->license->code }}
                            </div>

                        @endif

                        @if(
                            $freeReport->license_description
                        )

                            <div class="license-description">
                                {{ $freeReport->license_description }}
                            </div>

                        @endif

                    </div>

                @endif

            </div>

        </div>


        <div class="title-area">

            <div class="document-kicker">
                DOCUMENT TEHNIC
            </div>

            <div class="document-title">
                PROCES-VERBAL
            </div>

            @if(
                !empty(
                    $freeReport->title
                )
            )

                <div class="document-subtitle">
                    {{ $freeReport->title }}
                </div>

            @endif

        </div>

    </div>


    {{-- ============================================================
         DOCUMENT
    ============================================================= --}}

    <div class="hero">

        <div class="hero-left">

            <div class="hero-label">
                document
            </div>

            <div class="hero-number">
                {{ $freeReport->number }}
            </div>

            <div class="hero-small">
                PROCES-VERBAL
            </div>

        </div>

        <div class="hero-right">

            <div class="hero-date-label">
                data emiterii
            </div>

            <div class="hero-date">
                {{ $documentDate }}
            </div>

        </div>

    </div>


    {{-- ============================================================
         BENEFICIAR
    ============================================================= --}}

    <div class="client-row">

        <div class="client-card">

            <div class="client-label">
                Beneficiar
            </div>

            <div class="client-name">
                {{ $freeReport->client_name ?: '-' }}
            </div>

            <div class="client-data">

                @if(
                    !empty(
                        $freeReport->client_address
                    )
                )

                    {{ $freeReport->client_address }}

                @endif

                @if(
                    !empty(
                        $freeReport->client_phone
                    )
                )

                    &nbsp;•&nbsp;
                    {{ $freeReport->client_phone }}

                @endif

                @if(
                    !empty(
                        $freeReport->client_cui
                    )
                )

                    &nbsp;•&nbsp;
                    CUI {{ $freeReport->client_cui }}

                @endif

                @if(
                    !empty(
                        $freeReport->contact_person
                    )
                )

                    <br>
                    Persoana de contact:
                    {{ $freeReport->contact_person }}

                @endif

            </div>

        </div>


        <div class="reference-cell">

            <div class="reference-box">

                <div class="reference-label">
                    Referinta
                </div>

                @if(
                    $referenceType
                )

                    <div class="reference-value">
                        {{ $referenceType }}
                    </div>

                    <div class="reference-value">
                        {{ $referenceNumber }}
                    </div>

                @else

                    <div class="reference-value">
                        Proces-verbal liber
                    </div>

                @endif

                @if(
                    !empty(
                        $freeReport->location
                    )
                )

                    <div class="reference-gap"></div>

                    <div class="reference-label">
                        Locatie
                    </div>

                    <div class="reference-value">
                        {{ $freeReport->location }}
                    </div>

                @endif

            </div>

        </div>

    </div>


    {{-- ============================================================
         PARTICIPANTI
    ============================================================= --}}

    @if(
        $freeReport->participants
    )

        <div class="section">

            <div class="section-heading">

                <div class="section-title">
                    Participanti
                </div>

                <div class="section-caption">
                    Persoane prezente
                </div>

            </div>

            <div class="line line-blue"></div>

            <div class="content-box">
                {{ $freeReport->participants }}
            </div>

        </div>

    @endif


    {{-- ============================================================
         SUBIECT
    ============================================================= --}}

    @if(
        $freeReport->subject
    )

        <div class="section">

            <div class="section-heading">

                <div class="section-title">
                    Obiectul procesului-verbal
                </div>

                <div class="section-caption">
                    Subiect
                </div>

            </div>

            <div class="line line-blue"></div>

            <div class="content-box dark">
                {{ $freeReport->subject }}
            </div>

        </div>

    @endif


    {{-- ============================================================
         CONTINUT
    ============================================================= --}}

    @if(
        $freeReport->content
    )

        <div class="section">

            <div class="section-heading">

                <div class="section-title">
                    Continut
                </div>

                <div class="section-caption">
                    Descriere
                </div>

            </div>

            <div class="line line-blue"></div>

            <div class="content-box">
                {{ $freeReport->content }}
            </div>

        </div>

    @endif


    {{-- ============================================================
         CONSTATARI
    ============================================================= --}}

    @if(
        $freeReport->findings
    )

        <div class="section">

            <div class="section-heading">

                <div class="section-title">
                    Constatari
                </div>

                <div class="section-caption">
                    Situatia constatata
                </div>

            </div>

            <div class="line line-green"></div>

            <div class="content-box dark">
                {{ $freeReport->findings }}
            </div>

        </div>

    @endif


    {{-- ============================================================
         CONCLUZII
    ============================================================= --}}

    @if(
        $freeReport->conclusions
    )

        <div class="section">

            <div class="section-heading">

                <div class="section-title">
                    Concluzii
                </div>

                <div class="section-caption">
                    Rezultatul procesului-verbal
                </div>

            </div>

            <div class="line line-green"></div>

            <div class="content-box">
                {{ $freeReport->conclusions }}
            </div>

        </div>

    @endif


    {{-- ============================================================
         OBSERVATII
    ============================================================= --}}

    @if(
        $freeReport->observations
    )

        <div class="section">

            <div class="section-heading">

                <div class="section-title">
                    Observatii
                </div>

                <div class="section-caption">
                    Informatii suplimentare
                </div>

            </div>

            <div class="line"></div>

            <div class="content-box">
                {{ $freeReport->observations }}
            </div>

        </div>

    @endif


    {{-- ============================================================
         SEMNATURI
    ============================================================= --}}

    <div class="signatures">

        <div class="signature-cell left">

            <div class="signature-box">

                <div class="signature-title">
                    Din partea ELECTRODEP SRL
                </div>

                <div class="signature-line"></div>

                <div class="signature-name">

                    {{
                        $freeReport
                            ->provider_signature_name
                        ?: 'Semnatura'
                    }}

                </div>

                @if(
                    $freeReport
                        ->provider_signature_position
                )

                    <div class="signature-position">

                        {{
                            $freeReport
                                ->provider_signature_position
                        }}

                    </div>

                @endif

            </div>

        </div>


        <div class="signature-cell right">

            <div class="signature-box">

                <div class="signature-title">
                    Din partea beneficiarului
                </div>

                <div class="signature-line"></div>

                <div class="signature-name">

                    {{
                        $freeReport
                            ->client_signature_name
                        ?: 'Semnatura'
                    }}

                </div>

                @if(
                    $freeReport
                        ->client_signature_position
                )

                    <div class="signature-position">

                        {{
                            $freeReport
                                ->client_signature_position
                        }}

                    </div>

                @endif

            </div>

        </div>

    </div>


    {{-- ============================================================
         FOOTER
    ============================================================= --}}

    <div class="footer">

        <div class="footer-left">
            ELECTRODEP SRL
        </div>

        <div class="footer-right">

            PROCES-VERBAL
            {{ $freeReport->number }}

            &nbsp;•&nbsp;

            Document tehnic

        </div>

    </div>

</div>

</body>

</html>