<?php

namespace App\Exports;

use App\Models\Attendance;
use App\Models\Employee;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;

class AttendanceExport
{
    public static function generate(int $month, int $year, ?string $from = null, ?string $to = null): string
    {
        $startSelection = $from
            ? Carbon::createFromFormat('Y-m-d', $from)->startOfDay()
            : null;

        $endSelection = $startSelection
            ? Carbon::createFromFormat('Y-m-d', $to ?: $from)->startOfDay()
            : null;

        $startDate = $startSelection?->copy()
            ?? Carbon::create($year, $month, 1)->startOfMonth();

        $endDate = $endSelection?->copy()
            ?? $startDate->copy()->endOfMonth();

        /*
        |--------------------------------------------------------------------------
        | Angajați activi
        |--------------------------------------------------------------------------
        */

        $employees = Employee::query()
            ->where('active', true)
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'position',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Pontaje
        |--------------------------------------------------------------------------
        */

        $attendances = Attendance::query()
            ->whereBetween('date', [
                $startDate->toDateString(),
                $endDate->toDateString(),
            ])
            ->get()
            ->groupBy('employee_id');

        /*
        |--------------------------------------------------------------------------
        | Spreadsheet
        |--------------------------------------------------------------------------
        */

        $spreadsheet = new Spreadsheet();

        $sheet = $spreadsheet->getActiveSheet();

        $sheet->setTitle('Pontaj lunar');

        /*
        |--------------------------------------------------------------------------
        | Titlu
        |--------------------------------------------------------------------------
        */

        $sheet->mergeCells('A1:L1');

        $sheet->setCellValue(
            'A1',
            'ELECTRODEP SRL - PONTAJ'
        );

        $sheet->getStyle('A1')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 18,
            ],
            'alignment' => [
                'horizontal' =>
                    Alignment::HORIZONTAL_CENTER,
                'vertical' =>
                    Alignment::VERTICAL_CENTER,
            ],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(30);

        /*
        |--------------------------------------------------------------------------
        | Luna
        |--------------------------------------------------------------------------
        */

        $sheet->mergeCells('A2:L2');

        $sheet->setCellValue(
            'A2',
            $startSelection
                ? ($startSelection->isSameDay($endSelection)
                    ? 'Data: ' . $startSelection->locale('ro')->translatedFormat('d F Y')
                    : 'Perioada: ' . $startSelection->format('d.m.Y') . ' – ' . $endSelection->format('d.m.Y'))
                : 'Luna: ' . $startDate->locale('ro')->translatedFormat('F Y')
        );

