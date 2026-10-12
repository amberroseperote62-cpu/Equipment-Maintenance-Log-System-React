<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Equipment extends Model {
    protected $table = 'equipment';
    protected $fillable = ['room_id', 'name', 'property_number', 'category', 'status', 'remarks'];
    public function room() { return $this->belongsTo(Room::class); }
    public function logs() { return $this->hasMany(EquipmentLog::class); }
    // Room in-charges only see equipment in their own rooms.
    public function scopeVisibleTo($q, $u) {
        return $u->role === 'incharge' ? $q->whereHas('room', fn ($r) => $r->where('in_charge_id', $u->id)) : $q;
    }
}
