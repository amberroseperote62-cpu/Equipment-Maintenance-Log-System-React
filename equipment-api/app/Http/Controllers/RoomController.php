<?php
namespace App\Http\Controllers;
use App\Models\Room;
use Illuminate\Http\Request;
class RoomController extends Controller {
    public function index(Request $r) {
        $u = $r->user();
        $q = Room::with('inCharge:id,name')->withCount('equipment')
            ->when($u->role === 'incharge', fn ($q) => $q->where('in_charge_id', $u->id))
            ->when($r->q, fn ($q, $v) => $q->where(fn ($w) => $w->where('room_name', 'like', "%$v%")->orWhere('building', 'like', "%$v%")));
        return $r->boolean('all') ? $q->get() : $q->paginate(10);
    }
    private function rules() { return ['room_name' => 'required|string|max:255', 'building' => 'required|string|max:255', 'floor' => 'nullable|string|max:50', 'in_charge_id' => 'nullable|exists:users,id']; }
    public function store(Request $r) { return response()->json(Room::create($r->validate($this->rules())), 201); }
    public function update(Request $r, Room $room) { $room->update($r->validate($this->rules())); return $room; }
    public function destroy(Room $room) {
        abort_if($room->equipment()->exists(), 422, 'Cannot delete a room that still contains equipment.');
        $room->delete(); return response()->noContent();
    }
}
