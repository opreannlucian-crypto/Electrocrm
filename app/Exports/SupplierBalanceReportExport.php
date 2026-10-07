<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class SupplierBalanceReportExport
{
    /** @param Collection<int, array<string, mixed>> $suppliers */
    public static function generate(Collection $suppliers, array $totals): string
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Sold furnizori');
        $sheet->mergeCells('A1:F1');
        $sheet->setCellValue('A1', 'ElectroCRM - Raport sold furnizori');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16)->getColor()->setRGB('0F3D56');
        $sheet->mergeCells('A2:F2');
        $sheet->setCellValue('A2', 'Generat la: ' . now()->format('d.m.Y H:i'));
        $sheet->getStyle('A2')->getFont()->setItalic(true)->getColor()->setRGB('64748B');

        $sheet->fromArray(['Furnizor', 'CUI', 'Recepții', 'Total recepționat', 'Total plătit', 'Sold de plată'], null, 'A4');
        $sheet->getStyle('A4:F4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1769D1']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'CBD5E1']]],
        ]);

        $row = 5;
        foreach ($suppliers as $supplier) {
            $sheet->fromArray([
                $supplier['name'],
                $supplier['cui'] ?: '—',
                $supplier['receptions_count'],
                $supplier['received_total'],
                $supplier['paid_total'],
                $supplier['balance'],
            ], null, "A{$row}");
            $row++;
        }

        $totalRow = $row;
        $sheet->setCellValue("A{$totalRow}", 'TOTAL');
        $sheet->setCellValue("D{$totalRow}", $totals['received_total']);
        $sheet->setCellValue("E{$totalRow}", $totals['paid_total']);
        $sheet->setCellValue("F{$totalRow}", $totals['balance']);
        $sheet->getStyle("A{$totalRow}:F{$totalRow}")->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'EAF1FF']],
        ]);

        $lastRow = max(4, $totalRow);
        $sheet->getStyle("A4:F{$lastRow}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
        $sheet->getStyle("C5:F{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle("D5:F{$lastRow}")->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_NUMBER_00);
        foreach (['A' => 36, 'B' => 18, 'C' => 12, 'D' => 21, 'E' => 18, 'F' => 18] as $column => $width) {
            $sheet->getColumnDimension($column)->setWidth($width);
        }
        $sheet->freezePane('A5');
        $sheet->setAutoFilter("A4:F{$lastRow}");
        $sheet->getPageSetup()->setOrientation('landscape')->setFitToWidth(1)->setFitToHeight(0);
        $sheet->getHeaderFooter()->setOddFooter('&LElectroCRM · Raport sold furnizori&RPagina &P din &N');

        $path = storage_path('app/raport_sold_furnizori_' . now()->format('Ymd_His') . '.xlsx');
        (new Xlsx($spreadsheet))->save($path);
        $spreadsheet->disconnectWorksheets();

        return $path;
    }
}
