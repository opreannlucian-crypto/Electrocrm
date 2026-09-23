<!DOCTYPE html>
<html lang="ro">

<head>

    <meta charset="UTF-8">

    <title>
        {{ $quote->type === 'deviz' ? 'Deviz' : 'Oferta' }}
        {{ $quote->number }}
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
           LICENTA
        ============================================================ */

        .license-wrap {
            display: inline-block;
            min-width: 150px;
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
            font-size: 24px;
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
           INFO
        ============================================================ */

        .info-row {
            width: 100%;
            display: table;
            table-layout: fixed;
            background: #f8fafc;
            border: 1px solid #d9e1ea;
        }

        .info-item {
            display: table-cell;
            width: 25%;
            padding: 8px 9px;
            border-right: 1px solid #d9e1ea;
            vertical-align: top;
        }

        .info-item:last-child {
            border-right: none;
        }

        .info-label {
            font-size: 5.6px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.45px;
            font-weight: bold;
        }

        .info-value {
            margin-top: 3px;
            font-size: 7.7px;
            color: #0f172a;
            font-weight: bold;
        }

        /* ============================================================
           TABEL
        ============================================================ */

        table.items {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            margin-top: 4px;
        }

        table.items th {
            background: #eef3f8;
            border-bottom: 2px solid #0f172a;
            color: #334155;
            padding: 7px 6px;
            font-size: 6px;
            text-align: left;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            white-space: nowrap;
        }

        table.items td {
            padding: 7px 6px;
            border-bottom: 1px solid #e4e9ef;
            font-size: 7.2px;
            color: #334155;
            vertical-align: middle;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        table.items tr:nth-child(even) td {
            background: #fafbfc;
        }

        table.items th:nth-child(1),
        table.items td:nth-child(1) {
            width: 43%;
            text-align: left;
        }

        table.items th:nth-child(2),
        table.items td:nth-child(2) {
            width: 9%;
            text-align: center;
        }

        table.items th:nth-child(3),
        table.items td:nth-child(3) {
            width: 11%;
            text-align: right;
        }

        table.items th:nth-child(4),
        table.items td:nth-child(4) {
            width: 17%;
            text-align: right;
        }

        table.items th:nth-child(5),
        table.items td:nth-child(5) {
            width: 20%;
            text-align: right;
        }

        .item-name {
            color: #0f172a;
            font-size: 7.6px;
            font-weight: bold;
            line-height: 1.35;
        }

        .item-code {
            margin-top: 2px;
            color: #94a3b8;
            font-size: 5.5px;
        }

        .right {
            text-align: right;
        }

        .center {
            text-align: center;
        }

        /* ============================================================
           TOTALURI
        ============================================================ */

        .total-area {
            width: 100%;
            margin-top: 14px;
            display: table;
            table-layout: fixed;
        }

        .total-left {
            display: table-cell;
            width: 57%;
            vertical-align: middle;
            padding-right: 13px;
        }

        .total-right {
            display: table-cell;
            width: 43%;
            vertical-align: top;
        }

        .offer-validity {
            padding: 11px 12px;
            background: #f8fafc;
            border: 1px solid #d9e1ea;
            border-left: 3px solid #2563eb;
        }

        .validity-title {
            color: #0f172a;
            font-size: 7px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        .validity-text {
            margin-top: 4px;
            color: #475569;
            font-size: 7px;
            line-height: 1.55;
        }

        .total-card {
            width: 100%;
            background: #0f172a;
            color: #ffffff;
            border-radius: 2px;
            overflow: hidden;
        }

        .total-block-one {
            padding: 10px 13px 8px 13px;
        }

        .total-block-two {
            padding: 8px 13px;
            border-top: 1px solid #475569;
            border-bottom: 1px solid #475569;
        }

        .total-block-three {
            padding: 10px 13px;
            background: #111827;
        }

        .total-row {
            width: 100%;
            display: table;
            table-layout: fixed;
            padding: 3px 0;
        }

        .total-label {
            display: table-cell;
            width: 58%;
            color: #cbd5e1;
            font-size: 6.8px;
            vertical-align: middle;
        }

        .total-value {
            display: table-cell;
            width: 42%;
            text-align: right;
            color: #ffffff;
            font-size: 7.1px;
            font-weight: bold;
            vertical-align: middle;
        }

        .subtotal-row {
            margin-top: 5px;
            padding-top: 7px;
            border-top: 1px solid #64748b;
        }

        .subtotal-label {
            color: #ffffff;
            font-size: 7.5px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .subtotal-value {
            color: #ffffff;
            font-size: 8px;
            font-weight: bold;
        }

        .total-final-row {
            padding: 1px 0;
        }

        .total-final-label {
            color: #ffffff;
            font-size: 8.5px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .total-final-value {
            color: #60a5fa;
            font-size: 14px;
            font-weight: bold;
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

        .avoid-break {
            page-break-inside: avoid;
        }

    </style>

</head>

<body>

@php

    $isDeviz =
        $quote->type === 'deviz';

    $documentType =
        $isDeviz
            ? 'DEVIZ'
            : 'OFERTA';

    /*
    |--------------------------------------------------------------------------
    | REGIM TVA
    |--------------------------------------------------------------------------
    */

    $isVatPayer =
        ($quote->client?->tva_status ?? null)
        === 'platitor_tva';

    $vatRate =
        $isVatPayer
            ? 0
            : 21;

    /*
    |--------------------------------------------------------------------------
    | MATERIALE
    |--------------------------------------------------------------------------
    */

    $materials =
        $quote->items
            ->where(
                'type',
                'material'
            );

    /*
    |--------------------------------------------------------------------------
    | MANOPERA
    |--------------------------------------------------------------------------
    */

    $labor =
        $quote->items
            ->where(
                'type',
                'manopera'
            );

    /*
    |--------------------------------------------------------------------------
    | TOTAL MATERIALE
    |--------------------------------------------------------------------------
    */

    $materialsTotal = 0;

    foreach (
        $materials
        as $item
    ) {

        $lineSubtotal =
            (float) $item->quantity *
            (float) $item->unit_price;

        $lineDiscount =
            $lineSubtotal *
            (
                (float)
                (
                    $item->discount
                    ?? 0
                )
                / 100
            );

        $materialsTotal +=
            $lineSubtotal -
            $lineDiscount;
    }

    /*
    |--------------------------------------------------------------------------
    | TOTAL MANOPERA
    |--------------------------------------------------------------------------
    */

    $laborTotal = 0;

    foreach (
        $labor
        as $item
    ) {

        $lineSubtotal =
            (float) $item->quantity *
            (float) $item->unit_price;

        $lineDiscount =
            $lineSubtotal *
            (
                (float)
                (
                    $item->discount
                    ?? 0
                )
                / 100
            );

        $laborTotal +=
            $lineSubtotal -
            $lineDiscount;
    }

    /*
    |--------------------------------------------------------------------------
    | SUBTOTAL
    |--------------------------------------------------------------------------
    */

    $subtotal =
        $materialsTotal +
        $laborTotal;

    /*
    |--------------------------------------------------------------------------
    | DISCOUNT
    |--------------------------------------------------------------------------
    */

    $discountRate =
        (float)
        (
            $quote->discount
            ?? 0
        );

    $discountValue =
        $subtotal *
        (
            $discountRate /
            100
        );

    /*
    |--------------------------------------------------------------------------
    | TOTAL FARA TVA
    |--------------------------------------------------------------------------
    */

    $totalWithoutVat =
        $subtotal -
        $discountValue;

    /*
    |--------------------------------------------------------------------------
    | TVA
    |--------------------------------------------------------------------------
    */

    $vat =
        $totalWithoutVat *
        (
            $vatRate /
            100
        );

    /*
    |--------------------------------------------------------------------------
    | TOTAL CU TVA
    |--------------------------------------------------------------------------
    */

    $totalWithVat =
        $totalWithoutVat +
        $vat;

    /*
    |--------------------------------------------------------------------------
    | TOTAL FINAL
    |--------------------------------------------------------------------------
    */

    $finalTotal =
        $isVatPayer
            ? $totalWithoutVat
            : $totalWithVat;

    /*
    |--------------------------------------------------------------------------
    | DATA
    |--------------------------------------------------------------------------
    */

    $documentDate =
        $quote->date
            ? \Carbon\Carbon::parse(
                $quote->date
            )->format('d.m.Y')
            : '-';

    /*
    |--------------------------------------------------------------------------
    | ISO
    |--------------------------------------------------------------------------
    */

    $isoPath =
        public_path(
            'images/iso9001.png'
        );

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


            <div class="header-license">

                @if(
                    $quote->license
                )

                    <div class="license-wrap">

                        <div class="license-label">
                            Licenta / autorizatie
                        </div>

                        <div class="license-name">
                            {{ $quote->license->name }}
                        </div>

                        @if(
                            $quote->license->code
                        )

                            <div class="license-code">
                                Cod:
                                {{ $quote->license->code }}
                            </div>

                        @endif

                    </div>

                @endif

            </div>

        </div>


        {{-- ========================================================
             TITLU
        ========================================================= --}}

        <div class="title-area">

            <div class="document-kicker">
                DOCUMENT COMERCIAL
            </div>

            <div class="document-title">
                {{ $documentType }}
            </div>

            @if(
                !empty(
                    $quote->title
                )
            )

                <div class="document-subtitle">
                    {{ $quote->title }}
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
                {{ $quote->number }}
            </div>

            <div class="hero-small">
                {{ $documentType }}
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
         CLIENT
    ============================================================= --}}

    <div class="client-row">

        <div class="client-card">

            <div class="client-label">
                Beneficiar
            </div>

            <div class="client-name">
                {{ $quote->client->name ?? '-' }}
            </div>

            <div class="client-data">

                @if(
                    !empty(
                        $quote->client->address
                    )
                )

                    {{ $quote->client->address }}

                @endif

                @if(
                    !empty(
                        $quote->client->phone
                    )
                )

                    &nbsp;•&nbsp;
                    {{ $quote->client->phone }}

                @endif

                @if(
                    !empty(
                        $quote->client->email
                    )
                )

                    &nbsp;•&nbsp;
                    {{ $quote->client->email }}

                @endif

                @if(
                    !empty(
                        $quote->client->cui
                    )
                )

                    &nbsp;•&nbsp;
                    CUI {{ $quote->client->cui }}

                @endif

            </div>

        </div>


        <div class="reference-cell">

            <div class="reference-box">

                <div class="reference-label">
                    Referinta
                </div>

                <div class="reference-value">
                    {{ $quote->number }}
                </div>

                @if(
                    $quote->workOrder
                )

                    <div class="reference-gap"></div>

                    <div class="reference-label">
                        Lucrare
                    </div>

                    <div class="reference-value">
                        {{ $quote->workOrder->number }}
                    </div>

                @endif

            </div>

        </div>

    </div>


    {{-- ============================================================
         DATE DOCUMENT
    ============================================================= --}}

    <div class="section">

        <div class="section-heading">

            <div class="section-title">
                Detalii document
            </div>

            <div class="section-caption">
                Date comerciale
            </div>

        </div>

        <div class="line line-blue"></div>


        <div class="info-row">

            <div class="info-item">

                <div class="info-label">
                    Numar
                </div>

                <div class="info-value">
                    {{ $quote->number }}
                </div>

            </div>


            <div class="info-item">

                <div class="info-label">
                    Data
                </div>

                <div class="info-value">
                    {{ $documentDate }}
                </div>

            </div>


            <div class="info-item">

                <div class="info-label">
                    Regim TVA
                </div>

                <div class="info-value">

                    @if($isVatPayer)

                        Fara TVA

                    @else

                        TVA 21%

                    @endif

                </div>

            </div>


            <div class="info-item">

                <div class="info-label">
                    Discount
                </div>

                <div class="info-value">
                    {{
                        number_format(
                            $discountRate,
                            0,
                            ',',
                            '.'
                        )
                    }}%
                </div>

            </div>

        </div>

    </div>


    {{-- ============================================================
         MATERIALE
    ============================================================= --}}

    @if(
        $materials->count()
    )

        <div class="section">

            <div class="section-heading">

                <div class="section-title">
                    Materiale si echipamente
                </div>

                <div class="section-caption">
                    Furnizare
                </div>

            </div>

            <div class="line line-blue"></div>


            <table class="items">

                <colgroup>
                    <col style="width: 43%;">
                    <col style="width: 9%;">
                    <col style="width: 11%;">
                    <col style="width: 17%;">
                    <col style="width: 20%;">
                </colgroup>

                <thead>

                    <tr>

                        <th>
                            Denumire
                        </th>

                        <th class="center">
                            UM
                        </th>

                        <th class="right">
                            Cant.
                        </th>

                        <th class="right">
                            Pret unitar
                        </th>

                        <th class="right">
                            Valoare
                        </th>

                    </tr>

                </thead>


                <tbody>

                    @foreach(
                        $materials
                        as $item
                    )

                        @php

                            $lineSubtotal =
                                (float)
                                $item->quantity *
                                (float)
                                $item->unit_price;

                            $lineDiscount =
                                $lineSubtotal *
                                (
                                    (float)
                                    (
                                        $item->discount
                                        ?? 0
                                    )
                                    / 100
                                );

                            $lineTotal =
                                $lineSubtotal -
                                $lineDiscount;

                        @endphp


                        <tr>

                            <td>

                                <div class="item-name">
                                    {{ $item->name }}
                                </div>

                                @if(
                                    !empty(
                                        $item->product?->code
                                    )
                                )

                                    <div class="item-code">
                                        Cod:
                                        {{ $item->product->code }}
                                    </div>

                                @endif

                            </td>


                            <td class="center">
                                {{ $item->unit }}
                            </td>


                            <td class="right">

                                {{
                                    number_format(
                                        (float)
                                        $item->quantity,
                                        2,
                                        ',',
                                        '.'
                                    )
                                }}

                            </td>


                            <td class="right">

                                {{
                                    number_format(
                                        (float)
                                        $item->unit_price,
                                        2,
                                        ',',
                                        '.'
                                    )
                                }}
                                lei

                            </td>


                            <td class="right">

                                <strong>

                                    {{
                                        number_format(
                                            $lineTotal,
                                            2,
                                            ',',
                                            '.'
                                        )
                                    }}
                                    lei

                                </strong>

                            </td>

                        </tr>

                    @endforeach

                </tbody>

            </table>

        </div>

    @endif


    {{-- ============================================================
         MANOPERA
    ============================================================= --}}

    @if(
        $labor->count()
    )

        <div class="section">

            <div class="section-heading">

                <div class="section-title">
                    Manopera si servicii
                </div>

                <div class="section-caption">
                    Executie
                </div>

            </div>

            <div class="line line-green"></div>


            <table class="items">

                <colgroup>
                    <col style="width: 43%;">
                    <col style="width: 9%;">
                    <col style="width: 11%;">
                    <col style="width: 17%;">
                    <col style="width: 20%;">
                </colgroup>

                <thead>

                    <tr>

                        <th>
                            Denumire
                        </th>

                        <th class="center">
                            UM
                        </th>

                        <th class="right">
                            Cant.
                        </th>

                        <th class="right">
                            Pret unitar
                        </th>

                        <th class="right">
                            Valoare
                        </th>

                    </tr>

                </thead>


                <tbody>

                    @foreach(
                        $labor
                        as $item
                    )

                        @php

                            $lineSubtotal =
                                (float)
                                $item->quantity *
                                (float)
                                $item->unit_price;

                            $lineDiscount =
                                $lineSubtotal *
                                (
                                    (float)
                                    (
                                        $item->discount
                                        ?? 0
                                    )
                                    / 100
                                );

                            $lineTotal =
                                $lineSubtotal -
                                $lineDiscount;

                        @endphp


                        <tr>

                            <td>

                                <div class="item-name">
                                    {{ $item->name }}
                                </div>

                            </td>


                            <td class="center">
                                {{ $item->unit }}
                            </td>


                            <td class="right">

                                {{
                                    number_format(
                                        (float)
                                        $item->quantity,
                                        2,
                                        ',',
                                        '.'
                                    )
                                }}

                            </td>


                            <td class="right">

                                {{
                                    number_format(
                                        (float)
                                        $item->unit_price,
                                        2,
                                        ',',
                                        '.'
                                    )
                                }}
                                lei

                            </td>


                            <td class="right">

                                <strong>

                                    {{
                                        number_format(
                                            $lineTotal,
                                            2,
                                            ',',
                                            '.'
                                        )
                                    }}
                                    lei

                                </strong>

                            </td>

                        </tr>

                    @endforeach

                </tbody>

            </table>

        </div>

    @endif


    {{-- ============================================================
         TOTALURI
    ============================================================= --}}

    <div class="total-area avoid-break">

        <div class="total-left">

            <div class="offer-validity">

                <div class="validity-title">
                    Valabilitatea ofertei
                </div>

                <div class="validity-text">
                    Oferta este valabila
                    <strong>
                        30 de zile
                    </strong>
                    de la data emiterii.
                </div>

            </div>

        </div>


        <div class="total-right">

            <div class="total-card">

                {{-- =================================================
                     PLATITOR TVA
                     MATERIALe + MANOPERA + SUBTOTAL + TOTAL FARA TVA
                ================================================== --}}

                @if($isVatPayer)

                    <div class="total-block total-block-one">

                        <div class="total-row">

                            <span class="total-label">
                                Materiale
                            </span>

                            <span class="total-value">
                                {{
                                    number_format(
                                        $materialsTotal,
                                        2,
                                        ',',
                                        '.'
                                    )
                                }}
                                lei
                            </span>

                        </div>


                        <div class="total-row">

                            <span class="total-label">
                                Manopera
                            </span>

                            <span class="total-value">
                                {{
                                    number_format(
                                        $laborTotal,
                                        2,
                                        ',',
                                        '.'
                                    )
                                }}
                                lei
                            </span>

                        </div>


                        <div class="total-row subtotal-row">

                            <span class="total-label subtotal-label">
                                SUBTOTAL
                            </span>

                            <span class="total-value subtotal-value">
                                {{
                                    number_format(
                                        $subtotal,
                                        2,
                                        ',',
                                        '.'
                                    )
                                }}
                                lei
                            </span>

                        </div>

                    </div>


                    <div class="total-block total-block-three">

                        <div class="total-row total-final-row">

                            <span class="total-label total-final-label">
                                TOTAL FARA TVA
                            </span>

                            <span class="total-value total-final-value">
                                {{
                                    number_format(
                                        $totalWithoutVat,
                                        2,
                                        ',',
                                        '.'
                                    )
                                }}
                                lei
                            </span>

                        </div>

                    </div>


                {{-- =================================================
                     NEPLATITOR TVA / PERSOANA FIZICA
                ================================================== --}}

                @else

                    <div class="total-block total-block-one">

                        <div class="total-row">

                            <span class="total-label">
                                Materiale
                            </span>

                            <span class="total-value">
                                {{
                                    number_format(
                                        $materialsTotal,
                                        2,
                                        ',',
                                        '.'
                                    )
                                }}
                                lei
                            </span>

                        </div>


                        <div class="total-row">

                            <span class="total-label">
                                Manopera
                            </span>

                            <span class="total-value">
                                {{
                                    number_format(
                                        $laborTotal,
                                        2,
                                        ',',
                                        '.'
                                    )
                                }}
                                lei
                            </span>

                        </div>


                        <div class="total-row subtotal-row">

                            <span class="total-label subtotal-label">
                                SUBTOTAL
                            </span>

                            <span class="total-value subtotal-value">
                                {{
                                    number_format(
                                        $subtotal,
                                        2,
                                        ',',
                                        '.'
                                    )
                                }}
                                lei
                            </span>

                        </div>

                    </div>


                    <div class="total-block total-block-two">

                        <div class="total-row">

                            <span class="total-label">
                                Total fara TVA
                            </span>

                            <span class="total-value">
                                {{
                                    number_format(
                                        $totalWithoutVat,
                                        2,
                                        ',',
                                        '.'
                                    )
                                }}
                                lei
                            </span>

                        </div>


                        <div class="total-row">

                            <span class="total-label">
                                TVA 21%
                            </span>

                            <span class="total-value">
                                {{
                                    number_format(
                                        $vat,
                                        2,
                                        ',',
                                        '.'
                                    )
                                }}
                                lei
                            </span>

                        </div>

                    </div>


                    <div class="total-block total-block-three">

                        <div class="total-row total-final-row">

                            <span class="total-label total-final-label">
                                TOTAL CU TVA
                            </span>

                            <span class="total-value total-final-value">
                                {{
                                    number_format(
                                        $totalWithVat,
                                        2,
                                        ',',
                                        '.'
                                    )
                                }}
                                lei
                            </span>

                        </div>

                    </div>

                @endif

            </div>

        </div>

    </div>


    {{-- ============================================================
         OBSERVATII
    ============================================================= --}}

    @if(
        !empty(
            $quote->notes
        )
    )

        <div class="section">

            <div class="section-heading">

                <div class="section-title">
                    Observatii si conditii
                </div>

                <div class="section-caption">
                    Informatii suplimentare
                </div>

            </div>

            <div class="line"></div>


            <div
                style="
                    padding: 10px 11px;
                    border: 1px solid #d9e1ea;
                    background: #ffffff;
                    color: #475569;
                    font-size: 7px;
                    line-height: 1.6;
                    white-space: pre-line;
                "
            >
                {{ $quote->notes }}
            </div>

        </div>

    @endif


    {{-- ============================================================
         FOOTER
    ============================================================= --}}

    <div class="footer">

        <div class="footer-left">
            ELECTRODEP SRL
        </div>

        <div class="footer-right">

            {{ $documentType }}
            {{ $quote->number }}

            &nbsp;•&nbsp;

            @if($isVatPayer)

                Fara TVA

            @else

                TVA 21% • Valabilitate 30 zile

            @endif

        </div>

    </div>

</div>

</body>

</html>