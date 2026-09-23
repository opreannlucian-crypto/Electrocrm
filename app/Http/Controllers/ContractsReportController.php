<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Contract;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContractsReportController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'client_id' => ['nullable', 'exists:clients,id'],
            'contract_type' => ['nullable', 'string', 'max:255'],
        ]);

        $contracts = Contract::query()
            ->with(['client', 'workOrder'])
            ->when($filters['date_from'] ?? null, fn ($query, $date) => $query->whereDate('contract_date', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($query, $date) => $query->whereDate('contract_date', '<=', $date))
            ->when($filters['client_id'] ?? null, fn ($query, $clientId) => $query->where('client_id', $clientId))
            ->when($filters['contract_type'] ?? null, fn ($query, $type) => $query->where('type', $type))
            ->orderByDesc('contract_date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Contract $contract) => [
                'id' => $contract->id,
                'number' => $contract->number,
                'date' => $contract->contract_date?->format('Y-m-d'),
                'type' => $contract->type,
                'title' => $contract->title,
                'client_name' => $contract->client?->name,
                'work_order_number' => $contract->workOrder?->number,
                'status' => $contract->status,
                'value' => $contract->value,
                'currency' => $contract->currency ?: 'RON',
            ]);

        return Inertia::render('ContractsReports/Index', [
            'contracts' => $contracts,
            'clients' => Client::orderBy('name')->get(['id', 'name']),
            'types' => Contract::query()->whereNotNull('type')->where('type', '!=', '')->distinct()->orderBy('type')->pluck('type')->values(),
            'filters' => [
                'date_from' => $filters['date_from'] ?? '',
                'date_to' => $filters['date_to'] ?? '',
                'client_id' => $filters['client_id'] ?? '',
                'contract_type' => $filters['contract_type'] ?? '',
            ],
        ]);
    }
}
