<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Room extends Model {
    protected $fillable = ['room_name', 'building', 'floor', 'in_charge_id'];
    public function equipment() { return $this->hasMany(Equipment::class); }
    public function inCharge() { return $this->belongsTo(User::class, 'in_charge_id'); }
}
