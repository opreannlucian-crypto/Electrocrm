<?php

namespace App\Http\Controllers;

use App\Models\{CashPayment, Invoice, InvoiceItem, Reception, Receipt, SupplierPayment};
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;

class OperationalReportController extends Controller
{
    private const KINDS = ['receptions', 'proformas', 'bank-journal', 'documents', 'sales-agents', 'sales-products', 'product-profit', 'expenses-categories'];

    public function show(Request $request, string $kind)
    {
        abort_unless(in_array($kind, self::KINDS, true), 404);
        abort_unless($request->user()?->isAdministrator() || $request->user()?->isSalesManager(), 403);
        $filters = $request->validate(['from' => ['nullable', 'date'], 'to' => ['nullable', 'date', 'after_or_equal:from']]);
        $data = match ($kind) {
            'receptions' => $this->receptions($filters),
            'proformas' => $this->proformas($filters),
            'bank-journal' => $this->bankJournal($filters),
            'documents' => $this->documents($filters),
            'sales-agents' => $this->salesAgents($filters),
            'sales-products' => $this->salesProducts($filters, false),
            'product-profit' => $this->salesProducts($filters, true),
            'expenses-categories' => $this->expensesCategories($filters),
        };

        return Inertia::render('OperationalReports/Index', [...$data, 'kind' => $kind, 'filters' => $filters]);
    }

    private function date(Builder $query, array $filters, string $column): Builder
    {
        return $query->when($filters['from'] ?? null, fn ($q, $date) => $q->whereDate($column, '>=', $date))->when($filters['to'] ?? null, fn ($q, $date) => $q->whereDate($column, '<=', $date));
    }

    private function receptions(array $filters): array
    {
        $rows = $this->date(Reception::with(['supplier:id,name','warehouse:id,name']), $filters, 'received_at')->latest('received_at')->get()->map(fn ($r) => [$r->received_at?->format('Y-m-d'), $r->number, $r->supplier?->name ?? '—', $r->warehouse?->name ?? '—', (float) $r->total]);
        return $this->table('Raport recepții furnizori', 'Intrările în gestiune din recepțiile de la furnizori.', ['Data','NIR','Furnizor','Gestiune','Total'], $rows, [['label'=>'Total recepționat','value'=>$rows->sum(4)]]);
    }

    private function proformas(array $filters): array
    {
        $rows = $this->date(Invoice::with(['client:id,name','convertedInvoice:id,number'])->where('document_type','proforma'), $filters, 'issue_date')->latest('issue_date')->get()->map(fn ($i) => [$i->issue_date?->format('Y-m-d'), $i->number, $i->client?->name ?? '—', $i->status, $i->convertedInvoice ? 'Da · ' . $i->convertedInvoice->number : 'Nu', (float) $i->total, (float) $i->paid_amount, (float) $i->total - (float) $i->paid_amount]);
        return $this->table('Raport proforme', 'Proforme emise, încasări, sold și conversia în factură.', ['Data','Număr','Client','Status','Convertită în factură','Total','Încasat','Sold'], $rows, [['label'=>'Total proforme','value'=>$rows->sum(5)],['label'=>'Sold rămas','value'=>$rows->sum(7)]]);
    }

    private function bankJournal(array $filters): array
    {
        $in = $this->date(Receipt::with('client:id,name')->where('register_type','bank'), $filters, 'received_at')->get()->map(fn ($r) => ['date'=>$r->received_at?->format('Y-m-d'),'type'=>'Încasare','partner'=>$r->client?->name ?? 'Client neprecizat','document'=>trim(($r->document_series ?? '').' '.($r->document_number ?? '')) ?: '—','in'=>$r->is_return ? 0 : (float)$r->amount,'out'=>$r->is_return ? (float)$r->amount : 0]);
        $out = $this->date(SupplierPayment::with('supplier:id,name')->where('payment_method','bank_transfer'), $filters, 'paid_at')->get()->map(fn ($p) => ['date'=>$p->paid_at?->format('Y-m-d'),'type'=>'Plată furnizor','partner'=>$p->supplier?->name ?? '—','document'=>$p->document_number ?: $p->reference ?: '—','in'=>0,'out'=>(float)$p->amount]);
        $balance = 0; $rows = $in->concat($out)->sortBy('date')->values()->map(function ($row) use (&$balance) { $balance += $row['in'] - $row['out']; return [$row['date'],$row['type'],$row['partner'],$row['document'],$row['in'],$row['out'],$balance]; });
        return $this->table('Raport jurnal bancă', 'Încasări și plăți realizate prin bancă.', ['Data','Tip','Partener','Document','Intrare','Ieșire','Sold cumulativ'], $rows, [['label'=>'Încasări bancă','value'=>$rows->sum(4)],['label'=>'Plăți bancă','value'=>$rows->sum(5)],['label'=>'Sold net','value'=>$rows->sum(4)-$rows->sum(5)]]);
    }

