<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyProfile extends Model
{
    protected $fillable = ['name','cui','registration_number','address','city','county','postal_code','email','phone','iban','bank','default_vat_rate','invoice_series','invoice_footer'];
    protected $casts = ['default_vat_rate' => 'decimal:2'];

    public static function current(): self
    {
        return static::firstOrCreate([], ['default_vat_rate' => 21, 'invoice_series' => 'F']);
    }
}
