<?php

namespace App\Http\Controllers;

use App\Models\{Client, CompanyProfile, Invoice, InvoicePayment, Receipt};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class ReceiptController extends Controller {
 public function index(Request $r){
    $this->syncInvoicePayments();
    $q=Receipt::with(['client','invoice'])->latest('received_at'); if($r->filled('register_type'))$q->where('register_type',$r->register_type); if($r->filled('from'))$q->whereDate('received_at','>=',$r->from); if($r->filled('to'))$q->whereDate('received_at','<=',$r->to); $receipts=$q->get()->map(fn(Receipt $receipt)=>array_merge($receipt->toArray(),['received_at'=>$receipt->received_at?->format('d.m.Y')])); return Inertia::render('Receipts/Index',['receipts'=>$receipts,'clients'=>Client::orderBy('name')->get(),'invoices'=>Invoice::where('document_type','invoice')->latest()->get(),'filters'=>$r->only(['register_type','from','to']),'totals'=>['cash'=>Receipt::where('register_type','cash')->sum(DB::raw('CASE WHEN is_return=1 THEN -amount ELSE amount END')),'bank'=>Receipt::where('register_type','bank')->sum(DB::raw('CASE WHEN is_return=1 THEN -amount ELSE amount END'))]]);
 }
 public function store(Request $r){$d=$r->validate(['client_id'=>'nullable|exists:clients,id','invoice_id'=>'nullable|exists:invoices,id','source_type'=>'required|in:invoice,bon,proforma,chitanta,other','document_series'=>'nullable|string|max:30','document_number'=>'nullable|string|max:80','received_at'=>'required|date','amount'=>'required|numeric|gt:0','vat_amount'=>'nullable|numeric|min:0','payment_method'=>'required|in:cash,pos,bank_transfer,check,cod,other','register_type'=>'required|in:cash,bank','cash_register_number'=>'nullable|string|max:80','is_return'=>'boolean','reversal_of_id'=>'nullable|exists:receipts,id','z_report_number'=>'nullable|string|max:80','notes'=>'nullable|string|max:4000']); $d['vat_amount']=$d['vat_amount'] ?? 0; $d['created_by']=$r->user()->id; Receipt::create($d); return back()->with('success','Încasarea a fost înregistrată.');}
 public function pdf(Receipt $receipt){$receipt->load(['client','invoice']); $company=CompanyProfile::current(); $number=trim(($receipt->document_series?:'INC').' '.($receipt->document_number?:$receipt->id)); return Pdf::loadView('receipts.pdf',compact('receipt','company'))->setPaper('a5','portrait')->download('dovada-incasare-'.str_replace([' ','/'],'-',$number).'.pdf');}
 public function destroy(Receipt $receipt){$receipt->delete();return back()->with('success','Încasarea a fost ștearsă.');}

 private function syncInvoicePayments(): void {
    InvoicePayment::with('invoice')->whereDoesntHave('receipt')->orderBy('id')->each(function (InvoicePayment $payment) {
        $invoice = $payment->invoice;
        if (!$invoice) return;
        $method = match ($payment->method) {'cash' => 'cash', 'transfer' => 'bank_transfer', 'card' => 'pos', default => 'other'};
        Receipt::firstOrCreate(['invoice_payment_id' => $payment->id], [
            'client_id'=>$invoice->client_id, 'invoice_id'=>$invoice->id,
            'source_type'=>$invoice->document_type === 'proforma' ? 'proforma' : 'invoice',
            'document_series'=>$invoice->series, 'document_number'=>$invoice->number,
            'received_at'=>$payment->paid_at, 'amount'=>$payment->amount, 'vat_amount'=>0,
            'payment_method'=>$method, 'register_type'=>$method === 'cash' ? 'cash' : 'bank',
            'notes'=>$payment->notes,
        ]);
    });
 }
}
