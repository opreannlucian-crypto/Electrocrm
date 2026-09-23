<?php

namespace App\Http\Controllers;

use App\Services\OblioService;
use Inertia\Inertia;
use Inertia\Response;

class SpvInboxController extends Controller
{
    public function index(OblioService $oblio): Response
    {
        return Inertia::render('Spv/Index', [
            'oblioConfigured' => $oblio->configured(),
            'anafPrepared' => filled(config('services.efactura.token'))
                && filled(config('services.efactura.cif')),
            'anafEnvironment' => config('services.efactura.environment', 'test'),
        ]);
    }
}
