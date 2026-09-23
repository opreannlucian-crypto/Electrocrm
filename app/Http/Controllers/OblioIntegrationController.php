<?php

namespace App\Http\Controllers;

use App\Events\DomainNotificationEvent;
use App\Models\Invoice;
use App\Models\OblioSyncLog;
use App\Services\OblioService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OblioIntegrationController extends Controller
{
    public function testConnection(OblioService $oblio): RedirectResponse
    {
        $result = $oblio->testConnection();

        if (!$result['ok']) {
            $this->log(null, 'connection_test', 'error', $result);

            return back()->withErrors(['oblio' => $result['message']]);
        }

        $companies = collect($result['data'])
            ->map(fn (array $company) => $company['company'] ?? $company['cif'] ?? 'Firmă Oblio')
            ->implode(', ');

        $this->log(null, 'connection_test', 'success', $result);

        return back()->with('success', 'Conexiunea Oblio este validă. Firme disponibile: ' . ($companies ?: 'niciuna raportată.'));
    }

    public function issue(Request $request, Invoice $invoice, OblioService $oblio): RedirectResponse
    {
        abort_unless(config('services.oblio.sync_enabled'), 422, 'Integrarea Oblio este dezactivată. Configurează și testează mai întâi conexiunea.');
        abort_unless($invoice->status === 'draft', 422, 'Doar facturile ciornă pot fi emise în Oblio.');
        abort_if(in_array($invoice->oblio_status, ['pending', 'issued', 'cancelled'], true), 422, 'Factura are deja o operațiune Oblio înregistrată.');

        if (!$invoice->oblio_idempotency_key) {
            $invoice->update([
                'oblio_idempotency_key' => (string) Str::uuid(),
                'oblio_status' => 'pending',
                'oblio_error_message' => null,
            ]);
        }

        try {
            $result = $oblio->createInvoice($invoice->fresh(['client', 'items.product']));
        } catch (\Throwable $exception) {
            $result = [
                'ok' => false,
                'http_status' => null,
                'message' => $exception->getMessage(),
                'data' => [],
                'payload' => [],
            ];
        }

        $this->log($invoice, 'invoice_create', $result['ok'] ? 'success' : 'error', $result);

        if (!$result['ok']) {
            $invoice->update([
                'oblio_status' => 'error',
                'oblio_error_message' => $result['message'],
            ]);

            return back()->withErrors(['oblio' => 'Emiterea în Oblio a eșuat: ' . $result['message']]);
        }

        $data = $result['data'];
        $invoice->update([
            'status' => 'issued',
            'oblio_status' => 'issued',
            'oblio_cif' => (string) config('services.oblio.cif'),
            'oblio_series' => $data['seriesName'] ?? $invoice->oblio_series ?? config('services.oblio.invoice_series') ?? $invoice->series,
            'oblio_number' => (string) ($data['number'] ?? ''),
            'oblio_document_url' => $data['link'] ?? null,
            'oblio_payload_hash' => hash('sha256', json_encode($result['payload'] ?? [], JSON_THROW_ON_ERROR)),
            'oblio_error_message' => null,
            'oblio_last_synced_at' => now(),
            'oblio_issued_at' => now(),
            'efactura_status' => 'managed_by_oblio',
            'efactura_message' => 'Factura a fost emisă prin Oblio; transmiterea e-Factura este administrată de Oblio.',
        ]);

        DomainNotificationEvent::dispatch(
            'invoice.issued',
            $invoice->fresh(['client']),
            $request->user(),
            ['dedupe_context' => 'oblio-issued:' . $invoice->id]
        );

        return back()->with('success', 'Factura a fost emisă în Oblio. Număr Oblio: ' . ($data['seriesName'] ?? '') . ' ' . ($data['number'] ?? ''));
    }

    /**
     * @param array<string, mixed> $result
     */
    private function log(?Invoice $invoice, string $operation, string $status, array $result): void
    {
        OblioSyncLog::create([
            'invoice_id' => $invoice?->id,
            'operation' => $operation,
            'direction' => 'outbound',
            'status' => $status,
            'http_status' => $result['http_status'] ?? null,
            'idempotency_key' => $invoice?->oblio_idempotency_key,
            'request_summary' => $this->requestSummary($result['payload'] ?? []),
            'response_summary' => $this->responseSummary($result['data'] ?? []),
            'error_message' => $result['ok'] ?? false ? null : ($result['message'] ?? 'Eroare Oblio neprecizată.'),
            'occurred_at' => now(),
        ]);
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     */
    private function requestSummary(array $payload): array
    {
        return [
            'cif' => $payload['cif'] ?? null,
            'seriesName' => $payload['seriesName'] ?? null,
            'issueDate' => $payload['issueDate'] ?? null,
            'currency' => $payload['currency'] ?? null,
            'items_count' => count($payload['products'] ?? []),
            'idempotencyKey' => $payload['idempotencyKey'] ?? null,
            'spvExtern' => $payload['spvExtern'] ?? null,
        ];
    }

    /**
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    private function responseSummary(array $data): array
    {
        return collect($data)->only(['seriesName', 'number', 'link', 'documentType'])->all();
    }
}
