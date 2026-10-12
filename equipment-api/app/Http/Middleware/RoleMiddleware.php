<?php
namespace App\Http\Middleware;
use Closure;
class RoleMiddleware {
    public function handle($request, Closure $next, ...$roles) {
        $u = $request->user();
        if (!$u || $u->status !== 'active' || !in_array($u->role, $roles)) abort(403, 'You are not allowed to do this.');
        return $next($request);
    }
}
