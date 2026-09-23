<?php

namespace App\Http\Controllers;

use App\Models\{ApplicationSetting, CompanyProfile, InventoryDocument, Product, ProductStock, Warehouse};
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $this->authorizeAccess($request);

        return Inertia::render('Inventory/Index', [
            'warehouses' => Warehouse::where('active', true)->orderBy('name')->get(),
            'stocks' => ProductStock::with(['product:id,name,code,unit,purchase_price', 'warehouse:id,name'])->orderBy('warehouse_id')->get(),
            'inventories' => InventoryDocument::with('warehouse:id,name')->latest('inventoried_at')->latest()->get(),
        ]);
    }

    public function create(Request $request)
    {
        $this->authorizeAccess($request);

        return Inertia::render('Inventory/Create', [
            'warehouses' => Warehouse::where('active', true)->orderBy('name')->get(),
            'products' => Product::where('active', true)->orderBy('name')->get(['id', 'name', 'code', 'unit', 'purchase_price', 'stock_quantity']),
            'stocks' => ProductStock::get(['product_id', 'warehouse_id', 'quantity']),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeAccess($request);
        $data = $request->validate([
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'inventoried_at' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:4000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'distinct', 'exists:products,id'],
            'items.*.counted_quantity' => ['required', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($data, $request) {
            $warehouse = Warehouse::lockForUpdate()->findOrFail($data['warehouse_id']);
            $next = ((int) InventoryDocument::lockForUpdate()->max('id')) + 1;
            $series = data_get(ApplicationSetting::value('document-series', ['series' => ['inventory' => 'INV']]), 'series.inventory', 'INV');
            $inventory = InventoryDocument::create([
                'warehouse_id' => $warehouse->id,
                'number' => $series . '-' . str_pad((string) $next, 5, '0', STR_PAD_LEFT),
                'inventoried_at' => $data['inventoried_at'], 'status' => 'issued',
                'notes' => $data['notes'] ?? null, 'created_by' => $request->user()->id,
            ]);

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $inventory->items()->create([
                    'product_id' => $product->id, 'product_name' => $product->name, 'unit' => $product->unit ?: 'buc',
                    'book_quantity' => $this->bookQuantity($product, $warehouse),
                    'counted_quantity' => $item['counted_quantity'], 'unit_price' => $product->purchase_price ?: 0,
                ]);
            }
        });

        return redirect()->route('inventory.index')->with('success', 'Inventarul a fost emis. Diferențele nu au fost aplicate încă în stoc.');
    }

    public function show(Request $request, InventoryDocument $inventoryDocument)
    {
        $this->authorizeAccess($request);
        $inventoryDocument->load(['warehouse', 'items.product']);
        return Inertia::render('Inventory/Show', ['inventory' => $inventoryDocument]);
    }

    public function pdf(Request $request, InventoryDocument $inventoryDocument)
    {
        $this->authorizeAccess($request);
        $inventoryDocument->load(['warehouse', 'items.product']);
        $company = CompanyProfile::current();
        return Pdf::loadView('inventory.pdf', compact('inventoryDocument', 'company'))->setPaper('a4')->download($inventoryDocument->number . '.pdf');
    }

    public function apply(Request $request, InventoryDocument $inventoryDocument)
    {
        $this->authorizeAccess($request);
        abort_if($inventoryDocument->status === 'applied', 422, 'Diferențele acestui inventar au fost deja aplicate.');

        DB::transaction(function () use ($inventoryDocument, $request) {
            $inventoryDocument->load(['warehouse', 'items']);
            foreach ($inventoryDocument->items as $item) {
                $product = Product::lockForUpdate()->findOrFail($item->product_id);
                $difference = (float) $item->counted_quantity - (float) $item->book_quantity;
                if ($inventoryDocument->warehouse->type === 'cantitativ_valoric') {
                    ProductStock::firstOrCreate(['product_id' => $product->id, 'warehouse_id' => $inventoryDocument->warehouse_id], ['quantity' => 0])
                        ->update(['quantity' => $item->counted_quantity]);
                    $product->increment('stock_quantity', $difference);
                } else {
                    $product->update(['stock_quantity' => $item->counted_quantity]);
                }
            }
            $inventoryDocument->update(['status' => 'applied', 'applied_at' => now(), 'applied_by' => $request->user()->id]);
        });

        return back()->with('success', 'Diferențele de inventar au fost aplicate în stoc.');
    }

    private function bookQuantity(Product $product, Warehouse $warehouse): float
    {
        if ($warehouse->type !== 'cantitativ_valoric') return (float) $product->stock_quantity;
        return (float) (ProductStock::where(['product_id' => $product->id, 'warehouse_id' => $warehouse->id])->value('quantity') ?? 0);
    }

    private function authorizeAccess(Request $request): void
    {
        abort_unless($request->user()?->isAdministrator() || $request->user()?->isSalesManager(), 403);
    }
}
