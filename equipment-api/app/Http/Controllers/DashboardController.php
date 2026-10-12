<?php
namespace App\Http\Controllers;
use App\Models\{Equipment, EquipmentLog, RepairRequest, Room};
use Illuminate\Http\Request;
class DashboardController extends Controller {
    public function __invoke(Request $r) {
        $u = $r->user();
        $recent = fn ($q) => $q->with(['equipment:id,name', 'user:id,name'])->orderByDesc('logged_at')->limit(5)->get();
        if ($u->role === 'admin') return ['stats' => [
            'Total rooms' => Room::count(), 'Total equipment' => Equipment::count(),
            'Under repair' => Equipment::where('status', 'under_repair')->count(),
            'Pending requests' => RepairRequest::where('status', 'pending')->count()],
            'recent_logs' => $recent(EquipmentLog::query())];
        if ($u->role === 'technician') return ['stats' => [
            'Assigned requests' => RepairRequest::where('assigned_to', $u->id)->whereIn('status', ['assigned', 'in_progress'])->count(),
            'My logs' => EquipmentLog::where('user_id', $u->id)->count()],
            'recent_logs' => $recent(EquipmentLog::where('user_id', $u->id))];
        return ['stats' => [
            'My equipment' => Equipment::visibleTo($u)->count(),
            'Open requests' => RepairRequest::where('reported_by', $u->id)->where('status', '!=', 'resolved')->count(),
            'Resolved requests' => RepairRequest::where('reported_by', $u->id)->where('status', 'resolved')->count()],
            'recent_logs' => $recent(EquipmentLog::whereHas('equipment', fn ($e) => $e->visibleTo($u)))];
    }
}
