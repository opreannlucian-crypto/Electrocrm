<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductStock;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockReportController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()?->isAdministrator() || $request->user()?->isSalesManager(), 403);

        $filters = $request->validate([
            'warehouse_id' => ['nullable', 'exists:warehouses,id'],
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:all,in_stock,low,out_of_stock'],
        ]);
        $warehouse = !empty($filters['warehouse_id']) ? Warehouse::find($filters['warehouse_id']) : null;
        $stocks = $warehouse?->type === 'cantitativ_valoric'
            ? $this->warehouseStocks($filters, $warehouse)
            : $this->globalStocks($filters, $warehouse);

        return Inertia::render('StockReports/Index', [
            'stocks' => $stocks,
            'warehouses' => Warehouse::where('active', true)->orderBy('name')->get(['id', 'name']),
            'filters' => $filters,
            'totals' => [
                'quantity' => $stocks->sum('quantity'),
                'value' => $stocks->sum('value'),
                'low' => $stocks->filter(fn (array $stock) => $stock['quantity'] <= $stock['minimum'])->count(),
            ],
        ]);
    }

    private function globalStocks(array $filters, ?Warehouse $warehouse)
    {
        $query = Product::query()->where('active', true)
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(function ($products) use ($search) {
                $products->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%");
            }));
        $this->applyProductStatus($query, $filters['status'] ?? 'all', 'stock_quantity');

        return $query->orderBy('name')->get()->map(fn (Product $product) => [
            'id' => 'global-' . $product->id,
            'warehouse' => $warehouse?->name ?? 'Stoc global',
            'product' => $product->name,
            'code' => $product->code,
            'unit' => $product->unit,
            'quantity' => (float) $product->stock_quantity,
            'minimum' => (float) $product->minimum_stock,
            'value' => round((float) $product->stock_quantity * (float) $product->purchase_price, 2),
        ])->values();
    }

    private function warehouseStocks(array $filters, Warehouse $warehouse)
    {
        $query = ProductStock::with(['product:id,name,code,unit,purchase_price,minimum_stock', 'warehouse:id,name'])
            ->where('warehouse_id', $warehouse->id)
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->whereHas('product', fn ($products) => $products
                ->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%")));
        $status = $filters['status'] ?? 'all';
        if ($status === 'in_stock') $query->where('quantity', '>', 0);
        if ($status === 'out_of_stock') $query->where('quantity', '<=', 0);
        if ($status === 'low') $query->whereHas('product', fn ($products) => $products->whereColumn('product_stocks.quantity', '<=', 'products.minimum_stock'));

        return $query->get()->map(fn (ProductStock $stock) => [
            'id' => $stock->id,
            'warehouse' => $stock->warehouse?->name,
            'product' => $stock->product?->name,
            'code' => $stock->product?->code,
            'unit' => $stock->product?->unit,
            'quantity' => (float) $stock->quantity,
            'minimum' => (float) ($stock->product?->minimum_stock ?? 0),
            'value' => round((float) $stock->quantity * (float) ($stock->product?->purchase_price ?? 0), 2),
        ])->values();
    }

    private function applyProductStatus($query, string $status, string $quantityColumn): void
    {
        if ($status === 'in_stock') $query->where($quantityColumn, '>', 0);
        if ($status === 'out_of_stock') $query->where($quantityColumn, '<=', 0);
        if ($status === 'low') $query->whereColumn($quantityColumn, '<=', 'minimum_stock');
    }
}
