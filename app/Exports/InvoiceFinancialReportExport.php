<?php

namespace App\Exports;

use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Comment;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class InvoiceFinancialReportExport
{
    /**
     * @param array<string, mixed> $report
     */
    public static function generate(array $report): string
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Raport facturi');

        $filters = $report['filters'];
        $rows = $report['rows'];
        $sourceComment = sprintf(
            'Sursă: baza de date ElectroCRM, modul Facturi. Perioada extrasă: %s – %s.',
            Carbon::parse($filters['date_from'])->format('d.m.Y'),
            Carbon::parse($filters['date_to'])->format('d.m.Y')
        );

        $sheet->getColumnDimension('A')->setWidth(20);
        $sheet->getColumnDimension('B')->setWidth(20);

        $sheet->mergeCells('C3:O3');
        $sheet->setCellValue('C3', 'RAPORT FACTURI ȘI ÎNCASĂRI');
        $sheet->getStyle('C3:O3')->applyFromArray([
            'font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '135B44']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(3)->setRowHeight(25);

        $sheet->mergeCells('C5:O5');
        $sheet->setCellValue(
            'C5',
            sprintf('Perioada raportată: %s – %s', Carbon::parse($filters['date_from'])->format('d.m.Y'), Carbon::parse($filters['date_to'])->format('d.m.Y'))
        );
        $sheet->getStyle('C5:O5')->getFont()->setBold(true)->setSize(11);
        $sheet->setCellValue('C6', 'Valori în RON; facturile ciornă și anulate sunt excluse din indicatorii financiari.');
        $sheet->getStyle('C6')->getFont()->setItalic(true);

        $sheet->mergeCells('C8:F8');
        $sheet->setCellValue('C8', 'REZUMAT FINANCIAR');
        $sheet->getStyle('C8:F8')->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'CFE9E0']],
        ]);

        $metrics = [
            ['Facturat', '=SUMIFS($L$18:$L$' . max(18, 17 + count($rows)) . ',$I$18:$I$' . max(18, 17 + count($rows)) . ',"<>Ciornă",$I$18:$I$' . max(18, 17 + count($rows)) . ',"<>Anulată")'],
            ['TVA colectată', '=SUMIFS($K$18:$K$' . max(18, 17 + count($rows)) . ',$I$18:$I$' . max(18, 17 + count($rows)) . ',"<>Ciornă",$I$18:$I$' . max(18, 17 + count($rows)) . ',"<>Anulată")'],
            ['Încasat', '=SUMIFS($M$18:$M$' . max(18, 17 + count($rows)) . ',$I$18:$I$' . max(18, 17 + count($rows)) . ',"<>Ciornă",$I$18:$I$' . max(18, 17 + count($rows)) . ',"<>Anulată")'],
            ['Sold de încasat', '=SUMIFS($N$18:$N$' . max(18, 17 + count($rows)) . ',$I$18:$I$' . max(18, 17 + count($rows)) . ',"<>Ciornă",$I$18:$I$' . max(18, 17 + count($rows)) . ',"<>Anulată")'],
            ['Restant', '=SUMIF($O$18:$O$' . max(18, 17 + count($rows)) . ',"DA",$N$18:$N$' . max(18, 17 + count($rows)) . ')'],
            ['Facturi restante', '=COUNTIF($O$18:$O$' . max(18, 17 + count($rows)) . ',"DA")'],
        ];

        $metricRow = 9;
        foreach ($metrics as [$label, $formula]) {
            $sheet->setCellValue("C{$metricRow}", $label);
            $sheet->setCellValue("D{$metricRow}", $formula);
            $sheet->getStyle("C{$metricRow}")->getFont()->setBold(true);
            $sheet->getStyle("D{$metricRow}")->getFont()->setColor(new Color('000000'));
            $sheet->getStyle("D{$metricRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $metricRow++;
        }
        $sheet->getStyle('D9:D13')->getNumberFormat()->setFormatCode('#,##0.00;(#,##0.00);-');
        $sheet->getStyle('D14')->getNumberFormat()->setFormatCode('#,##0');
        $sheet->getStyle('C9:D14')->getBorders()->getBottom()->setBorderStyle(Border::BORDER_THIN);
        $sheet->getStyle('C12:D12')->getBorders()->getTop()->setBorderStyle(Border::BORDER_MEDIUM);
        $sheet->getStyle('C14:D14')->getBorders()->getBottom()->setBorderStyle(Border::BORDER_DOUBLE);

        $headers = ['Nr.', 'Factura', 'Emisă la', 'Scadență', 'Client', 'CUI', 'Status', 'Subtotal', 'TVA', 'Total', 'Încasat', 'Sold', 'Restantă'];
        $headerRow = 17;
        $startColumn = 'C';
        foreach ($headers as $index => $header) {
            $coordinate = chr(ord($startColumn) + $index) . $headerRow;
            $sheet->setCellValue($coordinate, $header);
        }
        $sheet->getStyle("C{$headerRow}:O{$headerRow}")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '135B44']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'CBD5E1']]],
        ]);

        $rowNumber = 18;
        foreach ($rows as $index => $row) {
            $values = [
                $index + 1,
                $row['number'],
                $row['issue_date'] ? Carbon::parse($row['issue_date'])->format('d.m.Y') : '',
                $row['due_date'] ? Carbon::parse($row['due_date'])->format('d.m.Y') : '',
                $row['client_name'],
                $row['client_cui'],
                $row['status_label'],
                $row['subtotal'],
                $row['vat_total'],
                $row['total'],
                $row['paid_amount'],
                $row['balance'],
                $row['is_overdue'] ? 'DA' : 'NU',
            ];

            foreach ($values as $columnIndex => $value) {
                $coordinate = chr(ord($startColumn) + $columnIndex) . $rowNumber;
                $sheet->setCellValue($coordinate, $value);
                $sheet->getStyle($coordinate)->getFont()->setColor(new Color('0000FF'));
                $comment = new Comment();
                $comment->getText()->createTextRun($sourceComment);
                $sheet->getComment($coordinate)->setAuthor('ElectroCRM')->setText($comment->getText());
            }

            if ($row['is_overdue']) {
                $sheet->getStyle("C{$rowNumber}:O{$rowNumber}")->getFont()->setColor(new Color('9B1C1C'));
            }

            $rowNumber++;
        }

        $lastDataRow = max($headerRow, $rowNumber - 1);
        $sheet->getStyle("C{$headerRow}:O{$lastDataRow}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
        $sheet->getStyle("C{$headerRow}:O{$lastDataRow}")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER)->setWrapText(true);
        $sheet->getStyle("C18:D{$lastDataRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("J18:N{$lastDataRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle("O18:O{$lastDataRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("J18:N{$lastDataRow}")->getNumberFormat()->setFormatCode('#,##0.00;(#,##0.00);-');

        foreach (range('C', 'O') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        $sheet->freezePane('C18');
        $sheet->setAutoFilter("C{$headerRow}:O{$headerRow}");
        $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
        $sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_A4);
        $sheet->getPageSetup()->setFitToWidth(1);
        $sheet->getPageSetup()->setFitToHeight(0);
        $sheet->getPageMargins()->setTop(0.4)->setRight(0.3)->setBottom(0.4)->setLeft(0.3);
        $sheet->getHeaderFooter()->setOddFooter('&LRaport facturi &RPagina &P din &N');
        $sheet->getPageSetup()->setPrintArea("B2:O{$lastDataRow}");

        $filename = sprintf('raport_facturi_%s_%s.xlsx', $filters['date_from'], $filters['date_to']);
        $path = storage_path('app/' . $filename);
        (new Xlsx($spreadsheet))->save($path);
        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet);

        return $path;
    }
}
