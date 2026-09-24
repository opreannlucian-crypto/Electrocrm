<?php

namespace App\Exports;

use App\Models\ClientRevision;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ClientRevisionExport
{
    /** @param iterable<ClientRevision> $revisions */
    public static function generate(iterable $revisions): string
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Revizii');
        $sheet->mergeCells('A1:F1');
        $sheet->setCellValue('A1', 'ElectroCRM - Raport revizii');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16)->getColor()->setRGB('0F3D56');
        $sheet->setCellValue('A2', 'Generat la: ' . now()->format('d.m.Y H:i'));
        $sheet->mergeCells('A2:F2');
        $sheet->getStyle('A2')->getFont()->setItalic(true)->getColor()->setRGB('64748B');

        $headers = ['Client', 'Tip revizie', 'Periodicitate', 'Ultima revizie', 'Următoarea revizie', 'Stare'];
        $sheet->fromArray($headers, null, 'A4');
        $sheet->getStyle('A4:F4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0F3D56']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'CBD5E1']]],
        ]);

        $row = 5;
        foreach ($revisions as $revision) {
            $next = $revision->next_revision_date;
            $status = !$next ? 'La cerere' : ($next->isPast() ? 'Depășită' : ($next->diffInDays(now()) <= 30 ? 'În următoarele 30 zile' : 'Programată'));
            $sheet->fromArray([
                $revision->client?->name ?: '—',
                $revision->type === ClientRevision::TYPE_FIRE ? 'Incendiu' : 'Efracție',
                match ($revision->period) {
                    ClientRevision::PERIOD_QUARTERLY => 'Trimestrială',
                    ClientRevision::PERIOD_SEMIANNUAL => 'Semestrială',
                    ClientRevision::PERIOD_ANNUAL => 'Anuală',
                    default => 'La cerere',
                },
                $revision->last_revision_date?->format('d.m.Y') ?: '—',
                $next?->format('d.m.Y') ?: 'La cerere',
                $status,
            ], null, "A{$row}");
            $row++;
        }

        $lastRow = max(4, $row - 1);
        $sheet->getStyle("A4:F{$lastRow}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
        $sheet->getStyle("A4:F{$lastRow}")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getStyle("B5:F{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        foreach (['A' => 32, 'B' => 18, 'C' => 20, 'D' => 18, 'E' => 22, 'F' => 26] as $column => $width) {
            $sheet->getColumnDimension($column)->setWidth($width);
        }
        $sheet->freezePane('A5');
        $sheet->setAutoFilter("A4:F{$lastRow}");
        $sheet->getPageSetup()->setOrientation('landscape')->setFitToWidth(1)->setFitToHeight(0);
        $sheet->getPageMargins()->setTop(0.4)->setRight(0.35)->setBottom(0.4)->setLeft(0.35);
        $sheet->getHeaderFooter()->setOddFooter('&LElectroCRM - Raport revizii&RPagina &P din &N');

        $filename = 'raport_revizii_selectate_' . now()->format('Ymd_His') . '.xlsx';
        $path = storage_path('app/' . $filename);
        (new Xlsx($spreadsheet))->save($path);
        $spreadsheet->disconnectWorksheets();

        return $path;
    }
}
