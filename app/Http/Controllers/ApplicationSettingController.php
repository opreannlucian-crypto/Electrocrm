<?php

namespace App\Http\Controllers;

use App\Models\ApplicationSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApplicationSettingController extends Controller
{
    private const SECTIONS = ['bank-accounts', 'vat-rates', 'cash-registers', 'document-series', 'product-preferences', 'document-preferences', 'personal-preferences'];

    public function edit(Request $request, string $section)
    {
        $this->authorizeSection($request, $section);
        $userId = $section === 'personal-preferences' ? $request->user()->id : null;

        $settings = ApplicationSetting::value($section, $this->defaults($section), $userId);
        if ($section === 'vat-rates') {
            $settings['rates'] = [21, 11, 0];
        }

        return Inertia::render('Settings/Index', [
            'section' => $section,
            'settings' => $settings,
        ]);
    }

    public function update(Request $request, string $section)
    {
        $this->authorizeSection($request, $section);
        $data = $request->validate(['settings' => ['required', 'array']])['settings'];
        if ($section === 'vat-rates') {
            $data['rates'] = [21, 11, 0];
        }
        $userId = $section === 'personal-preferences' ? $request->user()->id : null;
        ApplicationSetting::put($section, $data, $userId);

        return back()->with('success', 'Setările au fost salvate.');
    }

    private function authorizeSection(Request $request, string $section): void
    {
        abort_unless(in_array($section, self::SECTIONS, true), 404);
        if ($section !== 'personal-preferences') {
            abort_unless($request->user()?->isAdministrator(), 403, 'Doar administratorul poate modifica aceste setări.');
        }
    }

    private function defaults(string $section): array
    {
        return match ($section) {
            'bank-accounts' => ['accounts' => []],
            'vat-rates' => ['rates' => [21, 11, 0]],
            'cash-registers' => ['registers' => []],
            'document-series' => ['series' => ['reception' => 'NIR', 'consumption_note' => 'BC', 'inventory' => 'INV', 'invoice' => 'F', 'transfer_note' => 'NT', 'receipt' => 'CH', 'proforma' => 'PF', 'delivery_note' => 'AV']],
            'product-preferences' => ['default_unit' => 'buc', 'default_vat_rate' => 21, 'allow_negative_stock' => false, 'low_stock_alert' => true],
            'document-preferences' => ['show_vat' => true, 'include_logo' => true, 'default_currency' => 'RON', 'footer_note' => ''],
            'personal-preferences' => ['language' => 'ro', 'date_format' => 'DD.MM.YYYY', 'compact_navigation' => false],
        };
    }
}
