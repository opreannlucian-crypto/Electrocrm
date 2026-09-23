<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    /**
     * Lista angajatilor.
     */
    public function index()
    {
        return Inertia::render(
            'Employees/Index',
            [
                'employees' => Employee::latest()
                    ->paginate(10),
            ]
        );
    }

    /**
     * Formular creare angajat.
     */
    public function create()
    {
        return Inertia::render(
            'Employees/Create'
        );
    }

    /**
     * Salvare angajat nou.
     */
    public function store(
        Request $request
    ) {
        $validated = $this->validateEmployee(
            $request
        );

        /*
        |--------------------------------------------------------------------------
        | Valori implicite
        |--------------------------------------------------------------------------
        */

        if (
            !array_key_exists(
                'active',
                $validated
            )
        ) {
            $validated['active'] = true;
        }

        if (
            empty($validated['status'])
        ) {
            $validated['status'] = 'Activ';
        }

        $validated['employment_type'] = $validated['employment_type'] ?? 'full_time';
        $validated['is_primary_job'] = $validated['is_primary_job'] ?? true;
        $validated['monthly_norm_hours'] = $validated['monthly_norm_hours'] ?? 166.67;
        $validated['dependent_count'] = $validated['dependent_count'] ?? 0;

        $employee =
            Employee::create(
                $validated
            );

        /*
        |--------------------------------------------------------------------------
        | Istoric creare
        |--------------------------------------------------------------------------
        */

        $employee->histories()->create([
            'user_id' =>
                Auth::id(),

            'field' =>
                null,

            'old_value' =>
                null,

            'new_value' =>
                null,

            'action' =>
                'created',

            'description' =>
                'Angajatul a fost creat.',
        ]);

        return redirect()
            ->route(
                'employees.show',
                $employee
            )
            ->with(
                'success',
                'Angajat adaugat cu succes.'
            );
    }

    /**
     * Afisare angajat.
     */
    public function show(
        Employee $employee
    ) {
        $employee->load([
            'attendances',
            'histories.user',
            'documents.user',
        ]);

        return Inertia::render(
            'Employees/Show',
            [
                'employee' =>
                    $employee,
            ]
        );
    }

    /**
     * Formular editare angajat.
     */
    public function edit(
        Employee $employee
    ) {
        return Inertia::render(
            'Employees/Edit',
            [
                'employee' =>
                    $employee,
            ]
        );
    }

    /**
     * Actualizare angajat.
     */
    public function update(
        Request $request,
        Employee $employee
    ) {
        $validated = $this->validateEmployee(
            $request
        );

        /*
        |--------------------------------------------------------------------------
        | Pastram valorile vechi
        |--------------------------------------------------------------------------
        */

        $original =
            $employee->getOriginal();

        /*
        |--------------------------------------------------------------------------
        | Actualizare
        |--------------------------------------------------------------------------
        */

        $employee->update(
            $validated
        );

        /*
        |--------------------------------------------------------------------------
        | Campurile pentru care pastram istoric
        |--------------------------------------------------------------------------
        */

        $historyFields = [
            'name' => 'Nume',
            'cnp' => 'CNP',
            'phone' => 'Telefon',
            'email' => 'Email',
            'position' => 'Functie',
            'department' => 'Departament',
            'hire_date' => 'Data angajarii',
            'salary' => 'Salariu brut lunar',
            'employment_type' => 'Tip contract',
            'is_primary_job' => 'Funcție de bază',
            'monthly_norm_hours' => 'Normă lunară',
            'dependent_count' => 'Persoane în întreținere',
            'tax_facility_code' => 'Facilitate fiscală',
            'schedule' => 'Program',
            'status' => 'Status',
            'active' => 'Activ',
            'notes' => 'Observatii',
        ];

        /*
        |--------------------------------------------------------------------------
        | Salvam fiecare modificare
        |--------------------------------------------------------------------------
        */

        foreach (
            $historyFields as $field => $label
        ) {
            $oldValue =
                $original[$field]
                ?? null;

            $newValue =
                $employee->{$field}
                ?? null;

            /*
            |--------------------------------------------------------------------------
            | Normalizare pentru comparatie
            |--------------------------------------------------------------------------
            */

            $oldComparable =
                $this->normalizeHistoryValue(
                    $field,
                    $oldValue
                );

            $newComparable =
                $this->normalizeHistoryValue(
                    $field,
                    $newValue
                );

            if (
                $oldComparable ===
                $newComparable
            ) {
                continue;
            }

            $employee->histories()->create([
                'user_id' =>
                    Auth::id(),

                'field' =>
                    $field,

                'old_value' =>
                    $this->historyValue(
                        $field,
                        $oldValue
                    ),

                'new_value' =>
                    $this->historyValue(
                        $field,
                        $newValue
                    ),

                'action' =>
                    'updated',

                'description' =>
                    "Campul {$label} a fost modificat.",
            ]);
        }

        return redirect()
            ->route(
                'employees.show',
                $employee
            )
            ->with(
                'success',
                'Angajatul a fost modificat cu succes.'
            );
    }

    /**
     * Stergere angajat.
     */
    public function destroy(
        Employee $employee
    ) {
        $employee->delete();

        return redirect()
            ->route(
                'employees.index'
            )
            ->with(
                'success',
                'Angajat sters cu succes.'
            );
    }

    /**
     * Validarea datelor angajatului.
     */
    protected function validateEmployee(
        Request $request
    ): array {
        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'cnp' => [
                'nullable',
                'string',
                'max:255',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:255',
            ],

            'email' => [
                'nullable',
                'email',
                'max:255',
            ],

            'position' => [
                'nullable',
                'string',
                'max:255',
            ],

            'department' => [
                'nullable',
                'string',
                'max:255',
            ],

            'hire_date' => [
                'nullable',
                'date',
            ],

            'salary' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'employment_type' => [
                'nullable',
                'in:full_time,part_time,other',
            ],

            'is_primary_job' => [
                'nullable',
                'boolean',
            ],

            'monthly_norm_hours' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'dependent_count' => [
                'nullable',
                'integer',
                'min:0',
                'max:20',
            ],

            'tax_facility_code' => [
                'nullable',
                'string',
                'max:100',
            ],

            'schedule' => [
                'nullable',
                'string',
                'max:255',
            ],

            'status' => [
                'nullable',
                'string',
                'max:100',
            ],

            'active' => [
                'nullable',
                'boolean',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ]);
    }

    /**
     * Normalizeaza o valoare pentru comparatia istoricului.
     */
    protected function normalizeHistoryValue(
        string $field,
        mixed $value
    ): string {
        if (
            $value === null
        ) {
            return '';
        }

        if (
            $field === 'hire_date'
        ) {
            try {
                return \Carbon\Carbon::parse(
                    $value
                )->format('Y-m-d');
            } catch (\Throwable $e) {
                return (string) $value;
            }
        }

        if (
            in_array($field, ['salary', 'monthly_norm_hours'], true)
        ) {
            return number_format(
                (float) $value,
                2,
                '.',
                ''
            );
        }

        if (
            $field === 'active'
        ) {
            return $value
                ? '1'
                : '0';
        }

        return trim(
            (string) $value
        );
    }

    /**
     * Pregateste valoarea afisata in istoric.
     */
    protected function historyValue(
        string $field,
        mixed $value
    ): ?string {
        if (
            $value === null ||
            $value === ''
        ) {
            return null;
        }

        if (
            $field === 'hire_date'
        ) {
            try {
                return \Carbon\Carbon::parse(
                    $value
                )->format('d.m.Y');
            } catch (\Throwable $e) {
                return (string) $value;
            }
        }

        if (
            in_array($field, ['salary', 'monthly_norm_hours'], true)
        ) {
            return number_format(
                (float) $value,
                2,
                ',',
                '.'
            ) . ' lei';
        }

        if (
            $field === 'active'
        ) {
            return $value
                ? 'Da'
                : 'Nu';
        }

        return (string) $value;
    }
}