<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class RepairRequest extends Model {
    protected $fillable = ['equipment_id', 'reported_by', 'assigned_to', 'description', 'status', 'resolved_at'];
    protected $casts = ['resolved_at' => 'datetime'];
    public function equipment() { return $this->belongsTo(Equipment::class); }
    public function reporter() { return $this->belongsTo(User::class, 'reported_by'); }
    public function technician() { return $this->belongsTo(User::class, 'assigned_to'); }
}