        $sheet->getStyle('A2')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 12,
            ],
            'alignment' => [
                'horizontal' =>
                    Alignment::HORIZONTAL_CENTER,
                'vertical' =>
                    Alignment::VERTICAL_CENTER,
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Antet
        |--------------------------------------------------------------------------
        */

        $headers = [
            'Nr.',
            'Data',
            'Zi',
            'Angajat',
            'Funcția',
            'Intrare',
            'Ieșire',
            'Pauză (min)',
            'Ore lucrate',
            'Ore supl.',
            'Status',
            'Observații',
        ];

        $headerRow = 4;

        foreach ($headers as $index => $header) {

            $columnLetter =
                Coordinate::stringFromColumnIndex(
                    $index + 1
                );

            $sheet->setCellValue(
                $columnLetter . $headerRow,
                $header
            );
        }

        $sheet->getStyle(
            "A{$headerRow}:L{$headerRow}"
        )->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => [
                    'rgb' => 'FFFFFF',
                ],
            ],
            'fill' => [
                'fillType' =>
                    Fill::FILL_SOLID,
                'startColor' => [
                    'rgb' => '1E293B',
                ],
            ],
            'alignment' => [
                'horizontal' =>
                    Alignment::HORIZONTAL_CENTER,
                'vertical' =>
                    Alignment::VERTICAL_CENTER,
                'wrapText' => true,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' =>
                        Border::BORDER_THIN,
                    'color' => [
                        'rgb' => 'CBD5E1',
                    ],
                ],
            ],
        ]);

        $sheet->getRowDimension(
            $headerRow
        )->setRowHeight(28);

        /*
        |--------------------------------------------------------------------------
        | Date
        |--------------------------------------------------------------------------
        */

        $row = 5;
        $nr = 1;

        foreach ($employees as $employee) {

            $employeeAttendances =
                $attendances
                    ->get(
                        $employee->id,
                        collect()
                    )
                    ->keyBy(function ($attendance) {

                        return Carbon::parse(
                            $attendance->date
                        )->toDateString();
                    });

            $totalWorkedHours = 0;
            $totalOvertime = 0;
            $totalDaysWorked = 0;

            $currentDate =
                $startDate->copy();

            while ($currentDate->lte($endDate)) {

                $dateKey =
                    $currentDate->toDateString();

                $attendance =
                    $employeeAttendances->get(
                        $dateKey
                    );

                $workedHours =
                    $attendance
                        ? (float) $attendance->worked_hours
                        : 0;

                $overtime = max(
                    0,
                    $workedHours - 8
                );

                if (
                    $attendance &&
                    $attendance->status === 'prezent' &&
                    $workedHours > 0
                ) {
                    $totalDaysWorked++;
                }

                $totalWorkedHours +=
                    $workedHours;

                $totalOvertime +=
                    $overtime;

                /*
                |--------------------------------------------------------------------------
                | Nr.
                |--------------------------------------------------------------------------
                */

                $sheet->setCellValue(
                    "A{$row}",
                    $nr
                );

                /*
                |--------------------------------------------------------------------------
                | Data
                |--------------------------------------------------------------------------
                */

                $sheet->setCellValue(
                    "B{$row}",
                    $currentDate->format('d.m.Y')
                );

                /*
                |--------------------------------------------------------------------------
                | Zi
                |--------------------------------------------------------------------------
                */

                $sheet->setCellValue(
                    "C{$row}",
                    $currentDate
                        ->locale('ro')
                        ->dayName
                );

                /*
                |--------------------------------------------------------------------------
                | Angajat
                |--------------------------------------------------------------------------
                */

                $sheet->setCellValue(
                    "D{$row}",
                    $employee->name
                );

                /*
                |--------------------------------------------------------------------------
                | Funcția
                |--------------------------------------------------------------------------
                */

                $sheet->setCellValue(
                    "E{$row}",
                    $employee->position ?? ''
                );

                /*
                |--------------------------------------------------------------------------
                | Intrare
                |--------------------------------------------------------------------------
                */

                $sheet->setCellValue(
                    "F{$row}",
                    $attendance?->check_in
                        ? substr(
                            $attendance->check_in,
                            0,
                            5
                        )
                        : ''
                );

                /*
                |--------------------------------------------------------------------------
                | Ieșire
                |--------------------------------------------------------------------------
                */

                $sheet->setCellValue(
                    "G{$row}",
                    $attendance?->check_out
                        ? substr(
                            $attendance->check_out,
                            0,
                            5
                        )
                        : ''
                );

                /*
                |--------------------------------------------------------------------------
                | Pauză
                |--------------------------------------------------------------------------
                */

                $sheet->setCellValue(
                    "H{$row}",
                    $attendance
                        ? (int) $attendance->break_minutes
                        : ''
                );

                /*
                |--------------------------------------------------------------------------
                | Ore lucrate
                |--------------------------------------------------------------------------
                */

                if ($attendance) {

                    $sheet->setCellValue(
                        "I{$row}",
                        round(
                            $workedHours,
                            2
                        )
                    );

                } else {

                    $sheet->setCellValue(
                        "I{$row}",
                        ''
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Ore suplimentare
                |--------------------------------------------------------------------------
                */

                if ($attendance) {

                    $sheet->setCellValue(
                        "J{$row}",
                        round(
                            $overtime,
                            2
                        )
                    );

                } else {

                    $sheet->setCellValue(
                        "J{$row}",
                        ''
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Status
                |--------------------------------------------------------------------------
                */

                $statusLabel = '';

                if ($attendance) {

                    $statusLabel = match (
                        $attendance->status
                    ) {

                        'prezent' =>
                            'Prezent',

                        'absent' =>
                            'Absent',

                        'concediu' =>
                            'Concediu',

                        'medical' =>
                            'Medical',

                        'liber' =>
                            'Liber',

                        default =>
                            $attendance->status,
                    };
                }

                $sheet->setCellValue(
                    "K{$row}",
                    $statusLabel
                );

                /*
                |--------------------------------------------------------------------------
                | Observații
                |--------------------------------------------------------------------------
                */

                $sheet->setCellValue(
                    "L{$row}",
                    $attendance?->notes ?? ''
                );

                /*
                |--------------------------------------------------------------------------
                | Evidențiere weekend
                |--------------------------------------------------------------------------
                */

                if ($currentDate->isWeekend()) {

                    $sheet->getStyle(
                        "A{$row}:L{$row}"
                    )->applyFromArray([
                        'fill' => [
                            'fillType' =>
                                Fill::FILL_SOLID,
                            'startColor' => [
                                'rgb' => 'FEF2F2',
                            ],
                        ],
                        'font' => [
                            'color' => [
                                'rgb' => '991B1B',
                            ],
                        ],
                    ]);
                }

                $row++;
                $nr++;

                $currentDate->addDay();
            }

            /*
            |--------------------------------------------------------------------------
            | Rezumat angajat
            |--------------------------------------------------------------------------
            */

            $sheet->mergeCells(
                "A{$row}:C{$row}"
            );

            $sheet->setCellValue(
                "A{$row}",
                'REZUMAT: ' . $employee->name
            );

            $sheet->setCellValue(
                "D{$row}",
                'Zile lucrate'
            );

            $sheet->setCellValue(
                "E{$row}",
                $totalDaysWorked
            );

            $sheet->setCellValue(
                "F{$row}",
                'Ore lucrate'
            );

            $sheet->setCellValue(
                "G{$row}",
                round(
                    $totalWorkedHours,
                    2
                )
            );

            $sheet->setCellValue(
                "H{$row}",
                'Ore supl.'
            );

            $sheet->setCellValue(
                "I{$row}",
                round(
                    $totalOvertime,
                    2
                )
            );

            $sheet->setCellValue(
                "J{$row}",
                'Luna'
            );

            $sheet->setCellValue(
                "K{$row}",
                $startDate
                    ->locale('ro')
                    ->translatedFormat('F Y')
            );

            $sheet->getStyle(
                "A{$row}:L{$row}"
            )->applyFromArray([
                'font' => [
                    'bold' => true,
                    'color' => [
                        'rgb' => '0F172A',
                    ],
                ],
                'fill' => [
                    'fillType' =>
                        Fill::FILL_SOLID,
                    'startColor' => [
                        'rgb' => 'E2E8F0',
                    ],
                ],
                'alignment' => [
                    'vertical' =>
                        Alignment::VERTICAL_CENTER,
                ],
                'borders' => [
                    'top' => [
                        'borderStyle' =>
                            Border::BORDER_MEDIUM,
                        'color' => [
                            'rgb' => '64748B',
                        ],
                    ],
                    'bottom' => [
                        'borderStyle' =>
                            Border::BORDER_THIN,
                        'color' => [
                            'rgb' => 'CBD5E1',
                        ],
                    ],
                ],
            ]);

            $sheet->getRowDimension(
                $row
            )->setRowHeight(24);

            /*
            |--------------------------------------------------------------------------
            | Spațiu între angajați
            |--------------------------------------------------------------------------
            */

            $row += 2;
        }

        /*
        |--------------------------------------------------------------------------
        | Stil general
        |--------------------------------------------------------------------------
        */

        $lastRow = max(
            4,
            $row - 1
        );

        $sheet->getStyle(
            "A4:L{$lastRow}"
        )->getAlignment()
            ->setVertical(
                Alignment::VERTICAL_CENTER
            );

        $sheet->getStyle(
            "A4:L{$lastRow}"
        )->getAlignment()
            ->setWrapText(true);

        /*
        |--------------------------------------------------------------------------
        | Borduri tabel
        |--------------------------------------------------------------------------
        */

        $sheet->getStyle(
            "A4:L{$lastRow}"
        )->getBorders()
            ->getAllBorders()
            ->setBorderStyle(
                Border::BORDER_THIN
            );

        /*
        |--------------------------------------------------------------------------
        | Aliniere coloane
        |--------------------------------------------------------------------------
        */

        $sheet->getStyle(
            "A5:C{$lastRow}"
        )->getAlignment()
            ->setHorizontal(
                Alignment::HORIZONTAL_CENTER
            );

        $sheet->getStyle(
            "F5:K{$lastRow}"
        )->getAlignment()
            ->setHorizontal(
                Alignment::HORIZONTAL_CENTER
            );

        /*
        |--------------------------------------------------------------------------
        | Lățimi
        |--------------------------------------------------------------------------
        */

        $widths = [

            'A' => 7,

            'B' => 12,

            'C' => 14,

            'D' => 28,

            'E' => 28,

            'F' => 10,

            'G' => 10,

            'H' => 13,

            'I' => 13,

            'J' => 11,

            'K' => 14,

            'L' => 35,
        ];

        foreach ($widths as $column => $width) {

            $sheet
                ->getColumnDimension($column)
                ->setWidth($width);
        }

        /*
        |--------------------------------------------------------------------------
        | Printare
        |--------------------------------------------------------------------------
        */

        $sheet->freezePane('A5');

        $sheet->setAutoFilter(
            "A4:L4"
        );

        $sheet->getPageSetup()
            ->setOrientation(
                PageSetup::ORIENTATION_LANDSCAPE
            );

        $sheet->getPageSetup()
            ->setPaperSize(
                PageSetup::PAPERSIZE_A4
            );

        $sheet->getPageSetup()
            ->setFitToWidth(1);

        $sheet->getPageSetup()
            ->setFitToHeight(0);

        $sheet->getPageMargins()
            ->setTop(0.4);

        $sheet->getPageMargins()
            ->setRight(0.3);

        $sheet->getPageMargins()
            ->setBottom(0.4);

        $sheet->getPageMargins()
            ->setLeft(0.3);

        /*
        |--------------------------------------------------------------------------
        | Header / Footer pentru print
        |--------------------------------------------------------------------------
        */

        $sheet->getHeaderFooter()
            ->setOddHeader(
                '&CELECTRODEP SRL - PONTAJ'
            );

        $sheet->getHeaderFooter()
            ->setOddFooter(
                '&LPagina &P din &N'
            );

        /*
        |--------------------------------------------------------------------------
        | Fișier temporar
        |--------------------------------------------------------------------------
        */

        $filename = 'pontaj_' . (
            $startSelection
                ? ($startSelection->isSameDay($endSelection)
                    ? $startSelection->format('Y-m-d')
                    : $startSelection->format('Y-m-d') . '_pana_la_' . $endSelection->format('Y-m-d'))
                : $year . '_' . str_pad($month, 2, '0', STR_PAD_LEFT)
        ) . '.xlsx';

        $path =
            storage_path(
                'app/' . $filename
            );

        /*
        |--------------------------------------------------------------------------
        | Salvare
        |--------------------------------------------------------------------------
        */

        $writer =
            new Xlsx(
                $spreadsheet
            );

        $writer->save(
            $path
        );

        /*
        |--------------------------------------------------------------------------
        | Eliberare memorie
        |--------------------------------------------------------------------------
        */

        $spreadsheet->disconnectWorksheets();

        unset($spreadsheet);

        return $path;
    }
}
