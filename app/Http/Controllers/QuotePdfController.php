<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Http\Controllers\QuotePdfController;

class QuotePdfController extends Controller
{
    
public function show(Quote $quote)
    {
        $quote->load([
            'client',
            'workOrder',
            'items',
        ]);

        $materials = $quote->items
            ->where('type', 'material');

        $labor = $quote->items
            ->where('type', 'manopera');

        $itemTotal = function ($item) {
            $quantity = (float) $item->quantity;
            $price = (float) $item->unit_price;
            $discount = (float) ($item->discount ?? 0);

            $subtotal = $quantity * $price;

            return $subtotal - (
                $subtotal * $discount / 100
            );
        };

        $materialsTotal = $materials->sum($itemTotal);
        $laborTotal = $labor->sum($itemTotal);

        $subtotal = $materialsTotal + $laborTotal;

        $globalDiscount = (float) ($quote->discount ?? 0);

        $discountValue =
            $subtotal * $globalDiscount / 100;

        $afterDiscount =
            $subtotal - $discountValue;

        $vatRate = (float) ($quote->vat_rate ?? 0);

        $vat =
            $afterDiscount * $vatRate / 100;

        $total =
            $afterDiscount + $vat;

        $pdf = Pdf::loadView(
            'pdf.quote',
            [
                'quote' => $quote,
                'materials' => $materials,
                'labor' => $labor,
                'materialsTotal' => $materialsTotal,
                'laborTotal' => $laborTotal,
                'subtotal' => $subtotal,
                'discountValue' => $discountValue,
                'afterDiscount' => $afterDiscount,
                'vat' => $vat,
                'vatRate' => $vatRate,
                'total' => $total,
                'itemTotal' => $itemTotal,
            ]
        );

        $pdf->setPaper('A4', 'portrait');

        return $pdf->stream(
            $quote->number . '.pdf'
        );
    }
}