<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockMovementController extends Controller
{
    /**
     * Afiseaza miscarile de stoc.
     */
    public function index(Request $request)
    {
        $query = StockMovement::with([
            'product',
            'workOrder',
            'user',
        ])->latest();

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('reference_type')) {
            $query->where('reference_type', $request->reference_type);
        }

        if ($request->filled('search')) {
            $search = trim($request->search);

            $query->where(function ($q) use ($search) {
                $q->where('document_number', 'like', "%{$search}%")
                    ->orWhere('reason', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhereHas('product', function ($productQuery) use ($search) {
                        $productQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('code', 'like', "%{$search}%")
                            ->orWhere('ean', 'like', "%{$search}%");
                    });
            });
        }

        $movements = $query->paginate(25)->withQueryString();

        $products = Product::query()
            ->where('active', true)
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'code',
                'ean',
                'unit',
                'stock_quantity',
            ]);

        return inertia('StockMovements/Index', [
            'movements' => $movements,
            'products' => $products,
            'filters' => [
                'product_id' => $request->product_id,
                'type' => $request->type,
                'reference_type' => $request->reference_type,
                'search' => $request->search,
            ],
        ]);
    }

    /**
     * Afiseaza formularul pentru o miscare noua.
     */
    public function create()
    {
        $products = Product::query()
            ->where('active', true)
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'code',
                'ean',
                'unit',
                'stock_quantity',
                'purchase_price',
            ]);

        return inertia('StockMovements/Create', [
            'products' => $products,
        ]);
    }

    /**
     * Creeaza o miscare de stoc si actualizeaza stocul produsului.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => [
                'required',
                'integer',
                'exists:products,id',
            ],

            'type' => [
                'required',
                'in:in,out,adjustment',
            ],

            'quantity' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'unit_price' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'reference_type' => [
                'nullable',
                'string',
                'max:255',
            ],

            'reference_id' => [
                'nullable',
                'integer',
            ],

            'document_number' => [
                'nullable',
                'string',
                'max:255',
            ],

            'reason' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'work_order_id' => [
                'nullable',
                'integer',
                'exists:work_orders,id',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ]);

        DB::transaction(function () use ($validated) {
            $product = Product::query()
                ->lockForUpdate()
                ->findOrFail($validated['product_id']);

            $stockBefore = (float) $product->stock_quantity;
            $quantity = (float) $validated['quantity'];

            switch ($validated['type']) {
                case 'in':
                    $stockAfter = $stockBefore + $quantity;
                    break;

                case 'out':
                    $stockAfter = $stockBefore - $quantity;

                    if ($stockAfter < 0) {
                        abort(
                            422,
                            'Stoc insuficient pentru aceasta iesire.'
                        );
                    }

                    break;

                case 'adjustment':
                    $stockAfter = $quantity;
                    break;

                default:
                    abort(
                        422,
                        'Tip de miscare de stoc invalid.'
                    );
            }

            $movement = StockMovement::create([
                'product_id' => $product->id,
                'type' => $validated['type'],
                'quantity' => $quantity,
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'unit_price' => $validated['unit_price'] ?? null,
                'reference_type' => $validated['reference_type'] ?? null,
                'reference_id' => $validated['reference_id'] ?? null,
                'document_number' => $validated['document_number'] ?? null,
                'reason' => $validated['reason'] ?? null,
                'work_order_id' => $validated['work_order_id'] ?? null,
                'user_id' => auth()->id(),
                'notes' => $validated['notes'] ?? null,
            ]);

            $product->update([
                'stock_quantity' => $stockAfter,
            ]);
        });

        return redirect()
            ->route('stock-movements.index')
            ->with(
                'success',
                'Miscarea de stoc a fost inregistrata cu succes.'
            );
    }

    /**
     * Afiseaza o miscare de stoc.
     */
    public function show(StockMovement $stockMovement)
    {
        $stockMovement->load([
            'product',
            'workOrder',
            'user',
        ]);

        return inertia('StockMovements/Show', [
            'movement' => $stockMovement,
        ]);
    }

    /**
     * Sterge o miscare de stoc si recalculeaza stocul produsului.
     */
    public function destroy(StockMovement $stockMovement)
    {
        DB::transaction(function () use ($stockMovement) {
            $product = Product::query()
                ->lockForUpdate()
                ->findOrFail($stockMovement->product_id);

            /*
             * Recalculam stocul pornind de la miscarile ramase.
             * Astfel evitam sa modificam stocul gresit daca miscarea
             * stearsa nu este ultima inregistrare.
             */
            $stock = 0;

            $movements = StockMovement::query()
                ->where('product_id', $product->id)
                ->where('id', '!=', $stockMovement->id)
                ->orderBy('id')
                ->get([
                    'id',
                    'type',
                    'quantity',
                ]);

            foreach ($movements as $movement) {
                $quantity = (float) $movement->quantity;

                if ($movement->type === 'in') {
                    $stock += $quantity;
                } elseif ($movement->type === 'out') {
                    $stock -= $quantity;
                } elseif ($movement->type === 'adjustment') {
                    $stock = $quantity;
                }
            }

            if ($stock < 0) {
                $stock = 0;
            }

            $stockMovement->delete();

            $product->update([
                'stock_quantity' => $stock,
            ]);

            /*
             * Recalculam si stock_before / stock_after pentru
             * miscarile ramase, astfel incat istoricul sa ramana corect.
             */
            $runningStock = 0;

            $remainingMovements = StockMovement::query()
                ->where('product_id', $product->id)
                ->orderBy('id')
                ->get();

            foreach ($remainingMovements as $movement) {
                $before = $runningStock;
                $quantity = (float) $movement->quantity;

                if ($movement->type === 'in') {
                    $runningStock += $quantity;
                } elseif ($movement->type === 'out') {
                    $runningStock -= $quantity;
                } elseif ($movement->type === 'adjustment') {
                    $runningStock = $quantity;
                }

                $movement->update([
                    'stock_before' => $before,
                    'stock_after' => $runningStock,
                ]);
            }
        });

        return redirect()
            ->route('stock-movements.index')
            ->with(
                'success',
                'Miscarea de stoc a fost stearsa si stocul a fost recalculat.'
            );
    }
}