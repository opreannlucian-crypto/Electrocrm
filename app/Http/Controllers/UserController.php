<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Users/Index', [
            'users' => User::query()
                ->with('employee:id,name')
                ->orderBy('name')
                ->get([
                    'id',
                    'name',
                    'email',
                    'role',
                    'employee_id',
                    'allowed_modules',
                    'created_at',
                ]),
            'roles' => UserRole::options(),
            'modules' => User::MODULES,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Users/Create', $this->formProps());
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatedData($request);

        $user = User::create([
            ...$validated,
            'password' => Hash::make($validated['password']),
            'allowed_modules' => $this->allowedModulesFor($validated),
        ]);

        return redirect()
            ->route('users.edit', $user)
            ->with('success', 'Utilizatorul a fost creat cu succes.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('Users/Edit', [
            ...$this->formProps(),
            'userAccount' => $user->only([
                'id',
                'name',
                'email',
                'role',
                'employee_id',
                'allowed_modules',
            ]),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $this->validatedData($request, $user);

        $attributes = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'employee_id' => $validated['employee_id'] ?? null,
            'allowed_modules' => $this->allowedModulesFor($validated),
        ];

        if (!empty($validated['password'])) {
            $attributes['password'] = Hash::make($validated['password']);
        }

        $this->protectLastAdministrator($user, $attributes['role']);

        $user->update($attributes);

        return back()->with('success', 'Drepturile utilizatorului au fost actualizate.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($user->is($request->user()), 422, 'Nu îți poți șterge propriul cont.');

        $this->protectLastAdministrator($user, null, true);

        $user->delete();

        return redirect()
            ->route('users.index')
            ->with('success', 'Utilizatorul a fost șters.');
    }

    /**
     * @return array<string, mixed>
     */
    private function formProps(): array
    {
        return [
            'employees' => Employee::query()
                ->orderBy('name')
                ->get(['id', 'name', 'position']),
            'roles' => UserRole::options(),
            'modules' => User::MODULES,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request, ?User $user = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user),
            ],
            'password' => [
                $user ? 'nullable' : 'required',
                'string',
                'min:8',
                'confirmed',
            ],
            'role' => ['required', Rule::enum(UserRole::class)],
            'employee_id' => [
                Rule::requiredIf(fn () => $request->input('role') === UserRole::Technician->value),
                'nullable',
                'integer',
                'exists:employees,id',
                Rule::unique('users', 'employee_id')->ignore($user),
            ],
            'allowed_modules' => ['nullable', 'array'],
            'allowed_modules.*' => ['string', Rule::in(array_keys(User::MODULES))],
        ]);
    }

    /**
     * @param array<string, mixed> $validated
     * @return array<int, string>|null
     */
    private function allowedModulesFor(array $validated): ?array
    {
        if ($validated['role'] !== UserRole::Technician->value) {
            return null;
        }

        return array_values(array_intersect(
            $validated['allowed_modules'] ?? [],
            array_keys(User::MODULES),
        ));
    }

    private function protectLastAdministrator(
        User $user,
        ?string $newRole,
        bool $isDeleting = false,
    ): void {
        if (!$user->isAdministrator()) {
            return;
        }

        $isRemovingAdministrator = $isDeleting || $newRole !== UserRole::Administrator->value;

        if ($isRemovingAdministrator && User::query()->where('role', UserRole::Administrator->value)->count() <= 1) {
            abort(422, 'Trebuie să rămână cel puțin un administrator activ.');
        }
    }
}
