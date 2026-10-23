<?php
namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
class UserController extends Controller {
    public function index(Request $r) {
        $q = User::query()->when($r->role, fn ($q, $v) => $q->where('role', $v))
            ->when($r->q, fn ($q, $v) => $q->where(fn ($w) => $w->where('name', 'like', "%$v%")->orWhere('email', 'like', "%$v%")));
        return $r->boolean('all') ? $q->get() : $q->paginate(10);
    }
    public function store(Request $r) {
        $d = $r->validate(['name' => 'required', 'email' => 'required|email|unique:users', 'password' => 'required|min:8',
            'role' => ['required', Rule::in(['admin', 'technician', 'incharge'])], 'status' => ['sometimes', Rule::in(['active', 'inactive'])]]);
        return response()->json(User::create($d), 201);
    }
    public function update(Request $r, User $user) {
        $d = $r->validate(['name' => 'sometimes|required', 'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|min:8', 'role' => ['sometimes', Rule::in(['admin', 'technician', 'incharge'])], 'status' => ['sometimes', Rule::in(['active', 'inactive'])]]);
        if (empty($d['password'])) unset($d['password']);
        $user->update($d); return $user;
    }
    public function destroy(Request $r, User $user) {
        abort_if($user->id === $r->user()->id, 422, 'You cannot delete your own account.');
        $user->delete(); return response()->noContent();
    }
}
