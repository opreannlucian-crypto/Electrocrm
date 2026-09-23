<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">

    <title>
        Cerere demisie / incetare
    </title>

    <style>
        @page {
            size: A4 portrait;
            margin: 20mm 20mm 18mm 20mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            line-height: 1.55;
            color: #111827;
        }

        .document {
            width: 100%;
        }

        .header {
            text-align: center;
            margin-bottom: 28px;
        }

        .title {
            margin: 0;
            font-size: 19px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        .subtitle {
            margin-top: 6px;
            font-size: 11px;
            color: #6b7280;
        }

        .recipient {
            margin-bottom: 24px;
            line-height: 1.7;
        }

        .recipient strong {
            font-weight: bold;
        }

        .subject {
            margin-bottom: 22px;
            font-weight: bold;
        }

        .content {
            text-align: justify;
            line-height: 1.75;
        }

        .content p {
            margin: 0 0 13px 0;
        }

        .employee-name {
            font-weight: bold;
        }

        .important {
            font-weight: bold;
        }

        .details {
            margin: 18px 0;
            padding: 13px 16px;
            border-left: 3px solid #2563eb;
            background: #f8fafc;
        }

        .details p {
            margin: 5px 0;
        }

        .signature-area {
            margin-top: 55px;
            width: 100%;
        }

        .signature-left {
            width: 48%;
            float: left;
        }

        .signature-right {
            width: 48%;
            float: right;
            text-align: right;
        }

        .signature-title {
            font-weight: bold;
            margin-bottom: 32px;
        }

        .signature-line {
            display: inline-block;
            width: 180px;
            border-bottom: 1px solid #111827;
            height: 18px;
        }

        .footer {
            clear: both;
            margin-top: 65px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 9px;
            color: #9ca3af;
        }
    </style>
</head>

<body>

<div class="document">

    <div class="header">
        <h1 class="title">
            Cerere de demisie / incetare
        </h1>

        <div class="subtitle">
            Document intern
        </div>
    </div>

    <div class="recipient">
        <strong>Catre:</strong><br>
        Angajator
    </div>

    <div class="subject">
        Subiect: {{ $terminationLabel ?? 'Incetare raport de munca' }}
    </div>

    <div class="content">

        <p>
            Subsemnatul(a),
            <span class="employee-name">
                {{ $employee->name ?? '-' }}
            </span>,
            angajat(a) in cadrul societatii, in functia de
            <span class="important">
                {{ $employee->position ?? '-' }}
            </span>,
            va adresez prezenta cerere prin care va informez cu privire la
            incetarea raporturilor de munca.
        </p>

        <div class="details">

            <p>
                <strong>Tipul incetarii:</strong>
                {{ $terminationLabel ?? '-' }}
            </p>

            <p>
                <strong>Data cererii:</strong>
                {{ \Carbon\Carbon::parse($documentDate)->format('d.m.Y') }}
            </p>

            <p>
                <strong>Data incetarii:</strong>
                {{ \Carbon\Carbon::parse($terminationDate)->format('d.m.Y') }}
            </p>

            @if(!empty($noticeDays))
                <p>
                    <strong>Preaviz:</strong>
                    {{ $noticeDays }}
                    {{ ((int) $noticeDays === 1) ? 'zi' : 'zile' }}
                </p>
            @endif

        </div>

        @if(($terminationType ?? '') === 'demisie')

            <p>
                Prin prezenta, va notific demisia mea, cu respectarea
                prevederilor legale aplicabile si, dupa caz, a termenului
                de preaviz stabilit prin contractul individual de munca.
            </p>

        @elseif(($terminationType ?? '') === 'incetare_acordul_partilor')

            <p>
                Prin prezenta, solicit incetarea raporturilor de munca
                prin acordul partilor, la data mentionata mai sus, in
                conditiile stabilite de comun acord cu angajatorul.
            </p>

        @elseif(($terminationType ?? '') === 'incetare_angajator')

            <p>
                Prezenta cerere consemneaza incetarea raporturilor de munca
                la data mentionata mai sus, conform situatiei si
                documentelor aferente incetarii contractului individual
                de munca.
            </p>

        @else

            <p>
                Solicit incetarea raporturilor de munca la data mentionata
                in prezenta cerere, conform conditiilor stabilite intre
                parti si prevederilor legale aplicabile.
            </p>

        @endif

        @if(!empty($description))

            <p>
                <strong>Observatii:</strong>
            </p>

            <p>
                {!! nl2br(e($description)) !!}
            </p>

        @endif

        <p>
            Va rog sa luati act de prezenta cerere si sa dispuneti
            efectuarea formalitatilor necesare privind incetarea
            raporturilor de munca.
        </p>

        <p>
            Va multumesc.
        </p>

    </div>

    <div class="signature-area">

        <div class="signature-left">
            <div class="signature-title">
                Angajat,
            </div>

            {{ $employee->name ?? '-' }}

            <br><br>

            Semnatura:
            <span class="signature-line"></span>
        </div>

        <div class="signature-right">
            <div class="signature-title">
                Angajator,
            </div>

            <br>

            Semnatura si stampila:
            <span class="signature-line"></span>
        </div>

    </div>

    <div class="footer">
        Document generat automat din ElectroCRM
    </div>

</div>

</body>
</html>