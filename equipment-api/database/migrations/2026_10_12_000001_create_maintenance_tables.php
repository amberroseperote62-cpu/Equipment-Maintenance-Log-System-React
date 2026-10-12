<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $t) {
            $t->string('role')->default('incharge'); // admin | technician | incharge
            $t->string('status')->default('active');
        });
        Schema::create('rooms', function (Blueprint $t) {
            $t->id(); $t->string('room_name'); $t->string('building'); $t->string('floor')->nullable();
            $t->foreignId('in_charge_id')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });
        Schema::create('equipment', function (Blueprint $t) {
            $t->id(); $t->foreignId('room_id')->constrained()->restrictOnDelete();
            $t->string('name'); $t->string('property_number')->unique(); $t->string('category');
            $t->string('status')->default('working'); // working|under_repair|needs_replacement|disposed
            $t->text('remarks')->nullable(); $t->timestamps();
        });
        Schema::create('repair_requests', function (Blueprint $t) {
            $t->id(); $t->foreignId('equipment_id')->constrained()->restrictOnDelete();
            $t->foreignId('reported_by')->constrained('users');
            $t->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $t->text('description'); $t->string('status')->default('pending'); // pending|assigned|in_progress|resolved
            $t->timestamp('resolved_at')->nullable(); $t->timestamps();
        });
        Schema::create('equipment_logs', function (Blueprint $t) {
            $t->id(); $t->foreignId('equipment_id')->constrained()->restrictOnDelete();
            $t->foreignId('user_id')->constrained('users');
            $t->foreignId('repair_request_id')->nullable()->constrained('repair_requests')->nullOnDelete();
            $t->string('action_type'); // cleaned|repaired|modified|inspected|part_replaced
            $t->text('description'); $t->timestamp('logged_at')->useCurrent();
            $t->boolean('is_voided')->default(false); $t->text('void_reason')->nullable();
            $t->foreignId('voided_by')->nullable()->constrained('users'); $t->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('equipment_logs'); Schema::dropIfExists('repair_requests');
        Schema::dropIfExists('equipment'); Schema::dropIfExists('rooms');
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn(['role', 'status']));
    }
};
