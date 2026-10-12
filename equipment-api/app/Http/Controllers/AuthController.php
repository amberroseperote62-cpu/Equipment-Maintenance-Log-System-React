<?php
namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Hash, Password};
use Illuminate\Validation\ValidationException;
class AuthController extends Controller {
    public function register(Request $r) {
        $d = $r->validate(['name' => 'required|string|max:255', 'email' => 'required|email|unique:users', 'password' => 'required|min:8|confirmed']);
        $u = User::create($d + ['role' => 'incharge']); // self-registration is always room in-charge
        return response()->json(['user' => $u, 'token' => $u->createToken('api')->plainTextToken], 201);
    }
    public function login(Request $r) {
        $d = $r->validate(['email' => 'required|email', 'password' => 'required']);
        $u = User::where('email', $d['email'])->first();
        if (!$u || !Hash::check($d['password'], $u->password) || $u->status !== 'active')
            throw ValidationException::withMessages(['email' => 'Invalid credentials or inactive account.']);
        return ['user' => $u, 'token' => $u->createToken('api')->plainTextToken];
    }
    public function me(Request $r) { return $r->user(); }
    public function logout(Request $r) { $r->user()->currentAccessToken()->delete(); return ['message' => 'Logged out']; }
    public function forgot(Request $r) {
        $r->validate(['email' => 'required|email']);
        Password::sendResetLink($r->only('email'));
        return ['message' => 'If that email exists, a reset link has been sent.'];
    }
    public function reset(Request $r) {
        $d = $r->validate(['token' => 'required', 'email' => 'required|email', 'password' => 'required|min:8|confirmed']);
        $s = Password::reset($d, fn ($u, $p) => $u->forceFill(['password' => Hash::make($p)])->save());
        if ($s !== Password::PASSWORD_RESET) throw ValidationException::withMessages(['email' => __($s)]);
        return ['message' => 'Password reset successful.'];
    }
}
