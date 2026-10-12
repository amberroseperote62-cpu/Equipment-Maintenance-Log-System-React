<?php
namespace App\Http\Controllers;
use App\Models\{Equipment, EquipmentLog, Room};
use Illuminate\Http\Request;
class DashboardController extends Controller {
    public function __invoke(Request $r) {
        $u = $r->user();
        $recent = fn ($q) => $q->with(['equipment:id,name', 'user:id,name'])->orderByDesc('logged_at')->limit(5)->get();
        if ($u->role === 'admin') return ['stats' => [
            'Total rooms' => Room::count(), 'Total equipment' => Equipment::count(),
            'Under repair' => Equipment::where('status', 'under_repair')->count(),
            'Needs replacement' => Equipment::where('status', 'needs_replacement')->count()],
            'recent_logs' => $recent(EquipmentLog::query())];
        if ($u->role === 'technician') return ['stats' => [
            'My logs' => EquipmentLog::where('user_id', $u->id)->count(),
            'Cleaned' => EquipmentLog::where('user_id', $u->id)->where('action_type', 'cleaned')->count(),
            'Repaired' => EquipmentLog::where('user_id', $u->id)->where('action_type', 'repaired')->count()],
            'recent_logs' => $recent(EquipmentLog::where('user_id', $u->id))];
        return ['stats' => [
            'My equipment' => Equipment::visibleTo($u)->count(),
            'Working' => Equipment::visibleTo($u)->where('status', 'working')->count(),
            'Needs attention' => Equipment::visibleTo($u)->whereIn('status', ['under_repair', 'needs_replacement'])->count()],
            'recent_logs' => $recent(EquipmentLog::whereHas('equipment', fn ($e) => $e->visibleTo($u)))];
    }
}
