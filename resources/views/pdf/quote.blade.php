<!DOCTYPE html>
<html lang="ro">

<head>

    <meta charset="UTF-8">

    <style>

        @page {
            margin: 35px 40px;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            color: #1f2937;
        }

        .header {
            width: 100%;
            border-bottom: 3px solid #0f62fe;
            padding-bottom: 15px;
            margin-bottom: 25px;
        }

        .company {
            width: 55%;
        }

        .document {
            width: 45%;
            text-align: right;
        }

        .company-name {
            font-size: 20px;
            font-weight: bold;
            color: #0f62fe;
        }

        .company-info {
            margin-top: 5px;
            color: #555;
            line-height: 1.5;
        }

        .document-title {
            font-size: 22px;
            font-weight: bold;
            color: #111827;
        }

        .document-number {
            margin-top: 5px;
            font-size: 12px;
            font-weight: bold;
        }

        .section {
            background: #0f62fe;
            color: white;
            padding: 8px 10px;
            font-size: 11px;
            font-weight: bold;
            margin-top: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        .info-table td {
            border: 1px solid #d1d5db;
            padding: 7px;
            vertical-align: top;
        }

        .label {
            width: 25%;
            background: #f3f4f6;
            font-weight: bold;
        }

        .items {
            margin-top: 0;
        }

        .items th {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 7px;
            text-align: left;
            font-weight: bold;
        }

        .items td {
            border: 1px solid #d1d5db;
            padding: 7px;
        }

        .right {
            text-align: right;
        }

        .center {
            text-align: center;
        }

        .material {
            background: #eff6ff;
        }

        .labor {
            background: #fff7ed;
        }

        .totals {
            margin-top: 20px;
        }

        .totals-table {
            width: 45%;
            margin-left: auto;
        }

        .totals-table td {
            padding: 6px;
        }

        .total-final {
            border-top: 2px solid #0f62fe;
            font-size: 14px;
            font-weight: bold;
            padding-top: 10px !important;
        }

        .notes {
            border: 1px solid #d1d5db;
            padding: 10px;
            min-height: 60px;
        }

        .signatures {
            margin-top: 65px;
        }

        .signatures td {
            width: 50%;
            text-align: center;
            border: none;
            padding: 10px;
        }

        .footer {
            margin-top: 35px;
            padding-top: 10px;
            border-top: 1px solid #d1d5db;
            text-align: center;
            color: #777;
            font-size: 8px;
        }

    </style>

</head>

<body>

    {{-- HEADER --}}

    <table class="header">

        <tr>

            <td class="company" style="border: none;">

                <div class="company-name">
                    ELECTRODEP SRL
                </div>

                <div class="company-info">
                    Str. Alexe Turcas, nr. 21<br>
                    Vintu de Jos, jud. Alba
                </div>

            </td>

            <td class="document" style="border: none;">

                <div class="document-title">
                    DEVIZ / OFERTĂ
                </div>

                <div class="document-number">
                    {{ $quote->number }}
                </div>

                <div style="margin-top: 5px;">
                    Data:
                    {{ $quote->date?->format('d.m.Y') }}
                </div>

            </td>

        </tr>

    </table>


    {{-- CLIENT --}}

    <div class="section">
        CLIENT
    </div>

    <table class="info-table">

        <tr>

            <td class="label">
                Nume
            </td>

            <td>
                {{ $quote->client->name ?? '-' }}
            </td>

        </tr>

        <tr>

            <td class="label">
                Telefon
            </td>

            <td>
                {{ $quote->client->phone ?? '-' }}
            </td>

        </tr>

        <tr>

            <td class="label">
                Email
            </td>

            <td>
                {{ $quote->client->email ?? '-' }}
            </td>

        </tr>

        <tr>

            <td class="label">
                Adresă lucrare
            </td>

            <td>
                {{ $quote->workOrder->address ?? '-' }}
            </td>

        </tr>

    </table>


    {{-- LUCRARE --}}

    <div class="section">
        DATE LUCRARE
    </div>

    <table class="info-table">

        <tr>

            <td class="label">
                Număr lucrare
            </td>

            <td>
                {{ $quote->workOrder->number ?? '-' }}
            </td>

        </tr>

        <tr>

            <td class="label">
                Tip lucrare
            </td>

            <td>
                {{ $quote->workOrder->type ?? '-' }}
            </td>

        </tr>

        <tr>

            <td class="label">
                Tehnician
            </td>

            <td>
                {{ $quote->workOrder->employee->name ?? '-' }}
            </td>

        </tr>

    </table>


    {{-- POZIȚII --}}

    <div class="section">
        MATERIALE ȘI MANOPERĂ
    </div>

    <table class="items">

        <thead>

            <tr>

                <th style="width: 5%;">
                    Nr.
                </th>

                <th style="width: 43%;">
                    Denumire
                </th>

                <th style="width: 10%;" class="center">
                    UM
                </th>

                <th style="width: 10%;" class="right">
                    Cant.
                </th>

                <th style="width: 15%;" class="right">
                    Preț
                </th>

                <th style="width: 17%;" class="right">
                    Total
                </th>

            </tr>

        </thead>

        <tbody>

            @php
                $position = 1;
            @endphp

            @foreach($materials as $item)

                <tr class="material">

                    <td>
                        {{ $position++ }}
                    </td>

                    <td>
                        {{ $item->name }}
                    </td>

                    <td class="center">
                        {{ $item->unit }}
                    </td>

                    <td class="right">
                        {{ number_format($item->quantity, 2, ',', '.') }}
                    </td>

                    <td class="right">
                        {{ number_format($item->unit_price, 2, ',', '.') }}
                        lei
                    </td>

                    <td class="right">
                        {{ number_format($itemTotal($item), 2, ',', '.') }}
                        lei
                    </td>

                </tr>

            @endforeach


            @foreach($labor as $item)

                <tr class="labor">

                    <td>
                        {{ $position++ }}
                    </td>

                    <td>
                        {{ $item->name }}
                    </td>

                    <td class="center">
                        {{ $item->unit }}
                    </td>

                    <td class="right">
                        {{ number_format($item->quantity, 2, ',', '.') }}
                    </td>

                    <td class="right">
                        {{ number_format($item->unit_price, 2, ',', '.') }}
                        lei
                    </td>

                    <td class="right">
                        {{ number_format($itemTotal($item), 2, ',', '.') }}
                        lei
                    </td>

                </tr>

            @endforeach

        </tbody>

    </table>


    {{-- TOTALURI --}}

    <div class="totals">

        <table class="totals-table">

            <tr>

                <td>
                    Materiale
                </td>

                <td class="right">
                    {{ number_format($materialsTotal, 2, ',', '.') }}
                    lei
                </td>

            </tr>

            <tr>

                <td>
                    Manoperă
                </td>

                <td class="right">
                    {{ number_format($laborTotal, 2, ',', '.') }}
                    lei
                </td>

            </tr>

            <tr>

                <td>
                    Subtotal
                </td>

                <td class="right">
                    {{ number_format($subtotal, 2, ',', '.') }}
                    lei
                </td>

            </tr>

            <tr>

                <td>
                    Discount
                    ({{ number_format($quote->discount ?? 0, 2, ',', '.') }}%)
                </td>

                <td class="right">
                    -
                    {{ number_format($discountValue, 2, ',', '.') }}
                    lei
                </td>

            </tr>

            <tr>

                <td>
                    Bază TVA
                </td>

                <td class="right">
                    {{ number_format($afterDiscount, 2, ',', '.') }}
                    lei
                </td>

            </tr>

            <tr>

                <td>
                    TVA
                    ({{ number_format($vatRate, 2, ',', '.') }}%)
                </td>

                <td class="right">
                    {{ number_format($vat, 2, ',', '.') }}
                    lei
                </td>

            </tr>

            <tr>

                <td class="total-final">
                    TOTAL
                </td>

                <td class="right total-final">
                    {{ number_format($total, 2, ',', '.') }}
                    lei
                </td>

            </tr>

        </table>

    </div>


    {{-- OBSERVAȚII --}}

    @if($quote->notes)

        <div class="section">
            OBSERVAȚII / CONDIȚII
        </div>

        <div class="notes">
            {!! nl2br(e($quote->notes)) !!}
        </div>

    @endif


    {{-- SEMNĂTURI --}}

    <table class="signatures">

        <tr>

            <td>

                __________________________

                <br><br>

                Semnătura reprezentantului

            </td>

            <td>

                __________________________

                <br><br>

                Semnătura clientului

            </td>

        </tr>

    </table>


    <div class="footer">

        Deviz generat automat din ElectroCRM

    </div>

</body>

</html>