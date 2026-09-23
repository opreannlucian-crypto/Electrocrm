<?php

namespace App\Http\Controllers;

use App\Models\ProductCategory;
use App\Models\ChartAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductCategoryController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()?->isAdministrator() || $request->user()?->isSalesManager(), 403);

        return Inertia::render('ProductCategories/Index', [
            'categories' => ProductCategory::withCount('products')->orderBy('name')->get(),
            'accounts' => ChartAccount::where('active', true)->orderBy('code')->get(['code', 'name', 'class', 'type']),
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureAccess($request);
        ProductCategory::create($this->data($request));
        return back()->with('success', 'Categoria a fost adăugată.');
    }

    public function update(Request $request, ProductCategory $productCategory)
    {
        $this->ensureAccess($request);
        $productCategory->update($this->data($request, $productCategory));
        return back()->with('success', 'Categoria a fost actualizată.');
    }

    private function data(Request $request, ?ProductCategory $category = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:150', 'unique:product_categories,name' . ($category ? ',' . $category->id : '')],
            'code' => ['nullable', 'string', 'max:30', 'unique:product_categories,code' . ($category ? ',' . $category->id : '')],
            'inventory_account' => ['required', 'string', 'max:20'],
            'expense_account' => ['required', 'string', 'max:20'],
            'revenue_account' => ['required', 'string', 'max:20'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'active' => ['boolean'],
        ]);
    }

    private function ensureAccess(Request $request): void
    {
        abort_unless($request->user()?->isAdministrator() || $request->user()?->isSalesManager(), 403);
    }
}
