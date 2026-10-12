<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class EquipmentLog extends Model {
    protected $fillable = ['equipment_id', 'user_id', 'action_type', 'description', 'logged_at'];
    protected $casts = ['logged_at' => 'datetime', 'is_voided' => 'boolean'];
    public function equipment() { return $this->belongsTo(Equipment::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function voider() { return $this->belongsTo(User::class, 'voided_by'); }
}
