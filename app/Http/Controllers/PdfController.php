<?php

namespace App\Http\Controllers;

use App\Models\WorkOrder;
use Barryvdh\DomPDF\Facade\Pdf;

class PdfController extends Controller
{
    public function workOrder(WorkOrder $work_order)
    {
        $work_order->load([
            'client',
            'employee',
            'photos',
        ]);

        $beforePhotos = $work_order->photos
            ->where('type', 'before')
            ->values();

        $afterPhotos = $work_order->photos
            ->where('type', 'after')
            ->values();

        $documentPhotos = $work_order->photos
            ->where('type', 'document')
            ->values();

        $otherPhotos = $work_order->photos
            ->where('type', 'other')
            ->values();

        $pdf = Pdf::loadView(
            'pdf.work-order',
            [
                'workOrder' => $work_order,
                'beforePhotos' => $beforePhotos,
                'afterPhotos' => $afterPhotos,
                'documentPhotos' => $documentPhotos,
                'otherPhotos' => $otherPhotos,
            ]
        );

        $pdf->setPaper('A4', 'portrait');

        return $pdf->download(
            $work_order->number . '.pdf'
        );
    }
}