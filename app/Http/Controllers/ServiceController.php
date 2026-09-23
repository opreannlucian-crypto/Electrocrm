<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->input('search', ''));

        return Inertia::render('Services/Index', [
            'services' => Service::query()
                ->when($search !== '', fn ($query) => $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%")))
                ->orderBy('name')
                ->get(),
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request)
    {
        Service::create($this->validated($request));
        return back()->with('success', 'Serviciul a fost adăugat în nomenclator.');
    }

    public function update(Request $request, Service $service)
    {
        $service->update($this->validated($request, $service));
        return back()->with('success', 'Serviciul a fost actualizat.');
    }

    public function destroy(Service $service)
    {
        $service->delete();
        return back()->with('success', 'Serviciul a fost șters din nomenclator.');
    }

    private function validated(Request $request, ?Service $service = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:services,name' . ($service ? ',' . $service->id : '')],
            'code' => ['nullable', 'string', 'max:100', 'unique:services,code' . ($service ? ',' . $service->id : '')],
            'unit' => ['required', 'string', 'max:20'],
            'sale_price' => ['required', 'numeric', 'min:0'],
            'vat_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'active' => ['boolean'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);
    }
}
