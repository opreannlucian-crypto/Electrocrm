<!DOCTYPE html>
<html lang="ro">

<head>

    <meta charset="UTF-8">

    <title>
        {{ $contract->title ?: 'Contract' }}
        - {{ $contract->number }}
    </title>

    <style>

        @page {
    margin: 28px 65px 34px 65px;
}

        * {
            box-sizing: border-box;
        }

        html,
        body {
            .page {
    width: 100%;
    padding-left: 12px;
    padding-right: 12px;
}
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            line-height: 1.5;
            color: #222222;
            background: #ffffff;
        }

        .page {
            width: 100%;
        }

        /* ============================================================
           ANTET
        ============================================================ */

        .top-line {
            width: 100%;
            height: 3px;
            background: #2563eb;
            margin-bottom: 12px;
        }

        .header {
            width: 100%;
            padding-bottom: 10px;
            border-bottom: 1px solid #cfd4da;
        }

        .header-table {
            width: 100%;
            display: table;
            table-layout: fixed;
        }

        .header-company {
            display: table-cell;
            width: 55%;
            vertical-align: top;
        }

        .header-license {
            display: table-cell;
            width: 45%;
            vertical-align: top;
            text-align: right;
        }

        .company-name {
            color: #222222;
            font-size: 11px;
            font-weight: bold;
            letter-spacing: 0.2px;
        }

        .company-accent {
            width: 28px;
            height: 2px;
            background: #2563eb;
            margin-top: 4px;
            margin-bottom: 5px;
        }

        .company-data {
            color: #555555;
            font-size: 6.5px;
            line-height: 1.4;
        }

        .license-wrap {
            display: inline-block;
            max-width: 215px;
            padding: 6px 8px;
            border-right: 2px solid #2563eb;
            background: #f8fafc;
            text-align: right;
        }

        .license-label {
            color: #666666;
            font-size: 5.2px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        .license-name {
            margin-top: 3px;
            color: #222222;
            font-size: 7px;
            font-weight: bold;
        }

        .license-code {
            margin-top: 2px;
            color: #666666;
            font-size: 5.8px;
        }

        .license-description {
            margin-top: 3px;
            color: #555555;
            font-size: 5.5px;
            line-height: 1.35;
        }

        /* ============================================================
           TITLU
        ============================================================ */

        .title-area {
            width: 100%;
            text-align: center;
            padding: 20px 0 14px 0;
        }

        .document-kicker {
            color: #666666;
            font-size: 6px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }

        .document-title {
            margin-top: 5px;
            color: #111111;
            font-size: 18px;
            line-height: 1.2;
            font-weight: bold;
            text-transform: uppercase;
        }

        .document-subtitle {
            margin-top: 4px;
            color: #444444;
            font-size: 9px;
            font-weight: bold;
        }

        .document-number {
            margin-top: 6px;
            color: #555555;
            font-size: 8px;
        }

        /* ============================================================
           TEXT
        ============================================================ */

        .text {
            width: 100%;
            color: #252525;
            font-size: 9.4px;
            line-height: 1.58;
            text-align: left;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        .text p {
            margin: 0 0 7px 0;
            padding: 0;
        }

        .text p:last-child {
            margin-bottom: 0;
        }

        /* ============================================================
           INTRO
        ============================================================ */

        .intro {
            width: 100%;
            margin-top: 2px;
            margin-bottom: 4px;
        }

        /* ============================================================
           CAPITOLE
        ============================================================ */

        .chapter {
            width: 100%;
            margin-top: 17px;
        }

        .chapter-title {
            width: 100%;
            color: #111111;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            line-height: 1.35;
            text-align: left;
            margin: 0;
        }

        .chapter-rule {
            width: 100%;
            height: 1px;
            background: #cfd4da;
            margin-top: 5px;
            margin-bottom: 8px;
        }

        .article {
            width: 100%;
            margin-top: 7px;
        }

        .article:first-child {
            margin-top: 0;
        }

        .article-title {
            width: 100%;
            margin: 0 0 3px 0;
            padding: 0;
            color: #222222;
            font-size: 9.3px;
            font-weight: bold;
            line-height: 1.45;
            text-align: left;
        }

        .article-text {
            width: 100%;
            margin: 0;
            padding: 0;
            color: #252525;
            font-size: 9.3px;
            line-height: 1.58;
            text-align: left;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        .article-text p {
            margin: 0 0 6px 0;
            padding: 0;
        }

        .article-text p:last-child {
            margin-bottom: 0;
        }

        /* ============================================================
           PARTI CONTRACTANTE
        ============================================================ */

        .party {
            width: 100%;
            margin-top: 9px;
        }

        .party-title {
            width: 100%;
            margin: 0;
            color: #111111;
            font-size: 9.3px;
            font-weight: bold;
            text-transform: uppercase;
            text-align: left;
        }

        .party-name {
            width: 100%;
            margin-top: 3px;
            color: #111111;
            font-size: 10px;
            font-weight: bold;
            text-align: left;
        }

        .party-text {
            width: 100%;
            margin-top: 4px;
            color: #252525;
            font-size: 9.3px;
            line-height: 1.58;
            text-align: left;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        .party-text p {
            margin: 0 0 6px 0;
            padding: 0;
        }

        .party-text p:last-child {
            margin-bottom: 0;
        }

        /* ============================================================
           CONDITII COMERCIALE
        ============================================================ */

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 7px;
        }

        .data-table td {
            border: 1px solid #d4d8dc;
            padding: 7px 8px;
            vertical-align: top;
        }

        .data-label {
            width: 25%;
            background: #f7f8f9;
            color: #555555;
            font-size: 7px;
            font-weight: bold;
            text-transform: uppercase;
            text-align: left;
        }

        .data-value {
            color: #222222;
            font-size: 8.5px;
            line-height: 1.5;
            text-align: left;
        }

        /* ============================================================
           CONTINUTURI CU RANDURI
        ============================================================ */

        .contract-content {
            width: 100%;
            margin: 0;
            padding: 0;
            color: #252525;
            font-size: 9.3px;
            line-height: 1.58;
            text-align: left;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        .contract-content p {
            margin: 0 0 7px 0;
            padding: 0;
        }

        .contract-content p:last-child {
            margin-bottom: 0;
        }

        .reference {
            width: 100%;
            margin-top: 7px;
            color: #333333;
            font-size: 8.8px;
            line-height: 1.55;
            text-align: left;
        }

        /* ============================================================
           SEMNATURI
        ============================================================ */

        .signatures {
            width: 100%;
            display: table;
            table-layout: fixed;
            margin-top: 32px;
            page-break-inside: avoid;
        }

        .signature-cell {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }

        .signature-cell.left {
            padding-right: 28px;
        }

        .signature-cell.right {
            padding-left: 28px;
        }

        .signature-title {
            color: #111111;
            font-size: 8.5px;
            font-weight: bold;
            text-transform: uppercase;
            text-align: left;
        }

        .signature-company {
            margin-top: 3px;
            color: #444444;
            font-size: 8px;
            text-align: left;
        }

        .signature-space {
            height: 58px;
        }

        .signature-line {
            border-top: 1px solid #555555;
        }

        .signature-name {
            margin-top: 5px;
            color: #222222;
            font-size: 8px;
            font-weight: bold;
            text-align: center;
        }

        .signature-position {
            margin-top: 2px;
            color: #555555;
            font-size: 7px;
            text-align: center;
        }

        /* ============================================================
           FOOTER
        ============================================================ */

        .footer {
            width: 100%;
            margin-top: 20px;
            padding-top: 6px;
            border-top: 1px solid #d4d8dc;
            display: table;
            color: #888888;
            font-size: 5.7px;
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
        $contract->contract_date
            ? \Carbon\Carbon::parse(
                $contract->contract_date
            )->format('d.m.Y')
            : '-';

    $contractValue = null;

    if (
        $contract->value !== null &&
        $contract->value !== ''
    ) {
        $contractValue =
            number_format(
                (float) $contract->value,
                2,
                ',',
                '.'
            )
            . ' '
            . (
                $contract->currency
                ?: 'RON'
            );
    }

@endphp


<div class="page">

    {{-- ============================================================
         ANTET
         FARA ISO
    ============================================================= --}}

    <div class="top-line"></div>

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


            <div class="header-license">

                @if(
                    $contract->license_name
                )

                    <div class="license-wrap">

                        <div class="license-label">
                            Licenta / autorizatie
                        </div>

                        <div class="license-name">
                            {{ $contract->license_name }}
                        </div>

                        @if(
                            $contract->license &&
                            $contract->license->code
                        )

                            <div class="license-code">
                                Cod:
                                {{ $contract->license->code }}
                            </div>

                        @endif

                        @if(
                            $contract->license_description
                        )

                            <div class="license-description">
                                {{ $contract->license_description }}
                            </div>

                        @endif

                    </div>

                @endif

            </div>

        </div>


        <div class="title-area">

            <div class="document-kicker">
                DOCUMENT CONTRACTUAL
            </div>

            <div class="document-title">
                {{ $contract->title ?: 'CONTRACT DE PRESTARI SERVICII' }}
            </div>

            @if(
                $contract->type
            )

                <div class="document-subtitle">
                    {{ $contract->type }}
                </div>

            @endif

            <div class="document-number">

                Nr.
                <strong>
                    {{ $contract->number }}
                </strong>

                &nbsp;&nbsp;&nbsp;

                Data:
                <strong>
                    {{ $documentDate }}
                </strong>

            </div>

        </div>

    </div>


    {{-- ============================================================
         INTRO
    ============================================================= --}}

    <div class="intro text">

        <p>
            Incheiat astazi,
            <strong>{{ $documentDate }}</strong>,
            intre partile contractante mentionate mai jos,
            in conditiile si cu respectarea prevederilor prezentului contract.
        </p>

    </div>


    {{-- ============================================================
         CAPITOLUL I
    ============================================================= --}}

    <div class="chapter">

        <div class="chapter-title">
            CAPITOLUL I. PARTILE CONTRACTANTE
        </div>

        <div class="chapter-rule"></div>


        <div class="party">

            <div class="party-title">
                1.1. PRESTATOR
            </div>

            <div class="party-name">
                ELECTRODEP SRL
            </div>

            <div class="party-text">

                <p>
                    Cu sediul in Str. Alexe Turcas, nr. 21,
                    Vintu de Jos, jud. Alba,
                    CUI RO23457886,
                    J2008000314013,
                    telefon 0744 288 590,
                    email electrodep@yahoo.com.
                </p>

                @if(
                    $contract->provider_signature_name
                )

                    <p>
                        Reprezentata prin
                        <strong>
                            {{ $contract->provider_signature_name }}
                        </strong>

                        @if(
                            $contract->provider_signature_position
                        )

                            , in calitate de
                            <strong>
                                {{ $contract->provider_signature_position }}
                            </strong>

                        @endif
                    </p>

                @endif

            </div>

        </div>


        <div class="party">

            <div class="party-title">
                1.2. BENEFICIAR
            </div>

            <div class="party-name">
                {{ $contract->client?->name ?: '-' }}
            </div>

            <div class="party-text">

                @if(
                    $contract->client?->address
                )

                    <p>
                        Cu sediul in
                        {{ $contract->client->address }}.
                    </p>

                @endif

                @if(
                    $contract->client?->cui ||
                    $contract->client?->phone ||
                    $contract->client?->email
                )

                    <p>

                        @if(
                            $contract->client?->cui
                        )
                            CUI:
                            {{ $contract->client->cui }}
                        @endif

                        @if(
                            $contract->client?->phone
                        )
                            &nbsp;&nbsp;
                            Telefon:
                            {{ $contract->client->phone }}
                        @endif

                        @if(
                            $contract->client?->email
                        )
                            &nbsp;&nbsp;
                            Email:
                            {{ $contract->client->email }}
                        @endif

                    </p>

                @endif

                @if(
                    $contract->contact_person
                )

                    <p>
                        Persoana de contact:
                        {{ $contract->contact_person }}
                    </p>

                @endif

                @if(
                    $contract->client_signature_name
                )

                    <p>

                        Reprezentata prin
                        <strong>
                            {{ $contract->client_signature_name }}
                        </strong>

                        @if(
                            $contract->client_signature_position
                        )

                            , in calitate de
                            <strong>
                                {{ $contract->client_signature_position }}
                            </strong>

                        @endif

                    </p>

                @endif

            </div>

        </div>


        <div class="article">

            <div class="article-title">
                1.3.
            </div>

            <div class="article-text">
                Partile contractante declara ca au capacitatea de a incheia
                prezentul contract si convin asupra conditiilor prevazute
                in cuprinsul acestuia.
            </div>

        </div>

    </div>


    {{-- ============================================================
         CAPITOLUL II
    ============================================================= --}}

    <div class="chapter">

        <div class="chapter-title">
            CAPITOLUL II. OBIECTUL CONTRACTULUI
        </div>

        <div class="chapter-rule"></div>

        <div class="article">

            <div class="article-title">
                2.1.
            </div>

            <div class="article-text">

                @if(
                    $contract->subject
                )

                    {!! nl2br(e($contract->subject)) !!}

                @else

                    Obiectul contractului il constituie prestarea
                    serviciilor si/sau executarea lucrarilor convenite
                    de parti.

                @endif

            </div>

        </div>

    </div>


    {{-- ============================================================
         CAPITOLUL III
    ============================================================= --}}

    <div class="chapter">

        <div class="chapter-title">
            CAPITOLUL III. DURATA CONTRACTULUI
        </div>

        <div class="chapter-rule"></div>

        <div class="article">

            <div class="article-title">
                3.1.
            </div>

            <div class="article-text">

                @if(
                    $contract->duration
                )

                    {!! nl2br(e(
                        'Durata prezentului contract este ' .
                        $contract->duration .
                        '.'
                    )) !!}

                @else

                    Durata contractului se stabileste conform
                    intelegerii dintre parti.

                @endif

            </div>

        </div>

    </div>


    {{-- ============================================================
         CAPITOLUL IV
    ============================================================= --}}

    <div class="chapter">

        <div class="chapter-title">
            CAPITOLUL IV. PRETUL. MODALITATI DE PLATA
        </div>

        <div class="chapter-rule"></div>


        @if(
            $contract->value !== null &&
            $contract->value !== ''
        )

            <div class="article">

                <div class="article-title">
                    4.1.
                </div>

                <div class="article-text">

                    Valoarea contractului este de
                    <strong>
                        {{ $contractValue }}
                    </strong>.

                </div>

            </div>

        @endif


        @if(
            $contract->payment_terms
        )

            <div class="article">

                <div class="article-title">
                    4.2.
                </div>

                <div class="article-text">

                    Modalitatile si termenele de plata sunt urmatoarele:

                </div>

                <div class="contract-content">

                    {!! nl2br(e($contract->payment_terms)) !!}

                </div>

            </div>

        @endif


        @if(
            $contract->value === null &&
            !$contract->payment_terms
        )

            <div class="article">

                <div class="article-title">
                    4.1.
                </div>

                <div class="article-text">

                    Pretul si modalitatile de plata se stabilesc
                    prin acordul partilor contractante.

                </div>

            </div>

        @endif

    </div>


    {{-- ============================================================
         CAPITOLUL V
    ============================================================= --}}

    @if(
        $contract->content
    )

        <div class="chapter">

            <div class="chapter-title">
                CAPITOLUL V. MODALITATEA DE LUCRU SI PREVEDERI CONTRACTUALE
            </div>

            <div class="chapter-rule"></div>

            <div class="article">

                <div class="article-title">
                    5.1.
                </div>

                <div class="contract-content">

                    {!! nl2br(e($contract->content)) !!}

                </div>

            </div>

        </div>

    @endif


    {{-- ============================================================
         CAPITOLUL VI
    ============================================================= --}}

    @if(
        $contract->clauses
    )

        <div class="chapter">

            <div class="chapter-title">
                CAPITOLUL VI. CLAUZE CONTRACTUALE
            </div>

            <div class="chapter-rule"></div>

            <div class="article">

                <div class="article-title">
                    6.1.
                </div>

                <div class="contract-content">

                    {!! nl2br(e($contract->clauses)) !!}

                </div>

            </div>

        </div>

    @endif


    {{-- ============================================================
         CAPITOLUL VII
    ============================================================= --}}

    <div class="chapter">

        <div class="chapter-title">
            CAPITOLUL VII. OBLIGATIILE PARTILOR
        </div>

        <div class="chapter-rule"></div>

        <div class="article">

            <div class="article-title">
                7.1. Obligatiile beneficiarului
            </div>

            <div class="article-text">

                Beneficiarul se obliga sa puna la dispozitia
                prestatorului informatiile si conditiile necesare
                realizarii obiectului contractului si sa respecte
                conditiile de plata convenite.

            </div>

        </div>


        <div class="article">

            <div class="article-title">
                7.2. Obligatiile prestatorului
            </div>

            <div class="article-text">

                Prestatorul se obliga sa execute serviciile si
                lucrarile care fac obiectul prezentului contract
                in conditiile stabilite impreuna cu beneficiarul.

            </div>

        </div>

    </div>


    {{-- ============================================================
         CAPITOLUL VIII
    ============================================================= --}}

    <div class="chapter">

        <div class="chapter-title">
            CAPITOLUL VIII. MODIFICAREA SI INCETAREA CONTRACTULUI
        </div>

        <div class="chapter-rule"></div>

        <div class="article">

            <div class="article-title">
                8.1.
            </div>

            <div class="article-text">

                Modificarea prezentului contract se face prin acordul
                partilor si, dupa caz, prin act aditional.

            </div>

        </div>


        <div class="article">

            <div class="article-title">
                8.2.
            </div>

            <div class="article-text">

                Incetarea contractului poate interveni prin acordul
                partilor sau in celelalte conditii prevazute de lege
                si de prezentul contract.

            </div>

        </div>

    </div>


    {{-- ============================================================
         CAPITOLUL IX
    ============================================================= --}}

    <div class="chapter">

        <div class="chapter-title">
            CAPITOLUL IX. FORTA MAJORA
        </div>

        <div class="chapter-rule"></div>

        <div class="article">

            <div class="article-title">
                9.1.
            </div>

            <div class="article-text">

                Partile nu raspund pentru neexecutarea obligatiilor
                atunci cand aceasta este determinata de evenimente
                de forta majora, in conditiile legii.

            </div>

        </div>

    </div>


    {{-- ============================================================
         CAPITOLUL X
    ============================================================= --}}

    <div class="chapter">

        <div class="chapter-title">
            CAPITOLUL X. CONFIDENTIALITATE
        </div>

        <div class="chapter-rule"></div>

        <div class="article">

            <div class="article-title">
                10.1.
            </div>

            <div class="article-text">

                Partile se obliga sa pastreze confidentialitatea
                informatiilor comerciale si tehnice obtinute in
                cadrul executarii prezentului contract.

            </div>

        </div>

    </div>


    {{-- ============================================================
         CAPITOLUL XI
    ============================================================= --}}

    <div class="chapter">

        <div class="chapter-title">
            CAPITOLUL XI. SOLUTIONAREA LITIGIILOR
        </div>

        <div class="chapter-rule"></div>

        <div class="article">

            <div class="article-title">
                11.1.
            </div>

            <div class="article-text">

                Orice neintelegere aparuta intre parti in legatura
                cu prezentul contract va fi solutionata cu prioritate
                pe cale amiabila.

            </div>

        </div>


        <div class="article">

            <div class="article-title">
                11.2.
            </div>

            <div class="article-text">

                In cazul in care solutionarea amiabila nu este
                posibila, partile se vor adresa instantelor competente.

            </div>

        </div>

    </div>


    {{-- ============================================================
         CAPITOLUL XII
    ============================================================= --}}

    @if(
        $contract->observations
    )

        <div class="chapter">

            <div class="chapter-title">
                CAPITOLUL XII. ALTE CLAUZE SI OBSERVATII
            </div>

            <div class="chapter-rule"></div>

            <div class="article">

                <div class="article-title">
                    12.1.
                </div>

                <div class="contract-content">

                    {!! nl2br(e($contract->observations)) !!}

                </div>

            </div>

        </div>

    @endif


    {{-- ============================================================
         CAPITOLUL XIII
    ============================================================= --}}

    <div class="chapter">

        <div class="chapter-title">
            CAPITOLUL XIII. DISPOZITII FINALE
        </div>

        <div class="chapter-rule"></div>

        <div class="article">

            <div class="article-title">
                13.1.
            </div>

            <div class="article-text">

                Prezentul contract reprezinta acordul dintre parti
                cu privire la obiectul sau si se interpreteaza in
                conformitate cu prevederile legale aplicabile.

            </div>

        </div>


        <div class="article">

            <div class="article-title">
                13.2.
            </div>

            <div class="article-text">

                Prezentul contract a fost incheiat astazi,
                {{ $documentDate }},
                in doua exemplare, cate unul pentru fiecare parte,
                fiecare exemplar avand aceeasi valoare juridica.

            </div>

        </div>

    </div>


    {{-- ============================================================
         SEMNATURI
    ============================================================= --}}

    <div class="signatures">

        <div class="signature-cell left">

            <div class="signature-title">
                PRESTATOR
            </div>

            <div class="signature-company">
                ELECTRODEP SRL
            </div>

            <div class="signature-space"></div>

            <div class="signature-line"></div>

            <div class="signature-name">

                {{
                    $contract
                        ->provider_signature_name
                    ?: 'Semnatura si stampila'
                }}

            </div>

            @if(
                $contract
                    ->provider_signature_position
            )

                <div class="signature-position">

                    {{
                        $contract
                            ->provider_signature_position
                    }}

                </div>

            @endif

        </div>


        <div class="signature-cell right">

            <div class="signature-title">
                BENEFICIAR
            </div>

            <div class="signature-company">
                {{ $contract->client?->name ?: '-' }}
            </div>

            <div class="signature-space"></div>

            <div class="signature-line"></div>

            <div class="signature-name">

                {{
                    $contract
                        ->client_signature_name
                    ?: 'Semnatura si stampila'
                }}

            </div>

            @if(
                $contract
                    ->client_signature_position
            )

                <div class="signature-position">

                    {{
                        $contract
                            ->client_signature_position
                    }}

                </div>

            @endif

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

            Contract
            {{ $contract->number }}

            &nbsp;•&nbsp;

            {{ $documentDate }}

        </div>

    </div>

</div>

</body>

</html>