    private function documents(array $filters): array
    {
        $invoices = $this->date(Invoice::with('client:id,name'), $filters, 'issue_date')->get()->map(fn($i)=>['date'=>$i->issue_date?->format('Y-m-d'),'type'=>$i->document_type==='proforma'?'Proformă':'Factură','number'=>$i->number,'partner'=>$i->client?->name ?? '—','value'=>(float)$i->total]);
        $receptions = $this->date(Reception::with('supplier:id,name'), $filters, 'received_at')->get()->map(fn($r)=>['date'=>$r->received_at?->format('Y-m-d'),'type'=>'Recepție furnizor','number'=>$r->number,'partner'=>$r->supplier?->name ?? '—','value'=>(float)$r->total]);
        $rows=$invoices->concat($receptions)->sortByDesc('date')->values()->map(fn($r)=>[$r['date'],$r['type'],$r['number'],$r['partner'],$r['value']]);
        return $this->table('Raport documente', 'Centralizator documente, direct în aplicație, fără a descărca documente.', ['Data','Tip','Număr','Partener','Valoare'], $rows, [['label'=>'Documente','value'=>$rows->count(), 'money'=>false],['label'=>'Valoare totală','value'=>$rows->sum(4)]]);
    }

    private function salesAgents(array $filters): array
    {
        $invoices=$this->date(Invoice::with('creator:id,name')->where('document_type','invoice')->where('status','!=','cancelled'),$filters,'issue_date')->get();
        $rows=$invoices->groupBy(fn($i)=>$i->creator?->name ?? 'Nealocat (documente vechi)')->map(fn($items,$name)=>[$name,$items->count(),(float)$items->sum('total'),(float)$items->sum('paid_amount')])->sortByDesc(2)->values();
        return $this->table('Raport vânzări pe agent', 'Agentul este salvat pentru documentele emise de acum înainte; documentele vechi apar nealocate.', ['Agent','Facturi','Vânzări','Încasat'], $rows, [['label'=>'Vânzări totale','value'=>$rows->sum(2)]]);
    }

    private function salesProducts(array $filters, bool $profit): array
    {
        $items = InvoiceItem::with('product:id,purchase_price')->whereHas('invoice', fn($q) => $this->date($q->where('document_type','invoice')->where('status','!=','cancelled'), $filters, 'issue_date'))->get();
        $rows = $items->groupBy(fn($item) => $item->product?->name ?? $item->name)->map(function ($items, $name) use ($profit) { $sales=(float)$items->sum('net_amount'); $cost=(float)$items->sum(fn($item)=>(float)$item->quantity * (float)($item->cost_unit ?? $item->product?->purchase_price ?? 0)); return $profit ? [$name,(float)$items->sum('quantity'),$sales,$cost,$sales-$cost,$sales > 0 ? round((($sales-$cost)/$sales)*100,2) : 0] : [$name,(float)$items->sum('quantity'),$sales]; })->sortByDesc($profit ? 4 : 2)->values();
        return $profit ? $this->table('Raport profit pe produs', 'Costul este salvat pe facturile noi; pentru cele vechi se folosește costul actual al produsului.', ['Produs','Cantitate','Vânzări fără TVA','Cost','Profit','Marjă %'], $rows, [['label'=>'Profit total','value'=>$rows->sum(4)]]) : $this->table('Raport vânzări pe produs', 'Vânzări facturate, fără TVA, grupate pe produs.', ['Produs','Cantitate','Vânzări fără TVA'], $rows, [['label'=>'Vânzări totale','value'=>$rows->sum(2)]]);
    }

    private function expensesCategories(array $filters): array
    {
        $supplier=$this->date(SupplierPayment::where('payment_method','!=','cash'),$filters,'paid_at')->get()->map(fn($p)=>['category'=>$p->expense_category ?: 'Achiziții furnizori','value'=>(float)$p->amount]);
        $cash=$this->date(CashPayment::where('operation_type','expense'),$filters,'paid_at')->get()->map(fn($p)=>['category'=>$p->expense_category ?: 'Cheltuieli casierie','value'=>(float)$p->amount]);
        $rows=$supplier->concat($cash)->groupBy('category')->map(fn($items,$category)=>[$category,$items->count(),(float)$items->sum('value')])->sortByDesc(2)->values();
        return $this->table('Raport cheltuieli pe categorii', 'Plăți către furnizori și cheltuieli de casierie. Cheltuielile neîncadrate apar într-o categorie implicită.', ['Categorie','Operațiuni','Valoare'], $rows, [['label'=>'Cheltuieli totale','value'=>$rows->sum(2)]]);
    }

    private function table(string $title, string $description, array $columns, Collection $rows, array $summary): array
    {
        $moneyColumns = collect($columns)->keys()->filter(fn ($index) => in_array($columns[$index], ['Total','Încasat','Sold','Intrare','Ieșire','Sold cumulativ','Valoare','Vânzări','Vânzări fără TVA','Cost','Profit'], true))->values();
        return compact('title','description','columns','rows','summary','moneyColumns');
    }
}
