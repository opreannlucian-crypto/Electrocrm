<?php

namespace App\Http\Controllers;

use App\Models\WorkOrder;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class WorkOrderReportController extends Controller
{
    /**
     * Generează procesul-verbal de intervenție în PDF.
     */
    public function pdf(WorkOrder $workOrder)
    {
        $workOrder->load([
            'client',
            'employee',
            'license',
            'photos',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Fotografii
        |--------------------------------------------------------------------------
        |
        | Pregătim fotografiile pentru DomPDF folosind calea absolută
        | către fișierele stocate pe disk-ul public.
        |
        */

        $photos = $workOrder->photos->map(function ($photo) {
            $path = Storage::disk('public')->path(
                $photo->file
            );

            return [
                'path' => $path,
                'type' => $photo->type,
                'original_name' => $photo->original_name,
                'notes' => $photo->notes,
            ];
        });

        /*
        |--------------------------------------------------------------------------
        | Grupăm fotografiile
        |--------------------------------------------------------------------------
        */

        $photosBefore = $photos
            ->where('type', 'before')
            ->values();

        $photosDuring = $photos
            ->where('type', 'during')
            ->values();

        $photosAfter = $photos
            ->where('type', 'after')
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Generare PDF
        |--------------------------------------------------------------------------
        */

        $pdf = Pdf::loadView(
            'work_orders.report',
            [
                'workOrder' => $workOrder,
                'photosBefore' => $photosBefore,
                'photosDuring' => $photosDuring,
                'photosAfter' => $photosAfter,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Format pagină
        |--------------------------------------------------------------------------
        */

        $pdf->setPaper(
            'a4',
            'portrait'
        );

        /*
        |--------------------------------------------------------------------------
        | Returnare PDF
        |--------------------------------------------------------------------------
        */

        return $pdf->stream(
            'Proces-Verbal-' .
            $workOrder->number .
            '.pdf'
        );
    }
}