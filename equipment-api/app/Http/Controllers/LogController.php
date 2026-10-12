<?php
namespace App\Http\Controllers;
use App\Models\{Equipment, EquipmentLog};
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
class LogController extends Controller {
    public function index(Request $r) {
        $u = $r->user();
        return EquipmentLog::with(['equipment:id,name,property_number,room_id', 'user:id,name', 'voider:id,name'])
            ->whereHas('equipment', fn ($e) => $e->visibleTo($u)->when($r->room_id, fn ($q, $v) => $q->where('room_id', $v)))
            ->when($r->action_type, fn ($q, $v) => $q->where('action_type', $v))
            ->when($r->user_id, fn ($q, $v) => $q->where('user_id', $v))
            ->when($r->from, fn ($q, $v) => $q->whereDate('logged_at', '>=', $v))
            ->when($r->to, fn ($q, $v) => $q->whereDate('logged_at', '<=', $v))
            ->orderByDesc('logged_at')->paginate(10);
    }
    public function store(Request $r) {
        $d = $r->validate(['equipment_id' => 'required|exists:equipment,id',
            'action_type' => ['required', Rule::in(['cleaned', 'repaired', 'modified', 'inspected', 'part_replaced'])],
            'description' => 'required|string|min:3', 'logged_at' => 'nullable|date|before_or_equal:now',
            'equipment_status' => ['nullable', Rule::in(EquipmentController::STATUSES)]]);
        $log = EquipmentLog::create(collect($d)->except('equipment_status')->all() + ['user_id' => $r->user()->id, 'logged_at' => $d['logged_at'] ?? now()]);
        if (!empty($d['equipment_status'])) Equipment::whereKey($d['equipment_id'])->update(['status' => $d['equipment_status']]);
        return response()->json($log, 201);
    }
    // Logs are never edited or deleted, only voided with a reason.
    public function void(Request $r, EquipmentLog $log) {
        $d = $r->validate(['void_reason' => 'required|string|min:3']);
        abort_if($log->is_voided, 422, 'Already voided.');
        $log->forceFill($d + ['is_voided' => true, 'voided_by' => $r->user()->id])->save(); return $log;
    }
}
