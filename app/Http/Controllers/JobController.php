<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;


class JobController extends Controller
{

    public function index()
    {
        return Inertia::render('Jobs/Index', [

            'jobs' => Job::with('client')
                ->latest()
                ->get()

        ]);
    }



    public function create()
    {

        return Inertia::render('Jobs/Create', [

            'clients' => Client::orderBy('name')->get()

        ]);

    }



    public function store(Request $request)
    {

        $validated = $request->validate([


            'client_id' => 'required|exists:clients,id',

            'type' => 'required|string',

            'address' => 'nullable|string',

            'contact_person' => 'nullable|string',

            'phone' => 'nullable|string',

            'scheduled_date' => 'nullable|date',

            'scheduled_time' => 'nullable',

            'status' => 'required|string',

            'description' => 'nullable|string',

            'materials' => 'nullable|string',

            'notes' => 'nullable|string',


        ]);



        $validated['number'] = 'WO-' . str_pad(
            Job::count() + 1,
            5,
            '0',
            STR_PAD_LEFT
        );

        // Tabela lucrărilor are acest câmp obligatoriu. Rutele vechi
        // „jobs” folosesc aceeași tabelă ca modulul actual „work_orders”.
        $validated['work_type'] = $validated['type'];
        $validated['priority'] = 'normal';



        Job::create($validated);



        return redirect()
            ->route('jobs.index');

    }





    public function edit(Job $job)
    {

        return Inertia::render('Jobs/Create', [

            'job' => $job,

            'clients' => Client::orderBy('name')->get()

        ]);

    }

    public function show(Job $job)
    {
        return redirect()->route('jobs.edit', $job);
    }





    public function update(Request $request, Job $job)
    {


        $validated = $request->validate([


            'client_id' => 'required|exists:clients,id',

            'type' => 'required|string',

            'address' => 'nullable|string',

            'contact_person' => 'nullable|string',

            'phone' => 'nullable|string',

            'scheduled_date' => 'nullable|date',

            'scheduled_time' => 'nullable',

            'status' => 'required|string',

            'description' => 'nullable|string',

            'materials' => 'nullable|string',

            'notes' => 'nullable|string',


        ]);

        $validated['work_type'] = $validated['type'];



        $job->update($validated);



        return redirect()
            ->route('jobs.index');

    }





    public function destroy(Job $job)
    {

        $job->delete();


        return redirect()
            ->route('jobs.index');

    }

}
