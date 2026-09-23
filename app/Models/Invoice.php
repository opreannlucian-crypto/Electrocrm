<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    protected $fillable = [
        'client_id','quote_id','work_order_id','work_order_number','series','number','document_type','converted_invoice_id','issue_date','due_date','delivery_date','collection_date','status','currency','discount','fixed_discount','vat_rate','subtotal','vat_total','total','paid_amount','notes','issuer_name','issuer_identifier_type','issuer_identifier','delegate_name','accompanying_document_number','vehicle_number','seller_snapshot','buyer_snapshot','efactura_status','efactura_upload_id','efactura_message','efactura_xml_path','efactura_response_path','efactura_sent_at','efactura_confirmed_at','oblio_status','oblio_cif','oblio_series','oblio_number','oblio_document_url','oblio_idempotency_key','oblio_payload_hash','oblio_error_message','oblio_last_synced_at','oblio_issued_at',
    ];

    protected $casts = [
        'issue_date' => 'date','due_date' => 'date','document_type' => 'string','delivery_date' => 'date','collection_date' => 'date','efactura_sent_at' => 'datetime','efactura_confirmed_at' => 'datetime','oblio_last_synced_at' => 'datetime','oblio_issued_at' => 'datetime','issuer_identifier' => 'encrypted','seller_snapshot' => 'array','buyer_snapshot' => 'array',
        'discount' => 'decimal:2','fixed_discount' => 'decimal:2','vat_rate' => 'decimal:2','subtotal' => 'decimal:2','vat_total' => 'decimal:2','total' => 'decimal:2','paid_amount' => 'decimal:2',
    ];

    public function client(): BelongsTo { return $this->belongsTo(Client::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
    public function convertedInvoice(): BelongsTo { return $this->belongsTo(self::class, 'converted_invoice_id'); }
    public function quote(): BelongsTo { return $this->belongsTo(Quote::class); }
    public function workOrder(): BelongsTo { return $this->belongsTo(WorkOrder::class); }
    public function items(): HasMany { return $this->hasMany(InvoiceItem::class); }
    public function payments(): HasMany { return $this->hasMany(InvoicePayment::class)->latest('paid_at'); }
    public function oblioSyncLogs(): HasMany { return $this->hasMany(OblioSyncLog::class)->latest('occurred_at'); }

    public function refreshPaymentStatus(): void
    {
        $paid = (float) $this->payments()->sum('amount');
        $total = (float) $this->total;
        $this->paid_amount = $paid;
        if ($this->status !== 'cancelled') {
            $this->status = $paid <= 0 ? ($this->status === 'draft' ? 'draft' : 'issued') : ($paid + 0.005 >= $total ? 'paid' : 'partially_paid');
        }
        $this->save();
    }
}
