<?php

namespace App\Http\Controllers;

use App\Models\ContractTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContractTemplateController extends Controller
{
    /**
     * Lista sabloanelor.
     */
    public function index()
    {
        $templates = ContractTemplate::with([
            'user',
        ])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(15);

        return Inertia::render(
            'ContractTemplates/Index',
            [
                'templates' => $templates,
            ]
        );
    }

    /**
     * Formular creare sablon.
     */
    public function create()
    {
        return Inertia::render(
            'ContractTemplates/Create'
        );
    }

    /**
     * Salveaza sablon.
     */
    public function store(
        Request $request
    ) {
        $validated =
            $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'type' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'title' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'description' => [
                    'nullable',
                    'string',
                ],

                'content' => [
                    'nullable',
                    'string',
                ],

                'default_value' => [
                    'nullable',
                    'numeric',
                    'min:0',
                ],

                'default_duration' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'default_payment_terms' => [
                    'nullable',
                    'string',
                ],

                'default_notes' => [
                    'nullable',
                    'string',
                ],

                'provider_signature_name' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'provider_signature_position' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'client_signature_name' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'client_signature_position' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'active' => [
                    'nullable',
                    'boolean',
                ],

                'sort_order' => [
                    'nullable',
                    'integer',
                    'min:0',
                ],
            ]);

        $validated['active'] =
            $request->boolean(
                'active',
                true
            );

        $validated['sort_order'] =
            $validated['sort_order'] ?? 0;

        $validated['user_id'] =
            auth()->id();

        $template =
            ContractTemplate::create(
                $validated
            );

        return redirect()
            ->route(
                'contract-templates.show',
                $template
            )
            ->with(
                'success',
                'Sablonul de contract a fost creat cu succes.'
            );
    }

    /**
     * Afiseaza sablonul.
     */
    public function show(
        ContractTemplate $contractTemplate
    ) {
        $contractTemplate->load([
            'user',
        ]);

        return Inertia::render(
            'ContractTemplates/Show',
            [
                'template' =>
                    $contractTemplate,
            ]
        );
    }

    /**
     * Formular editare sablon.
     */
    public function edit(
        ContractTemplate $contractTemplate
    ) {
        return Inertia::render(
            'ContractTemplates/Edit',
            [
                'template' =>
                    $contractTemplate,
            ]
        );
    }

    /**
     * Actualizare sablon.
     */
    public function update(
        Request $request,
        ContractTemplate $contractTemplate
    ) {
        $validated =
            $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'type' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'title' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'description' => [
                    'nullable',
                    'string',
                ],

                'content' => [
                    'nullable',
                    'string',
                ],

                'default_value' => [
                    'nullable',
                    'numeric',
                    'min:0',
                ],

                'default_duration' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'default_payment_terms' => [
                    'nullable',
                    'string',
                ],

                'default_notes' => [
                    'nullable',
                    'string',
                ],

                'provider_signature_name' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'provider_signature_position' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'client_signature_name' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'client_signature_position' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'active' => [
                    'nullable',
                    'boolean',
                ],

                'sort_order' => [
                    'nullable',
                    'integer',
                    'min:0',
                ],
            ]);

        $validated['active'] =
            $request->boolean(
                'active'
            );

        $validated['sort_order'] =
            $validated['sort_order'] ?? 0;

        $contractTemplate->update(
            $validated
        );

        return redirect()
            ->route(
                'contract-templates.show',
                $contractTemplate
            )
            ->with(
                'success',
                'Sablonul de contract a fost actualizat.'
            );
    }

    /**
     * Stergere sablon.
     */
    public function destroy(
        ContractTemplate $contractTemplate
    ) {
        $contractTemplate->delete();

        return redirect()
            ->route(
                'contract-templates.index'
            )
            ->with(
                'success',
                'Sablonul de contract a fost sters.'
            );
    }
}