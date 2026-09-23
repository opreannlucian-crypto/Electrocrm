<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{

    public function index()
    {
        return Inertia::render('Customers/Index', [
            'customers' => Customer::latest()->paginate(10)
        ]);
    }



    public function create()
    {
        return Inertia::render('Customers/Create');
    }



    public function store(Request $request)
    {

        $validated = $request->validate([

            'company_name' => 'nullable|string|max:255',

            'contact_name' => 'nullable|string|max:255',

            'cui' => 'nullable|string|max:50',

            'phone' => 'nullable|string|max:50',

            'email' => 'nullable|email|max:255',

            'address' => 'nullable|string',

            'city' => 'nullable|string|max:100',

            'county' => 'nullable|string|max:100',

            'type' => 'required|string',

            'notes' => 'nullable|string',

        ]);



        Customer::create($validated);



        return redirect()
            ->route('customers.index')
            ->with('success', 'Client adăugat cu succes.');

    }




    public function edit(Customer $customer)
    {
        return Inertia::render('Customers/Edit', [
            'customer' => $customer
        ]);
    }




    public function update(Request $request, Customer $customer)
    {

        $validated = $request->validate([

            'company_name' => 'nullable|string|max:255',

            'contact_name' => 'nullable|string|max:255',

            'cui' => 'nullable|string|max:50',

            'phone' => 'nullable|string|max:50',

            'email' => 'nullable|email|max:255',

            'address' => 'nullable|string',

            'city' => 'nullable|string|max:100',

            'county' => 'nullable|string|max:100',

            'type' => 'required|string',

            'notes' => 'nullable|string',

        ]);



        $customer->update($validated);



        return redirect()
            ->route('customers.index')
            ->with('success', 'Client modificat cu succes.');

    }




    public function destroy(Customer $customer)
    {

        $customer->delete();



        return redirect()
            ->route('customers.index')
            ->with('success', 'Client șters cu succes.');

    }

}