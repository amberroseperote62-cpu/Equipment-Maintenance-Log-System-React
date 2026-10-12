<?php
namespace App\Http\Controllers;
use App\Models\{Equipment, RepairRequest, User};
use Illuminate\Http\Request;
class RepairRequestController extends Controller {
    public function index(Request $r) {
        $u = $r->user();
        return RepairRequest::with(['equipment:id,name,property_number', 'reporter:id,name', 'technician:id,name'])
            ->when($u->role === 'incharge', fn ($q) => $q->where('reported_by', $u->id))
            ->when($u->role === 'technician', fn ($q) => $q->where('assigned_to', $u->id))
            ->when($r->status, fn ($q, $v) => $q->where('status', $v))->latest()->paginate(10);
    }
    public function store(Request $r) {
        $d = $r->validate(['equipment_id' => 'required|exists:equipment,id', 'description' => 'required|string|min:5']);
        abort_unless(Equipment::visibleTo($r->user())->whereKey($d['equipment_id'])->exists(), 403, 'Not your room.');
        return response()->json(RepairRequest::create($d + ['reported_by' => $r->user()->id]), 201);
    }
    public function assign(Request $r, RepairRequest $repairRequest) {
        $d = $r->validate(['assigned_to' => 'required|exists:users,id']);
        abort_unless(User::whereKey($d['assigned_to'])->where('role', 'technician')->exists(), 422, 'User is not a technician.');
        abort_if($repairRequest->status === 'resolved', 422, 'Request already resolved.');
        $newStatus = $repairRequest->status === 'pending' ? 'assigned' : $repairRequest->status;
        $repairRequest->update($d + ['status' => $newStatus]); return $repairRequest;
    }
    public function resolve(RepairRequest $repairRequest) {
        $repairRequest->update(['status' => 'resolved', 'resolved_at' => now()]); return $repairRequest;
    }
}
