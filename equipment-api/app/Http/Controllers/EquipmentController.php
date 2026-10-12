<?php
namespace App\Http\Controllers;
use App\Models\Equipment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
class EquipmentController extends Controller {
    const STATUSES = ['working', 'under_repair', 'needs_replacement', 'disposed'];
    public function index(Request $r) {
        return Equipment::visibleTo($r->user())->with('room:id,room_name,building')
            ->when($r->q, fn ($q, $v) => $q->where(fn ($w) => $w->where('name', 'like', "%$v%")->orWhere('property_number', 'like', "%$v%")))
            ->when($r->room_id, fn ($q, $v) => $q->where('room_id', $v))
            ->when($r->status, fn ($q, $v) => $q->where('status', $v))
            ->latest()->paginate(10);
    }
    public function show(Request $r, $id) {
        $e = Equipment::visibleTo($r->user())->with('room.inCharge:id,name')->findOrFail($id);
        $e->logs = $e->logs()->with(['user:id,name', 'voider:id,name'])->orderByDesc('logged_at')->get(); // newest first
        return $e;
    }
    public function store(Request $r) { return response()->json(Equipment::create($r->validate($this->rules())), 201); }
    public function update(Request $r, Equipment $equipment) { $equipment->update($r->validate($this->rules($equipment->id))); return $equipment; }
    public function destroy(Equipment $equipment) {
        if ($equipment->logs()->exists() || $equipment->repairRequests()->exists()) {
            $equipment->update(['status' => 'disposed']);
            return ['message' => 'Equipment has history, so it was marked as disposed instead of deleted.'];
        }
        $equipment->delete(); return ['message' => 'Equipment deleted.'];
    }
    private function rules($id = null) {
        return ['room_id' => 'required|exists:rooms,id', 'name' => 'required|string|max:255',
            'property_number' => ['required', 'string', 'max:100', Rule::unique('equipment')->ignore($id)],
            'category' => 'required|string|max:100', 'status' => ['sometimes', Rule::in(self::STATUSES)], 'remarks' => 'nullable|string'];
    }
}
