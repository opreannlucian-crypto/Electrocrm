<?php

namespace App\Http\Controllers;

use App\Models\WorkOrder;
use App\Models\WorkOrderPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class WorkOrderPhotoController extends Controller
{
    /**
     * Upload fotografii pentru o lucrare.
     */
    public function store(Request $request, WorkOrder $workOrder)
    {
        $validated = $request->validate([
            'photos' => [
                'required',
                'array',
                'min:1',
            ],

            'photos.*' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp,gif',
                'max:10240',
            ],

            'type' => [
                'nullable',
                'string',
                'in:before,during,after',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ]);

        $type = $validated['type'] ?? 'before';
        $notes = $validated['notes'] ?? null;

        $photos = $request->file('photos', []);

        foreach ($photos as $photo) {

            if (!$photo || !$photo->isValid()) {
                continue;
            }

            $path = $photo->store(
                'work-orders/' . $workOrder->id . '/photos',
                'public'
            );

            WorkOrderPhoto::create([
                'work_order_id' => $workOrder->id,
                'file' => $path,
                'original_name' => $photo->getClientOriginalName(),
                'type' => $type,
                'notes' => $notes,
            ]);
        }

        return back()->with(
            'success',
            'Fotografia a fost incarcata cu succes.'
        );
    }

    /**
     * Sterge o fotografie.
     */
    public function destroy(WorkOrderPhoto $photo)
    {
        if (
            $photo->file &&
            Storage::disk('public')->exists($photo->file)
        ) {
            Storage::disk('public')->delete($photo->file);
        }

        $photo->delete();

        return back()->with(
            'success',
            'Fotografia a fost stearsa cu succes.'
        );
    }
}