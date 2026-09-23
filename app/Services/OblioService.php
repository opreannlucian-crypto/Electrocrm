<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoicePayment;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class OblioService
{
    private const BASE_URL = 'https://www.oblio.eu/api';

    public function configured(): bool
    {
        return filled(config('services.oblio.email'))
            && filled(config('services.oblio.secret'))
            && filled(config('services.oblio.cif'));
    }

    /**
     * Test de conexiune numai citire. Nu emite și nu modifică documente.
     *
     * @return array{ok:bool,http_status:int|null,message:string,data:array<mixed>}
     */
    public function testConnection(): array
    {
        return $this->companies();
    }

    /**
     * @return array{ok:bool,http_status:int|null,message:string,data:array<mixed>}
     */
    public function companies(): array
    {
        return $this->request('GET', '/nomenclature/companies');
    }

    /**
     * @return array{ok:bool,http_status:int|null,message:string,data:array<mixed>}
     */
    public function series(?string $cif = null): array
    {
        return $this->request('GET', '/nomenclature/series', [
            'cif' => $this->issuerCif($cif),
        ]);
    }

    /**
     * @return array{ok:bool,http_status:int|null,message:string,data:array<mixed>}
     */
    public function vatRates(?string $cif = null): array
    {
        return $this->request('GET', '/nomenclature/vat_rates', [
            'cif' => $this->issuerCif($cif),
        ]);
    }

    /**
     * Pregătește și transmite o factură în Oblio numai la apel explicit.
     *
     * @return array{ok:bool,http_status:int|null,message:string,data:array<mixed>,payload:array<mixed>}
     */
    public function createInvoice(Invoice $invoice): array
    {
        $invoice->loadMissing(['client', 'items.product']);
        $payload = $this->invoicePayload($invoice);
        $result = $this->request('POST', '/docs/invoice', [], $payload);

        return [...$result, 'payload' => $payload];
    }

    /**
     * Înregistrează o încasare numai pentru o factură deja emisă în Oblio.
     *
     * @return array{ok:bool,http_status:int|null,message:string,data:array<mixed>}
     */
    public function collectInvoice(Invoice $invoice, InvoicePayment $payment): array
    {
        $this->ensureExternalInvoice($invoice);

        return $this->request('PUT', '/docs/invoice/collect', [], [
            'cif' => $invoice->oblio_cif ?: $this->issuerCif(),
            'seriesName' => $invoice->oblio_series,
            'number' => $invoice->oblio_number,
            'collect' => [
                'type' => $this->paymentType($payment->method),
                'documentNumber' => $payment->reference ?: 'ECRM-' . $payment->id,
                'value' => (float) $payment->amount,
                'issueDate' => $payment->paid_at->format('Y-m-d'),
                'mentions' => $payment->notes,
            ],
        ]);
    }

    /**
     * @return array{ok:bool,http_status:int|null,message:string,data:array<mixed>}
     */
    public function cancelInvoice(Invoice $invoice): array
    {
        $this->ensureExternalInvoice($invoice);

        return $this->request('PUT', '/docs/invoice/cancel', [], [
            'cif' => $invoice->oblio_cif ?: $this->issuerCif(),
            'seriesName' => $invoice->oblio_series,
            'number' => $invoice->oblio_number,
        ]);
    }

    /**
     * @return array<mixed>
     */
    public function invoicePayload(Invoice $invoice): array
    {
        $cif = $this->issuerCif($invoice->oblio_cif);
        $vatRates = $this->cachedVatRates($cif);
        $products = $invoice->items->map(function ($item) use ($vatRates) {
            $discount = (float) $item->discount;
            $price = round((float) $item->unit_price * (1 - $discount / 100), 4);

            return [
                'name' => $item->name,
                'code' => $item->product?->code ?: '',
                'description' => $item->product?->description ?: '',
                'price' => $price,
                'measuringUnit' => $item->unit ?: 'buc',
                'currency' => 'RON',
                'vatName' => $this->vatNameFor((float) $item->vat_rate, $vatRates),
                'vatPercentage' => (float) $item->vat_rate,
                'vatIncluded' => 0,
                'quantity' => (float) $item->quantity,
                'productType' => $this->productTypeFor($item->type),
            ];
        })->values()->all();

        if ((float) $invoice->discount > 0) {
            $products[] = [
                'name' => 'Discount comercial ElectroCRM',
                'discount' => (float) $invoice->discount,
                'discountType' => 'procentual',
                'discountAllAbove' => 1,
            ];
        }

        return [
            'cif' => $cif,
            'client' => $this->clientPayload($invoice),
            'issueDate' => $invoice->issue_date->format('Y-m-d'),
            'dueDate' => $invoice->due_date?->format('Y-m-d'),
            'deliveryDate' => $invoice->issue_date->format('Y-m-d'),
            'seriesName' => $invoice->oblio_series ?: config('services.oblio.invoice_series') ?: $invoice->series,
            'language' => 'RO',
            'precision' => 2,
            'currency' => $invoice->currency,
            'products' => $products,
            'internalNote' => $invoice->notes,
            'idempotencyKey' => $invoice->oblio_idempotency_key ?: (string) Str::uuid(),
            'spvExtern' => config('services.oblio.spv_extern') ? 1 : 0,
        ];
    }

    /**
     * @return array<mixed>
     */
    private function clientPayload(Invoice $invoice): array
    {
        $client = $invoice->client;
        $snapshot = $invoice->buyer_snapshot ?: [];

        return [
            'cif' => $client->cui ?: '',
            'name' => $client->name,
            'address' => $client->address ?: data_get($snapshot, 'address', ''),
            'state' => data_get($snapshot, 'county', ''),
            'city' => $client->city ?: data_get($snapshot, 'city', ''),
            'email' => $client->email ?: data_get($snapshot, 'email', ''),
            'phone' => $client->phone ?: data_get($snapshot, 'phone', ''),
            'contact' => $client->contact_person ?: '',
            'vatPayer' => $client->tva_status !== 'neplatitor_tva',
            'save' => 0,
        ];
    }

    /**
     * @return array{ok:bool,http_status:int|null,message:string,data:array<mixed>}
     */
    private function request(string $method, string $uri, array $query = [], ?array $payload = null): array
    {
        if (!$this->configured()) {
            return $this->failure(null, 'Credențialele Oblio nu sunt configurate pe server.');
        }

        $token = $this->accessToken();
        if (!$token) {
            return $this->failure(null, 'Autentificarea Oblio a eșuat. Verifică e-mailul și API Secret.');
        }

        $request = Http::acceptJson()
            ->withToken($token)
            ->timeout((int) config('services.oblio.timeout', 20))
            ->retry((int) config('services.oblio.retry_times', 2), 500, throw: false);

        $response = match ($method) {
            'GET' => $request->get(self::BASE_URL . $uri, $query),
            'POST' => $request->post(self::BASE_URL . $uri, $payload ?? []),
            'PUT' => $request->put(self::BASE_URL . $uri, $payload ?? []),
            default => throw new \InvalidArgumentException('Metodă Oblio neacceptată.'),
        };

        return $this->normalizeResponse($response);
    }

    private function accessToken(): ?string
    {
        $cacheKey = 'oblio.access_token.' . sha1((string) config('services.oblio.email'));
        $cached = Cache::get($cacheKey);

        if (is_array($cached) && filled($cached['token'] ?? null) && (int) ($cached['expires_at'] ?? 0) > now()->addMinute()->timestamp) {
            return $cached['token'];
        }

        $response = Http::asForm()
            ->acceptJson()
            ->timeout((int) config('services.oblio.timeout', 20))
            ->post(self::BASE_URL . '/authorize/token', [
                'client_id' => config('services.oblio.email'),
                'client_secret' => config('services.oblio.secret'),
            ]);

        $token = $response->json('access_token');
        if (!$response->successful() || !filled($token)) {
            return null;
        }

        $expiresIn = max(60, (int) $response->json('expires_in', 3600) - 60);
        Cache::put($cacheKey, [
            'token' => $token,
            'expires_at' => now()->addSeconds($expiresIn)->timestamp,
        ], now()->addSeconds($expiresIn));

        return $token;
    }

    /**
     * @return array{ok:bool,http_status:int|null,message:string,data:array<mixed>}
     */
    private function normalizeResponse(Response $response): array
    {
        $json = $response->json();
        $apiStatus = is_array($json) ? (int) ($json['status'] ?? 0) : 0;
        $ok = $response->successful() && ($apiStatus === 0 || $apiStatus === 200);

        return [
            'ok' => $ok,
            'http_status' => $response->status(),
            'message' => (string) (data_get($json, 'statusMessage') ?: ($ok ? 'Success' : 'Răspuns Oblio nevalid.')),
            'data' => is_array(data_get($json, 'data')) ? data_get($json, 'data') : [],
        ];
    }

    /**
     * @return array{ok:bool,http_status:int|null,message:string,data:array<mixed>}
     */
    private function failure(?int $status, string $message): array
    {
        return ['ok' => false, 'http_status' => $status, 'message' => $message, 'data' => []];
    }

    private function issuerCif(?string $cif = null): string
    {
        $value = $cif ?: config('services.oblio.cif');

        if (!filled($value)) {
            throw new \RuntimeException('CIF-ul Oblio nu este configurat.');
        }

        return (string) $value;
    }

    /**
     * @return array<mixed>
     */
    private function cachedVatRates(string $cif): array
    {
        return Cache::remember('oblio.vat_rates.' . sha1($cif), now()->addHour(), function () use ($cif) {
            $result = $this->vatRates($cif);
            if (!$result['ok']) {
                throw new \RuntimeException('Nu s-au putut încărca cotele TVA din Oblio: ' . $result['message']);
            }

            return $result['data'];
        });
    }

    /**
     * @param array<mixed> $vatRates
     */
    private function vatNameFor(float $percentage, array $vatRates): string
    {
        foreach ($vatRates as $rate) {
            if (abs((float) data_get($rate, 'percent') - $percentage) < 0.001) {
                return (string) data_get($rate, 'name');
            }
        }

        throw new \RuntimeException('Cota TVA de ' . $percentage . '% nu este configurată în Oblio.');
    }

    private function productTypeFor(string $type): string
    {
        return in_array(mb_strtolower($type), ['service', 'serviciu', 'manopera'], true)
            ? 'Serviciu'
            : 'Materiale consumabile';
    }

    private function paymentType(string $method): string
    {
        return match (mb_strtolower($method)) {
            'card' => 'Card',
            'cash', 'numerar' => 'Alta incasare numerar',
            'transfer', 'bank_transfer', 'ordin de plata' => 'Ordin de plata',
            default => 'Alta incasare banca',
        };
    }

    private function ensureExternalInvoice(Invoice $invoice): void
    {
        if (!$invoice->oblio_series || !$invoice->oblio_number || $invoice->oblio_status !== 'issued') {
            throw new \RuntimeException('Factura nu este emisă în Oblio.');
        }
    }
}
