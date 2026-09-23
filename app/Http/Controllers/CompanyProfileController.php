<?php

namespace App\Http\Controllers;

use App\Models\CompanyProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyProfileController extends Controller
{
    public function edit()
    {
        return Inertia::render('CompanyProfile/Edit', ['company' => CompanyProfile::current()]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name'=>'required|string|max:255','cui'=>'nullable|string|max:50','registration_number'=>'nullable|string|max:80','address'=>'nullable|string|max:255','city'=>'nullable|string|max:100','county'=>'nullable|string|max:100','postal_code'=>'nullable|string|max:20','email'=>'nullable|email','phone'=>'nullable|string|max:50','iban'=>'nullable|string|max:80','bank'=>'nullable|string|max:150','default_vat_rate'=>'required|numeric|min:0|max:100','invoice_series'=>'required|string|max:20','invoice_footer'=>'nullable|string',
        ]);
        CompanyProfile::current()->update($data);
        return back()->with('success', 'Datele firmei au fost actualizate.');
    }
}
