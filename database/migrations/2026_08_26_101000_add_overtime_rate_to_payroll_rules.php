<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('payroll_rules')->orderBy('id')->get()->each(function (object $rule): void {
            $rates = json_decode($rule->rates ?? '{}', true) ?: [];
            $rates['overtime_premium_rate'] = $rates['overtime_premium_rate'] ?? 75;
            $rates['overtime_compensation_mode'] = $rates['overtime_compensation_mode'] ?? 'paid_premium';

            DB::table('payroll_rules')->where('id', $rule->id)->update([
                'rates' => json_encode($rates, JSON_THROW_ON_ERROR),
                'updated_at' => now(),
            ]);
        });
    }

    public function down(): void
    {
        DB::table('payroll_rules')->orderBy('id')->get()->each(function (object $rule): void {
            $rates = json_decode($rule->rates ?? '{}', true) ?: [];
            unset($rates['overtime_premium_rate'], $rates['overtime_compensation_mode']);

            DB::table('payroll_rules')->where('id', $rule->id)->update([
                'rates' => json_encode($rates, JSON_THROW_ON_ERROR),
                'updated_at' => now(),
            ]);
        });
    }
};
