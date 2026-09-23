<?php

namespace Database\Seeders;

use App\Models\CompanyProfile;
use Illuminate\Database\Seeder;

class DemoCompanyProfileSeeder extends Seeder
{
    public function run(): void
    {
        CompanyProfile::current()->update([
            'name' => 'SC ELECTRODEP SRL',
            'cui' => 'RO23457886',
            'address' => 'Str. Alexe Turcas, nr. 21',
            'city' => 'Vintu De Jos',
            'county' => 'Alba',
            'iban' => null,
            'bank' => null,
            'email' => null,
            'phone' => null,
            'default_vat_rate' => 21,
            'invoice_series' => 'F',
        ]);
    }
}
