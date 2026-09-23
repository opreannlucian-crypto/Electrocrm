<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ProductController extends Controller
{
    /**
     * Lista produselor din stoc
     *
     * Căutare după:
     * - nume
     * - cod
     * - EAN
     * - categorie
     *
     * Filtre:
     * - toate
     * - în stoc
     * - stoc redus
     * - fără stoc
     * - inactive
     */
    public function index(Request $request)
    {
        $search = trim($request->input('search', ''));
        $filter = $request->input('filter', 'all');

        $products = Product::query()
            ->when($filter !== 'inactive', fn ($query) => $query->where('active', true))

            /*
             * CĂUTARE
             */
            ->when($search !== '', function ($query) use ($search) {

                $query->where(function ($q) use ($search) {

                    $q->where('name', 'like', '%' . $search . '%')
                        ->orWhere('code', 'like', '%' . $search . '%')
                        ->orWhere('ean', 'like', '%' . $search . '%')
                        ->orWhere('category', 'like', '%' . $search . '%');

                });

            })

            /*
             * FILTRE
             */
            ->when($filter === 'in_stock', function ($query) {

                $query->where('active', true)
                    ->where('stock_quantity', '>', 0);

            })

            ->when($filter === 'low_stock', function ($query) {

                $query->where('active', true)
                    ->where('stock_quantity', '>', 0)
                    ->whereColumn(
                        'stock_quantity',
                        '<=',
                        'minimum_stock'
                    );

            })

            ->when($filter === 'out_of_stock', function ($query) {

                $query->where('active', true)
                    ->where('stock_quantity', '<=', 0);

            })

            ->when($filter === 'inactive', function ($query) {

                $query->where('active', false);

            })

            /*
             * SORTARE
             */
            ->orderBy('name')

            /*
             * PAGINARE
             */
            ->paginate(20)

            /*
             * Păstrăm căutarea și filtrul
             * când schimbăm pagina.
             */
            ->withQueryString();

        return Inertia::render(
            'Products/Index',
            [
                'products' => $products,

                'filters' => [
                    'search' => $search,
                    'filter' => $filter,
                ],
            ]
        );
    }

    /**
     * Formular produs nou
     */
    public function create()
    {
        return Inertia::render(
            'Products/Create'
        );
    }

    /**
     * Salvare produs
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'code' => [
                'nullable',
                'string',
                'max:100',
                'unique:products,code',
            ],

            'ean' => [
                'nullable',
                'string',
                'max:50',
                'unique:products,ean',
            ],

            'category' => [
                'nullable',
                'string',
                'max:100',
            ],

            'product_category_id' => ['nullable', 'integer', 'exists:product_categories,id'],

            'unit' => [
                'required',
                'string',
                'max:50',
            ],

            'stock_quantity' => [
                'required',
                'numeric',
                'min:0',
            ],

            'purchase_price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'sale_price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'vat_rate' => [
                'required',
                'numeric',
                'min:0',
                'max:100',
            ],

            'minimum_stock' => [
                'required',
                'numeric',
                'min:0',
            ],

            'active' => [
                'required',
                'boolean',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ]);

        Product::create($validated);

        return redirect()
            ->route('products.index')
            ->with(
                'success',
                'Produsul a fost adăugat în stoc.'
            );
    }

    /**
     * Importă produse din prima foaie a unui fișier Excel sau CSV.
     * Coloana „Denumire” este obligatorie; restul au valori implicite.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv,txt', 'max:10240'],
        ]);

        try {
            $rows = IOFactory::load($request->file('file')->getRealPath())
                ->getActiveSheet()
                ->toArray('', true, true, true);
        } catch (\Throwable $exception) {
            return back()->with('error', 'Fișierul nu poate fi citit. Încarcă un Excel sau CSV valid.');
        }

        if (count($rows) < 2) {
            return back()->with('error', 'Fișierul trebuie să conțină un antet și cel puțin un produs.');
        }

        $headers = [];
        foreach ($rows[1] as $column => $value) {
            $headers[$this->productColumn((string) $value)] = $column;
        }

        if (!isset($headers['name'])) {
            return back()->with('error', 'Lipsește coloana obligatorie „Denumire”.');
        }

        $products = [];
        $errors = [];
        foreach (array_slice($rows, 1, null, true) as $rowNumber => $row) {
            $name = trim((string) ($row[$headers['name']] ?? ''));
            if ($name === '') {
                continue;
            }

            $product = [
                'name' => $name,
                'code' => $this->sheetText($row, $headers, 'code', 100),
                'ean' => $this->sheetText($row, $headers, 'ean', 50),
                'category' => $this->sheetText($row, $headers, 'category', 100),
                'unit' => $this->sheetText($row, $headers, 'unit', 50) ?: 'buc',
                'stock_quantity' => $this->sheetNumber($row, $headers, 'stock_quantity', 0),
                'purchase_price' => $this->sheetNumber($row, $headers, 'purchase_price', 0),
                'sale_price' => $this->sheetNumber($row, $headers, 'sale_price', 0),
                'vat_rate' => $this->sheetNumber($row, $headers, 'vat_rate', 21),
                'minimum_stock' => $this->sheetNumber($row, $headers, 'minimum_stock', 0),
                'active' => $this->sheetBoolean($row, $headers, 'active', true),
                'notes' => $this->sheetText($row, $headers, 'notes'),
            ];

            if ($product['stock_quantity'] < 0 || $product['purchase_price'] < 0 || $product['sale_price'] < 0 || $product['minimum_stock'] < 0 || $product['vat_rate'] < 0 || $product['vat_rate'] > 100) {
                $errors[] = "Rândul {$rowNumber}: stocul, prețurile și TVA-ul trebuie să aibă valori valide.";
            }

            $products[] = $product;
        }

        if ($products === []) {
            return back()->with('error', 'Nu am găsit produse de importat.');
        }

        if ($errors !== []) {
            return back()->with('error', 'Importul nu a fost efectuat. ' . implode(' ', array_slice($errors, 0, 5)));
        }

        $created = 0;
        $updated = 0;

        DB::transaction(function () use ($products, &$created, &$updated): void {
            foreach ($products as $data) {
                $existing = Product::query()
                    ->when($data['code'], fn ($query, $code) => $query->orWhere('code', $code))
                    ->when($data['ean'], fn ($query, $ean) => $query->orWhere('ean', $ean))
                    ->first();

                if ($existing) {
                    $existing->update($data);
                    $updated++;
                    continue;
                }

                Product::create($data);
                $created++;
            }
        });

        return redirect()->route('products.index')->with('success', "Import finalizat: {$created} produse adăugate, {$updated} actualizate.");
    }

    private function productColumn(string $header): string
    {
        $header = Str::of($header)->ascii()->lower()->trim()->replace([' ', '-', '/'], '_')->value();

        return [
            'denumire' => 'name', 'nume' => 'name', 'produs' => 'name',
            'cod' => 'code', 'sku' => 'code', 'ean' => 'ean', 'barcode' => 'ean',
            'categorie' => 'category', 'category' => 'category',
            'um' => 'unit', 'u_m' => 'unit', 'unitate' => 'unit', 'unit' => 'unit',
            'stoc' => 'stock_quantity', 'cantitate' => 'stock_quantity', 'stock_quantity' => 'stock_quantity',
            'pret_achizitie' => 'purchase_price', 'pret_cumparare' => 'purchase_price', 'purchase_price' => 'purchase_price',
            'pret_vanzare' => 'sale_price', 'sale_price' => 'sale_price',
            'tva' => 'vat_rate', 'cota_tva' => 'vat_rate', 'vat_rate' => 'vat_rate',
            'stoc_minim' => 'minimum_stock', 'minimum_stock' => 'minimum_stock',
            'activ' => 'active', 'active' => 'active', 'observatii' => 'notes', 'note' => 'notes', 'notes' => 'notes',
        ][$header] ?? $header;
    }

    private function sheetText(array $row, array $headers, string $field, ?int $maxLength = null): ?string
    {
        $value = isset($headers[$field]) ? trim((string) ($row[$headers[$field]] ?? '')) : '';

        return $value === '' ? null : Str::limit($value, $maxLength ?? PHP_INT_MAX, '');
    }

    private function sheetNumber(array $row, array $headers, string $field, float $default): float
    {
        if (!isset($headers[$field]) || $row[$headers[$field]] === '') {
            return $default;
        }

        $value = str_replace(' ', '', (string) $row[$headers[$field]]);
        $value = str_contains($value, ',') && str_contains($value, '.') ? str_replace(',', '.', str_replace('.', '', $value)) : str_replace(',', '.', $value);

        return is_numeric($value) ? (float) $value : $default;
    }

    private function sheetBoolean(array $row, array $headers, string $field, bool $default): bool
    {
        if (!isset($headers[$field]) || $row[$headers[$field]] === '') {
            return $default;
        }

        return !in_array(Str::lower(trim((string) $row[$headers[$field]])), ['0', 'nu', 'false', 'inactiv'], true);
    }

    /**
     * Afișare produs
     */
    public function show(Product $product)
    {
        return Inertia::render(
            'Products/Show',
            [
                'product' => $product,
            ]
        );
    }

    /**
     * Formular editare produs
     */
    public function edit(Product $product)
    {
        return Inertia::render(
            'Products/Edit',
            [
                'product' => $product,
            ]
        );
    }

    /**
     * Actualizare produs
     */
    public function update(
        Request $request,
        Product $product
    ) {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'code' => [
                'nullable',
                'string',
                'max:100',
                'unique:products,code,' . $product->id,
            ],

            'ean' => [
                'nullable',
                'string',
                'max:50',
                'unique:products,ean,' . $product->id,
            ],

            'category' => [
                'nullable',
                'string',
                'max:100',
            ],

            'product_category_id' => ['nullable', 'integer', 'exists:product_categories,id'],

            'unit' => [
                'required',
                'string',
                'max:50',
            ],

            'stock_quantity' => [
                'required',
                'numeric',
                'min:0',
            ],

            'purchase_price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'sale_price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'vat_rate' => [
                'required',
                'numeric',
                'min:0',
                'max:100',
            ],

            'minimum_stock' => [
                'required',
                'numeric',
                'min:0',
            ],

            'active' => [
                'required',
                'boolean',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ]);

        $product->update($validated);

        return redirect()
            ->route('products.index')
            ->with(
                'success',
                'Produsul a fost actualizat.'
            );
    }

    /**
     * Ștergere produs
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()
            ->route('products.index')
            ->with(
                'success',
                'Produsul a fost șters.'
            );
    }
}
