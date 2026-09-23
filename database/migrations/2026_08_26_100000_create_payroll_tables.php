<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->string('employment_type', 50)->nullable()->after('salary');
            $table->boolean('is_primary_job')->default(true)->after('employment_type');
            $table->decimal('monthly_norm_hours', 8, 2)->nullable()->after('is_primary_job');
            $table->unsignedSmallInteger('dependent_count')->default(0)->after('monthly_norm_hours');
            $table->string('tax_facility_code', 100)->nullable()->after('dependent_count');
            $table->json('payroll_settings')->nullable()->after('tax_facility_code');
        });

        Schema::create('payroll_rules', function (Blueprint $table) {
            $table->id();
            $table->string('code', 100)->unique();
            $table->string('name');
            $table->date('valid_from');
            $table->date('valid_to')->nullable();
            $table->json('rates');
            $table->text('source_reference')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('salary_slips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payroll_rule_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->string('period_label', 100);
            $table->string('status', 30)->default('draft');
            $table->string('calculation_mode', 30)->default('full_month');
            $table->string('tax_facility_code', 100)->nullable();
            $table->decimal('scheduled_hours', 8, 2)->default(0);
            $table->decimal('worked_hours', 8, 2)->default(0);
            $table->decimal('overtime_hours', 8, 2)->default(0);
            $table->decimal('medical_leave_days', 8, 2)->default(0);
            $table->decimal('gross_base', 12, 2)->default(0);
            $table->decimal('gross_income', 12, 2)->default(0);
            $table->decimal('non_cash_benefits', 12, 2)->default(0);
            $table->decimal('personal_deduction', 12, 2)->default(0);
            $table->decimal('cas_base', 12, 2)->default(0);
            $table->decimal('cas_rate', 8, 4)->default(0);
            $table->decimal('cas_amount', 12, 2)->default(0);
            $table->decimal('cass_base', 12, 2)->default(0);
            $table->decimal('cass_rate', 8, 4)->default(0);
            $table->decimal('cass_amount', 12, 2)->default(0);
            $table->decimal('income_tax_base', 12, 2)->default(0);
            $table->decimal('income_tax_rate', 8, 4)->default(0);
            $table->decimal('income_tax_amount', 12, 2)->default(0);
            $table->decimal('other_deductions', 12, 2)->default(0);
            $table->decimal('net_pay', 12, 2)->default(0);
            $table->decimal('employer_cam_base', 12, 2)->default(0);
            $table->decimal('employer_cam_rate', 8, 4)->default(0);
            $table->decimal('employer_cam_amount', 12, 2)->default(0);
            $table->decimal('employer_total_cost', 12, 2)->default(0);
            $table->json('calculation_snapshot')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('finalized_at')->nullable();
            $table->timestamps();
            $table->unique(['employee_id', 'period_start']);
        });

        Schema::create('salary_slip_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('salary_slip_id')->constrained()->cascadeOnDelete();
            $table->string('category', 30);
            $table->string('code', 100)->nullable();
            $table->string('description');
            $table->decimal('quantity', 10, 2)->nullable();
            $table->decimal('rate', 10, 4)->nullable();
            $table->decimal('amount', 12, 2)->default(0);
            $table->boolean('include_cas')->default(true);
            $table->boolean('include_cass')->default(true);
            $table->boolean('include_income_tax')->default(true);
            $table->boolean('cash_effect')->default(true);
            $table->string('support_source', 30)->nullable();
            $table->json('metadata')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        DB::table('payroll_rules')->insert([
            'code' => 'RO-STD-2026-07',
            'name' => 'Regim standard salarizare România — iulie 2026',
            'valid_from' => '2026-07-01',
            'rates' => json_encode([
                'cas_rate' => 25,
                'cass_rate' => 10,
                'income_tax_rate' => 10,
                'employer_cam_rate' => 2.25,
                'minimum_gross_salary' => 4325,
                'monthly_norm_hours' => 166.667,
            ], JSON_THROW_ON_ERROR),
            'source_reference' => 'HG nr. 146/2026 pentru salariul minim. Ratele și facilitățile trebuie validate și actualizate de contabilitate pentru fiecare perioadă.',
            'notes' => 'Regulă inițială configurabilă. Nu înlocuiește validarea contabilă și fluxul D112.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_slip_items');
        Schema::dropIfExists('salary_slips');
        Schema::dropIfExists('payroll_rules');

        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn([
                'employment_type',
                'is_primary_job',
                'monthly_norm_hours',
                'dependent_count',
                'tax_facility_code',
                'payroll_settings',
            ]);
        });
    }
};
