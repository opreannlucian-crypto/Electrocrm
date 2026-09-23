<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">

    <title>Cerere de concediu</title>

    <style>
        @page {
            size: A4 portrait;
            margin: 15mm 18mm 15mm 18mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: DejaVu Sans, sans-serif;
            font-size: 10.5px;
            color: #1f2937;
            line-height: 1.5;
        }

        .header {
            border-bottom: 2px solid #111827;
            padding-bottom: 10px;
            margin-bottom: 22px;
        }

        .company {
            font-size: 17px;
            font-weight: bold;
            color: #111827;
        }

        .company-subtitle {
            font-size: 8px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 2px;
        }

        .document-title {
            text-align: center;
            font-size: 19px;
            font-weight: bold;
            color: #111827;
            text-transform: uppercase;
            margin-bottom: 3px;
        }

        .document-subtitle {
            text-align: center;
            font-size: 9px;
            color: #6b7280;
            margin-bottom: 25px;
        }

        .section-title {
            font-size: 10px;
            font-weight: bold;
            color: #111827;
            text-transform: uppercase;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }

        .employee-info {
            margin-bottom: 22px;
            line-height: 1.65;
        }

        .employee-info strong {
            color: #111827;
        }

        .request {
            text-align: justify;
            font-size: 11px;
            line-height: 1.8;
            margin-bottom: 18px;
        }

        .period {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 12px 15px;
            margin: 16px 0 20px 0;
            text-align: center;
        }

        .period strong {
            color: #111827;
        }

        .description {
            border: 1px solid #d1d5db;
            padding: 10px 12px;
            min-height: 55px;
            margin-bottom: 18px;
        }

        .description-empty {
            color: #9ca3af;
            font-style: italic;
        }

        .declaration {
            text-align: justify;
            font-size: 9.5px;
            line-height: 1.6;
            color: #4b5563;
            margin-top: 15px;
        }

        .date {
            margin-top: 22px;
            font-size: 9.5px;
        }

        .signatures {
            width: 100%;
            margin-top: 55px;
        }

        .signature-table {
            width: 100%;
            border-collapse: collapse;
        }

        .signature-table td {
            width: 50%;
            text-align: center;
            vertical-align: top;
        }

        .signature-title {
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 35px;
        }

        .signature-line {
            width: 70%;
            margin: 0 auto 6px auto;
            border-top: 1px solid #111827;
        }

        .signature-name {
            font-size: 8.5px;
            color: #6b7280;
        }

        .footer {
            margin-top: 32px;
            padding-top: 7px;
            border-top: 1px solid #d1d5db;
            text-align: center;
            font-size: 7.5px;
            color: #9ca3af;
        }
    </style>
</head>

<body>

    {{-- HEADER --}}

    <div class="header">

        <div class="company">
            ELECTRODEP
        </div>

        <div class="company-subtitle">
            Document intern - Resurse umane
        </div>

    </div>


    {{-- TITLU --}}

    <div class="document-title">
        Cerere de concediu
    </div>

    <div class="document-subtitle">
        Document pentru evidenta perioadei de concediu
    </div>


    {{-- DATE ANGAJAT --}}

    <div class="section-title">
        Date angajat
    </div>

    <div class="employee-info">

        Nume si prenume:
        <strong>
            {{ $employee->name ?? '-' }}
        </strong>

        <br>

        Functie:
        <strong>
            {{ $employee->position ?? '-' }}
        </strong>

        @if(!empty($employee->department))

            &nbsp;&nbsp;|&nbsp;&nbsp;

            Departament:
            <strong>
                {{ $employee->department }}
            </strong>

        @endif

        @if(!empty($employee->hire_date))

            &nbsp;&nbsp;|&nbsp;&nbsp;

            Data angajarii:
            <strong>
                {{ \Carbon\Carbon::parse($employee->hire_date)->format('d.m.Y') }}
            </strong>

        @endif

    </div>


    {{-- CERERE --}}

    <div class="section-title">
        Cererea angajatului
    </div>

    <div class="request">

        Subsemnatul/Subsemnata
        <strong>{{ $employee->name ?? '-' }}</strong>,
        avand functia de
        <strong>{{ $employee->position ?? '-' }}</strong>,
        va rog sa imi aprobati efectuarea concediului in perioada
        <strong>
            {{ \Carbon\Carbon::parse($periodStart)->format('d.m.Y') }}
        </strong>
        -
        <strong>
            {{ \Carbon\Carbon::parse($periodEnd)->format('d.m.Y') }}
        </strong>,
        reprezentand
        <strong>{{ $days }} zile</strong>
        de concediu.

    </div>


    {{-- PERIOADA --}}

    <div class="period">

        Perioada solicitata:
        <strong>
            {{ \Carbon\Carbon::parse($periodStart)->format('d.m.Y') }}
            -
            {{ \Carbon\Carbon::parse($periodEnd)->format('d.m.Y') }}
        </strong>

        &nbsp;&nbsp;&nbsp;

        Numar zile:
        <strong>
            {{ $days }}
        </strong>

    </div>


    {{-- OBSERVATII --}}

    <div class="section-title">
        Observatii
    </div>

    <div class="description">

        @if(!empty($description))

            {{ $description }}

        @else

            <span class="description-empty">
                Nu au fost adaugate observatii.
            </span>

        @endif

    </div>


    {{-- DECLARATIE --}}

    <div class="declaration">

        Prezenta cerere este intocmita pentru evidenta si aprobarea
        perioadei de concediu mentionate mai sus. Perioada solicitata
        va fi inregistrata in evidenta interna a companiei, conform
        procedurilor aplicabile.

    </div>


    {{-- DATA --}}

    <div class="date">

        Data cererii:
        <strong>
            {{ \Carbon\Carbon::parse($documentDate)->format('d.m.Y') }}
        </strong>

    </div>


    {{-- SEMNATURI --}}

    <div class="signatures">

        <table class="signature-table">

            <tr>

                <td>

                    <div class="signature-title">
                        Angajat
                    </div>

                    <div class="signature-line"></div>

                    <div class="signature-name">
                        {{ $employee->name ?? '-' }}
                    </div>

                </td>

                <td>

                    <div class="signature-title">
                        Aprobat
                    </div>

                    <div class="signature-line"></div>

                    <div class="signature-name">
                        Semnatura si stampila
                    </div>

                </td>

            </tr>

        </table>

    </div>


    {{-- FOOTER --}}

    <div class="footer">

        Cerere de concediu - document generat automat din ElectroCRM

    </div>

</body>
</html>