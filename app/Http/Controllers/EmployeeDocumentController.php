<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeDocument;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EmployeeDocumentController extends Controller
{
    /**
     * Categorii disponibile pentru documentele angajatului.
     */
    public const CATEGORIES = [
        'contract_munca' => 'Contract de munca',
        'act_aditional' => 'Act aditional',
        'fisa_postului' => 'Fisa postului',
        'cerere_concediu' => 'Cerere de concediu',
        'demisie_incetare' => 'Demisie / Incetare',
        'medical' => 'Document medical',
        'decizie' => 'Decizie',
        'adeverinta' => 'Adeverinta',
        'declaratie' => 'Declaratie',
        'evaluare' => 'Evaluare',
        'instruire_autorizare' => 'Instruire / Autorizare',
        'alte_documente' => 'Alte documente',
    ];

    /**
     * Formular creare cerere de concediu.
     */
    public function createLeaveRequest(
        Employee $employee
    ) {
        return Inertia::render(
            'Employees/Documents/CreateLeaveRequest',
            [
                'employee' => $employee,
            ]
        );
    }

    /**
     * Genereaza cererea de concediu.
     */
    public function storeLeaveRequest(
        Request $request,
        Employee $employee
    ) {
        $validated = $request->validate([
            'document_date' => [
                'required',
                'date',
            ],

            'period_start' => [
                'required',
                'date',
            ],

            'period_end' => [
                'required',
                'date',
                'after_or_equal:period_start',
            ],

            'days' => [
                'required',
                'integer',
                'min:1',
                'max:366',
            ],

            'description' => [
                'nullable',
                'string',
            ],
        ]);

        $pdf = Pdf::loadView(
            'employees.documents.leave-request',
            [
                'employee' =>
                    $employee,

                'documentDate' =>
                    $validated['document_date'],

                'periodStart' =>
                    $validated['period_start'],

                'periodEnd' =>
                    $validated['period_end'],

                'days' =>
                    $validated['days'],

                'description' =>
                    $validated['description'] ?? null,
            ]
        );

        $pdf->setPaper(
            'A4',
            'portrait'
        );

        $fileName =
            'cerere-concediu-' .
            $employee->id .
            '-' .
            now()->format('YmdHis') .
            '.pdf';

        $directory =
            'employee-documents/' .
            $employee->id;

        $path =
            $directory .
            '/' .
            $fileName;

        Storage::disk('public')->put(
            $path,
            $pdf->output()
        );

        $employee->documents()->create([
            'user_id' =>
                Auth::id(),

            'category' =>
                'cerere_concediu',

            'name' =>
                'Cerere de concediu - ' .
                $employee->name,

            'document_number' =>
                null,

            'document_date' =>
                $validated['document_date'],

            'valid_from' =>
                $validated['period_start'],

            'valid_until' =>
                $validated['period_end'],

            'period_start' =>
                $validated['period_start'],

            'period_end' =>
                $validated['period_end'],

            'status' =>
                'Generat',

            'description' =>
                $validated['description'] ?? null,

            'file_path' =>
                $path,

            'original_name' =>
                $fileName,

            'mime_type' =>
                'application/pdf',

            'file_size' =>
                Storage::disk('public')->size(
                    $path
                ),
        ]);

        return redirect()
            ->route(
                'employees.show',
                $employee->id
            )
            ->with(
                'success',
                'Cererea de concediu a fost generata si salvata cu succes.'
            );
    }

    /**
     * Formular creare cerere de demisie / incetare.
     */
    public function createTerminationRequest(
        Employee $employee
    ) {
        return Inertia::render(
            'Employees/Documents/CreateTerminationRequest',
            [
                'employee' => $employee,
            ]
        );
    }

    /**
     * Genereaza cererea de demisie / incetare.
     */
    public function storeTerminationRequest(
        Request $request,
        Employee $employee
    ) {
        $validated = $request->validate([
            'request_type' => [
                'required',
                'string',
                'in:demisie,incetare',
            ],

            'document_date' => [
                'required',
                'date',
            ],

            'termination_date' => [
                'required',
                'date',
            ],

            'notice_days' => [
                'nullable',
                'integer',
                'min:0',
                'max:365',
            ],

            'reason' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'description' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ]);

        $terminationLabel = match (
            $validated['request_type']
        ) {
            'demisie' =>
                'Demisie',

            'incetare' =>
                'Incetare contract de munca',

            default =>
                'Demisie / Incetare',
        };

        $pdf = Pdf::loadView(
            'employees.documents.termination-request',
            [
                'employee' =>
                    $employee,

                'documentDate' =>
                    $validated['document_date'],

                'terminationDate' =>
                    $validated['termination_date'],

                'terminationType' =>
                    $validated['request_type'],

                'terminationLabel' =>
                    $terminationLabel,

                'noticeDays' =>
                    $validated['notice_days'] ?? null,

                'reason' =>
                    $validated['reason'] ?? null,

                'description' =>
                    $validated['description'] ?? null,
            ]
        );

        $pdf->setPaper(
            'A4',
            'portrait'
        );

        $fileName =
            'cerere-' .
            (
                $validated['request_type'] ===
                'demisie'
                    ? 'demisie'
                    : 'incetare'
            ) .
            '-' .
            $employee->id .
            '-' .
            now()->format('YmdHis') .
            '.pdf';

        $directory =
            'employee-documents/' .
            $employee->id;

        $path =
            $directory .
            '/' .
            $fileName;

        Storage::disk('public')->put(
            $path,
            $pdf->output()
        );

        $employee->documents()->create([
            'user_id' =>
                Auth::id(),

            'category' =>
                'demisie_incetare',

            'name' =>
                $terminationLabel .
                ' - ' .
                $employee->name,

            'document_number' =>
                null,

            'document_date' =>
                $validated['document_date'],

            'valid_from' =>
                $validated['termination_date'],

            'valid_until' =>
                null,

            'period_start' =>
                null,

            'period_end' =>
                null,

            'status' =>
                'Generat',

            'description' =>
                trim(
                    ($validated['reason'] ?? '') .
                    (
                        !empty(
                            $validated['description']
                        )
                            ? "\n" .
                                $validated['description']
                            : ''
                    )
                ) ?: null,

            'file_path' =>
                $path,

            'original_name' =>
                $fileName,

            'mime_type' =>
                'application/pdf',

            'file_size' =>
                Storage::disk('public')->size(
                    $path
                ),
        ]);

        return redirect()
            ->route(
                'employees.show',
                $employee->id
            )
            ->with(
                'success',
                'Cererea PDF a fost generata si salvata cu succes.'
            );
    }

    /**
     * Salveaza un document pentru angajat.
     */
    public function store(
        Request $request,
        Employee $employee
    ) {
        $validated = $request->validate([
            'category' => [
                'required',
                'string',
                'in:' .
                    implode(
                        ',',
                        array_keys(
                            self::CATEGORIES
                        )
                    ),
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'document_number' => [
                'nullable',
                'string',
                'max:255',
            ],

            'document_date' => [
                'nullable',
                'date',
            ],

            'valid_from' => [
                'nullable',
                'date',
            ],

            'valid_until' => [
                'nullable',
                'date',
            ],

            'period_start' => [
                'nullable',
                'date',
            ],

            'period_end' => [
                'nullable',
                'date',
            ],

            'status' => [
                'nullable',
                'string',
                'max:100',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'file' => [
                'required',
                'file',
                'max:20480',
                'mimes:pdf,jpg,jpeg,png,webp,doc,docx,xls,xlsx',
            ],
        ]);

        $file =
            $request->file('file');

        $path =
            $file->store(
                'employee-documents/' .
                $employee->id,
                'public'
            );

        $employee->documents()->create([
            'user_id' =>
                Auth::id(),

            'category' =>
                $validated['category'],

            'name' =>
                $validated['name'],

            'document_number' =>
                $validated['document_number']
                ?? null,

            'document_date' =>
                $validated['document_date']
                ?? null,

            'valid_from' =>
                $validated['valid_from']
                ?? null,

            'valid_until' =>
                $validated['valid_until']
                ?? null,

            'period_start' =>
                $validated['period_start']
                ?? null,

            'period_end' =>
                $validated['period_end']
                ?? null,

            'status' =>
                $validated['status']
                ?? null,

            'description' =>
                $validated['description']
                ?? null,

            'file_path' =>
                $path,

            'original_name' =>
                $file->getClientOriginalName(),

            'mime_type' =>
                $file->getClientMimeType(),

            'file_size' =>
                $file->getSize(),
        ]);

        return back()
            ->with(
                'success',
                'Documentul a fost incarcat cu succes.'
            );
    }

    /**
     * Descarca / deschide documentul.
     */
    public function download(
        Employee $employee,
        EmployeeDocument $employeeDocument
    ) {
        abort_unless(
            $employeeDocument->employee_id ===
                $employee->id,
            404
        );

        abort_unless(
            Storage::disk('public')->exists(
                $employeeDocument->file_path
            ),
            404
        );

        return Storage::disk('public')
            ->download(
                $employeeDocument->file_path,
                $employeeDocument->original_name
                    ?: $employeeDocument->name
            );
    }

    /**
     * Sterge documentul.
     */
    public function destroy(
        Employee $employee,
        EmployeeDocument $employeeDocument
    ) {
        abort_unless(
            $employeeDocument->employee_id ===
                $employee->id,
            404
        );

        if (
            $employeeDocument->file_path &&
            Storage::disk('public')->exists(
                $employeeDocument->file_path
            )
        ) {
            Storage::disk('public')->delete(
                $employeeDocument->file_path
            );
        }

        $employeeDocument->delete();

        return back()
            ->with(
                'success',
                'Documentul a fost sters.'
            );
    }
}