<?php

namespace App\Http\Controllers;

use App\Events\DomainNotificationEvent;
use App\Models\Client;
use App\Models\ApplicationSetting;
use App\Models\CompanyProfile;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\Service;
use App\Models\Receipt;
use App\Models\Quote;
use App\Models\WorkOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use App\Services\OblioService;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $invoices = Invoice::with('client')->latest('issue_date')->get()
            ->map(fn (Invoice $invoice) => array_merge($invoice->toArray(), [
                'issue_date' => $invoice->issue_date?->format('d.m.Y'),
            ]));
        return Inertia::render('Invoices/Index', ['invoices' => $invoices]);
    }

    public function create(Request $request)
    {
        $documentType = $request->is('proformas/create') ? 'proforma' : 'invoice';
        return Inertia::render('Invoices/Create', [
            'clients' => Client::orderBy('name')->get(),
            'products' => Product::where('active', true)->orderBy('name')->get(['id', 'name', 'code', 'unit', 'sale_price', 'vat_rate']),
            'services' => Service::where('active', true)->orderBy('name')->get(['id', 'name', 'code', 'unit', 'sale_price', 'vat_rate']),
            'quotes' => Quote::with(['client','items'])->whereIn('status', ['accepted','finalized','draft'])->latest()->get(),
            'workOrders' => WorkOrder::with('client')->latest()->get(),
            'sourceQuote' => $request->filled('quote') ? Quote::with(['client','items'])->findOrFail($request->integer('quote')) : null,
            'companyProfile' => CompanyProfile::current(),
            'issuerDefault' => [
                'name' => $request->user()?->employee?->name ?? $request->user()?->name,
            ],
            'documentType' => $documentType,
            'defaultSeries' => data_get(ApplicationSetting::value('document-series', ['series' => []]), 'series.' . ($documentType === 'proforma' ? 'proforma' : 'invoice'), $documentType === 'proforma' ? 'PF' : (CompanyProfile::current()->invoice_series ?: 'F')),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateInvoice($request);
        $invoice = DB::transaction(function () use ($data, $request) {
            $client = Client::findOrFail($data['client_id']);
            $workOrder = filled($data['work_order_id'] ?? null)
                ? WorkOrder::findOrFail($data['work_order_id'])
                : null;
            $company = CompanyProfile::current();
            $documentType = $data['document_type'] ?? 'invoice';
            $series = data_get(ApplicationSetting::value('document-series', ['series' => []]), 'series.' . ($documentType === 'proforma' ? 'proforma' : 'invoice'), $documentType === 'proforma' ? 'PF' : ($company->invoice_series ?: 'F'));
            $vatRate = $client->tva_status === 'neplatitor_tva' ? 0 : (float) ($data['vat_rate'] ?? $company->default_vat_rate ?? 21);
            $number = $series . '-' . now()->format('Y') . '-' . str_pad((string) (Invoice::where('document_type', $documentType)->whereYear('issue_date', now()->year)->lockForUpdate()->count() + 1), 5, '0', STR_PAD_LEFT);
            $invoice = Invoice::create([
                'client_id' => $client->id, 'quote_id' => $data['quote_id'] ?? null, 'work_order_id' => $workOrder?->id,
                'work_order_number' => $workOrder?->number, 'created_by' => $request->user()->id, 'series' => $series, 'number' => $number, 'issue_date' => $data['issue_date'], 'due_date' => $data['due_date'] ?? null,
                'delivery_date' => $data['delivery_date'] ?? null, 'collection_date' => $data['collection_date'] ?? null,
                'status' => 'draft', 'currency' => 'RON', 'document_type' => $documentType, 'discount' => $data['discount'] ?? 0, 'fixed_discount' => $data['fixed_discount'] ?? 0, 'vat_rate' => $vatRate, 'notes' => $data['notes'] ?? null,
                'issuer_name' => $data['issuer_name'] ?? null, 'issuer_identifier_type' => $data['issuer_identifier_type'] ?? null, 'issuer_identifier' => $data['issuer_identifier'] ?? null,
                'delegate_name' => $data['delegate_name'] ?? null, 'accompanying_document_number' => $data['accompanying_document_number'] ?? null, 'vehicle_number' => $data['vehicle_number'] ?? null,
                'buyer_snapshot' => $client->only(['name','cui','address','city','email','phone','tva_status']),
                'seller_snapshot' => $this->sellerSnapshot(),
            ]);
            $subtotal = $vatTotal = 0;
            foreach ($data['items'] as $item) {
                if (($item['type'] ?? null) === 'serviciu') {
                    $item['service_id'] = $this->resolveService($item)?->id;
                    $item['product_id'] = null;
                } else {
                    $item['service_id'] = null;
                }
                $itemVatRate = $client->tva_status === 'neplatitor_tva'
                    ? 0
                    : (float) ($item['vat_rate'] ?? $vatRate);
                $net = round((float)$item['quantity'] * (float)$item['unit_price'] * (1 - ((float)($item['discount'] ?? 0) / 100)), 2);
                $lineVat = round($net * $itemVatRate / 100, 2);
                $costUnit = !empty($item['product_id']) ? (float) (\App\Models\Product::find($item['product_id'])?->purchase_price ?? 0) : 0;
                $invoice->items()->create(array_merge($item, ['cost_unit'=>$costUnit,'vat_rate'=>$itemVatRate,'net_amount'=>$net,'vat_amount'=>$lineVat,'gross_amount'=>$net+$lineVat]));
                $subtotal += $net; $vatTotal += $lineVat;
            }
            $generalDiscount = (float)($data['discount'] ?? 0);
            $percentageDiscountValue = round($subtotal * $generalDiscount / 100, 2);
            $fixedDiscountValue = min(round((float) ($data['fixed_discount'] ?? 0), 2), max(0, $subtotal - $percentageDiscountValue));
            $discountValue = $percentageDiscountValue + $fixedDiscountValue;
            $effectiveVatRate = $subtotal > 0 ? ($vatTotal / $subtotal * 100) : 0;
            $vatTotal = round(max(0, $vatTotal - ($discountValue * $effectiveVatRate / 100)), 2);
            $invoice->update(['fixed_discount'=>$fixedDiscountValue, 'subtotal'=>$subtotal, 'vat_total'=>$vatTotal, 'total'=>round($subtotal - $discountValue + $vatTotal, 2)]);
            return $invoice;
        });
        return redirect()->route('invoices.show', $invoice)->with('success', $invoice->document_type === 'proforma' ? 'Proforma a fost creată.' : 'Factura a fost creată.');
    }

    public function convertToInvoice(Request $request, Invoice $invoice)
    {
        abort_unless($invoice->document_type === 'proforma', 422, 'Doar o proformă poate fi convertită în factură.');
        abort_if($invoice->converted_invoice_id, 422, 'Proforma a fost deja convertită.');
        $invoice->load('items');
        $new = DB::transaction(function () use ($invoice) {
            $copy = $invoice->replicate(['number', 'document_type', 'converted_invoice_id', 'status', 'paid_amount', 'efactura_status', 'oblio_status']);
            $copy->document_type = 'invoice';
            $copy->series = data_get(ApplicationSetting::value('document-series', ['series' => ['invoice' => 'F']]), 'series.invoice', 'F');
            $copy->number = $copy->series . '-' . now()->format('Y') . '-' . str_pad((string) (Invoice::where('document_type', 'invoice')->whereYear('issue_date', now()->year)->lockForUpdate()->count() + 1), 5, '0', STR_PAD_LEFT);
            $copy->status = 'draft';
            $copy->paid_amount = 0;
            $copy->save();
            foreach ($invoice->items as $item) { $copy->items()->create($item->only(['product_id','type','name','unit','quantity','unit_price','discount','vat_rate','net_amount','vat_amount','gross_amount'])); }
            $invoice->update(['converted_invoice_id' => $copy->id]);
            return $copy;
        });
        return redirect()->route('invoices.show', $new)->with('success', 'Proforma convertită în factură fiscală.');
    }

    public function show(Invoice $invoice, OblioService $oblio)
    {
        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice->load(['client','items.product','items.service','payments','quote','workOrder','oblioSyncLogs']),
            'canEdit' => $this->canEdit($invoice),
            'oblio' => [
                'configured' => $oblio->configured(),
                'enabled' => (bool) config('services.oblio.sync_enabled'),
                'spvExtern' => (bool) config('services.oblio.spv_extern'),
            ],
        ]);
    }

    public function edit(Request $request, Invoice $invoice)
    {
        $this->ensureEditable($invoice);

        return Inertia::render('Invoices/Create', [
            'invoice' => $invoice->load('items'),
            'clients' => Client::orderBy('name')->get(),
            'products' => Product::where('active', true)->orderBy('name')->get(['id', 'name', 'code', 'unit', 'sale_price', 'vat_rate']),
            'services' => Service::where('active', true)->orderBy('name')->get(['id', 'name', 'code', 'unit', 'sale_price', 'vat_rate']),
            'workOrders' => WorkOrder::with('client')->latest()->get(),
            'sourceQuote' => null,
            'companyProfile' => CompanyProfile::current(),
            'issuerDefault' => ['name' => $request->user()?->employee?->name ?? $request->user()?->name],
            'documentType' => $invoice->document_type,
            'defaultSeries' => $invoice->series,
        ]);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $this->ensureEditable($invoice);
        $data = $this->validateInvoice($request);

        DB::transaction(function () use ($data, $invoice) {
            $client = Client::findOrFail($data['client_id']);
            $workOrder = filled($data['work_order_id'] ?? null) ? WorkOrder::findOrFail($data['work_order_id']) : null;
            $company = CompanyProfile::current();
            $vatRate = $client->tva_status === 'neplatitor_tva' ? 0 : (float) ($data['vat_rate'] ?? $company->default_vat_rate ?? 21);

            $invoice->update([
                'client_id' => $client->id, 'quote_id' => $data['quote_id'] ?? null, 'work_order_id' => $workOrder?->id,
                'work_order_number' => $workOrder?->number, 'issue_date' => $data['issue_date'], 'due_date' => $data['due_date'] ?? null,
                'delivery_date' => $data['delivery_date'] ?? null, 'collection_date' => $data['collection_date'] ?? null,
                'discount' => $data['discount'] ?? 0, 'fixed_discount' => $data['fixed_discount'] ?? 0, 'vat_rate' => $vatRate,
                'notes' => $data['notes'] ?? null, 'issuer_name' => $data['issuer_name'] ?? null,
                'issuer_identifier_type' => $data['issuer_identifier_type'] ?? null, 'issuer_identifier' => $data['issuer_identifier'] ?? null,
                'delegate_name' => $data['delegate_name'] ?? null, 'accompanying_document_number' => $data['accompanying_document_number'] ?? null,
                'vehicle_number' => $data['vehicle_number'] ?? null,
                'buyer_snapshot' => $client->only(['name','cui','address','city','email','phone','tva_status']),
            ]);
            $invoice->items()->delete();

            $subtotal = $vatTotal = 0;
            foreach ($data['items'] as $item) {
                if (($item['type'] ?? null) === 'serviciu') {
                    $item['service_id'] = $this->resolveService($item)?->id;
                    $item['product_id'] = null;
                } else {
                    $item['service_id'] = null;
                }
                $itemVatRate = $client->tva_status === 'neplatitor_tva' ? 0 : (float) ($item['vat_rate'] ?? $vatRate);
                $net = round((float) $item['quantity'] * (float) $item['unit_price'] * (1 - ((float) ($item['discount'] ?? 0) / 100)), 2);
                $lineVat = round($net * $itemVatRate / 100, 2);
                $costUnit = !empty($item['product_id']) ? (float) (Product::find($item['product_id'])?->purchase_price ?? 0) : 0;
                $invoice->items()->create(array_merge($item, ['cost_unit' => $costUnit, 'vat_rate' => $itemVatRate, 'net_amount' => $net, 'vat_amount' => $lineVat, 'gross_amount' => $net + $lineVat]));
                $subtotal += $net;
                $vatTotal += $lineVat;
            }
            $percentageDiscountValue = round($subtotal * (float) ($data['discount'] ?? 0) / 100, 2);
            $fixedDiscountValue = min(round((float) ($data['fixed_discount'] ?? 0), 2), max(0, $subtotal - $percentageDiscountValue));
            $discountValue = $percentageDiscountValue + $fixedDiscountValue;
            $effectiveVatRate = $subtotal > 0 ? ($vatTotal / $subtotal * 100) : 0;
            $vatTotal = round(max(0, $vatTotal - ($discountValue * $effectiveVatRate / 100)), 2);
            $invoice->update(['fixed_discount' => $fixedDiscountValue, 'subtotal' => $subtotal, 'vat_total' => $vatTotal, 'total' => round($subtotal - $discountValue + $vatTotal, 2)]);
        });

        return redirect()->route('invoices.show', $invoice)->with('success', $invoice->document_type === 'proforma' ? 'Proforma a fost actualizată.' : 'Factura a fost actualizată.');
    }

    public function addPayment(Request $request, Invoice $invoice)
    {
        if (config('services.oblio.sync_enabled') && $invoice->status === 'draft' && $invoice->oblio_status !== 'issued') {
            return back()->withErrors(['oblio' => 'Emite mai întâi factura în Oblio înainte de a înregistra o plată.']);
        }

        $data = $request->validate(['amount'=>'required|numeric|min:0.01','paid_at'=>'required|date','method'=>'required|string|max:30','reference'=>'nullable|string|max:100','notes'=>'nullable|string']);
        if ((float) $data['amount'] > ((float) $invoice->total - (float) $invoice->paid_amount + 0.01)) { return back()->withErrors(['amount' => 'Plata depășește soldul facturii.']); }
        [$payment, $wasDraft] = DB::transaction(function () use ($invoice, $data, $request) {
            $payment = $invoice->payments()->create($data);
            Receipt::firstOrCreate(
                ['invoice_payment_id' => $payment->id],
                $this->receiptDataForPayment($invoice, $payment, $request->user()?->id)
            );

            $wasDraft = $invoice->status === 'draft';
            if ($wasDraft) { $invoice->update(['status'=>'issued']); }
            $invoice->refreshPaymentStatus();
            if (!$invoice->collection_date && $invoice->status === 'paid') {
                $invoice->update(['collection_date' => $data['paid_at']]);
            }

            return [$payment, $wasDraft];
        });
        if ($wasDraft) {
            DomainNotificationEvent::dispatch(
                'invoice.issued',
                $invoice->fresh(['client']),
                $request->user(),
                ['dedupe_context' => 'invoice-issued:' . $invoice->id]
            );
        }
        return back()->with('success','Plata a fost înregistrată.');
    }

    private function receiptDataForPayment(Invoice $invoice, $payment, ?int $userId): array
    {
        $paymentMethod = match ($payment->method) {
            'cash' => 'cash',
            'transfer' => 'bank_transfer',
            'card' => 'pos',
            default => 'other',
        };

        return [
            'client_id' => $invoice->client_id,
            'invoice_id' => $invoice->id,
            'source_type' => $invoice->document_type === 'proforma' ? 'proforma' : 'invoice',
            'document_series' => $invoice->series,
            'document_number' => $invoice->number,
            'received_at' => $payment->paid_at,
            'amount' => $payment->amount,
            'vat_amount' => 0,
            'payment_method' => $paymentMethod,
            'register_type' => $paymentMethod === 'cash' ? 'cash' : 'bank',
            'notes' => $payment->notes,
            'created_by' => $userId,
        ];
    }

    public function issue(Request $request, Invoice $invoice)
    {
        abort_if(config('services.oblio.sync_enabled'), 422, 'Emiterea directă este dezactivată. Folosește acțiunea „Emite în Oblio”.');
        $documentLabel = $invoice->document_type === 'proforma' ? 'Factura proformă' : 'Factura';
        abort_if($invoice->status === 'cancelled', 422, "{$documentLabel} anulată nu poate fi emisă.");

        $wasIssued = $invoice->status === 'issued';
        $invoice->update(['status' => 'issued']);

        if (!$wasIssued) {
            DomainNotificationEvent::dispatch(
                'invoice.issued',
                $invoice->fresh(['client']),
                $request->user(),
                ['dedupe_context' => 'invoice-issued:' . $invoice->id]
            );
        }

        return back()->with('success', "{$documentLabel} a fost emisă.");
    }

    public function pdf(Invoice $invoice)
    {
        $invoice->load(['client','items','payments','workOrder']);
        return Pdf::loadView('invoices.pdf', compact('invoice'))->download($invoice->number . '.pdf');
    }

    public function efactura(Invoice $invoice)
    {
        abort_if($invoice->document_type === 'proforma', 422, 'Factura proformă nu se transmite prin RO e-Factura. Convertește-o mai întâi în factură fiscală.');
        abort_if(config('services.oblio.spv_extern') && $invoice->oblio_status === 'issued', 422, 'Transmiterea e-Factura este administrată prin Oblio pentru această factură.');
        abort_unless(in_array($invoice->status, ['issued','partially_paid','paid'], true), 422, 'Emite factura înainte de transmitere.');
        $xml = $this->ublXml($invoice->load(['client','items']));
        $path = 'efactura/' . $invoice->number . '.xml';
        Storage::disk('local')->put($path, $xml);
        $invoice->update(['efactura_xml_path'=>$path, 'efactura_status'=>'ready', 'efactura_message'=>'XML UBL pregătit pentru transmitere.']);
        $token = config('services.efactura.token');
        $cif = preg_replace('/\D/', '', (string) data_get($invoice->seller_snapshot, 'cui', CompanyProfile::current()->cui));
        if (!$token || !$cif) { return back()->with('success','XML e-Factura a fost generat. Configurează EFAC_TOKEN și EFAC_CIF pentru transmiterea către ANAF.'); }
        $base = config('services.efactura.environment') === 'test' ? 'https://api.anaf.ro/test' : 'https://api.anaf.ro/prod';
        $endpoint = $base . '/FCTEL/rest/' . ($invoice->client->type === 'persoana_fizica' ? 'uploadb2c' : 'upload');
        $response = Http::withToken($token)->attach('file', $xml, $invoice->number . '.xml')->post($endpoint, ['standard'=>'UBL','cif'=>$cif]);
        if (!$response->successful()) { $invoice->update(['efactura_status'=>'error','efactura_message'=>'ANAF: '.$response->body()]); return back()->withErrors(['efactura'=>'Transmiterea ANAF a eșuat.']); }
        $payload = $response->json();
        $invoice->update(['efactura_status'=>'sent','efactura_upload_id'=>$payload['id_incarcare'] ?? $payload['index_incarcare'] ?? null,'efactura_message'=>$response->body(),'efactura_sent_at'=>now()]);
        return back()->with('success','Factura a fost transmisă către RO e-Factura.');
    }

    private function validateInvoice(Request $request): array
    {
        return $request->validate([
            'document_type'=>'nullable|in:invoice,proforma','client_id'=>'required|exists:clients,id','quote_id'=>'nullable|exists:quotes,id','work_order_id'=>'nullable|exists:work_orders,id','series'=>'nullable|string|max:20','issue_date'=>'required|date','due_date'=>'nullable|date|after_or_equal:issue_date','delivery_date'=>'nullable|date','collection_date'=>'nullable|date','vat_rate'=>'nullable|numeric|min:0|max:100','discount'=>'nullable|numeric|min:0|max:100','fixed_discount'=>'nullable|numeric|min:0','notes'=>'nullable|string|max:4000','issuer_name'=>'nullable|string|max:150','issuer_identifier_type'=>'nullable|in:CNP,CI,BI,Pașaport','issuer_identifier'=>'nullable|string|max:100','delegate_name'=>'nullable|string|max:150','accompanying_document_number'=>'nullable|string|max:100','vehicle_number'=>'nullable|string|max:50','items'=>'required|array|min:1','items.*.product_id'=>'nullable|exists:products,id','items.*.service_id'=>'nullable|exists:services,id','items.*.type'=>'required|string','items.*.name'=>'required|string|max:255','items.*.unit'=>'required|string|max:20','items.*.quantity'=>'required|numeric|gt:0','items.*.unit_price'=>'required|numeric|min:0','items.*.discount'=>'nullable|numeric|min:0|max:100','items.*.vat_rate'=>'nullable|numeric|min:0|max:100',
        ]);
    }

    private function resolveService(array $item): ?Service
    {
        if (!empty($item['service_id'])) {
            return Service::find($item['service_id']);
        }

        $name = trim((string) ($item['name'] ?? ''));
        if ($name === '') {
            return null;
        }

        return Service::query()->whereRaw('lower(name) = ?', [mb_strtolower($name)])->first()
            ?? Service::create([
                'name' => $name,
                'unit' => $item['unit'] ?: 'serviciu',
                'sale_price' => $item['unit_price'] ?? 0,
                'vat_rate' => $item['vat_rate'] ?? 21,
                'active' => true,
            ]);
    }

    private function canEdit(Invoice $invoice): bool
    {
        return $invoice->status !== 'cancelled'
            && (float) $invoice->paid_amount === 0.0
            && !$invoice->payments()->exists()
            && $invoice->oblio_status !== 'issued'
            && !$invoice->efactura_sent_at
            && !($invoice->document_type === 'proforma' && $invoice->converted_invoice_id);
    }

    private function ensureEditable(Invoice $invoice): void
    {
        abort_unless($this->canEdit($invoice), 422, 'Documentul nu mai poate fi editat deoarece are încasări, a fost transmis fiscal sau proforma a fost deja convertită în factură.');
    }

    private function sellerSnapshot(): array
    {
        $company = CompanyProfile::current();
        return ['name'=>$company->name,'cui'=>$company->cui,'registration_number'=>$company->registration_number,'address'=>trim(collect([$company->address, $company->city, $company->county])->filter()->implode(', ')),'iban'=>$company->iban,'bank'=>$company->bank,'email'=>$company->email,'phone'=>$company->phone,'footer'=>$company->invoice_footer];
    }

    private function ublXml(Invoice $invoice): string
    {
        $seller = $invoice->seller_snapshot ?: []; $buyer = $invoice->buyer_snapshot ?: [];
        $e = fn($v) => htmlspecialchars((string)$v, ENT_XML1 | ENT_QUOTES, 'UTF-8');
        $lines = ''; $n = 1;
        foreach ($invoice->items as $item) { $lines .= '<cac:InvoiceLine><cbc:ID>'.$n++.'</cbc:ID><cbc:InvoicedQuantity unitCode="C62">'.$item->quantity.'</cbc:InvoicedQuantity><cbc:LineExtensionAmount currencyID="RON">'.$item->net_amount.'</cbc:LineExtensionAmount><cac:Item><cbc:Name>'.$e($item->name).'</cbc:Name></cac:Item><cac:Price><cbc:PriceAmount currencyID="RON">'.$item->unit_price.'</cbc:PriceAmount></cac:Price></cac:InvoiceLine>'; }
        return '<?xml version="1.0" encoding="UTF-8"?><Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"><cbc:ID>'.$e($invoice->number).'</cbc:ID><cbc:IssueDate>'.$invoice->issue_date->format('Y-m-d').'</cbc:IssueDate><cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode><cbc:DocumentCurrencyCode>RON</cbc:DocumentCurrencyCode><cac:AccountingSupplierParty><cac:Party><cac:PartyName><cbc:Name>'.$e($seller['name'] ?? '').'</cbc:Name></cac:PartyName><cac:PartyTaxScheme><cbc:CompanyID>'.$e($seller['cui'] ?? '').'</cbc:CompanyID></cac:PartyTaxScheme></cac:Party></cac:AccountingSupplierParty><cac:AccountingCustomerParty><cac:Party><cac:PartyName><cbc:Name>'.$e($buyer['name'] ?? '').'</cbc:Name></cac:PartyName><cac:PartyTaxScheme><cbc:CompanyID>'.$e($buyer['cui'] ?? '').'</cbc:CompanyID></cac:PartyTaxScheme></cac:Party></cac:AccountingCustomerParty><cac:TaxTotal><cbc:TaxAmount currencyID="RON">'.$invoice->vat_total.'</cbc:TaxAmount></cac:TaxTotal><cac:LegalMonetaryTotal><cbc:LineExtensionAmount currencyID="RON">'.$invoice->subtotal.'</cbc:LineExtensionAmount><cbc:TaxExclusiveAmount currencyID="RON">'.$invoice->subtotal.'</cbc:TaxExclusiveAmount><cbc:TaxInclusiveAmount currencyID="RON">'.$invoice->total.'</cbc:TaxInclusiveAmount><cbc:PayableAmount currencyID="RON">'.$invoice->total.'</cbc:PayableAmount></cac:LegalMonetaryTotal>'.$lines.'</Invoice>';
    }
}
