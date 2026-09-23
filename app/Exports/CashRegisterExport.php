<?php

namespace App\Exports;

use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class CashRegisterExport
{
    public static function generate(array $report): string
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Registru de casă');
        $filters = $report['filters'];
        $summary = $report['summary'];
        $transactions = $report['transactions'];

        foreach (['A' => 14, 'B' => 24, 'C' => 42, 'D' => 16, 'E' => 16, 'F' => 16] as $column => $width) $sheet->getColumnDimension($column)->setWidth($width);
        $sheet->mergeCells('A1:F1');
        $sheet->setCellValue('A1', 'REGISTRU DE CASĂ – ÎNCASĂRI ȘI PLĂȚI');
        $sheet->getStyle('A1:F1')->applyFromArray(['font' => ['bold' => true, 'size' => 15, 'color' => ['rgb' => 'FFFFFF']], 'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '135B44']], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]]);
        $sheet->getRowDimension(1)->setRowHeight(26);
        $sheet->mergeCells('A2:F2');
        $sheet->setCellValue('A2', sprintf('Perioada: %s – %s', Carbon::parse($filters['date_from'])->format('d.m.Y'), Carbon::parse($filters['date_to'])->format('d.m.Y')));
        $sheet->getStyle('A2:F2')->getFont()->setItalic(true);

        $summaryRows = [['Sold inițial', $summary['opening_balance']], ['Total încasări', $summary['cash_in']], ['Total plăți', $summary['cash_out']], ['Sold final', $summary['closing_balance']]];
        foreach ($summaryRows as $index => [$label, $value]) {
            $row = $index + 4;
            $sheet->setCellValue("A{$row}", $label);
            $sheet->setCellValue("B{$row}", $value);
            $sheet->getStyle("A{$row}")->getFont()->setBold(true);
        }
        $sheet->getStyle('B4:B7')->getNumberFormat()->setFormatCode('#,##0.00;(#,##0.00);-');
        $sheet->getStyle('A7:B7')->getFont()->setBold(true);
        $sheet->getStyle('A4:B7')->getBorders()->getBottom()->setBorderStyle(Border::BORDER_THIN);

        $headerRow = 10;
        $sheet->fromArray(['Data', 'Operațiune', 'Document / partener', 'Încasări (RON)', 'Plăți (RON)', 'Sold (RON)'], null, "A{$headerRow}");
        $sheet->getStyle("A{$headerRow}:F{$headerRow}")->applyFromArray(['font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']], 'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '135B44']], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'wrapText' => true]]);

        $row = $headerRow + 1;
        foreach ($transactions as $transaction) {
            $sheet->setCellValue("A{$row}", Carbon::parse($transaction['date'])->format('d.m.Y'));
            $sheet->setCellValue("B{$row}", $transaction['type']);
            $sheet->setCellValue("C{$row}", trim($transaction['document'] . ' – ' . $transaction['partner'] . ($transaction['description'] ? ' (' . $transaction['description'] . ')' : '')));
            $sheet->setCellValue("D{$row}", $transaction['in']);
            $sheet->setCellValue("E{$row}", $transaction['out']);
            $sheet->setCellValue("F{$row}", $row === $headerRow + 1 ? '=B4+D' . $row . '-E' . $row : '=F' . ($row - 1) . '+D' . $row . '-E' . $row);
            $row++;
        }
        $lastRow = max($headerRow, $row - 1);
        $sheet->getStyle("A{$headerRow}:F{$lastRow}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
        if ($row > $headerRow + 1) {
            $sheet->getStyle("D" . ($headerRow + 1) . ":F{$lastRow}")->getNumberFormat()->setFormatCode('#,##0.00;(#,##0.00);-');
            $sheet->getStyle("D" . ($headerRow + 1) . ":F{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        }
        $sheet->freezePane('A11');
        $sheet->setAutoFilter("A{$headerRow}:F{$lastRow}");
        $sheet->getPageSetup()->setOrientation('landscape')->setFitToWidth(1)->setFitToHeight(0);

        $filename = sprintf('registru_casa_%s_%s.xlsx', $filters['date_from'], $filters['date_to']);
        $path = storage_path('app/' . $filename);
        (new Xlsx($spreadsheet))->save($path);
        $spreadsheet->disconnectWorksheets();
        return $path;
    }
}
