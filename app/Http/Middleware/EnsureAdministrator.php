<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdministrator
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()?->isAdministrator()) {
            abort(403, 'Doar administratorii pot gestiona utilizatorii și drepturile lor.');
        }

        return $next($request);
    }
}
