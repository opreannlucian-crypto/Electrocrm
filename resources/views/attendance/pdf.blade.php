<!DOCTYPE html>
<html lang="ro">

<head>

    <meta charset="UTF-8">

    <title>
        Pontaj {{ $monthName }}
    </title>

    <style>

        @page {
            size: A4 landscape;
            margin: 12mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 8px;
            color: #1e293b;
        }

        .header {
            text-align: center;
            margin-bottom: 15px;
        }

        .company {
            font-size: 20px;
            font-weight: bold;
            letter-spacing: 1px;
        }

        .title {
            font-size: 14px;
            font-weight: bold;
            margin-top: 5px;
        }

        .subtitle {
            font-size: 10px;
            color: #64748b;
            margin-top: 3px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
        }

        th {
            background: #1e293b;
            color: white;
            padding: 5px 3px;
            border: 1px solid #334155;
            text-align: center;
            font-size: 7px;
        }

        td {
            border: 1px solid #cbd5e1;
            padding: 4px 3px;
            vertical-align: middle;
        }

        .center {
            text-align: center;
        }

        .weekend {
            background: #f1f5f9;
            color: #64748b;
        }

        .summary {
            background: #e2e8f0;
            font-weight: bold;
        }

        .summary td {
            padding: 6px 4px;
        }

        .employee-name {
            font-weight: bold;
            color: #0f172a;
        }

        .footer {
            margin-top: 20px;
            font-size: 8px;
            color: #64748b;
        }

    </style>

</head>

<body>

<div class="header">

    <div class="company">
        ELECTRODEP SRL
    </div>

    <div class="title">
        PONTAJ
    </div>

    <div class="subtitle">
        {{ $monthName }}
    </div>

</div>

@foreach ($rows as $row)

    <table>

        <thead>

            <tr>

                <th style="width: 20%;">
                    Angajat
                </th>

                <th style="width: 14%;">
                    Funcția
                </th>

                <th style="width: 9%;">
                    Data
                </th>

                <th style="width: 9%;">
                    Zi
                </th>

                <th style="width: 7%;">
                    Intrare
                </th>

                <th style="width: 7%;">
                    Ieșire
                </th>

                <th style="width: 7%;">
                    Pauză
                </th>

                <th style="width: 7%;">
                    Ore
                </th>

                <th style="width: 7%;">
                    Supl.
                </th>

                <th style="width: 8%;">
                    Status
                </th>

                <th>
                    Observații
                </th>

            </tr>

        </thead>

        <tbody>

        @foreach ($days as $day)

            @php
                $attendance = $row['attendances']->get(
                    $day['date']
                );

                $workedHours = $attendance
                    ? (float) $attendance['worked_hours']
                    : 0;

                $overtime = max(
                    0,
                    $workedHours - 8
                );
            @endphp

            <tr class="{{ $day['is_weekend'] ? 'weekend' : '' }}">

                <td class="employee-name">
                    {{ $row['employee']['name'] }}
                </td>

                <td>
                    {{ $row['employee']['position'] ?? '' }}
                </td>

                <td class="center">
                    {{ \Carbon\Carbon::parse($day['date'])->format('d.m.Y') }}
                </td>

                <td class="center">
                    {{ ucfirst($day['weekday']) }}
                </td>

                <td class="center">
                    {{ $attendance['check_in'] ?? '' }}
                </td>

                <td class="center">
                    {{ $attendance['check_out'] ?? '' }}
                </td>

                <td class="center">
                    {{ $attendance['break_minutes'] ?? '' }}
                </td>

                <td class="center">
                    {{ $attendance ? number_format($workedHours, 2, ',', '') : '' }}
                </td>

                <td class="center">
                    {{ $attendance ? number_format($overtime, 2, ',', '') : '' }}
                </td>

                <td class="center">
                    {{ $attendance['status'] ?? '' }}
                </td>

                <td>
                    {{ $attendance['notes'] ?? '' }}
                </td>

            </tr>

        @endforeach

            <tr class="summary">

                <td colspan="6">
                    REZUMAT PERIOADĂ
                </td>

                <td class="center">
                    Zile:
                    {{ $row['total_days_worked'] }}
                </td>

                <td class="center">
                    Ore:
                    {{ number_format($row['total_worked_hours'], 2, ',', '') }}
                </td>

                <td class="center">
                    Supl.:
                    {{ number_format($row['total_overtime'], 2, ',', '') }}
                </td>

                <td colspan="2">
                    Angajat:
                    {{ $row['employee']['name'] }}
                </td>

            </tr>

        </tbody>

    </table>

@endforeach

<div class="footer">

    Document generat automat din ElectroCRM.

    <span style="float: right;">
        ELECTRODEP SRL
    </span>

</div>

</body>

</html>
