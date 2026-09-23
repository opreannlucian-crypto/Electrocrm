<?php

namespace App\Services;

use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\SimpleType\Jc;

class WordDocumentExporter
{
    public function download(string $title, array $sections, string $filename)
    {
        $word = new PhpWord();
        $word->setDefaultFontName('Arial');
        $word->setDefaultFontSize(10.5);
        $word->addParagraphStyle('body', ['spaceAfter' => 140, 'lineHeight' => 1.2]);
        $word->addParagraphStyle('section', ['spaceBefore' => 240, 'spaceAfter' => 100]);
        $section = $word->addSection(['marginTop' => 1440, 'marginBottom' => 1440, 'marginLeft' => 1440, 'marginRight' => 1440, 'headerHeight' => 708, 'footerHeight' => 708]);

        $header = $section->addHeader();
        $header->addText('ELECTROCRM  |  DOCUMENT EDITABIL', ['name' => 'Arial', 'size' => 8, 'color' => '64748B', 'bold' => true], ['alignment' => Jc::END]);
        $section->addText('DOCUMENT', ['size' => 9, 'bold' => true, 'color' => '2563EB'], ['alignment' => Jc::CENTER, 'spaceAfter' => 100]);
        $section->addText($title, ['size' => 18, 'bold' => true, 'color' => '0F172A'], ['alignment' => Jc::CENTER, 'spaceAfter' => 260]);

        $meta = [];
        foreach (['Număr', 'Data', 'Client', 'Locație'] as $key) if (!empty($sections[$key])) $meta[$key] = $sections[$key];
        if ($meta) {
            $table = $section->addTable(['borderSize' => 4, 'borderColor' => 'CBD5E1', 'cellMargin' => 120, 'width' => 9360]);
            $row = $table->addRow();
            foreach ($meta as $label => $value) { $cell = $row->addCell((int) floor(9360 / count($meta))); $cell->addText($label, ['size' => 8, 'bold' => true, 'color' => '64748B']); $cell->addText((string) $value, ['size' => 10, 'bold' => true, 'color' => '0F172A']); }
            foreach (array_keys($meta) as $key) unset($sections[$key]);
        }

        foreach ($sections as $heading => $text) {
            if ($text === null || trim((string) $text) === '') continue;
            $section->addText($heading, ['size' => 12, 'bold' => true, 'color' => '1D4ED8'], 'section');
            foreach (preg_split('/\R{2,}/', trim(strip_tags((string) $text))) as $paragraph) $section->addText($paragraph, ['size' => 10.5, 'color' => '1F2937'], 'body');
        }

        $footer = $section->addFooter();
        $footer->addText('Generat din ElectroCRM · fișier Word editabil', ['size' => 8, 'color' => '94A3B8'], ['alignment' => Jc::CENTER]);
        $path = tempnam(sys_get_temp_dir(), 'electrocrm-') . '.docx';
        IOFactory::createWriter($word, 'Word2007')->save($path);
        return response()->download($path, $filename, ['Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])->deleteFileAfterSend(true);
    }
}
