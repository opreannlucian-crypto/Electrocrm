<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class Receipt extends Model {
 protected $fillable=['client_id','invoice_id','invoice_payment_id','source_type','document_series','document_number','received_at','amount','vat_amount','payment_method','register_type','cash_register_number','is_return','reversal_of_id','z_report_number','notes','created_by'];
 protected $casts=['received_at'=>'date','amount'=>'decimal:2','vat_amount'=>'decimal:2','is_return'=>'boolean'];
 public function client(): BelongsTo{return $this->belongsTo(Client::class);} public function invoice(): BelongsTo{return $this->belongsTo(Invoice::class);} public function invoicePayment(): BelongsTo{return $this->belongsTo(InvoicePayment::class);} public function creator(): BelongsTo{return $this->belongsTo(User::class,'created_by');} public function reversalOf(): BelongsTo{return $this->belongsTo(self::class,'reversal_of_id');}
}
