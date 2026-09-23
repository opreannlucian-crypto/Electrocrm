<?php

namespace App\Http\Controllers;

use App\Models\{ApplicationSetting, CashPayment, Product, ProductCategory, ProductStock, Reception, Supplier, SupplierPayment, Warehouse};
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReceptionController extends Controller
{
    public function create()
    {
        return $this->formPage();
    }

    public function index()
    {
        return Inertia::render('Receptions/Index', [
            'receptions' => Reception::with(['supplier', 'warehouse'])->latest()->get(),
            'suppliers' => Supplier::where('active', true)->orderBy('name')->get(),
            'warehouses' => Warehouse::where('active', true)->orderBy('name')->get(),
            'products' => Product::where('active', true)->orderBy('name')->get(),
            'categories' => ProductCategory::where('active', true)->orderBy('name')->get(),
        ]);
    }

    private function formPage()
    {
        return Inertia::render('Receptions/Create', [
            'suppliers' => Supplier::where('active', true)->orderBy('name')->get(),
            'warehouses' => Warehouse::where('active', true)->orderBy('name')->get(),
            'products' => Product::where('active', true)->orderBy('name')->get(),
            'categories' => ProductCategory::where('active', true)->orderBy('name')->get(),
            'stockProductIds' => ProductStock::query()->get(['warehouse_id', 'product_id']),
            'defaultReceptionSeries' => $this->documentSeries('reception', 'NIR'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateReception($request, false);

        DB::transaction(function () use ($data, $request) {
            $warehouse = Warehouse::findOrFail($data['warehouse_id']);
            $supplier = $this->resolveSupplier($data);
            $reception = Reception::create([
                'supplier_id' => $supplier?->id,
                'warehouse_id' => $data['warehouse_id'],
                'number' => $this->nextReceptionNumber($this->documentSeries('reception', 'NIR')),
                'received_at' => $data['received_at'],
                'supplier_document_number' => $data['supplier_document_number'] ?? null,
                'document_code' => $data['document_code'] ?? null,
                'reception_series' => $this->documentSeries('reception', 'NIR'),
                'stock_entry_date' => $data['stock_entry_date'] ?? $data['received_at'],
                'currency' => $data['currency'] ?? 'RON',
                'vat_included' => $data['vat_included'] ?? false,
                'delegate' => $data['delegate'] ?? null,
                'vehicle' => $data['vehicle'] ?? null,
                'mentions' => $data['mentions'] ?? null,
                'paid_now' => $data['paid_now'] ?? false,
                'paid_amount' => $data['paid_amount'] ?? 0,
                'payment_method' => $data['payment_method'] ?? null,
                'payment_reference' => $data['payment_reference'] ?? null,
                'document_type' => $data['document_type'] ?? 'NIR',
                'invoice_series' => $data['invoice_series'] ?? null,
                'invoice_number' => $data['invoice_number'] ?? null,
                'delivery_note_number' => $data['delivery_note_number'] ?? null,
                'commission_members' => $data['commission_members'] ?? null,
                'storekeeper' => $data['storekeeper'] ?? null,
                'difference_notes' => $data['difference_notes'] ?? null,
                'notes' => $data['notes'] ?? null,
                'created_by' => $request->user()->id,
            ]);

            $total = 0;
            foreach ($data['items'] as $item) {
                $product = $this->resolveProduct($item);
                $quantity = (float) $item['quantity_received'];
                $unitPrice = (float) $item['unit_price'];
                $lineTotal = $quantity * $unitPrice;
                $total += $lineTotal * (1 + ((float) $item['vat_rate'] / 100));

                $reception->items()->create([
                    'product_id' => $product->id,
                    'product_category_id' => $product->product_category_id,
                    'inventory_account' => $product->productCategory?->inventory_account,
                    'product_name' => $item['product_name'],
                    'product_code' => $item['product_code'] ?? null,
                    'unit' => $item['unit'] ?? 'buc',
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'selling_price' => $item['selling_price'] ?? 0,
                    'vat_rate' => $item['vat_rate'],
                    'line_total' => $lineTotal,
                ]);

                $this->increaseStock($product, $warehouse, $quantity, $item);
            }
            $reception->update(['total' => $total]);

            if (($data['paid_now'] ?? false) && $reception->supplier_id) {
                $amount = (float) ($data['paid_amount'] ?? 0) ?: $total;
                $method = $data['payment_method'] ?? 'bank_transfer';

                abort_if($amount > $total + 0.01, 422, 'Suma achitată nu poate depăși totalul recepției.');

                $supplierPayment = SupplierPayment::create([
                    'supplier_id' => $reception->supplier_id,
                    'reception_id' => $reception->id,
                    'paid_at' => $data['received_at'],
                    'amount' => $amount,
                    'payment_method' => $method,
                    'reference' => $data['payment_reference'] ?? null,
                    'document_number' => $reception->number,
                    'notes' => 'Plată înregistrată la recepția ' . $reception->number . '.',
                    'created_by' => $request->user()->id,
                ]);

                if ($method === 'cash') {
                    CashPayment::create([
                        'supplier_payment_id' => $supplierPayment->id,
                        'paid_at' => $data['received_at'],
                        'operation_type' => 'expense',
                        'expense_category' => 'Achiziție furnizor',
                        'beneficiary' => $reception->supplier->name,
                        'document_number' => $reception->number,
                        'amount' => $amount,
                        'notes' => 'Plată numerar pentru recepția ' . $reception->number . '.',
                        'created_by' => $request->user()->id,
                    ]);
                }
            }
        });

        return redirect()->route('receptions.index')->with('success', 'Recepția a fost salvată cu succes și stocul a fost actualizat.');
    }

    public function show(Reception $reception)
    {
        $reception->load(['supplier', 'warehouse', 'items.product']);
        return Inertia::render('Receptions/Show', ['reception' => $reception]);
    }

    public function reportPdf(Request $request)
    {
        $receptions = $this->selectedReceptions($request);

        return Pdf::loadView('receptions.report-pdf', compact('receptions'))
            ->setPaper('a4', 'landscape')
            ->download('raport-receptii.pdf');
    }

    public function printSelected(Request $request)
    {
        $receptions = $this->selectedReceptions($request, true);

        return Pdf::loadView('receptions.selected-pdf', compact('receptions'))
            ->setPaper('a4', 'portrait')
            ->stream('receptii-selectate.pdf');
    }

    public function edit(Reception $reception)
    {
        $reception->load(['supplier', 'warehouse', 'items.product']);
        return Inertia::render('Receptions/Edit', [
            'reception' => $reception,
            'suppliers' => Supplier::where('active', true)->orderBy('name')->get(),
            'warehouses' => Warehouse::where('active', true)->orderBy('name')->get(),
            'products' => Product::where('active', true)->orderBy('name')->get(),
            'categories' => ProductCategory::where('active', true)->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Reception $reception)
    {
        $data = $this->validateReception($request, true);

        DB::transaction(function () use ($data, $reception) {
            $reception->load(['items', 'warehouse']);
            foreach ($reception->items as $oldItem) {
                $this->decreaseStock(Product::find($oldItem->product_id), $reception->warehouse, (float) $oldItem->quantity);
            }

            $reception->update([
                'supplier_id' => $data['supplier_id'] ?? null,
                'warehouse_id' => $data['warehouse_id'],
                'received_at' => $data['received_at'],
                'notes' => $data['notes'] ?? null,
                'mentions' => $data['mentions'] ?? null,
                'delegate' => $data['delegate'] ?? null,
                'vehicle' => $data['vehicle'] ?? null,
            ]);
            $reception->items()->delete();

            $warehouse = Warehouse::findOrFail($data['warehouse_id']);
            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $quantity = (float) $item['quantity_received'];
                $reception->items()->create([
                    'product_id' => $product->id,
                    'product_category_id' => $product->product_category_id,
                    'inventory_account' => $product->productCategory?->inventory_account,
                    'product_name' => $item['product_name'],
                    'unit' => $item['unit'],
                    'quantity' => $quantity,
                    'unit_price' => $item['unit_price'],
                    'selling_price' => $item['selling_price'] ?? 0,
                    'vat_rate' => $item['vat_rate'],
                    'line_total' => $quantity * (float) $item['unit_price'],
                ]);
                $this->increaseStock($product, $warehouse, $quantity, $item);
            }
        });

        return redirect()->route('receptions.index')->with('success', 'Recepția a fost actualizată cu succes.');
    }

    public function destroy(Reception $reception)
    {
        DB::transaction(function () use ($reception) {
            $reception->load(['items', 'warehouse']);
            foreach ($reception->items as $item) {
                $this->decreaseStock(Product::find($item->product_id), $reception->warehouse, (float) $item->quantity, true);
            }
            $reception->items()->delete();
            $reception->delete();
        });

        return redirect()->route('receptions.index')->with('success', 'Recepția a fost ștearsă cu succes.');
    }

    private function resolveProduct(array $item): Product
    {
        return !empty($item['product_id'])
            ? Product::findOrFail($item['product_id'])
            : Product::create([
                'name' => $item['product_name'],
                'product_category_id' => $item['product_category_id'] ?? null,
                'code' => $item['product_code'] ?? null,
                'unit' => $item['unit'] ?? 'buc',
                'purchase_price' => $item['unit_price'],
                'sale_price' => $item['selling_price'] ?? 0,
                'vat_rate' => $item['vat_rate'],
                'stock_quantity' => 0,
                'active' => true,
            ]);
    }

    private function resolveSupplier(array $data): ?Supplier
    {
        if (!empty($data['supplier_id'])) {
            return Supplier::findOrFail($data['supplier_id']);
        }

        $name = trim((string) ($data['supplier_name'] ?? ''));
        if ($name === '') {
            return null;
        }

        $cui = trim((string) ($data['supplier_cui'] ?? ''));
        $existing = $cui !== ''
            ? Supplier::where('cui', $cui)->first()
            : Supplier::whereRaw('lower(name) = ?', [mb_strtolower($name)])->first();

        if ($existing) {
            return $existing;
        }

        return Supplier::create([
            'name' => $name,
            'cui' => $cui ?: null,
            'registration_number' => $data['supplier_registration_number'] ?? null,
            'address' => $data['supplier_address'] ?? null,
            'phone' => $data['supplier_phone'] ?? null,
            'active' => true,
        ]);
    }

    private function selectedReceptions(Request $request, bool $withItems = false)
    {
        $ids = $request->validate(['ids' => ['required', 'array', 'min:1'], 'ids.*' => ['integer', 'exists:receptions,id']])['ids'];
        $relations = $withItems ? ['supplier', 'warehouse', 'items.product'] : ['supplier', 'warehouse'];

        return Reception::with($relations)->whereIn('id', $ids)->orderByDesc('received_at')->get();
    }

    private function nextReceptionNumber(?string $series): string
    {
        $prefix = strtoupper(trim($series ?: 'NIR'));
        $prefix = preg_replace('/[^A-Z0-9_-]/', '', $prefix) ?: 'NIR';

        // Folosim cel mai mare ID deja emis, nu data și ora; astfel numărul rămâne consecutiv
        // și nu se poate reutiliza după ștergerea unei recepții.
        $next = ((int) Reception::query()->lockForUpdate()->max('id')) + 1;

        return $prefix . '-' . str_pad((string) $next, 5, '0', STR_PAD_LEFT);
    }

    private function documentSeries(string $key, string $fallback): string
    {
        return data_get(ApplicationSetting::value('document-series', ['series' => [$key => $fallback]]), 'series.' . $key, $fallback) ?: $fallback;
    }

    private function increaseStock(Product $product, Warehouse $warehouse, float $quantity, array $item): void
    {
        $product->increment('stock_quantity', $quantity);
        $product->update([
            'purchase_price' => $item['unit_price'],
            'sale_price' => $item['selling_price'] ?? $product->sale_price,
            'vat_rate' => $item['vat_rate'],
        ]);

        if ($warehouse->type === 'cantitativ_valoric') {
            $stock = ProductStock::firstOrCreate(['product_id' => $product->id, 'warehouse_id' => $warehouse->id], ['quantity' => 0]);
            $stock->increment('quantity', $quantity);
        }
    }

    private function decreaseStock(?Product $product, ?Warehouse $warehouse, float $quantity, bool $validateQuantity = false): void
    {
        if (!$product) return;
        if ($warehouse?->type === 'cantitativ_valoric') {
            $stock = ProductStock::where('product_id', $product->id)->where('warehouse_id', $warehouse->id)->first();
            if ($validateQuantity && (!$stock || (float) $stock->quantity < $quantity)) {
                abort(422, 'Recepția nu poate fi ștearsă deoarece stocul a fost consumat.');
            }
            if ($stock) $stock->decrement('quantity', $quantity);
        }
        $product->decrement('stock_quantity', $quantity);
    }

    private function validateReception(Request $request, bool $editing): array
    {
        $rules = [
            'supplier_id' => 'nullable|exists:suppliers,id', 'supplier_name' => 'nullable|required_without:supplier_id|string|max:180', 'supplier_cui' => 'nullable|string|max:30', 'supplier_registration_number' => 'nullable|string|max:60', 'supplier_address' => 'nullable|string|max:255', 'supplier_phone' => 'nullable|string|max:40', 'warehouse_id' => 'required|exists:warehouses,id', 'received_at' => 'required|date',
            'supplier_document_number' => 'nullable|string|max:80', 'document_code' => 'nullable|string|max:80', 'reception_series' => 'nullable|string|max:40', 'stock_entry_date' => 'nullable|date', 'currency' => 'nullable|string|size:3', 'vat_included' => 'boolean', 'delegate' => 'nullable|string|max:150', 'vehicle' => 'nullable|string|max:80', 'mentions' => 'nullable|string|max:4000', 'paid_now' => 'boolean', 'paid_amount' => 'nullable|numeric|min:0', 'payment_method' => 'nullable|required_if:paid_now,true|in:bank_transfer,cash,card,check,other', 'payment_reference' => 'nullable|string|max:100', 'document_type' => 'nullable|in:NIR,NIR_factura,NIR_aviz', 'invoice_series' => 'nullable|string|max:30', 'invoice_number' => 'nullable|string|max:80', 'delivery_note_number' => 'nullable|string|max:80', 'commission_members' => 'nullable|string|max:500', 'storekeeper' => 'nullable|string|max:150', 'difference_notes' => 'nullable|string|max:2000', 'notes' => 'nullable|string|max:4000', 'items' => 'required|array|min:1', 'items.*.product_id' => $editing ? 'required|exists:products,id' : 'nullable|exists:products,id', 'items.*.product_category_id' => 'nullable|exists:product_categories,id', 'items.*.product_name' => 'required|string|max:180', 'items.*.product_code' => 'nullable|string|max:60', 'items.*.unit' => 'required|string|max:20', 'items.*.quantity_document' => 'nullable|numeric|min:0', 'items.*.quantity_received' => 'required|numeric|gt:0', 'items.*.unit_price' => 'required|numeric|min:0', 'items.*.selling_price' => 'nullable|numeric|min:0', 'items.*.vat_rate' => 'required|numeric|min:0',
        ];
        return $request->validate($rules);
    }
}
